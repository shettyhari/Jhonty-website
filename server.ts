import crypto from 'crypto';
import express, { Request } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  DEFAULT_ROLE_PERMISSIONS,
  INITIAL_STAFF_USERS,
  PERMISSION_DEFINITIONS,
  STORE_SCOPES,
} from './src/data/adminUsers.ts';
import { PRODUCTS, STORES_DATA } from './src/data/catalog.ts';
import {
  OrderTrackingRecord,
  SAMPLE_TRACKING_ORDERS,
  buildTrackingFromReceipt,
} from './src/data/tracking.ts';
import type {
  OrderReceipt,
  Product,
  PublicStaffUser,
  StaffPermission,
  StaffRole,
  StaffUser,
  StoreScope,
} from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '.jhonty_db.json');
const PORT = Number(process.env.PORT) || 3000;

interface StoreDatabase {
  products: Product[];
  orders: OrderTrackingRecord[];
  staffUsers: StaffUser[];
  sessions: Record<string, string>;
}

const VALID_PERMISSIONS = new Set<StaffPermission>(PERMISSION_DEFINITIONS.map((p) => p.key));
const VALID_STORES = new Set<StoreScope>(STORE_SCOPES);

function loadDatabase(): StoreDatabase {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<StoreDatabase>;
      if (Array.isArray(parsed.products) && Array.isArray(parsed.orders)) {
        return {
          products: parsed.products,
          orders: parsed.orders,
          staffUsers:
            Array.isArray(parsed.staffUsers) && parsed.staffUsers.length > 0
              ? parsed.staffUsers
              : structuredClone(INITIAL_STAFF_USERS),
          sessions:
            parsed.sessions && typeof parsed.sessions === 'object' ? parsed.sessions : {},
        };
      }
    }
  } catch (err) {
    console.warn('Could not read persisted db, seeding defaults:', err);
  }
  return {
    products: structuredClone(PRODUCTS),
    orders: structuredClone(SAMPLE_TRACKING_ORDERS),
    staffUsers: structuredClone(INITIAL_STAFF_USERS),
    sessions: {},
  };
}

let db: StoreDatabase = loadDatabase();

function saveDatabase() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist db to disk:', err);
  }
}

function sumSizeStock(sizeStock: Record<string, number>): number {
  return Object.values(sizeStock).reduce((sum, n) => sum + Math.max(0, Number(n) || 0), 0);
}

function sanitizeUser(user: StaffUser): PublicStaffUser {
  const { password: _pw, ...safe } = user;
  return safe;
}

function getActor(req: Request): StaffUser | null {
  const headerToken = req.header('x-admin-token');
  const authHeader = req.header('authorization');
  const token =
    headerToken ||
    (authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : '');
  if (!token) return null;
  const userId = db.sessions[token];
  if (!userId) return null;
  const user = db.staffUsers.find((u) => u.id === userId && u.active);
  return user || null;
}

function sanitizePermissions(
  perms: unknown,
  fallbackRole: StaffRole
): StaffPermission[] {
  if (!Array.isArray(perms)) return [...DEFAULT_ROLE_PERMISSIONS[fallbackRole]];
  const filtered = Array.from(
    new Set(perms.filter((p): p is StaffPermission => VALID_PERMISSIONS.has(p as StaffPermission)))
  );
  return filtered.length > 0 ? filtered : [...DEFAULT_ROLE_PERMISSIONS[fallbackRole]];
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Health
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, storeCount: STORES_DATA.length });
  });

  // =========================================================================
  // ADMIN & TEAM AUTHENTICATION + ROLE / STORE / PERMISSIONS MANAGEMENT
  // =========================================================================

  app.post('/api/admin/login', (req, res) => {
    const { username, password } = (req.body || {}) as {
      username?: string;
      password?: string;
    };
    const cleanUsername = (username || '').trim().toLowerCase();
    const cleanPassword = password || '';

    if (!cleanUsername || !cleanPassword) {
      res.status(400).json({ error: 'Username and password are required.' });
      return;
    }

    const user = db.staffUsers.find(
      (u) => u.username.toLowerCase() === cleanUsername && u.password === cleanPassword
    );
    if (!user) {
      res.status(401).json({ error: 'Invalid staff username or password.' });
      return;
    }
    if (!user.active) {
      res.status(403).json({
        error: 'This account has been suspended. Contact a Master Admin to restore access.',
      });
      return;
    }

    const token = crypto.randomUUID();
    db.sessions[token] = user.id;
    saveDatabase();

    res.json({
      token,
      user: sanitizeUser(user),
    });
  });

  app.post('/api/admin/logout', (req, res) => {
    const token = req.header('x-admin-token');
    if (token && db.sessions[token]) {
      delete db.sessions[token];
      saveDatabase();
    }
    res.json({ ok: true });
  });

  app.get('/api/admin/session', (req, res) => {
    const actor = getActor(req);
    if (!actor) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    res.json({ user: sanitizeUser(actor) });
  });

  app.get('/api/admin/users', (req, res) => {
    const actor = getActor(req);
    if (!actor) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    if (!actor.permissions.includes('manage_users')) {
      res.status(403).json({ error: 'You do not have permission to view team credentials.' });
      return;
    }
    res.json({ users: db.staffUsers.map(sanitizeUser) });
  });

  app.post('/api/admin/users', (req, res) => {
    const actor = getActor(req);
    if (!actor) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    if (!actor.permissions.includes('manage_users')) {
      res.status(403).json({ error: 'You do not have permission to create user credentials.' });
      return;
    }

    const body = (req.body || {}) as Partial<StaffUser>;
    const fullName = (body.fullName || '').trim();
    const username = (body.username || '').trim().toLowerCase().replace(/\s+/g, '_');
    const password = (body.password || '').trim();
    const role: StaffRole = body.role === 'admin' ? 'admin' : 'team';
    const assignedStore: StoreScope = VALID_STORES.has(body.assignedStore as StoreScope)
      ? (body.assignedStore as StoreScope)
      : role === 'admin'
        ? 'All Stores'
        : 'Hitech City Metro';

    if (!fullName || !username || password.length < 4) {
      res.status(400).json({
        error: 'Full name, username, and a password of at least 4 characters are required.',
      });
      return;
    }

    if (db.staffUsers.some((u) => u.username.toLowerCase() === username)) {
      res.status(409).json({ error: `Username "${username}" is already in use.` });
      return;
    }

    const newUser: StaffUser = {
      id: `USR-${role.toUpperCase()}-${Date.now().toString().slice(-4)}`,
      fullName,
      username,
      password,
      role,
      assignedStore,
      permissions: sanitizePermissions(body.permissions, role),
      active: body.active !== false,
      createdAt: new Date().toISOString(),
      createdBy: actor.username,
    };

    db.staffUsers = [newUser, ...db.staffUsers];
    saveDatabase();
    res.status(201).json({ user: sanitizeUser(newUser) });
  });

  app.patch('/api/admin/users/:id', (req, res) => {
    const actor = getActor(req);
    if (!actor) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    if (!actor.permissions.includes('manage_users')) {
      res.status(403).json({ error: 'You do not have permission to update user credentials.' });
      return;
    }

    const targetId = req.params.id;
    const idx = db.staffUsers.findIndex((u) => u.id === targetId);
    if (idx === -1) {
      res.status(404).json({ error: 'User account not found.' });
      return;
    }

    const existing = db.staffUsers[idx];
    const patch = (req.body || {}) as Partial<StaffUser>;
    const nextRole: StaffRole =
      patch.role === 'admin' || patch.role === 'team' ? patch.role : existing.role;
    const nextActive = typeof patch.active === 'boolean' ? patch.active : existing.active;
    const nextPermissions = patch.permissions
      ? sanitizePermissions(patch.permissions, nextRole)
      : existing.permissions;

    // Prevent disabling/demoting the last active admin with manage_users
    const otherActiveAdminExists = db.staffUsers.some(
      (u) =>
        u.id !== existing.id &&
        u.active &&
        u.role === 'admin' &&
        u.permissions.includes('manage_users')
    );
    if (
      !otherActiveAdminExists &&
      (!nextActive || nextRole !== 'admin' || !nextPermissions.includes('manage_users'))
    ) {
      res.status(400).json({
        error: 'At least one active Admin with Team & User Credentials access must remain.',
      });
      return;
    }

    const nextAssignedStore: StoreScope = VALID_STORES.has(patch.assignedStore as StoreScope)
      ? (patch.assignedStore as StoreScope)
      : existing.assignedStore;

    const updated: StaffUser = {
      ...existing,
      fullName: patch.fullName?.trim() || existing.fullName,
      password:
        patch.password && patch.password.trim().length >= 4
          ? patch.password.trim()
          : existing.password,
      role: nextRole,
      assignedStore: nextAssignedStore,
      permissions: nextPermissions,
      active: nextActive,
    };

    db.staffUsers[idx] = updated;
    if (!updated.active) {
      Object.keys(db.sessions).forEach((t) => {
        if (db.sessions[t] === updated.id) delete db.sessions[t];
      });
    }
    saveDatabase();
    res.json({ user: sanitizeUser(updated) });
  });

  app.delete('/api/admin/users/:id', (req, res) => {
    const actor = getActor(req);
    if (!actor) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    if (!actor.permissions.includes('manage_users')) {
      res.status(403).json({ error: 'You do not have permission to delete users.' });
      return;
    }

    const targetId = req.params.id;
    if (actor.id === targetId) {
      res.status(400).json({ error: 'You cannot delete your own currently signed-in account.' });
      return;
    }

    const target = db.staffUsers.find((u) => u.id === targetId);
    if (!target) {
      res.status(404).json({ error: 'User account not found.' });
      return;
    }

    const otherActiveAdminExists = db.staffUsers.some(
      (u) =>
        u.id !== targetId &&
        u.active &&
        u.role === 'admin' &&
        u.permissions.includes('manage_users')
    );
    if (!otherActiveAdminExists) {
      res.status(400).json({ error: 'Cannot delete the last active Admin account.' });
      return;
    }

    db.staffUsers = db.staffUsers.filter((u) => u.id !== targetId);
    Object.keys(db.sessions).forEach((t) => {
      if (db.sessions[t] === targetId) delete db.sessions[t];
    });
    saveDatabase();
    res.json({ deletedId: targetId });
  });

  // =========================================================================
  // PRODUCTS & INVENTORY
  // =========================================================================

  // Get all products (public storefront + admin)
  app.get('/api/products', (_req, res) => {
    res.json({ products: db.products });
  });

  // Add new product (requires manage_catalog)
  app.post('/api/products', (req, res) => {
    const actor = getActor(req);
    if (!actor) {
      res.status(401).json({ error: 'Admin sign-in required.' });
      return;
    }
    if (!actor.permissions.includes('manage_catalog')) {
      res.status(403).json({ error: 'Missing Catalog & Pricing permission.' });
      return;
    }

    const body = req.body as Partial<Product>;
    if (!body.title?.trim() || !body.brand?.trim() || !body.price) {
      res.status(400).json({ error: 'Title, brand, and price are required.' });
      return;
    }

    const nextId = db.products.reduce((max, p) => Math.max(max, p.id), 0) + 1;
    const sizes =
      Array.isArray(body.sizes) && body.sizes.length > 0 ? body.sizes : ['S', 'M', 'L', 'XL'];

    const sizeStock: Record<string, number> = {};
    sizes.forEach((s) => {
      const provided = body.sizeStock?.[s];
      sizeStock[s] = typeof provided === 'number' && provided >= 0 ? provided : 10;
    });

    const totalStock =
      typeof body.stock === 'number' && Object.keys(body.sizeStock || {}).length === 0
        ? Math.max(0, body.stock)
        : sumSizeStock(sizeStock);

    const resolvedStore =
      actor.assignedStore !== 'All Stores'
        ? actor.assignedStore
        : body.storeLocation || 'Hitech City Metro';

    const newProduct: Product = {
      id: nextId,
      sku:
        body.sku?.trim() ||
        `JH-${String(body.category || 'GEN')
          .slice(0, 2)
          .toUpperCase()}-${100 + nextId}`,
      brand: body.brand.trim().toUpperCase(),
      title: body.title.trim(),
      category: body.category || 'Shirts & Polos',
      occasion: body.occasion || 'Casual',
      price: Math.max(1, Number(body.price)),
      mrp: Math.max(Number(body.price), Number(body.mrp) || Number(body.price) * 2),
      rating: body.rating || '4.7',
      reviews: body.reviews ?? 1,
      sizes,
      stock: totalStock,
      sizeStock,
      reorderLevel: typeof body.reorderLevel === 'number' ? body.reorderLevel : 10,
      storeLocation: resolvedStore,
      updatedAt: new Date().toISOString(),
      colors:
        Array.isArray(body.colors) && body.colors.length > 0
          ? body.colors
          : [{ name: 'Signature Black', hex: '#18181b' }],
      fabric: body.fabric?.trim() || '100% Combed Cotton',
      fit: body.fit?.trim() || 'Regular Fit',
      care: body.care?.trim() || 'Machine Wash Cold',
      origin: body.origin?.trim() || 'Made in India',
      description:
        body.description?.trim() ||
        'Curated Jhonty Hub branded menswear piece crafted for everyday comfort and lasting durability.',
      gallery:
        Array.isArray(body.gallery) && body.gallery.filter((img) => typeof img === 'string' && img.trim()).length > 0
          ? body.gallery.map((img) => img.trim()).filter(Boolean)
          : ['/src/assets/images/jhonty_mens_overshirt_1794941649529.jpg'],
    };

    db.products = [newProduct, ...db.products];
    saveDatabase();
    res.status(201).json({ product: newProduct });
  });

  // Update product details or inventory (requires manage_catalog)
  app.patch('/api/products/:id', (req, res) => {
    const actor = getActor(req);
    if (!actor) {
      res.status(401).json({ error: 'Admin sign-in required.' });
      return;
    }
    if (!actor.permissions.includes('manage_catalog')) {
      res.status(403).json({ error: 'Missing Catalog & Pricing permission.' });
      return;
    }

    const id = Number(req.params.id);
    const idx = db.products.findIndex((p) => p.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    const existing = db.products[idx];
    if (actor.assignedStore !== 'All Stores' && existing.storeLocation !== actor.assignedStore) {
      res.status(403).json({ error: `Scoped to ${actor.assignedStore} only.` });
      return;
    }

    const patch = req.body as Partial<Product>;
    const updatedSizes =
      Array.isArray(patch.sizes) && patch.sizes.length > 0 ? patch.sizes : existing.sizes;

    const mergedSizeStock: Record<string, number> = {};
    updatedSizes.forEach((size) => {
      if (patch.sizeStock && typeof patch.sizeStock[size] === 'number') {
        mergedSizeStock[size] = Math.max(0, patch.sizeStock[size]);
      } else if (typeof existing.sizeStock[size] === 'number') {
        mergedSizeStock[size] = existing.sizeStock[size];
      } else {
        mergedSizeStock[size] = 8;
      }
    });

    const nextGallery = Array.isArray(patch.gallery)
      ? patch.gallery.map((img) => (typeof img === 'string' ? img.trim() : '')).filter(Boolean)
      : existing.gallery;

    const updated: Product = {
      ...existing,
      ...patch,
      id: existing.id,
      storeLocation:
        actor.assignedStore !== 'All Stores'
          ? existing.storeLocation
          : patch.storeLocation || existing.storeLocation,
      brand: patch.brand ? patch.brand.trim().toUpperCase() : existing.brand,
      title: patch.title ? patch.title.trim() : existing.title,
      price: typeof patch.price === 'number' ? Math.max(1, patch.price) : existing.price,
      mrp: typeof patch.mrp === 'number' ? Math.max(1, patch.mrp) : existing.mrp,
      sizes: updatedSizes,
      sizeStock: mergedSizeStock,
      stock: sumSizeStock(mergedSizeStock),
      gallery: nextGallery.length > 0 ? nextGallery : existing.gallery,
      updatedAt: new Date().toISOString(),
    };

    db.products[idx] = updated;
    saveDatabase();
    res.json({ product: updated });
  });

  // Restock a specific product (requires manage_inventory)
  app.post('/api/products/:id/restock', (req, res) => {
    const actor = getActor(req);
    if (!actor) {
      res.status(401).json({ error: 'Admin sign-in required.' });
      return;
    }
    if (!actor.permissions.includes('manage_inventory')) {
      res.status(403).json({ error: 'Missing Inventory & Stock Control permission.' });
      return;
    }

    const id = Number(req.params.id);
    const idx = db.products.findIndex((p) => p.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    const existing = db.products[idx];
    if (actor.assignedStore !== 'All Stores' && existing.storeLocation !== actor.assignedStore) {
      res.status(403).json({ error: `Scoped to ${actor.assignedStore} only.` });
      return;
    }

    const { deltaPerSize, sizeStock } = req.body as {
      deltaPerSize?: number;
      sizeStock?: Record<string, number>;
    };

    const nextSizeStock: Record<string, number> = { ...existing.sizeStock };
    if (sizeStock) {
      existing.sizes.forEach((s) => {
        if (typeof sizeStock[s] === 'number') {
          nextSizeStock[s] = Math.max(0, sizeStock[s]);
        }
      });
    } else if (typeof deltaPerSize === 'number') {
      existing.sizes.forEach((s) => {
        nextSizeStock[s] = Math.max(0, (nextSizeStock[s] || 0) + deltaPerSize);
      });
    }

    const updated: Product = {
      ...existing,
      sizeStock: nextSizeStock,
      stock: sumSizeStock(nextSizeStock),
      updatedAt: new Date().toISOString(),
    };

    db.products[idx] = updated;
    saveDatabase();
    res.json({ product: updated });
  });

  // Bulk refresh low-stock inventory (requires manage_inventory, respects store scope)
  app.post('/api/products/refresh-inventory', (req, res) => {
    const actor = getActor(req);
    if (!actor) {
      res.status(401).json({ error: 'Admin sign-in required.' });
      return;
    }
    if (!actor.permissions.includes('manage_inventory')) {
      res.status(403).json({ error: 'Missing Inventory & Stock Control permission.' });
      return;
    }

    const { minPerSize = 10 } = (req.body || {}) as { minPerSize?: number };
    const target = Math.max(1, Number(minPerSize) || 10);
    let refreshedCount = 0;

    db.products = db.products.map((p) => {
      if (actor.assignedStore !== 'All Stores' && p.storeLocation !== actor.assignedStore) {
        return p;
      }
      if (p.stock <= p.reorderLevel || Object.values(p.sizeStock).some((v) => v < target)) {
        const nextSizeStock: Record<string, number> = {};
        p.sizes.forEach((s) => {
          nextSizeStock[s] = Math.max(p.sizeStock[s] || 0, target);
        });
        refreshedCount += 1;
        return {
          ...p,
          sizeStock: nextSizeStock,
          stock: sumSizeStock(nextSizeStock),
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    saveDatabase();
    res.json({ products: db.products, refreshedCount });
  });

  // Delete product (requires manage_catalog)
  app.delete('/api/products/:id', (req, res) => {
    const actor = getActor(req);
    if (!actor) {
      res.status(401).json({ error: 'Admin sign-in required.' });
      return;
    }
    if (!actor.permissions.includes('manage_catalog')) {
      res.status(403).json({ error: 'Missing Catalog & Pricing permission.' });
      return;
    }

    const id = Number(req.params.id);
    const target = db.products.find((p) => p.id === id);
    if (!target) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
    if (actor.assignedStore !== 'All Stores' && target.storeLocation !== actor.assignedStore) {
      res.status(403).json({ error: `Scoped to ${actor.assignedStore} only.` });
      return;
    }

    db.products = db.products.filter((p) => p.id !== id);
    saveDatabase();
    res.json({ deletedId: id });
  });

  // Orders & Fulfillment
  app.get('/api/orders', (_req, res) => {
    res.json({ orders: db.orders });
  });

  app.post('/api/orders', (req, res) => {
    const receipt = req.body as OrderReceipt;
    if (!receipt?.orderId || !Array.isArray(receipt.items)) {
      res.status(400).json({ error: 'Invalid order payload.' });
      return;
    }

    // Deduct stock per ordered size
    receipt.items.forEach((item) => {
      const idx = db.products.findIndex((p) => p.id === item.id);
      if (idx > -1) {
        const prod = db.products[idx];
        const nextSizeStock = { ...prod.sizeStock };
        const currentQty = nextSizeStock[item.size] ?? 0;
        nextSizeStock[item.size] = Math.max(0, currentQty - item.qty);
        db.products[idx] = {
          ...prod,
          sizeStock: nextSizeStock,
          stock: sumSizeStock(nextSizeStock),
          updatedAt: new Date().toISOString(),
        };
      }
    });

    const record = buildTrackingFromReceipt(receipt);
    db.orders = [record, ...db.orders];
    saveDatabase();
    res.status(201).json({ order: record, products: db.products });
  });

  app.patch('/api/orders/:orderId/status', (req, res) => {
    const actor = getActor(req);
    if (!actor) {
      res.status(401).json({ error: 'Admin sign-in required.' });
      return;
    }
    if (!actor.permissions.includes('manage_orders')) {
      res.status(403).json({ error: 'Missing Orders & Fulfillment permission.' });
      return;
    }

    const orderId = req.params.orderId.toUpperCase();
    const idx = db.orders.findIndex((o) => o.orderId.toUpperCase() === orderId);
    if (idx === -1) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    const { status } = req.body as { status: OrderTrackingRecord['status'] };
    const existing = db.orders[idx];

    const progressMap: Record<OrderTrackingRecord['status'], number> = {
      'Order Placed': 20,
      'Packed at Jhonty Hub': 42,
      'In Transit': 68,
      'Out for Delivery': 88,
      Delivered: 100,
      'Ready for Store Pickup': 75,
    };

    const nextProgress = progressMap[status] ?? existing.progressPct;
    const updatedWaypoints = existing.waypoints.map((wp, i) => {
      const threshold = Math.round(((i + 1) / existing.waypoints.length) * 100);
      const completed = nextProgress >= threshold || i === 0;
      return {
        ...wp,
        completed,
        current: false,
      };
    });

    const lastCompletedIdx = updatedWaypoints.reduce(
      (acc, wp, i) => (wp.completed ? i : acc),
      0
    );
    if (updatedWaypoints[lastCompletedIdx]) {
      updatedWaypoints[lastCompletedIdx].current = true;
    }

    const updatedOrder: OrderTrackingRecord = {
      ...existing,
      status,
      progressPct: nextProgress,
      estimatedDelivery:
        status === 'Delivered'
          ? `Delivered on ${new Date().toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}`
          : existing.estimatedDelivery,
      waypoints: updatedWaypoints,
    };

    db.orders[idx] = updatedOrder;
    saveDatabase();
    res.json({ order: updatedOrder });
  });

  // Mount Vite dev middleware or serve static production bundle
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Jhonty Hub server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

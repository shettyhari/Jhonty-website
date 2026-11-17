import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PRODUCTS, STORES_DATA } from './src/data/catalog.ts';
import {
  OrderTrackingRecord,
  SAMPLE_TRACKING_ORDERS,
  buildTrackingFromReceipt,
} from './src/data/tracking.ts';
import type { OrderReceipt, Product } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '.jhonty_db.json');
const PORT = Number(process.env.PORT) || 3000;

interface StoreDatabase {
  products: Product[];
  orders: OrderTrackingRecord[];
}

function loadDatabase(): StoreDatabase {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<StoreDatabase>;
      if (Array.isArray(parsed.products) && Array.isArray(parsed.orders)) {
        return {
          products: parsed.products,
          orders: parsed.orders,
        };
      }
    }
  } catch (err) {
    console.warn('Could not read persisted db, seeding defaults:', err);
  }
  return {
    products: structuredClone(PRODUCTS),
    orders: structuredClone(SAMPLE_TRACKING_ORDERS),
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

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // Health
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, storeCount: STORES_DATA.length });
  });

  // Get all products
  app.get('/api/products', (_req, res) => {
    res.json({ products: db.products });
  });

  // Add new product
  app.post('/api/products', (req, res) => {
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
      storeLocation: body.storeLocation || 'Hitech City Metro',
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
        Array.isArray(body.gallery) && body.gallery.length > 0
          ? body.gallery
          : ['/src/assets/images/jhonty_mens_overshirt_1794941649529.jpg'],
    };

    db.products = [newProduct, ...db.products];
    saveDatabase();
    res.status(201).json({ product: newProduct });
  });

  // Update product details or inventory
  app.patch('/api/products/:id', (req, res) => {
    const id = Number(req.params.id);
    const idx = db.products.findIndex((p) => p.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    const existing = db.products[idx];
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

    const updated: Product = {
      ...existing,
      ...patch,
      id: existing.id,
      brand: patch.brand ? patch.brand.trim().toUpperCase() : existing.brand,
      title: patch.title ? patch.title.trim() : existing.title,
      price: typeof patch.price === 'number' ? Math.max(1, patch.price) : existing.price,
      mrp: typeof patch.mrp === 'number' ? Math.max(1, patch.mrp) : existing.mrp,
      sizes: updatedSizes,
      sizeStock: mergedSizeStock,
      stock: sumSizeStock(mergedSizeStock),
      updatedAt: new Date().toISOString(),
    };

    db.products[idx] = updated;
    saveDatabase();
    res.json({ product: updated });
  });

  // Restock a specific product (delta or explicit sizeStock)
  app.post('/api/products/:id/restock', (req, res) => {
    const id = Number(req.params.id);
    const idx = db.products.findIndex((p) => p.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    const existing = db.products[idx];
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

  // Bulk refresh low-stock inventory
  app.post('/api/products/refresh-inventory', (req, res) => {
    const { minPerSize = 10 } = (req.body || {}) as { minPerSize?: number };
    const target = Math.max(1, Number(minPerSize) || 10);
    let refreshedCount = 0;

    db.products = db.products.map((p) => {
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

  // Delete product
  app.delete('/api/products/:id', (req, res) => {
    const id = Number(req.params.id);
    const before = db.products.length;
    db.products = db.products.filter((p) => p.id !== id);
    if (db.products.length === before) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
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

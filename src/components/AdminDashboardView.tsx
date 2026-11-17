import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Boxes,
  CheckCircle2,
  Edit3,
  KeyRound,
  LogOut,
  MapPin,
  Moon,
  Package,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShoppingBag,
  Sun,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSION_DEFINITIONS,
  STORE_SCOPES,
} from '../data/adminUsers';
import { STORES_DATA, formatINR } from '../data/catalog';
import { OrderTrackingRecord } from '../data/tracking';
import {
  Category,
  Occasion,
  Product,
  PublicStaffUser,
  StaffPermission,
  StaffRole,
  StoreScope,
} from '../types';
import { BrandLogo } from './BrandLogo';
import { ResilientImage } from './ResilientImage';

type AdminTab = 'inventory' | 'catalog' | 'orders' | 'stores' | 'users';
type StockFilter = 'all' | 'in' | 'low' | 'out';

interface UserPayloadInput {
  fullName: string;
  username: string;
  password?: string;
  role: StaffRole;
  assignedStore: StoreScope;
  permissions: StaffPermission[];
  active: boolean;
}

interface AdminDashboardViewProps {
  theme: 'light' | 'dark';
  currentUser: PublicStaffUser;
  staffUsers: PublicStaffUser[];
  products: Product[];
  orders: OrderTrackingRecord[];
  isLoading: boolean;
  isBusy: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  onCreateProduct: (payload: Partial<Product>) => Promise<boolean>;
  onUpdateProduct: (id: number, patch: Partial<Product>) => Promise<boolean>;
  onRestockProduct: (
    id: number,
    payload: { deltaPerSize?: number; sizeStock?: Record<string, number> }
  ) => Promise<boolean>;
  onRefreshInventory: (minPerSize?: number) => Promise<void>;
  onDeleteProduct: (id: number) => Promise<void>;
  onUpdateOrderStatus: (orderId: string, status: OrderTrackingRecord['status']) => Promise<void>;
  onCreateStaffUser: (payload: UserPayloadInput) => Promise<{ ok: boolean; error?: string }>;
  onUpdateStaffUser: (
    id: string,
    patch: Partial<UserPayloadInput>
  ) => Promise<{ ok: boolean; error?: string }>;
  onDeleteStaffUser: (id: string) => Promise<void>;
  onTrackOrder: (orderId: string) => void;
  onOpenProduct: (id: number) => void;
  onBackToStore: () => void;
}

const IMAGE_PRESETS = [
  { label: 'Plaid Overshirt', path: '/src/assets/images/jhonty_mens_overshirt_1794941649529.jpg' },
  { label: 'Utility Bomber Jacket', path: '/src/assets/images/jhonty_mens_jacket_1794941649320.jpg' },
  { label: 'Linen & Denim Pairing', path: '/src/assets/images/jhonty_mens_denim_1794941650819.jpg' },
  { label: 'Giza Cotton Formal Shirt', path: '/src/assets/images/prod_formal_shirt_1794940942746.jpg' },
  { label: 'Combed Cotton Polo', path: '/src/assets/images/prod_mens_polo_1794940943524.jpg' },
  { label: 'Olive Field Shacket', path: '/src/assets/images/jhonty_hub_hero_1794941649302.jpg' },
  { label: 'Running Sneakers', path: '/src/assets/images/prod_running_sneakers_1794940944846.jpg' },
  { label: 'Executive Work Tote', path: '/src/assets/images/prod_vegan_tote_1794940946088.jpg' },
];

const CATEGORIES: Exclude<Category, 'All'>[] = [
  'Shirts & Polos',
  'Denim & Chinos',
  'Outerwear',
  'Footwear',
  'Accessories',
];

const OCCASIONS: Occasion[] = ['Casual', 'Workwear', 'Active', 'Festive'];

const STORE_LOCATIONS = ['Hitech City Metro', 'Venkata Ramana Colony', 'Kukatpally Hub'];

const ORDER_STATUSES: OrderTrackingRecord['status'][] = [
  'Order Placed',
  'Packed at Jhonty Hub',
  'In Transit',
  'Out for Delivery',
  'Delivered',
  'Ready for Store Pickup',
];

function getStockStatus(p: Product): {
  key: 'in' | 'low' | 'out';
  label: string;
  textClass: string;
} {
  if (p.stock <= 0) {
    return { key: 'out', label: 'Out of Stock', textClass: 'text-red-600 dark:text-red-400' };
  }
  if (p.stock <= p.reorderLevel) {
    return { key: 'low', label: 'Low Stock', textClass: 'text-amber-700 dark:text-amber-400' };
  }
  return { key: 'in', label: 'In Stock', textClass: 'text-emerald-700 dark:text-emerald-400' };
}

interface ProductFormState {
  id?: number;
  sku: string;
  brand: string;
  title: string;
  category: Exclude<Category, 'All'>;
  occasion: Occasion;
  storeLocation: string;
  price: string;
  mrp: string;
  reorderLevel: string;
  sizesText: string;
  defaultSizeQty: string;
  fabric: string;
  fit: string;
  care: string;
  description: string;
  image: string;
}

const EMPTY_FORM: ProductFormState = {
  sku: '',
  brand: 'JHONTY ORIGINALS',
  title: '',
  category: 'Shirts & Polos',
  occasion: 'Casual',
  storeLocation: 'Hitech City Metro',
  price: '1299',
  mrp: '2499',
  reorderLevel: '10',
  sizesText: 'S, M, L, XL',
  defaultSizeQty: '12',
  fabric: '100% Combed Cotton',
  fit: 'Regular Fit',
  care: 'Machine Wash Cold',
  description: '',
  image: IMAGE_PRESETS[0].path,
};

interface UserFormState {
  id?: string;
  fullName: string;
  username: string;
  password: string;
  role: StaffRole;
  assignedStore: StoreScope;
  permissions: StaffPermission[];
  active: boolean;
}

const EMPTY_USER_FORM: UserFormState = {
  fullName: '',
  username: '',
  password: '',
  role: 'team',
  assignedStore: 'Hitech City Metro',
  permissions: [...DEFAULT_ROLE_PERMISSIONS.team],
  active: true,
};

export function AdminDashboardView({
  theme,
  currentUser,
  staffUsers,
  products,
  orders,
  isLoading,
  isBusy,
  onToggleTheme,
  onLogout,
  onCreateProduct,
  onUpdateProduct,
  onRestockProduct,
  onRefreshInventory,
  onDeleteProduct,
  onUpdateOrderStatus,
  onCreateStaffUser,
  onUpdateStaffUser,
  onDeleteStaffUser,
  onTrackOrder,
  onOpenProduct,
  onBackToStore,
}: AdminDashboardViewProps) {
  const canInventory = currentUser.permissions.includes('manage_inventory');
  const canCatalog = currentUser.permissions.includes('manage_catalog');
  const canOrders = currentUser.permissions.includes('manage_orders');
  const canStores = currentUser.permissions.includes('manage_stores');
  const canUsers = currentUser.permissions.includes('manage_users');

  const isStoreScoped = currentUser.assignedStore !== 'All Stores';

  const navItems = useMemo(() => {
    const items: { id: AdminTab; label: string; icon: typeof Boxes; count?: number }[] = [];
    const visibleProducts = isStoreScoped
      ? products.filter((p) => p.storeLocation === currentUser.assignedStore)
      : products;
    const alertCount = visibleProducts.filter((p) => p.stock <= p.reorderLevel).length;

    if (canInventory) {
      items.push({ id: 'inventory', label: 'Inventory & Stock', icon: Boxes, count: alertCount });
    }
    if (canCatalog) {
      items.push({
        id: 'catalog',
        label: 'Catalog & Products',
        icon: ShoppingBag,
        count: visibleProducts.length,
      });
    }
    if (canOrders) {
      items.push({
        id: 'orders',
        label: 'Orders & Fulfillment',
        icon: Package,
        count: orders.length,
      });
    }
    if (canStores) {
      items.push({
        id: 'stores',
        label: 'Hyderabad Stores',
        icon: MapPin,
        count: isStoreScoped ? 1 : STORES_DATA.length,
      });
    }
    if (canUsers) {
      items.push({
        id: 'users',
        label: 'Team & Permissions',
        icon: Users,
        count: staffUsers.length,
      });
    }
    return items;
  }, [
    canInventory,
    canCatalog,
    canOrders,
    canStores,
    canUsers,
    isStoreScoped,
    currentUser.assignedStore,
    products,
    orders.length,
    staffUsers.length,
  ]);

  const [activeTab, setActiveTab] = useState<AdminTab>(navItems[0]?.id || 'inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category>('All');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [storeFilter, setStoreFilter] = useState<string>(
    isStoreScoped ? currentUser.assignedStore : 'All'
  );

  // Team Filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | StaffRole>('all');
  const [userStoreFilter, setUserStoreFilter] = useState<string>('All');

  // Product Add/Edit Modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [formState, setFormState] = useState<ProductFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  // Per-Size Stock Adjuster Modal
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);
  const [draftSizeStock, setDraftSizeStock] = useState<Record<string, number>>({});

  // Confirm delete inline state
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Staff User Create/Edit Modal
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState<UserFormState>(EMPTY_USER_FORM);
  const [userFormError, setUserFormError] = useState<string | null>(null);
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(null);

  useEffect(() => {
    if (navItems.length > 0 && !navItems.some((item) => item.id === activeTab)) {
      setActiveTab(navItems[0].id);
    }
  }, [navItems, activeTab]);

  useEffect(() => {
    if (isStoreScoped) {
      setStoreFilter(currentUser.assignedStore);
    }
  }, [isStoreScoped, currentUser.assignedStore]);

  const scopedProducts = useMemo(() => {
    if (!isStoreScoped) return products;
    return products.filter((p) => p.storeLocation === currentUser.assignedStore);
  }, [products, isStoreScoped, currentUser.assignedStore]);

  const metrics = useMemo(() => {
    const totalSkus = scopedProducts.length;
    const totalUnits = scopedProducts.reduce((sum, p) => sum + p.stock, 0);
    const lowStockCount = scopedProducts.filter(
      (p) => p.stock > 0 && p.stock <= p.reorderLevel
    ).length;
    const outOfStockCount = scopedProducts.filter((p) => p.stock <= 0).length;
    const inventoryValue = scopedProducts.reduce((sum, p) => sum + p.stock * p.price, 0);
    return {
      totalSkus,
      totalUnits,
      alertCount: lowStockCount + outOfStockCount,
      lowStockCount,
      outOfStockCount,
      inventoryValue,
    };
  }, [scopedProducts]);

  const filteredProducts = useMemo(() => {
    return scopedProducts.filter((p) => {
      if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
      if (!isStoreScoped && storeFilter !== 'All' && p.storeLocation !== storeFilter) return false;
      const status = getStockStatus(p).key;
      if (stockFilter !== 'all' && status !== stockFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const match =
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.storeLocation.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [scopedProducts, categoryFilter, isStoreScoped, storeFilter, stockFilter, searchQuery]);

  const filteredStaffUsers = useMemo(() => {
    return staffUsers.filter((u) => {
      if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
      if (userStoreFilter !== 'All' && u.assignedStore !== userStoreFilter) return false;
      if (userSearch.trim()) {
        const q = userSearch.trim().toLowerCase();
        return (
          u.fullName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.assignedStore.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [staffUsers, userRoleFilter, userStoreFilter, userSearch]);

  const openCreateModal = () => {
    const nextNum = 101 + products.length;
    setFormState({
      ...EMPTY_FORM,
      sku: `JH-MN-${nextNum}`,
      storeLocation: isStoreScoped ? currentUser.assignedStore : 'Hitech City Metro',
    });
    setFormError(null);
    setProductModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setFormState({
      id: p.id,
      sku: p.sku,
      brand: p.brand,
      title: p.title,
      category: p.category,
      occasion: p.occasion,
      storeLocation: p.storeLocation,
      price: String(p.price),
      mrp: String(p.mrp),
      reorderLevel: String(p.reorderLevel),
      sizesText: p.sizes.join(', '),
      defaultSizeQty: '10',
      fabric: p.fabric,
      fit: p.fit,
      care: p.care,
      description: p.description,
      image: p.gallery[0] || IMAGE_PRESETS[0].path,
    });
    setFormError(null);
    setProductModalOpen(true);
  };

  const openStockAdjuster = (p: Product) => {
    setStockModalProduct(p);
    const copy: Record<string, number> = {};
    p.sizes.forEach((s) => {
      copy[s] = p.sizeStock[s] ?? 0;
    });
    setDraftSizeStock(copy);
  };

  const openCreateUserModal = () => {
    setUserForm({ ...EMPTY_USER_FORM });
    setUserFormError(null);
    setUserModalOpen(true);
  };

  const openEditUserModal = (u: PublicStaffUser) => {
    setUserForm({
      id: u.id,
      fullName: u.fullName,
      username: u.username,
      password: '',
      role: u.role,
      assignedStore: u.assignedStore,
      permissions: [...u.permissions],
      active: u.active,
    });
    setUserFormError(null);
    setUserModalOpen(true);
  };

  const handleRoleSwitchInForm = (nextRole: StaffRole) => {
    setUserForm((prev) => ({
      ...prev,
      role: nextRole,
      assignedStore:
        nextRole === 'admin'
          ? 'All Stores'
          : prev.assignedStore === 'All Stores'
            ? 'Hitech City Metro'
            : prev.assignedStore,
      permissions: [...DEFAULT_ROLE_PERMISSIONS[nextRole]],
    }));
  };

  const toggleUserPermission = (perm: StaffPermission) => {
    setUserForm((prev) => {
      const exists = prev.permissions.includes(perm);
      const next = exists
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm];
      return { ...prev, permissions: next };
    });
  };

  const handleSubmitProduct = async (e: FormEvent) => {
    e.preventDefault();
    const price = Number(formState.price);
    const mrp = Number(formState.mrp);
    const reorderLevel = Math.max(0, Number(formState.reorderLevel) || 10);
    const sizes = formState.sizesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (!formState.title.trim() || !formState.brand.trim()) {
      setFormError('Brand and Product Title are required.');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setFormError('Selling price must be greater than ₹0.');
      return;
    }
    if (sizes.length === 0) {
      setFormError('Enter at least one size (e.g. S, M, L, XL).');
      return;
    }

    const resolvedMrp = Number.isFinite(mrp) && mrp >= price ? mrp : price * 2;
    const payload: Partial<Product> = {
      sku: formState.sku.trim().toUpperCase(),
      brand: formState.brand.trim().toUpperCase(),
      title: formState.title.trim(),
      category: formState.category,
      occasion: formState.occasion,
      storeLocation: isStoreScoped ? currentUser.assignedStore : formState.storeLocation,
      price,
      mrp: resolvedMrp,
      reorderLevel,
      sizes,
      fabric: formState.fabric.trim() || '100% Cotton',
      fit: formState.fit.trim() || 'Regular Fit',
      care: formState.care.trim() || 'Machine Wash Cold',
      description:
        formState.description.trim() ||
        'Curated Jhonty Hub branded menswear piece stocked at our Madhapur showroom.',
      gallery: [formState.image.trim() || IMAGE_PRESETS[0].path],
    };

    let ok = false;
    if (formState.id) {
      ok = await onUpdateProduct(formState.id, payload);
    } else {
      const qtyEach = Math.max(0, Number(formState.defaultSizeQty) || 0);
      const sizeStock: Record<string, number> = {};
      sizes.forEach((s) => {
        sizeStock[s] = qtyEach;
      });
      ok = await onCreateProduct({
        ...payload,
        sizeStock,
        stock: qtyEach * sizes.length,
      });
    }

    if (ok) {
      setProductModalOpen(false);
    }
  };

  const handleSaveSizeStock = async (e: FormEvent) => {
    e.preventDefault();
    if (!stockModalProduct) return;
    const ok = await onRestockProduct(stockModalProduct.id, { sizeStock: draftSizeStock });
    if (ok) {
      setStockModalProduct(null);
    }
  };

  const handleSubmitUser = async (e: FormEvent) => {
    e.preventDefault();
    setUserFormError(null);

    if (!userForm.fullName.trim() || !userForm.username.trim()) {
      setUserFormError('Full name and username are required.');
      return;
    }
    if (!userForm.id && userForm.password.trim().length < 4) {
      setUserFormError('Create a password of at least 4 characters.');
      return;
    }
    if (userForm.id && userForm.password.trim() && userForm.password.trim().length < 4) {
      setUserFormError('New password must be at least 4 characters.');
      return;
    }
    if (userForm.permissions.length === 0) {
      setUserFormError('Select at least one permission for this account.');
      return;
    }

    const res = userForm.id
      ? await onUpdateStaffUser(userForm.id, {
          fullName: userForm.fullName.trim(),
          role: userForm.role,
          assignedStore: userForm.assignedStore,
          permissions: userForm.permissions,
          active: userForm.active,
          ...(userForm.password.trim() ? { password: userForm.password.trim() } : {}),
        })
      : await onCreateStaffUser({
          fullName: userForm.fullName.trim(),
          username: userForm.username.trim().toLowerCase().replace(/\s+/g, '_'),
          password: userForm.password.trim(),
          role: userForm.role,
          assignedStore: userForm.assignedStore,
          permissions: userForm.permissions,
          active: userForm.active,
        });

    if (res.ok) {
      setUserModalOpen(false);
    } else {
      setUserFormError(res.error || 'Could not save user account.');
    }
  };

  const sectionLabelMap: Record<AdminTab, string> = {
    inventory: 'Inventory & Stock',
    catalog: 'Catalog & Products',
    orders: 'Orders & Fulfillment',
    stores: 'Hyderabad Stores',
    users: 'Team & Permissions',
  };

  const permissionLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    PERMISSION_DEFINITIONS.forEach((p) => {
      map[p.key] = p.label;
    });
    return map;
  }, []);

  const visibleStores = isStoreScoped
    ? STORES_DATA.filter((st) => st.name.includes(currentUser.assignedStore) || (currentUser.assignedStore === 'Venkata Ramana Colony' && st.name.includes('Venkata Ramana')) || (currentUser.assignedStore === 'Kukatpally Hub' && st.name.includes('Kukatpally')) || (currentUser.assignedStore === 'Hitech City Metro' && st.name.includes('Hitech City')))
    : STORES_DATA;

  return (
    <div className="bg-neutral-50 dark:bg-[#080808] min-h-screen flex flex-col transition-colors">
      {/* Dedicated Top Operations Bar (Separate from Customer Storefront) */}
      <header className="sticky top-0 z-40 h-16 bg-white dark:bg-[#0b0b0b] border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <BrandLogo compact variant={theme} />
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-neutral-200 dark:border-neutral-800">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
              Operations Console
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                currentUser.role === 'admin'
                  ? 'bg-[#faa619] text-neutral-950'
                  : 'bg-neutral-950 dark:bg-neutral-800 text-white dark:text-neutral-200'
              }`}
            >
              {currentUser.role}
            </span>
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              · {currentUser.assignedStore}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:block text-right mr-2">
            <div className="text-xs font-bold text-neutral-950 dark:text-white leading-tight">
              {currentUser.fullName}
            </div>
            <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              @{currentUser.username}
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            role="switch"
            aria-checked={theme === 'dark'}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="inline-flex items-center gap-1.5 px-2.5 h-9 border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 hover:border-[#faa619] text-neutral-800 dark:text-neutral-100 text-xs font-semibold rounded-md transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#faa619]" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-700" />
            )}
            <span className="hidden lg:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

          <button
            type="button"
            onClick={onBackToStore}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 h-9 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-950 dark:hover:border-neutral-500 text-neutral-900 dark:text-neutral-100 text-xs font-bold uppercase tracking-wider rounded-md transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 h-9 border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 hover:bg-red-600 hover:text-white dark:hover:bg-red-700 text-red-700 dark:text-red-400 text-xs font-bold uppercase tracking-wider rounded-md transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <div className="max-w-[1440px] w-full mx-auto flex flex-col lg:flex-row flex-1">
        {/* Left Sidebar (Desktop) */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 shrink-0 bg-white dark:bg-[#0b0b0b] border-r border-neutral-200 dark:border-neutral-800 p-4 justify-between">
          <div>
            <div className="px-2.5 pb-4 mb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#d98200] dark:text-[#faa619]">
                {currentUser.role === 'admin' ? 'Administrator Access' : 'Store Team Access'}
              </div>
              <div className="text-sm font-bold text-neutral-950 dark:text-white mt-0.5 truncate">
                {currentUser.assignedStore}
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                {currentUser.permissions.length} of {PERMISSION_DEFINITIONS.length} modules enabled
              </div>
            </div>

            <nav className="space-y-1" aria-label="Admin sections">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                      active
                        ? 'bg-neutral-950 dark:bg-[#faa619] text-white dark:text-neutral-950'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-950 dark:hover:text-white'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </span>
                    {typeof item.count === 'number' && (
                      <span
                        className={`text-xs tabular-nums font-mono ${
                          active
                            ? 'text-[#faa619] dark:text-neutral-950'
                            : 'text-neutral-500 dark:text-neutral-400'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="px-2.5 py-2 rounded-md bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-400">
              <div className="font-bold text-neutral-900 dark:text-neutral-200 mb-1">
                Active Permissions
              </div>
              <div className="leading-relaxed">
                {currentUser.permissions.map((p) => permissionLabelMap[p]).join(' · ')}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Mobile Tab Bar */}
          <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-2 rounded-md text-xs font-bold whitespace-nowrap shrink-0 border ${
                  activeTab === item.id
                    ? 'bg-neutral-950 dark:bg-[#faa619] text-white dark:text-neutral-950 border-neutral-950 dark:border-[#faa619]'
                    : 'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-800'
                }`}
              >
                {item.label} ({item.count})
              </button>
            ))}
          </div>

          {/* Top Breadcrumb Bar + Primary Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-200 dark:border-neutral-800">
            <div>
              <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Jhonty Hub / {currentUser.assignedStore} /{' '}
                <span className="text-neutral-950 dark:text-white font-semibold">
                  {sectionLabelMap[activeTab]}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 dark:text-white mt-1">
                {sectionLabelMap[activeTab]}
              </h1>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {activeTab === 'users' && canUsers ? (
                <button
                  type="button"
                  onClick={openCreateUserModal}
                  className="inline-flex items-center gap-1.5 h-10 px-4 bg-[#faa619] hover:bg-[#e6950c] text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-md whitespace-nowrap shrink-0 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create User Credential</span>
                </button>
              ) : (
                <>
                  {canInventory && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onRefreshInventory(10)}
                      className="inline-flex items-center gap-1.5 h-10 px-3.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-950 dark:hover:border-neutral-500 text-neutral-900 dark:text-neutral-100 text-xs font-bold uppercase tracking-wider rounded-md whitespace-nowrap shrink-0 disabled:opacity-50 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isBusy ? 'animate-spin' : ''}`} />
                      <span>Refresh Low Stock</span>
                    </button>
                  )}
                  {canCatalog && (
                    <button
                      type="button"
                      onClick={openCreateModal}
                      className="inline-flex items-center gap-1.5 h-10 px-4 bg-[#faa619] hover:bg-[#e6950c] text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-md whitespace-nowrap shrink-0 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Product</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* 4-Column Summary Strip */}
          {activeTab !== 'users' && (
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
                <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  Active Catalog SKUs
                </div>
                <div className="text-2xl font-bold text-neutral-950 dark:text-white tabular-nums mt-1">
                  {metrics.totalSkus}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  {isStoreScoped ? `Scoped: ${currentUser.assignedStore}` : 'Across 3 Hyderabad stores'}
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
                <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  Total Units on Hand
                </div>
                <div className="text-2xl font-bold text-neutral-950 dark:text-white tabular-nums mt-1">
                  {metrics.totalUnits.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-1">
                  Synced with live storefront
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
                <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  Stock Alerts
                </div>
                <div
                  className={`text-2xl font-bold tabular-nums mt-1 ${
                    metrics.alertCount > 0
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {metrics.alertCount}
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 tabular-nums">
                  {metrics.lowStockCount} Low Stock · {metrics.outOfStockCount} Out of Stock
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
                <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  Inventory Retail Value
                </div>
                <div className="text-2xl font-bold text-neutral-950 dark:text-white tabular-nums mt-1">
                  {formatINR(metrics.inventoryValue)}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 tabular-nums">
                  {orders.length} active &amp; completed orders
                </div>
              </div>
            </section>
          )}

          {/* INVENTORY OR CATALOG TAB */}
          {(activeTab === 'inventory' || activeTab === 'catalog') && (
            <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
              {/* Filter Bar */}
              <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search SKU, product title, brand, or store..."
                    aria-label="Filter inventory"
                    className="w-full h-10 pl-9 pr-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm text-neutral-950 dark:text-neutral-100 placeholder:text-neutral-400 focus:bg-white dark:focus:bg-neutral-950 focus:border-[#faa619] focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as Category)}
                    aria-label="Filter by department"
                    className="h-10 px-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-md text-xs font-semibold text-neutral-800 dark:text-neutral-100 focus:border-[#faa619] focus:outline-none"
                  >
                    <option value="All">All Departments</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <select
                    value={isStoreScoped ? currentUser.assignedStore : storeFilter}
                    disabled={isStoreScoped}
                    onChange={(e) => setStoreFilter(e.target.value)}
                    aria-label="Filter by store location"
                    className="h-10 px-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-md text-xs font-semibold text-neutral-800 dark:text-neutral-100 disabled:opacity-60 focus:border-[#faa619] focus:outline-none"
                  >
                    {!isStoreScoped && <option value="All">All Store Locations</option>}
                    {STORE_LOCATIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>

                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value as StockFilter)}
                    aria-label="Filter by stock status"
                    className="h-10 px-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-md text-xs font-semibold text-neutral-800 dark:text-neutral-100 focus:border-[#faa619] focus:outline-none"
                  >
                    <option value="all">All Stock States</option>
                    <option value="in">In Stock</option>
                    <option value="low">Low Stock</option>
                    <option value="out">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Loading / Empty / Table */}
              {isLoading ? (
                <div className="p-10 text-center text-sm text-neutral-500 dark:text-neutral-400">
                  Loading live Jhonty Hub inventory...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-base font-bold text-neutral-950 dark:text-white">
                    No matching products in inventory
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 mb-5">
                    Try clearing your search or stock filter, or add a new SKU.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('All');
                      setStockFilter('all');
                      if (!isStoreScoped) setStoreFilter('All');
                    }}
                    className="px-4 py-2 border border-neutral-950 dark:border-neutral-700 text-neutral-950 dark:text-white text-xs font-bold uppercase tracking-wider rounded-md"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                        <th className="py-3 px-4">Product &amp; SKU</th>
                        <th className="py-3 px-4">Department &amp; Store</th>
                        <th className="py-3 px-4">Price / MRP</th>
                        <th className="py-3 px-4">Size Breakdown</th>
                        <th className="py-3 px-4">Total Stock</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-sm">
                      {filteredProducts.map((p) => {
                        const status = getStockStatus(p);
                        return (
                          <tr
                            key={p.id}
                            className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors"
                          >
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3 min-w-[240px]">
                                <button
                                  type="button"
                                  onClick={() => onOpenProduct(p.id)}
                                  className="w-11 h-14 rounded-md overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shrink-0"
                                >
                                  <ResilientImage
                                    src={p.gallery[0]}
                                    alt={p.title}
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                                <div className="min-w-0">
                                  <div className="text-xs font-mono font-semibold text-neutral-500 dark:text-neutral-400 tabular-nums">
                                    {p.sku} · {p.brand}
                                  </div>
                                  <button
                                    type="button"
                                    disabled={!canCatalog}
                                    onClick={() => canCatalog && openEditModal(p)}
                                    className="text-left font-semibold text-neutral-950 dark:text-white hover:text-[#d98200] dark:hover:text-[#faa619] disabled:hover:text-neutral-950 dark:disabled:hover:text-white line-clamp-1 mt-0.5"
                                  >
                                    {p.title}
                                  </button>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                {p.category}
                              </div>
                              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                {p.storeLocation}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap tabular-nums">
                              <div className="font-bold text-neutral-950 dark:text-white">
                                {formatINR(p.price)}
                              </div>
                              <div className="text-xs text-neutral-400 dark:text-neutral-500 line-through">
                                {formatINR(p.mrp)}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="text-xs font-mono text-neutral-700 dark:text-neutral-300 tabular-nums max-w-[240px] leading-relaxed">
                                {p.sizes.map((s, idx) => (
                                  <span key={s}>
                                    <span
                                      className={
                                        (p.sizeStock[s] ?? 0) === 0
                                          ? 'text-red-600 dark:text-red-400 font-semibold'
                                          : ''
                                      }
                                    >
                                      {s}: {p.sizeStock[s] ?? 0}
                                    </span>
                                    {idx < p.sizes.length - 1 ? ' · ' : ''}
                                  </span>
                                ))}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap tabular-nums">
                              <div className="font-bold text-neutral-950 dark:text-white">
                                {p.stock} units
                              </div>
                              <div className={`text-xs font-semibold mt-0.5 ${status.textClass}`}>
                                {status.label}
                                {status.key === 'low' ? ` (≤${p.reorderLevel})` : ''}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center justify-end gap-1.5">
                                {canInventory && (
                                  <>
                                    <button
                                      type="button"
                                      disabled={isBusy}
                                      onClick={() => onRestockProduct(p.id, { deltaPerSize: 5 })}
                                      title="Add +5 units to every size"
                                      className="px-2.5 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-[#faa619] text-neutral-900 dark:text-neutral-100 hover:text-neutral-950 text-xs font-bold rounded-md tabular-nums transition-colors"
                                    >
                                      +5 Sizes
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => openStockAdjuster(p)}
                                      className="px-2.5 py-1.5 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-950 dark:hover:border-neutral-500 text-neutral-800 dark:text-neutral-200 text-xs font-semibold rounded-md transition-colors"
                                    >
                                      Stock
                                    </button>
                                  </>
                                )}
                                {canCatalog && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => openEditModal(p)}
                                      aria-label={`Edit ${p.title}`}
                                      className="p-1.5 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-950 dark:hover:border-neutral-500 text-neutral-700 dark:text-neutral-300 rounded-md"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    {confirmDeleteId === p.id ? (
                                      <button
                                        type="button"
                                        disabled={isBusy}
                                        onClick={async () => {
                                          await onDeleteProduct(p.id);
                                          setConfirmDeleteId(null);
                                        }}
                                        className="px-2.5 py-1.5 bg-red-600 text-white text-xs font-bold rounded-md"
                                      >
                                        Confirm
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => setConfirmDeleteId(p.id)}
                                        aria-label={`Delete ${p.title}`}
                                        className="p-1.5 border border-neutral-300 dark:border-neutral-700 hover:border-red-600 dark:hover:border-red-500 text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 rounded-md"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* ORDERS & FULFILLMENT TAB */}
          {activeTab === 'orders' && canOrders && (
            <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-neutral-950 dark:text-white">
                    Customer Orders &amp; Dispatch Status
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Status updates sync immediately with the storefront Order Tracking map.
                  </p>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="p-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
                  No orders recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                        <th className="py-3 px-4">Order ID</th>
                        <th className="py-3 px-4">Destination &amp; Carrier</th>
                        <th className="py-3 px-4">Items</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4">Fulfillment Status</th>
                        <th className="py-3 px-4 text-right">Route</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-sm">
                      {orders.map((ord) => (
                        <tr
                          key={ord.orderId}
                          className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40"
                        >
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-mono font-bold text-neutral-950 dark:text-white tabular-nums">
                              {ord.orderId}
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                              {ord.placedAt}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-neutral-900 dark:text-neutral-100">
                              {ord.destinationCity}
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                              {ord.carrier} · {ord.awb}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-xs text-neutral-800 dark:text-neutral-200 space-y-0.5">
                              {ord.items.map((it, idx) => (
                                <div key={`${it.title}-${idx}`} className="line-clamp-1">
                                  {it.qty}× {it.brand} ({it.size})
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap font-bold text-neutral-950 dark:text-white tabular-nums">
                            {formatINR(ord.total)}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <select
                              value={ord.status}
                              disabled={isBusy}
                              onChange={(e) =>
                                onUpdateOrderStatus(
                                  ord.orderId,
                                  e.target.value as OrderTrackingRecord['status']
                                )
                              }
                              aria-label={`Update status for ${ord.orderId}`}
                              className="h-9 px-2.5 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-xs font-semibold text-neutral-900 dark:text-neutral-100 focus:border-[#faa619] focus:outline-none"
                            >
                              {ORDER_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => onTrackOrder(ord.orderId)}
                              className="px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-950 dark:hover:border-neutral-500 text-neutral-900 dark:text-neutral-100 text-xs font-semibold rounded-md"
                            >
                              Track Route
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* HYDERABAD STORES TAB */}
          {activeTab === 'stores' && canStores && (
            <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {visibleStores.map((st) => {
                const shortName = st.name.includes('Hitech City')
                  ? 'Hitech City Metro'
                  : st.name.includes('Venkata Ramana')
                  ? 'Venkata Ramana Colony'
                  : 'Kukatpally Hub';
                const storeProducts = products.filter((p) => p.storeLocation === shortName);
                const storeUnits = storeProducts.reduce((s, p) => s + p.stock, 0);
                const storeAlerts = storeProducts.filter((p) => p.stock <= p.reorderLevel).length;
                const storeStaffCount = staffUsers.filter(
                  (u) => u.assignedStore === shortName || u.assignedStore === 'All Stores'
                ).length;

                return (
                  <div
                    key={st.id}
                    className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold text-[#d98200] dark:text-[#faa619]">
                          {st.id} · {st.city}
                        </span>
                        <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                          {storeStaffCount} staff assigned
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-neutral-950 dark:text-white mt-1">
                        {st.name}
                      </h3>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1.5 leading-relaxed">
                        {st.address}
                      </p>

                      <dl className="grid grid-cols-3 gap-2 pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-800 tabular-nums">
                        <div>
                          <dt className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            SKUs
                          </dt>
                          <dd className="text-base font-bold text-neutral-950 dark:text-white">
                            {storeProducts.length}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            Units
                          </dt>
                          <dd className="text-base font-bold text-neutral-950 dark:text-white">
                            {storeUnits}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            Alerts
                          </dt>
                          <dd
                            className={`text-base font-bold ${
                              storeAlerts > 0
                                ? 'text-amber-700 dark:text-amber-400'
                                : 'text-emerald-700 dark:text-emerald-400'
                            }`}
                          >
                            {storeAlerts}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {canInventory && (
                      <button
                        type="button"
                        onClick={() => {
                          setStoreFilter(shortName);
                          setActiveTab('inventory');
                        }}
                        className="w-full h-10 border border-neutral-950 dark:border-neutral-700 text-neutral-950 dark:text-white hover:bg-[#faa619] hover:border-[#faa619] hover:text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-md transition-colors"
                      >
                        View Store Inventory
                      </button>
                    )}
                  </div>
                );
              })}
            </section>
          )}

          {/* TEAM & PERMISSIONS TAB (Admin Only) */}
          {activeTab === 'users' && canUsers && (
            <div className="space-y-6">
              {/* Role & Store Summary Strip */}
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
                  <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    Total Staff Accounts
                  </div>
                  <div className="text-2xl font-bold text-neutral-950 dark:text-white tabular-nums mt-1">
                    {staffUsers.length}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {staffUsers.filter((u) => u.active).length} active credentials
                  </div>
                </div>

                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
                  <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    Admin Accounts
                  </div>
                  <div className="text-2xl font-bold text-[#d98200] dark:text-[#faa619] tabular-nums mt-1">
                    {staffUsers.filter((u) => u.role === 'admin').length}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Full system &amp; role control
                  </div>
                </div>

                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
                  <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    Store Team Leads
                  </div>
                  <div className="text-2xl font-bold text-neutral-950 dark:text-white tabular-nums mt-1">
                    {staffUsers.filter((u) => u.role === 'team').length}
                  </div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-1">
                    Store-wise scoped permissions
                  </div>
                </div>

                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
                  <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    Store Coverage
                  </div>
                  <div className="text-2xl font-bold text-neutral-950 dark:text-white tabular-nums mt-1">
                    {STORES_DATA.length} Hubs
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Madhapur · Hitech · Kukatpally
                  </div>
                </div>
              </section>

              {/* Team Directory & Credentials Table */}
              <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="search"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search staff name, username, or store..."
                      aria-label="Search staff credentials"
                      className="w-full h-10 pl-9 pr-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm text-neutral-950 dark:text-neutral-100 placeholder:text-neutral-400 focus:bg-white dark:focus:bg-neutral-950 focus:border-[#faa619] focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value as 'all' | StaffRole)}
                      aria-label="Filter users by role"
                      className="h-10 px-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-md text-xs font-semibold text-neutral-800 dark:text-neutral-100 focus:border-[#faa619] focus:outline-none"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admin Only</option>
                      <option value="team">Team Only</option>
                    </select>

                    <select
                      value={userStoreFilter}
                      onChange={(e) => setUserStoreFilter(e.target.value)}
                      aria-label="Filter users by assigned store"
                      className="h-10 px-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-md text-xs font-semibold text-neutral-800 dark:text-neutral-100 focus:border-[#faa619] focus:outline-none"
                    >
                      <option value="All">All Store Assignments</option>
                      {STORE_SCOPES.map((sc) => (
                        <option key={sc} value={sc}>
                          {sc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {filteredStaffUsers.length === 0 ? (
                  <div className="p-10 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    No staff credentials matched your filter.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                          <th className="py-3 px-4">Staff Member &amp; Username</th>
                          <th className="py-3 px-4">Account Role</th>
                          <th className="py-3 px-4">Assigned Store</th>
                          <th className="py-3 px-4">Granted Permissions</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-sm">
                        {filteredStaffUsers.map((u) => {
                          const isSelf = u.id === currentUser.id;
                          return (
                            <tr
                              key={u.id}
                              className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors"
                            >
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                                  <span>{u.fullName}</span>
                                  {isSelf && (
                                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mt-0.5">
                                  @{u.username}
                                  {u.createdBy ? ` · Added by ${u.createdBy}` : ''}
                                </div>
                              </td>

                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                                    u.role === 'admin'
                                      ? 'bg-[#faa619] text-neutral-950'
                                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                                  }`}
                                >
                                  <Shield className="w-3 h-3" />
                                  <span>{u.role}</span>
                                </span>
                              </td>

                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                  {u.assignedStore}
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="text-xs text-neutral-700 dark:text-neutral-300 max-w-xs leading-relaxed">
                                  {u.permissions.map((p) => permissionLabelMap[p] || p).join(' · ')}
                                </div>
                              </td>

                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span
                                  className={`text-xs font-bold ${
                                    u.active
                                      ? 'text-emerald-700 dark:text-emerald-400'
                                      : 'text-red-600 dark:text-red-400'
                                  }`}
                                >
                                  {u.active ? 'Active' : 'Suspended'}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                <div className="inline-flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() => openEditUserModal(u)}
                                    className="px-2.5 py-1.5 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-950 dark:hover:border-neutral-500 text-neutral-800 dark:text-neutral-200 text-xs font-semibold rounded-md transition-colors"
                                  >
                                    Edit Access
                                  </button>

                                  {!isSelf && (
                                    <button
                                      type="button"
                                      disabled={isBusy}
                                      onClick={() =>
                                        onUpdateStaffUser(u.id, { active: !u.active })
                                      }
                                      className="px-2.5 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs font-semibold rounded-md transition-colors"
                                    >
                                      {u.active ? 'Suspend' : 'Activate'}
                                    </button>
                                  )}

                                  {!isSelf &&
                                    (confirmDeleteUserId === u.id ? (
                                      <button
                                        type="button"
                                        disabled={isBusy}
                                        onClick={async () => {
                                          await onDeleteStaffUser(u.id);
                                          setConfirmDeleteUserId(null);
                                        }}
                                        className="px-2.5 py-1.5 bg-red-600 text-white text-xs font-bold rounded-md"
                                      >
                                        Confirm
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => setConfirmDeleteUserId(u.id)}
                                        aria-label={`Delete ${u.fullName}`}
                                        className="p-1.5 border border-neutral-300 dark:border-neutral-700 hover:border-red-600 dark:hover:border-red-500 text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 rounded-md"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    ))}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>

      {/* CREATE / EDIT TEAM & ADMIN USER MODAL */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[1px]">
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between sticky top-0 bg-white dark:bg-neutral-900 z-10">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#d98200] dark:text-[#faa619]" />
                <h2 className="text-base font-bold text-neutral-950 dark:text-white">
                  {userForm.id
                    ? `Edit Credentials & Permissions (@${userForm.username})`
                    : 'Create Store-Wise Staff Credential'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setUserModalOpen(false)}
                aria-label="Close user modal"
                className="p-1 text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitUser} className="p-6 space-y-5">
              {userFormError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 rounded-md text-xs font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{userFormError}</span>
                </div>
              )}

              {/* Identity & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={userForm.fullName}
                    onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                    placeholder="e.g. Kiran Kumar"
                    className="w-full h-10 px-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm text-neutral-950 dark:text-neutral-100 focus:border-[#faa619] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Login Username *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(userForm.id)}
                    value={userForm.username}
                    onChange={(e) =>
                      setUserForm({
                        ...userForm,
                        username: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                      })
                    }
                    placeholder="e.g. kukatpally_lead"
                    className="w-full h-10 px-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm font-mono text-neutral-950 dark:text-neutral-100 disabled:opacity-60 focus:border-[#faa619] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    {userForm.id ? 'Reset Password (optional)' : 'Login Password *'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required={!userForm.id}
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      placeholder={
                        userForm.id ? 'Leave blank to keep existing' : 'Min 4 characters'
                      }
                      className="flex-1 h-10 px-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm font-mono text-neutral-950 dark:text-neutral-100 focus:border-[#faa619] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const rnd = `JH#${Math.floor(1000 + Math.random() * 9000)}`;
                        setUserForm({ ...userForm, password: rnd });
                      }}
                      className="px-3 h-10 border border-neutral-300 dark:border-neutral-700 hover:border-[#faa619] text-xs font-bold rounded-md text-neutral-800 dark:text-neutral-200 shrink-0"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Store Assignment *
                  </label>
                  <select
                    value={userForm.assignedStore}
                    onChange={(e) =>
                      setUserForm({ ...userForm, assignedStore: e.target.value as StoreScope })
                    }
                    className="w-full h-10 px-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm font-semibold text-neutral-950 dark:text-neutral-100 focus:border-[#faa619] focus:outline-none"
                  >
                    {STORE_SCOPES.map((sc) => (
                      <option key={sc} value={sc}>
                        {sc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Role Selection: Admin vs Team */}
              <div>
                <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Choose Account Type (Admin or Team) *
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleRoleSwitchInForm('admin')}
                    className={`p-3.5 text-left rounded-lg border-2 transition-colors ${
                      userForm.role === 'admin'
                        ? 'border-[#faa619] bg-[#fffcf5] dark:bg-neutral-950'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-neutral-950 dark:text-white">
                        Admin
                      </span>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#faa619] text-neutral-950">
                        Full Access
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                      Full backoffice control including pricing, all stores, and creating Team users.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSwitchInForm('team')}
                    className={`p-3.5 text-left rounded-lg border-2 transition-colors ${
                      userForm.role === 'team'
                        ? 'border-[#faa619] bg-[#fffcf5] dark:bg-neutral-950'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-neutral-950 dark:text-white">
                        Team
                      </span>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-neutral-950 dark:bg-neutral-800 text-white dark:text-neutral-200">
                        Store Ops
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                      Store-scoped operations for stock updates, Click &amp; Collect, and order dispatch.
                    </p>
                  </button>
                </div>
              </div>

              {/* Granular Permissions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Role Permissions ({userForm.permissions.length} selected)
                  </span>
                  <div className="flex items-center gap-2 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() =>
                        setUserForm((prev) => ({
                          ...prev,
                          permissions: [...DEFAULT_ROLE_PERMISSIONS.admin],
                        }))
                      }
                      className="text-[#d98200] dark:text-[#faa619] hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-neutral-300 dark:text-neutral-700">|</span>
                    <button
                      type="button"
                      onClick={() =>
                        setUserForm((prev) => ({
                          ...prev,
                          permissions: [...DEFAULT_ROLE_PERMISSIONS.team],
                        }))
                      }
                      className="text-neutral-600 dark:text-neutral-400 hover:underline"
                    >
                      Team Preset
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {PERMISSION_DEFINITIONS.map((perm) => {
                    const checked = userForm.permissions.includes(perm.key);
                    return (
                      <label
                        key={perm.key}
                        className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                          checked
                            ? 'border-[#faa619]/70 bg-[#fffcf5] dark:bg-neutral-950'
                            : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleUserPermission(perm.key)}
                          className="mt-0.5 accent-[#faa619]"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-neutral-950 dark:text-white">
                            {perm.label}
                          </div>
                          <div className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">
                            {perm.description}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={userForm.active}
                  onChange={(e) => setUserForm({ ...userForm, active: e.target.checked })}
                  className="accent-[#faa619]"
                />
                <span>Account Active (allow immediate sign-in at /admin)</span>
              </label>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="h-10 px-4 border border-neutral-300 dark:border-neutral-700 text-xs font-bold uppercase tracking-wider rounded-md text-neutral-700 dark:text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBusy}
                  className="h-10 px-5 bg-[#faa619] hover:bg-[#e6950c] text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-md disabled:opacity-50"
                >
                  {userForm.id ? 'Save Permissions' : 'Create Credential'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[1px]">
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between sticky top-0 bg-white dark:bg-neutral-900 z-10">
              <h2 className="text-base font-bold text-neutral-950 dark:text-white">
                {formState.id ? 'Edit Product & Pricing' : 'Add New Catalog Product'}
              </h2>
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                aria-label="Close product modal"
                className="p-1 text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 rounded-md text-xs font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.brand}
                    onChange={(e) => setFormState({ ...formState, brand: e.target.value })}
                    placeholder="e.g. JHONTY ORIGINALS"
                    className="w-full h-10 px-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm text-neutral-950 dark:text-neutral-100 focus:border-[#faa619] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={formState.sku}
                    onChange={(e) => setFormState({ ...formState, sku: e.target.value })}
                    placeholder="e.g. JH-OS-109"
                    className="w-full h-10 px-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm font-mono uppercase text-neutral-950 dark:text-neutral-100 focus:border-[#faa619] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  placeholder="e.g. Men Brushed Twill Overshirt"
                  className="w-full h-10 px-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm text-neutral-950 dark:text-neutral-100 focus:border-[#faa619] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Department
                  </label>
                  <select
                    value={formState.category}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        category: e.target.value as Exclude<Category, 'All'>,
                      })
                    }
                    className="w-full h-10 px-3 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm bg-white dark:bg-neutral-950 text-neutral-950 dark:text-neutral-100 focus:border-[#faa619] focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Occasion
                  </label>
                  <select
                    value={formState.occasion}
                    onChange={(e) =>
                      setFormState({ ...formState, occasion: e.target.value as Occasion })
                    }
                    className="w-full h-10 px-3 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm bg-white dark:bg-neutral-950 text-neutral-950 dark:text-neutral-100 focus:border-[#faa619] focus:outline-none"
                  >
                    {OCCASIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Hyderabad Store
                  </label>
                  <select
                    value={isStoreScoped ? currentUser.assignedStore : formState.storeLocation}
                    disabled={isStoreScoped}
                    onChange={(e) =>
                      setFormState({ ...formState, storeLocation: e.target.value })
                    }
                    className="w-full h-10 px-3 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm bg-white dark:bg-neutral-950 text-neutral-950 dark:text-neutral-100 disabled:opacity-60 focus:border-[#faa619] focus:outline-none"
                  >
                    {STORE_LOCATIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formState.price}
                    onChange={(e) => setFormState({ ...formState, price: e.target.value })}
                    className="w-full h-10 px-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm text-neutral-950 dark:text-neutral-100 tabular-nums focus:border-[#faa619] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formState.mrp}
                    onChange={(e) => setFormState({ ...formState, mrp: e.target.value })}
                    className="w-full h-10 px-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm text-neutral-950 dark:text-neutral-100 tabular-nums focus:border-[#faa619] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Reorder Level
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formState.reorderLevel}
                    onChange={(e) => setFormState({ ...formState, reorderLevel: e.target.value })}
                    className="w-full h-10 px-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm text-neutral-950 dark:text-neutral-100 tabular-nums focus:border-[#faa619] focus:outline-none"
                  />
                </div>
                {!formState.id && (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Qty / Size
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formState.defaultSizeQty}
                      onChange={(e) =>
                        setFormState({ ...formState, defaultSizeQty: e.target.value })
                      }
                      className="w-full h-10 px-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm text-neutral-950 dark:text-neutral-100 tabular-nums focus:border-[#faa619] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Sizes (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formState.sizesText}
                    onChange={(e) => setFormState({ ...formState, sizesText: e.target.value })}
                    placeholder="S, M, L, XL"
                    className="w-full h-10 px-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm text-neutral-950 dark:text-neutral-100 focus:border-[#faa619] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Catalog Image Asset
                  </label>
                  <select
                    value={formState.image}
                    onChange={(e) => setFormState({ ...formState, image: e.target.value })}
                    className="w-full h-10 px-3 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm bg-white dark:bg-neutral-950 text-neutral-950 dark:text-neutral-100 focus:border-[#faa619] focus:outline-none"
                  >
                    {IMAGE_PRESETS.map((img) => (
                      <option key={img.path} value={img.path}>
                        {img.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Fabric / Material
                  </label>
                  <input
                    type="text"
                    value={formState.fabric}
                    onChange={(e) => setFormState({ ...formState, fabric: e.target.value })}
                    className="w-full h-10 px-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm text-neutral-950 dark:text-neutral-100 focus:border-[#faa619] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Fit
                  </label>
                  <input
                    type="text"
                    value={formState.fit}
                    onChange={(e) => setFormState({ ...formState, fit: e.target.value })}
                    className="w-full h-10 px-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm text-neutral-950 dark:text-neutral-100 focus:border-[#faa619] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Care
                  </label>
                  <input
                    type="text"
                    value={formState.care}
                    onChange={(e) => setFormState({ ...formState, care: e.target.value })}
                    className="w-full h-10 px-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm text-neutral-950 dark:text-neutral-100 focus:border-[#faa619] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  placeholder="Short product description shown on Product Detail & Quick View"
                  className="w-full p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm text-neutral-950 dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#faa619] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="h-10 px-4 border border-neutral-300 dark:border-neutral-700 text-xs font-bold uppercase tracking-wider rounded-md text-neutral-700 dark:text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBusy}
                  className="h-10 px-5 bg-[#faa619] hover:bg-[#e6950c] text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-md disabled:opacity-50"
                >
                  {formState.id ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PER-SIZE STOCK ADJUSTER MODAL */}
      {stockModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[1px]">
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                  {stockModalProduct.sku}
                </div>
                <h2 className="text-base font-bold text-neutral-950 dark:text-white line-clamp-1">
                  Adjust Size Stock
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setStockModalProduct(null)}
                aria-label="Close stock adjuster"
                className="p-1 text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSizeStock} className="p-6 space-y-5">
              <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                {stockModalProduct.brand} — {stockModalProduct.title}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  Quick add all sizes:
                </span>
                {[5, 10, 25].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => {
                      const next: Record<string, number> = {};
                      stockModalProduct.sizes.forEach((s) => {
                        next[s] = (draftSizeStock[s] ?? 0) + delta;
                      });
                      setDraftSizeStock(next);
                    }}
                    className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-[#faa619] text-neutral-900 dark:text-neutral-100 hover:text-neutral-950 text-xs font-bold rounded-md tabular-nums transition-colors"
                  >
                    +{delta}
                  </button>
                ))}
              </div>

              <div className="space-y-2.5">
                {stockModalProduct.sizes.map((size) => (
                  <div
                    key={size}
                    className="flex items-center justify-between gap-4 p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md"
                  >
                    <span className="text-sm font-bold text-neutral-950 dark:text-white">
                      Size {size}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setDraftSizeStock((prev) => ({
                            ...prev,
                            [size]: Math.max(0, (prev[size] ?? 0) - 1),
                          }))
                        }
                        className="w-8 h-8 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white rounded-md font-bold text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={draftSizeStock[size] ?? 0}
                        onChange={(e) =>
                          setDraftSizeStock((prev) => ({
                            ...prev,
                            [size]: Math.max(0, Number(e.target.value) || 0),
                          }))
                        }
                        aria-label={`Stock for size ${size}`}
                        className="w-16 h-8 text-center border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white rounded-md text-sm font-bold tabular-nums focus:border-[#faa619] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setDraftSizeStock((prev) => ({
                            ...prev,
                            [size]: (prev[size] ?? 0) + 1,
                          }))
                        }
                        className="w-8 h-8 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white rounded-md font-bold text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 pt-2 border-t border-neutral-200 dark:border-neutral-800 tabular-nums">
                <span>New Total Stock</span>
                <span className="text-sm font-bold text-neutral-950 dark:text-white inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  {Object.values(draftSizeStock).reduce((sum, n) => sum + (Number(n) || 0), 0)}{' '}
                  units
                </span>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setStockModalProduct(null)}
                  className="h-10 px-4 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold uppercase tracking-wider rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBusy}
                  className="h-10 px-5 bg-neutral-950 dark:bg-[#faa619] hover:bg-neutral-800 dark:hover:bg-[#e6950c] text-white dark:text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-md disabled:opacity-50"
                >
                  Save Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

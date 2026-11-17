import { FormEvent, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Boxes,
  CheckCircle2,
  Edit3,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { STORES_DATA, formatINR } from '../data/catalog';
import { OrderTrackingRecord } from '../data/tracking';
import { Category, Occasion, Product } from '../types';
import { ResilientImage } from './ResilientImage';

type AdminTab = 'inventory' | 'catalog' | 'orders' | 'stores';
type StockFilter = 'all' | 'in' | 'low' | 'out';

interface AdminDashboardViewProps {
  products: Product[];
  orders: OrderTrackingRecord[];
  isLoading: boolean;
  isBusy: boolean;
  onCreateProduct: (payload: Partial<Product>) => Promise<boolean>;
  onUpdateProduct: (id: number, patch: Partial<Product>) => Promise<boolean>;
  onRestockProduct: (
    id: number,
    payload: { deltaPerSize?: number; sizeStock?: Record<string, number> }
  ) => Promise<boolean>;
  onRefreshInventory: (minPerSize?: number) => Promise<void>;
  onDeleteProduct: (id: number) => Promise<void>;
  onUpdateOrderStatus: (orderId: string, status: OrderTrackingRecord['status']) => Promise<void>;
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
    return { key: 'out', label: 'Out of Stock', textClass: 'text-red-600' };
  }
  if (p.stock <= p.reorderLevel) {
    return { key: 'low', label: 'Low Stock', textClass: 'text-amber-700' };
  }
  return { key: 'in', label: 'In Stock', textClass: 'text-emerald-700' };
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

export function AdminDashboardView({
  products,
  orders,
  isLoading,
  isBusy,
  onCreateProduct,
  onUpdateProduct,
  onRestockProduct,
  onRefreshInventory,
  onDeleteProduct,
  onUpdateOrderStatus,
  onTrackOrder,
  onOpenProduct,
  onBackToStore,
}: AdminDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category>('All');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [storeFilter, setStoreFilter] = useState<string>('All');

  // Product Add/Edit Modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [formState, setFormState] = useState<ProductFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  // Per-Size Stock Adjuster Modal
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);
  const [draftSizeStock, setDraftSizeStock] = useState<Record<string, number>>({});

  // Confirm delete inline state
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const metrics = useMemo(() => {
    const totalSkus = products.length;
    const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
    const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.reorderLevel).length;
    const outOfStockCount = products.filter((p) => p.stock <= 0).length;
    const inventoryValue = products.reduce((sum, p) => sum + p.stock * p.price, 0);
    return {
      totalSkus,
      totalUnits,
      alertCount: lowStockCount + outOfStockCount,
      lowStockCount,
      outOfStockCount,
      inventoryValue,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
      if (storeFilter !== 'All' && p.storeLocation !== storeFilter) return false;
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
  }, [products, categoryFilter, storeFilter, stockFilter, searchQuery]);

  const openCreateModal = () => {
    const nextNum = 101 + products.length;
    setFormState({
      ...EMPTY_FORM,
      sku: `JH-MN-${nextNum}`,
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
      storeLocation: formState.storeLocation,
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

  const sectionLabelMap: Record<AdminTab, string> = {
    inventory: 'Inventory & Stock',
    catalog: 'Catalog & Products',
    orders: 'Orders & Fulfillment',
    stores: 'Hyderabad Stores',
  };

  const navItems: { id: AdminTab; label: string; icon: typeof Boxes; count?: number }[] = [
    { id: 'inventory', label: 'Inventory & Stock', icon: Boxes, count: metrics.alertCount },
    { id: 'catalog', label: 'Catalog & Products', icon: ShoppingBag, count: products.length },
    { id: 'orders', label: 'Orders & Fulfillment', icon: Package, count: orders.length },
    { id: 'stores', label: 'Hyderabad Stores', icon: MapPin, count: STORES_DATA.length },
  ];

  return (
    <div className="bg-neutral-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row">
        {/* Left Sidebar (Desktop) */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 shrink-0 bg-white border-r border-neutral-200 min-h-[calc(100vh-64px)] p-4 justify-between">
          <div>
            <div className="px-2.5 pb-4 mb-3 border-b border-neutral-200">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#d98200]">
                Operations Console
              </div>
              <div className="text-sm font-bold text-neutral-950 mt-0.5">
                Jhonty Hub Backoffice
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
                        ? 'bg-neutral-950 text-white'
                        : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </span>
                    {typeof item.count === 'number' && (
                      <span
                        className={`text-xs tabular-nums font-mono ${
                          active ? 'text-[#faa619]' : 'text-neutral-500'
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

          <div className="pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onBackToStore}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 border border-neutral-300 hover:border-neutral-950 rounded-md text-xs font-bold uppercase tracking-wider text-neutral-900 bg-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </button>
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
                    ? 'bg-neutral-950 text-white border-neutral-950'
                    : 'bg-white text-neutral-800 border-neutral-200'
                }`}
              >
                {item.label} ({item.count})
              </button>
            ))}
          </div>

          {/* Top Breadcrumb Bar + Primary Actions (Max 2 on Right) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-200">
            <div>
              <div className="text-xs font-medium text-neutral-500">
                Jhonty Hub / Admin Console /{' '}
                <span className="text-neutral-950 font-semibold">{sectionLabelMap[activeTab]}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 mt-1">
                {sectionLabelMap[activeTab]}
              </h1>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => onRefreshInventory(10)}
                className="inline-flex items-center gap-1.5 h-10 px-3.5 bg-white border border-neutral-300 hover:border-neutral-950 text-neutral-900 text-xs font-bold uppercase tracking-wider rounded-md whitespace-nowrap shrink-0 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isBusy ? 'animate-spin' : ''}`} />
                <span>Refresh Low Stock</span>
              </button>
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-1.5 h-10 px-4 bg-[#faa619] hover:bg-[#e6950c] text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-md whitespace-nowrap shrink-0 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* 4-Column Summary Strip (Single Elevation) */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-neutral-200 rounded-lg p-4">
              <div className="text-xs font-semibold text-neutral-500">Active Catalog SKUs</div>
              <div className="text-2xl font-bold text-neutral-950 tabular-nums mt-1">
                {metrics.totalSkus}
              </div>
              <div className="text-xs text-neutral-500 mt-1">Across 3 Hyderabad stores</div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-lg p-4">
              <div className="text-xs font-semibold text-neutral-500">Total Units on Hand</div>
              <div className="text-2xl font-bold text-neutral-950 tabular-nums mt-1">
                {metrics.totalUnits.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-emerald-700 font-medium mt-1">
                Synced with live storefront
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-lg p-4">
              <div className="text-xs font-semibold text-neutral-500">Stock Alerts</div>
              <div
                className={`text-2xl font-bold tabular-nums mt-1 ${
                  metrics.alertCount > 0 ? 'text-amber-700' : 'text-emerald-700'
                }`}
              >
                {metrics.alertCount}
              </div>
              <div className="text-xs text-neutral-600 mt-1 tabular-nums">
                {metrics.lowStockCount} Low Stock · {metrics.outOfStockCount} Out of Stock
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-lg p-4">
              <div className="text-xs font-semibold text-neutral-500">Inventory Retail Value</div>
              <div className="text-2xl font-bold text-neutral-950 tabular-nums mt-1">
                {formatINR(metrics.inventoryValue)}
              </div>
              <div className="text-xs text-neutral-500 mt-1 tabular-nums">
                {orders.length} active &amp; completed orders
              </div>
            </div>
          </section>

          {/* INVENTORY OR CATALOG TAB */}
          {(activeTab === 'inventory' || activeTab === 'catalog') && (
            <section className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
              {/* Filter Bar */}
              <div className="p-4 border-b border-neutral-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search SKU, product title, brand, or store..."
                    aria-label="Filter inventory"
                    className="w-full h-10 pl-9 pr-3 bg-neutral-50 border border-neutral-200 rounded-md text-sm focus:bg-white focus:border-[#faa619] focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as Category)}
                    aria-label="Filter by department"
                    className="h-10 px-3 bg-white border border-neutral-200 rounded-md text-xs font-semibold text-neutral-800 focus:border-[#faa619] focus:outline-none"
                  >
                    <option value="All">All Departments</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <select
                    value={storeFilter}
                    onChange={(e) => setStoreFilter(e.target.value)}
                    aria-label="Filter by store location"
                    className="h-10 px-3 bg-white border border-neutral-200 rounded-md text-xs font-semibold text-neutral-800 focus:border-[#faa619] focus:outline-none"
                  >
                    <option value="All">All Store Locations</option>
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
                    className="h-10 px-3 bg-white border border-neutral-200 rounded-md text-xs font-semibold text-neutral-800 focus:border-[#faa619] focus:outline-none"
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
                <div className="p-10 text-center text-sm text-neutral-500">
                  Loading live Jhonty Hub inventory...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-base font-bold text-neutral-950">
                    No matching products in inventory
                  </p>
                  <p className="text-sm text-neutral-500 mt-1 mb-5">
                    Try clearing your search or stock filter, or add a new SKU.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('All');
                      setStockFilter('all');
                      setStoreFilter('All');
                    }}
                    className="px-4 py-2 border border-neutral-950 text-xs font-bold uppercase tracking-wider rounded-md"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200 text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                        <th className="py-3 px-4">Product &amp; SKU</th>
                        <th className="py-3 px-4">Department &amp; Store</th>
                        <th className="py-3 px-4">Price / MRP</th>
                        <th className="py-3 px-4">Size Breakdown</th>
                        <th className="py-3 px-4">Total Stock</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 text-sm">
                      {filteredProducts.map((p) => {
                        const status = getStockStatus(p);
                        return (
                          <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3 min-w-[240px]">
                                <button
                                  type="button"
                                  onClick={() => onOpenProduct(p.id)}
                                  className="w-11 h-14 rounded-md overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0"
                                >
                                  <ResilientImage
                                    src={p.gallery[0]}
                                    alt={p.title}
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                                <div className="min-w-0">
                                  <div className="text-xs font-mono font-semibold text-neutral-500 tabular-nums">
                                    {p.sku} · {p.brand}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => openEditModal(p)}
                                    className="text-left font-semibold text-neutral-950 hover:text-[#d98200] line-clamp-1 mt-0.5"
                                  >
                                    {p.title}
                                  </button>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="font-medium text-neutral-900">{p.category}</div>
                              <div className="text-xs text-neutral-500 mt-0.5">
                                {p.storeLocation}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap tabular-nums">
                              <div className="font-bold text-neutral-950">{formatINR(p.price)}</div>
                              <div className="text-xs text-neutral-400 line-through">
                                {formatINR(p.mrp)}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="text-xs font-mono text-neutral-700 tabular-nums max-w-[240px] leading-relaxed">
                                {p.sizes.map((s, idx) => (
                                  <span key={s}>
                                    <span
                                      className={
                                        (p.sizeStock[s] ?? 0) === 0
                                          ? 'text-red-600 font-semibold'
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
                              <div className="font-bold text-neutral-950">{p.stock} units</div>
                              <div className={`text-xs font-semibold mt-0.5 ${status.textClass}`}>
                                {status.label}
                                {status.key === 'low' ? ` (≤${p.reorderLevel})` : ''}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => onRestockProduct(p.id, { deltaPerSize: 5 })}
                                  title="Add +5 units to every size"
                                  className="px-2.5 py-1.5 bg-neutral-100 hover:bg-[#faa619] text-neutral-900 text-xs font-bold rounded-md tabular-nums transition-colors"
                                >
                                  +5 Sizes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openStockAdjuster(p)}
                                  className="px-2.5 py-1.5 border border-neutral-300 hover:border-neutral-950 text-neutral-800 text-xs font-semibold rounded-md transition-colors"
                                >
                                  Stock
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openEditModal(p)}
                                  aria-label={`Edit ${p.title}`}
                                  className="p-1.5 border border-neutral-300 hover:border-neutral-950 text-neutral-700 rounded-md"
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
                                    className="p-1.5 border border-neutral-300 hover:border-red-600 text-neutral-600 hover:text-red-600 rounded-md"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
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
          {activeTab === 'orders' && (
            <section className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-neutral-950">
                    Customer Orders &amp; Dispatch Status
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Status updates sync immediately with the storefront Order Tracking map.
                  </p>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="p-12 text-center text-sm text-neutral-500">
                  No orders recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200 text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                        <th className="py-3 px-4">Order ID</th>
                        <th className="py-3 px-4">Destination &amp; Carrier</th>
                        <th className="py-3 px-4">Items</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4">Fulfillment Status</th>
                        <th className="py-3 px-4 text-right">Route</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 text-sm">
                      {orders.map((ord) => (
                        <tr key={ord.orderId} className="hover:bg-neutral-50/80">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-mono font-bold text-neutral-950 tabular-nums">
                              {ord.orderId}
                            </div>
                            <div className="text-xs text-neutral-500 mt-0.5">{ord.placedAt}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-neutral-900">
                              {ord.destinationCity}
                            </div>
                            <div className="text-xs text-neutral-500 mt-0.5">
                              {ord.carrier} · {ord.awb}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-xs text-neutral-800 space-y-0.5">
                              {ord.items.map((it, idx) => (
                                <div key={`${it.title}-${idx}`} className="line-clamp-1">
                                  {it.qty}× {it.brand} ({it.size})
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap font-bold text-neutral-950 tabular-nums">
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
                              className="h-9 px-2.5 bg-white border border-neutral-300 rounded-md text-xs font-semibold text-neutral-900 focus:border-[#faa619] focus:outline-none"
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
                              className="px-3 py-1.5 border border-neutral-300 hover:border-neutral-950 text-xs font-semibold rounded-md"
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
          {activeTab === 'stores' && (
            <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {STORES_DATA.map((st) => {
                const shortName = st.name.includes('Hitech City')
                  ? 'Hitech City Metro'
                  : st.name.includes('Venkata Ramana')
                  ? 'Venkata Ramana Colony'
                  : 'Kukatpally Hub';
                const storeProducts = products.filter((p) => p.storeLocation === shortName);
                const storeUnits = storeProducts.reduce((s, p) => s + p.stock, 0);
                const storeAlerts = storeProducts.filter((p) => p.stock <= p.reorderLevel).length;

                return (
                  <div
                    key={st.id}
                    className="bg-white border border-neutral-200 rounded-lg p-5 flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="text-xs font-mono font-bold text-[#d98200]">
                        {st.id} · {st.city}
                      </div>
                      <h3 className="text-base font-bold text-neutral-950 mt-1">{st.name}</h3>
                      <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">{st.address}</p>

                      <dl className="grid grid-cols-3 gap-2 pt-4 mt-4 border-t border-neutral-200 tabular-nums">
                        <div>
                          <dt className="text-[11px] text-neutral-500">SKUs</dt>
                          <dd className="text-base font-bold text-neutral-950">
                            {storeProducts.length}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[11px] text-neutral-500">Units</dt>
                          <dd className="text-base font-bold text-neutral-950">{storeUnits}</dd>
                        </div>
                        <div>
                          <dt className="text-[11px] text-neutral-500">Alerts</dt>
                          <dd
                            className={`text-base font-bold ${
                              storeAlerts > 0 ? 'text-amber-700' : 'text-emerald-700'
                            }`}
                          >
                            {storeAlerts}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setStoreFilter(shortName);
                        setActiveTab('inventory');
                      }}
                      className="w-full h-10 border border-neutral-950 text-neutral-950 hover:bg-[#faa619] hover:border-[#faa619] text-xs font-bold uppercase tracking-wider rounded-md transition-colors"
                    >
                      View Store Inventory
                    </button>
                  </div>
                );
              })}
            </section>
          )}
        </main>
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[1px]">
          <div className="bg-white rounded-lg border border-neutral-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-base font-bold text-neutral-950">
                {formState.id ? 'Edit Product & Pricing' : 'Add New Catalog Product'}
              </h2>
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                aria-label="Close product modal"
                className="p-1 text-neutral-500 hover:text-neutral-950"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs font-semibold text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.brand}
                    onChange={(e) => setFormState({ ...formState, brand: e.target.value })}
                    placeholder="e.g. JHONTY ORIGINALS"
                    className="w-full h-10 px-3 border border-neutral-200 rounded-md text-sm focus:border-[#faa619] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">SKU</label>
                  <input
                    type="text"
                    value={formState.sku}
                    onChange={(e) => setFormState({ ...formState, sku: e.target.value })}
                    placeholder="e.g. JH-OS-109"
                    className="w-full h-10 px-3 border border-neutral-200 rounded-md text-sm font-mono uppercase focus:border-[#faa619] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  placeholder="e.g. Men Brushed Twill Overshirt"
                  className="w-full h-10 px-3 border border-neutral-200 rounded-md text-sm focus:border-[#faa619] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
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
                    className="w-full h-10 px-3 border border-neutral-200 rounded-md text-sm bg-white focus:border-[#faa619] focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Occasion
                  </label>
                  <select
                    value={formState.occasion}
                    onChange={(e) =>
                      setFormState({ ...formState, occasion: e.target.value as Occasion })
                    }
                    className="w-full h-10 px-3 border border-neutral-200 rounded-md text-sm bg-white focus:border-[#faa619] focus:outline-none"
                  >
                    {OCCASIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Hyderabad Store
                  </label>
                  <select
                    value={formState.storeLocation}
                    onChange={(e) =>
                      setFormState({ ...formState, storeLocation: e.target.value })
                    }
                    className="w-full h-10 px-3 border border-neutral-200 rounded-md text-sm bg-white focus:border-[#faa619] focus:outline-none"
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
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formState.price}
                    onChange={(e) => setFormState({ ...formState, price: e.target.value })}
                    className="w-full h-10 px-3 border border-neutral-200 rounded-md text-sm tabular-nums focus:border-[#faa619] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formState.mrp}
                    onChange={(e) => setFormState({ ...formState, mrp: e.target.value })}
                    className="w-full h-10 px-3 border border-neutral-200 rounded-md text-sm tabular-nums focus:border-[#faa619] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Reorder Level
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formState.reorderLevel}
                    onChange={(e) => setFormState({ ...formState, reorderLevel: e.target.value })}
                    className="w-full h-10 px-3 border border-neutral-200 rounded-md text-sm tabular-nums focus:border-[#faa619] focus:outline-none"
                  />
                </div>
                {!formState.id && (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Qty / Size
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formState.defaultSizeQty}
                      onChange={(e) =>
                        setFormState({ ...formState, defaultSizeQty: e.target.value })
                      }
                      className="w-full h-10 px-3 border border-neutral-200 rounded-md text-sm tabular-nums focus:border-[#faa619] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Sizes (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formState.sizesText}
                    onChange={(e) => setFormState({ ...formState, sizesText: e.target.value })}
                    placeholder="S, M, L, XL"
                    className="w-full h-10 px-3 border border-neutral-200 rounded-md text-sm focus:border-[#faa619] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Catalog Image Asset
                  </label>
                  <select
                    value={formState.image}
                    onChange={(e) => setFormState({ ...formState, image: e.target.value })}
                    className="w-full h-10 px-3 border border-neutral-200 rounded-md text-sm bg-white focus:border-[#faa619] focus:outline-none"
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
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Fabric / Material
                  </label>
                  <input
                    type="text"
                    value={formState.fabric}
                    onChange={(e) => setFormState({ ...formState, fabric: e.target.value })}
                    className="w-full h-10 px-3 border border-neutral-200 rounded-md text-sm focus:border-[#faa619] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Fit</label>
                  <input
                    type="text"
                    value={formState.fit}
                    onChange={(e) => setFormState({ ...formState, fit: e.target.value })}
                    className="w-full h-10 px-3 border border-neutral-200 rounded-md text-sm focus:border-[#faa619] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Care</label>
                  <input
                    type="text"
                    value={formState.care}
                    onChange={(e) => setFormState({ ...formState, care: e.target.value })}
                    className="w-full h-10 px-3 border border-neutral-200 rounded-md text-sm focus:border-[#faa619] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  placeholder="Short product description shown on Product Detail & Quick View"
                  className="w-full p-3 border border-neutral-200 rounded-md text-sm focus:border-[#faa619] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="h-10 px-4 border border-neutral-300 text-xs font-bold uppercase tracking-wider rounded-md text-neutral-700"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[1px]">
          <div className="bg-white rounded-lg border border-neutral-200 w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-neutral-500">{stockModalProduct.sku}</div>
                <h2 className="text-base font-bold text-neutral-950 line-clamp-1">
                  Adjust Size Stock
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setStockModalProduct(null)}
                aria-label="Close stock adjuster"
                className="p-1 text-neutral-500 hover:text-neutral-950"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSizeStock} className="p-6 space-y-5">
              <div className="text-sm font-semibold text-neutral-800">
                {stockModalProduct.brand} — {stockModalProduct.title}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-500">Quick add all sizes:</span>
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
                    className="px-2.5 py-1 bg-neutral-100 hover:bg-[#faa619] text-xs font-bold rounded-md tabular-nums transition-colors"
                  >
                    +{delta}
                  </button>
                ))}
              </div>

              <div className="space-y-2.5">
                {stockModalProduct.sizes.map((size) => (
                  <div
                    key={size}
                    className="flex items-center justify-between gap-4 p-2.5 bg-neutral-50 border border-neutral-200 rounded-md"
                  >
                    <span className="text-sm font-bold text-neutral-950">Size {size}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setDraftSizeStock((prev) => ({
                            ...prev,
                            [size]: Math.max(0, (prev[size] ?? 0) - 1),
                          }))
                        }
                        className="w-8 h-8 border border-neutral-300 bg-white rounded-md font-bold text-sm hover:bg-neutral-100"
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
                        className="w-16 h-8 text-center border border-neutral-300 bg-white rounded-md text-sm font-bold tabular-nums focus:border-[#faa619] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setDraftSizeStock((prev) => ({
                            ...prev,
                            [size]: (prev[size] ?? 0) + 1,
                          }))
                        }
                        className="w-8 h-8 border border-neutral-300 bg-white rounded-md font-bold text-sm hover:bg-neutral-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-600 pt-2 border-t border-neutral-200 tabular-nums">
                <span>New Total Stock</span>
                <span className="text-sm font-bold text-neutral-950 inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  {Object.values(draftSizeStock).reduce((sum, n) => sum + (Number(n) || 0), 0)}{' '}
                  units
                </span>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setStockModalProduct(null)}
                  className="h-10 px-4 border border-neutral-300 text-xs font-bold uppercase tracking-wider rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBusy}
                  className="h-10 px-5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-md disabled:opacity-50"
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

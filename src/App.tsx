import { useEffect, useMemo, useState } from 'react';
import { PRODUCTS, STORES_DATA } from './data/catalog';
import {
  OrderTrackingRecord,
  SAMPLE_TRACKING_ORDERS,
  buildTrackingFromReceipt,
} from './data/tracking';
import {
  BagItem,
  Category,
  Occasion,
  OrderReceipt,
  Product,
  StoreLocation,
  ViewMode,
} from './types';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { ProductDetailView } from './components/ProductDetailView';
import { StoreLocatorView } from './components/StoreLocatorView';
import { CheckoutView } from './components/CheckoutView';
import { OrderTrackingView } from './components/OrderTrackingView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { Overlays } from './components/Overlays';
import { Footer } from './components/Footer';

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [view, setView] = useState<ViewMode>('home');
  const [activeProductId, setActiveProductId] = useState<number>(1);
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [activeMaxPrice, setActiveMaxPrice] = useState<number | null>(null);
  const [activeOccasion, setActiveOccasion] = useState<Occasion | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [products, setProducts] = useState<Product[]>(() => loadStored('jh_products', PRODUCTS));
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isAdminBusy, setIsAdminBusy] = useState<boolean>(false);

  const [bag, setBag] = useState<BagItem[]>(() => loadStored('jh_bag', []));
  const [wishlistIds, setWishlistIds] = useState<number[]>(() => loadStored('jh_wishlist', []));
  const [selectedStoreId, setSelectedStoreId] = useState<string>(() =>
    loadStored('jh_store_id', 'HYD-HTC')
  );
  const [userName, setUserName] = useState<string | null>(() => loadStored('jh_user', null));
  const [coupon, setCoupon] = useState<string | null>(null);
  const [trackingOrders, setTrackingOrders] = useState<OrderTrackingRecord[]>(() =>
    loadStored('jh_orders', SAMPLE_TRACKING_ORDERS)
  );
  const [trackedOrderId, setTrackedOrderId] = useState<string | null>(null);

  const [bagOpen, setBagOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Hydrate products & orders from backend API on mount
  useEffect(() => {
    let cancelled = false;
    async function hydrateFromServer() {
      try {
        const [prodRes, ordRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/orders'),
        ]);
        if (!cancelled && prodRes.ok) {
          const prodData = (await prodRes.json()) as { products?: Product[] };
          if (Array.isArray(prodData.products)) {
            setProducts(prodData.products);
          }
        }
        if (!cancelled && ordRes.ok) {
          const ordData = (await ordRes.json()) as { orders?: OrderTrackingRecord[] };
          if (Array.isArray(ordData.orders)) {
            setTrackingOrders(ordData.orders);
          }
        }
      } catch {
        // Fallback gracefully to locally cached state
      } finally {
        if (!cancelled) setIsLoadingData(false);
      }
    }
    hydrateFromServer();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('jh_products', JSON.stringify(products));
    } catch {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('jh_bag', JSON.stringify(bag));
    } catch {}
  }, [bag]);

  useEffect(() => {
    try {
      localStorage.setItem('jh_wishlist', JSON.stringify(wishlistIds));
    } catch {}
  }, [wishlistIds]);

  useEffect(() => {
    try {
      localStorage.setItem('jh_store_id', JSON.stringify(selectedStoreId));
    } catch {}
  }, [selectedStoreId]);

  useEffect(() => {
    try {
      localStorage.setItem('jh_user', JSON.stringify(userName));
    } catch {}
  }, [userName]);

  useEffect(() => {
    try {
      localStorage.setItem('jh_orders', JSON.stringify(trackingOrders));
    } catch {}
  }, [trackingOrders]);

  useEffect(() => {
    const syncFromHash = () => {
      const h = window.location.hash;
      if (h.startsWith('#product/')) {
        const id = Number(h.split('/')[1]);
        if (Number.isFinite(id) && id > 0) {
          setActiveProductId(id);
          setView('pdp');
        }
      } else if (h === '#stores') {
        setView('stores');
      } else if (h === '#checkout') {
        setView('checkout');
      } else if (h === '#tracking') {
        setView('tracking');
      } else if (h === '#admin') {
        setView('admin');
      } else {
        setView('home');
      }
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const closeAllOverlays = () => {
    setBagOpen(false);
    setWishlistOpen(false);
    setMobileMenuOpen(false);
    setAuthOpen(false);
    setSizeGuideOpen(false);
    setQuickViewProduct(null);
  };

  const navigateTo = (nextView: ViewMode, productId?: number) => {
    closeAllOverlays();
    setView(nextView);
    if (nextView === 'pdp' && productId) {
      setActiveProductId(productId);
      window.history.replaceState(null, '', `#product/${productId}`);
    } else if (nextView === 'stores') {
      window.history.replaceState(null, '', '#stores');
    } else if (nextView === 'checkout') {
      window.history.replaceState(null, '', '#checkout');
    } else if (nextView === 'tracking') {
      window.history.replaceState(null, '', '#tracking');
    } else if (nextView === 'admin') {
      window.history.replaceState(null, '', '#admin');
    } else {
      window.history.replaceState(null, '', '#home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (cat: Category) => {
    setActiveCategory(cat);
    setActiveBrand(null);
    setActiveMaxPrice(null);
    setActiveOccasion(null);
    if (view !== 'home') {
      navigateTo('home');
    }
  };

  const handleSelectBrand = (brand: string) => {
    setActiveCategory('All');
    setActiveBrand(brand);
    setActiveMaxPrice(null);
    setActiveOccasion(null);
    if (view !== 'home') navigateTo('home');
  };

  const handleSelectOccasion = (occ: Occasion) => {
    setActiveCategory('All');
    setActiveBrand(null);
    setActiveMaxPrice(null);
    setActiveOccasion(occ);
    if (view !== 'home') navigateTo('home');
  };

  const handleResetFilters = () => {
    setActiveCategory('All');
    setActiveBrand(null);
    setActiveMaxPrice(null);
    setActiveOccasion(null);
    setSearchQuery('');
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (activeCategory !== 'All' && p.category !== activeCategory) return false;
      if (activeBrand && p.brand.toLowerCase() !== activeBrand.toLowerCase()) return false;
      if (activeMaxPrice && p.price > activeMaxPrice) return false;
      if (activeOccasion && p.occasion !== activeOccasion) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const match =
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [products, activeCategory, activeBrand, activeMaxPrice, activeOccasion, searchQuery]);

  const handleAddToBag = (product: Product, size: string, colorName?: string) => {
    const available = product.sizeStock?.[size] ?? product.stock;
    if (available <= 0) {
      showToast(`Size ${size} is currently out of stock`);
      return;
    }
    const resolvedColor = colorName || product.colors[0]?.name || 'Signature';
    setBag((prev) => {
      const idx = prev.findIndex((i) => i.id === product.id && i.size === size);
      if (idx > -1) {
        if (prev[idx].qty >= available) {
          showToast(`Max available stock (${available}) reached for size ${size}`);
          return prev;
        }
        return prev.map((item, i) => (i === idx ? { ...item, qty: item.qty + 1 } : item));
      }
      return [
        ...prev,
        {
          id: product.id,
          brand: product.brand,
          title: product.title,
          price: product.price,
          mrp: product.mrp,
          image: product.gallery[0],
          size,
          colorName: resolvedColor,
          qty: 1,
        },
      ];
    });
    showToast(`Added ${product.brand} (${size}) to basket`);
  };

  const handleBuyNow = (product: Product, size: string, colorName?: string) => {
    handleAddToBag(product, size, colorName);
    navigateTo('checkout');
  };

  const handleToggleWishlist = (id: number) => {
    setWishlistIds((prev) => {
      if (prev.includes(id)) {
        showToast('Removed from wishlist');
        return prev.filter((x) => x !== id);
      }
      showToast('Saved to wishlist');
      return [...prev, id];
    });
  };

  const handleUpdateQty = (idx: number, delta: number) => {
    setBag((prev) =>
      prev
        .map((item, i) => (i === idx ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const handleRemoveBagItem = (idx: number) => {
    setBag((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleApplyCoupon = (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (code === 'JHONTY15' || code === 'JH1000') {
      setCoupon(code);
      showToast(`Promo code ${code} applied`);
    } else {
      showToast('Try promo code JHONTY15 or JH1000');
    }
  };

  const handleProceedCheckout = () => {
    if (bag.length === 0) {
      showToast('Add an item to your basket first');
      return;
    }
    navigateTo('checkout');
  };

  const sumSizeStock = (sizeStock: Record<string, number>) =>
    Object.values(sizeStock).reduce((sum, n) => sum + Math.max(0, Number(n) || 0), 0);

  const isJsonResponse = (res: Response) =>
    (res.headers.get('content-type') || '').includes('application/json');

  const handleCompleteOrder = async (receipt: OrderReceipt) => {
    const deductLocally = () => {
      setProducts((prev) =>
        prev.map((prod) => {
          const orderedItems = receipt.items.filter((i) => i.id === prod.id);
          if (orderedItems.length === 0) return prod;
          const nextSizeStock = { ...prod.sizeStock };
          orderedItems.forEach((item) => {
            nextSizeStock[item.size] = Math.max(0, (nextSizeStock[item.size] ?? 0) - item.qty);
          });
          return {
            ...prod,
            sizeStock: nextSizeStock,
            stock: sumSizeStock(nextSizeStock),
            updatedAt: new Date().toISOString(),
          };
        })
      );
      const fallback = buildTrackingFromReceipt(receipt);
      setTrackingOrders((prev) => [fallback, ...prev]);
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(receipt),
      });
      if (res.ok && isJsonResponse(res)) {
        const data = (await res.json()) as {
          order: OrderTrackingRecord;
          products: Product[];
        };
        setTrackingOrders((prev) => [data.order, ...prev]);
        setProducts(data.products);
      } else {
        deductLocally();
      }
    } catch {
      deductLocally();
    }
    setTrackedOrderId(receipt.orderId);
    setBag([]);
    setCoupon(null);
    showToast(`Order ${receipt.orderId} confirmed!`);
  };

  // Admin Backend Handlers (with static-host fallback if /api/* is absent)
  const handleCreateProduct = async (payload: Partial<Product>): Promise<boolean> => {
    setIsAdminBusy(true);
    const createLocally = () => {
      const nextId = products.reduce((max, p) => Math.max(max, p.id), 0) + 1;
      const sizes =
        Array.isArray(payload.sizes) && payload.sizes.length > 0
          ? payload.sizes
          : ['S', 'M', 'L', 'XL'];
      const sizeStock: Record<string, number> = {};
      sizes.forEach((s) => {
        const v = payload.sizeStock?.[s];
        sizeStock[s] = typeof v === 'number' && v >= 0 ? v : 10;
      });
      const created: Product = {
        id: nextId,
        sku:
          payload.sku?.trim() ||
          `JH-${String(payload.category || 'GEN')
            .slice(0, 2)
            .toUpperCase()}-${100 + nextId}`,
        brand: (payload.brand || 'JHONTY ORIGINALS').trim().toUpperCase(),
        title: (payload.title || 'New Product').trim(),
        category: payload.category || 'Shirts & Polos',
        occasion: payload.occasion || 'Casual',
        price: Math.max(1, Number(payload.price) || 999),
        mrp: Math.max(Number(payload.price) || 999, Number(payload.mrp) || 1999),
        rating: payload.rating || '4.7',
        reviews: payload.reviews ?? 1,
        sizes,
        sizeStock,
        stock: sumSizeStock(sizeStock),
        reorderLevel: typeof payload.reorderLevel === 'number' ? payload.reorderLevel : 10,
        storeLocation: payload.storeLocation || 'Hitech City Metro',
        updatedAt: new Date().toISOString(),
        colors: payload.colors?.length
          ? payload.colors
          : [{ name: 'Signature Black', hex: '#18181b' }],
        fabric: payload.fabric?.trim() || '100% Combed Cotton',
        fit: payload.fit?.trim() || 'Regular Fit',
        care: payload.care?.trim() || 'Machine Wash Cold',
        origin: payload.origin?.trim() || 'Made in India',
        description:
          payload.description?.trim() ||
          'Curated Jhonty Hub branded menswear piece crafted for everyday comfort.',
        gallery: payload.gallery?.length
          ? payload.gallery
          : ['/src/assets/images/jhonty_mens_overshirt_1794941649529.jpg'],
      };
      setProducts((prev) => [created, ...prev]);
      showToast(`Created ${created.sku} (${created.brand})`);
      return true;
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.status === 404 || !isJsonResponse(res)) {
        return createLocally();
      }
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        showToast(err.error || 'Could not create product');
        return false;
      }
      const data = (await res.json()) as { product: Product };
      setProducts((prev) => [data.product, ...prev]);
      showToast(`Created ${data.product.sku} (${data.product.brand})`);
      return true;
    } catch {
      return createLocally();
    } finally {
      setIsAdminBusy(false);
    }
  };

  const handleUpdateProduct = async (id: number, patch: Partial<Product>): Promise<boolean> => {
    setIsAdminBusy(true);
    const updateLocally = () => {
      let updatedSku = '';
      setProducts((prev) =>
        prev.map((existing) => {
          if (existing.id !== id) return existing;
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
          updatedSku = patch.sku || existing.sku;
          return {
            ...existing,
            ...patch,
            id: existing.id,
            brand: patch.brand ? patch.brand.trim().toUpperCase() : existing.brand,
            title: patch.title ? patch.title.trim() : existing.title,
            sizes: updatedSizes,
            sizeStock: mergedSizeStock,
            stock: sumSizeStock(mergedSizeStock),
            updatedAt: new Date().toISOString(),
          };
        })
      );
      showToast(`Updated ${updatedSku || 'product'}`);
      return true;
    };

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (res.status === 404 || !isJsonResponse(res)) {
        return updateLocally();
      }
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        showToast(err.error || 'Could not update product');
        return false;
      }
      const data = (await res.json()) as { product: Product };
      setProducts((prev) => prev.map((p) => (p.id === id ? data.product : p)));
      showToast(`Updated ${data.product.sku}`);
      return true;
    } catch {
      return updateLocally();
    } finally {
      setIsAdminBusy(false);
    }
  };

  const handleRestockProduct = async (
    id: number,
    payload: { deltaPerSize?: number; sizeStock?: Record<string, number> }
  ): Promise<boolean> => {
    setIsAdminBusy(true);
    const restockLocally = () => {
      let msg = 'Stock updated';
      setProducts((prev) =>
        prev.map((existing) => {
          if (existing.id !== id) return existing;
          const nextSizeStock: Record<string, number> = { ...existing.sizeStock };
          if (payload.sizeStock) {
            existing.sizes.forEach((s) => {
              if (typeof payload.sizeStock?.[s] === 'number') {
                nextSizeStock[s] = Math.max(0, payload.sizeStock[s]);
              }
            });
          } else if (typeof payload.deltaPerSize === 'number') {
            existing.sizes.forEach((s) => {
              nextSizeStock[s] = Math.max(
                0,
                (nextSizeStock[s] || 0) + (payload.deltaPerSize || 0)
              );
            });
          }
          const total = sumSizeStock(nextSizeStock);
          msg = `Stock updated for ${existing.sku}: ${total} units`;
          return {
            ...existing,
            sizeStock: nextSizeStock,
            stock: total,
            updatedAt: new Date().toISOString(),
          };
        })
      );
      showToast(msg);
      return true;
    };

    try {
      const res = await fetch(`/api/products/${id}/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.status === 404 || !isJsonResponse(res)) {
        return restockLocally();
      }
      if (!res.ok) {
        showToast('Failed to update stock');
        return false;
      }
      const data = (await res.json()) as { product: Product };
      setProducts((prev) => prev.map((p) => (p.id === id ? data.product : p)));
      showToast(`Stock updated for ${data.product.sku}: ${data.product.stock} units`);
      return true;
    } catch {
      return restockLocally();
    } finally {
      setIsAdminBusy(false);
    }
  };

  const handleRefreshInventory = async (minPerSize = 10) => {
    setIsAdminBusy(true);
    const refreshLocally = () => {
      let refreshedCount = 0;
      const nextProducts = products.map((p) => {
        if (p.stock <= p.reorderLevel || Object.values(p.sizeStock).some((v) => v < minPerSize)) {
          const nextSizeStock: Record<string, number> = {};
          p.sizes.forEach((s) => {
            nextSizeStock[s] = Math.max(p.sizeStock[s] || 0, minPerSize);
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
      setProducts(nextProducts);
      showToast(
        refreshedCount > 0
          ? `Replenished ${refreshedCount} low-stock SKU(s) to ${minPerSize}+ per size`
          : 'All SKUs already meet minimum stock levels'
      );
    };

    try {
      const res = await fetch('/api/products/refresh-inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minPerSize }),
      });
      if (res.status === 404 || !isJsonResponse(res)) {
        refreshLocally();
        return;
      }
      if (!res.ok) {
        showToast('Failed to refresh low stock');
        return;
      }
      const data = (await res.json()) as { products: Product[]; refreshedCount: number };
      setProducts(data.products);
      showToast(
        data.refreshedCount > 0
          ? `Replenished ${data.refreshedCount} low-stock SKU(s) to ${minPerSize}+ per size`
          : 'All SKUs already meet minimum stock levels'
      );
    } catch {
      refreshLocally();
    } finally {
      setIsAdminBusy(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    setIsAdminBusy(true);
    const deleteLocally = () => {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast('Removed product from catalog');
    };

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.status === 404 || !isJsonResponse(res)) {
        deleteLocally();
        return;
      }
      if (!res.ok) {
        showToast('Failed to delete product');
        return;
      }
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast('Removed product from catalog');
    } catch {
      deleteLocally();
    } finally {
      setIsAdminBusy(false);
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    status: OrderTrackingRecord['status']
  ) => {
    setIsAdminBusy(true);
    const updateOrderLocally = () => {
      const progressMap: Record<OrderTrackingRecord['status'], number> = {
        'Order Placed': 20,
        'Packed at Jhonty Hub': 42,
        'In Transit': 68,
        'Out for Delivery': 88,
        Delivered: 100,
        'Ready for Store Pickup': 75,
      };
      setTrackingOrders((prev) =>
        prev.map((existing) => {
          if (existing.orderId !== orderId) return existing;
          const nextProgress = progressMap[status] ?? existing.progressPct;
          const updatedWaypoints = existing.waypoints.map((wp, i) => ({
            ...wp,
            completed: nextProgress >= Math.round(((i + 1) / existing.waypoints.length) * 100) || i === 0,
            current: false,
          }));
          const lastIdx = updatedWaypoints.reduce((acc, wp, i) => (wp.completed ? i : acc), 0);
          if (updatedWaypoints[lastIdx]) updatedWaypoints[lastIdx].current = true;
          return {
            ...existing,
            status,
            progressPct: nextProgress,
            waypoints: updatedWaypoints,
          };
        })
      );
      showToast(`Order ${orderId} set to "${status}"`);
    };

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.status === 404 || !isJsonResponse(res)) {
        updateOrderLocally();
        return;
      }
      if (!res.ok) {
        showToast('Could not update order status');
        return;
      }
      const data = (await res.json()) as { order: OrderTrackingRecord };
      setTrackingOrders((prev) => prev.map((o) => (o.orderId === orderId ? data.order : o)));
      showToast(`Order ${orderId} set to "${status}"`);
    } catch {
      updateOrderLocally();
    } finally {
      setIsAdminBusy(false);
    }
  };

  const activeProduct = products.find((p) => p.id === activeProductId) || products[0];
  const selectedStore: StoreLocation =
    STORES_DATA.find((s) => s.id === selectedStoreId) || STORES_DATA[0];
  const bagCount = bag.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-950">
      <Header
        activeCategory={activeCategory}
        activeView={view}
        searchQuery={searchQuery}
        bagCount={bagCount}
        wishlistCount={wishlistIds.length}
        userName={userName}
        onSelectCategory={handleSelectCategory}
        onNavigate={(v) => navigateTo(v)}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (view !== 'home') setView('home');
        }}
        onSearchSubmit={() => {
          if (view !== 'home') navigateTo('home');
          window.setTimeout(() => {
            document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }}
        onOpenBag={() => {
          closeAllOverlays();
          setBagOpen(true);
        }}
        onOpenWishlist={() => {
          closeAllOverlays();
          setWishlistOpen(true);
        }}
        onOpenAuth={() => {
          closeAllOverlays();
          setAuthOpen(true);
        }}
        onOpenMobileMenu={() => {
          closeAllOverlays();
          setMobileMenuOpen(true);
        }}
        onResetHome={() => {
          handleResetFilters();
          navigateTo('home');
        }}
      />

      <div className="flex-1">
        {view === 'home' && (
          <HomeView
            products={filteredProducts}
            allProductCount={products.length}
            activeCategory={activeCategory}
            activeBrand={activeBrand}
            activeMaxPrice={activeMaxPrice}
            activeOccasion={activeOccasion}
            searchQuery={searchQuery}
            wishlistIds={wishlistIds}
            onSelectCategory={handleSelectCategory}
            onSelectBrand={handleSelectBrand}
            onSelectMaxPrice={setActiveMaxPrice}
            onSelectOccasion={handleSelectOccasion}
            onSearchChange={setSearchQuery}
            onResetFilters={handleResetFilters}
            onOpenProduct={(id) => navigateTo('pdp', id)}
            onQuickView={(p) => {
              closeAllOverlays();
              setQuickViewProduct(p);
            }}
            onToggleWishlist={handleToggleWishlist}
            onAddToBag={(p, size) => handleAddToBag(p, size)}
            onOpenStores={() => navigateTo('stores')}
          />
        )}

        {view === 'pdp' && activeProduct && (
          <ProductDetailView
            product={activeProduct}
            allProducts={products}
            isWishlisted={wishlistIds.includes(activeProduct.id)}
            wishlistIds={wishlistIds}
            onNavigateHome={() => navigateTo('home')}
            onSelectCategory={handleSelectCategory}
            onOpenProduct={(id) => navigateTo('pdp', id)}
            onQuickView={(p) => {
              closeAllOverlays();
              setQuickViewProduct(p);
            }}
            onToggleWishlist={handleToggleWishlist}
            onAddToBag={handleAddToBag}
            onBuyNow={handleBuyNow}
            onOpenSizeGuide={() => {
              closeAllOverlays();
              setSizeGuideOpen(true);
            }}
          />
        )}

        {view === 'stores' && (
          <StoreLocatorView
            selectedStoreId={selectedStoreId}
            onSelectStore={(st) => {
              setSelectedStoreId(st.id);
              showToast(`Selected ${st.name}`);
            }}
            onContinueToCheckout={() => {
              if (bag.length > 0) {
                navigateTo('checkout');
              } else {
                navigateTo('home');
              }
            }}
            onBackHome={() => navigateTo('home')}
          />
        )}

        {view === 'checkout' && (
          <CheckoutView
            bag={bag}
            coupon={coupon}
            selectedStore={selectedStore}
            onSelectStoreId={setSelectedStoreId}
            onApplyCoupon={handleApplyCoupon}
            onCompleteOrder={handleCompleteOrder}
            onTrackOrder={(id) => {
              setTrackedOrderId(id);
              navigateTo('tracking');
            }}
            onBackToShopping={() => navigateTo('home')}
          />
        )}

        {view === 'tracking' && (
          <OrderTrackingView
            orders={trackingOrders}
            initialOrderId={trackedOrderId}
            onBackHome={() => navigateTo('home')}
          />
        )}

        {view === 'admin' && (
          <AdminDashboardView
            products={products}
            orders={trackingOrders}
            isLoading={isLoadingData}
            isBusy={isAdminBusy}
            onCreateProduct={handleCreateProduct}
            onUpdateProduct={handleUpdateProduct}
            onRestockProduct={handleRestockProduct}
            onRefreshInventory={handleRefreshInventory}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onTrackOrder={(id) => {
              setTrackedOrderId(id);
              navigateTo('tracking');
            }}
            onOpenProduct={(id) => navigateTo('pdp', id)}
            onBackToStore={() => navigateTo('home')}
          />
        )}
      </div>

      {view !== 'admin' && (
        <Footer
          onSelectCategory={handleSelectCategory}
          onNavigate={(v) => navigateTo(v)}
          onNotify={showToast}
        />
      )}

      <Overlays
        bagOpen={bagOpen}
        wishlistOpen={wishlistOpen}
        mobileMenuOpen={mobileMenuOpen}
        authOpen={authOpen}
        sizeGuideOpen={sizeGuideOpen}
        quickViewProduct={quickViewProduct}
        products={products}
        bag={bag}
        wishlistIds={wishlistIds}
        coupon={coupon}
        onCloseAll={closeAllOverlays}
        onUpdateQty={handleUpdateQty}
        onRemoveBagItem={handleRemoveBagItem}
        onApplyCoupon={handleApplyCoupon}
        onProceedCheckout={handleProceedCheckout}
        onAddToBag={(p, size) => handleAddToBag(p, size)}
        onToggleWishlist={handleToggleWishlist}
        onOpenProduct={(id) => navigateTo('pdp', id)}
        onSignIn={(name) => {
          setUserName(name);
          closeAllOverlays();
          showToast(`Signed in as ${name}`);
        }}
        onSelectCategory={handleSelectCategory}
        onNavigate={(v) => navigateTo(v)}
      />

      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 bg-neutral-950 text-white text-xs sm:text-sm font-semibold rounded-md shadow-lg border border-neutral-800 whitespace-nowrap"
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}

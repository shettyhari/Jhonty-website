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
        if (PRODUCTS.some((p) => p.id === id)) {
          setActiveProductId(id);
          setView('pdp');
        }
      } else if (h === '#stores') {
        setView('stores');
      } else if (h === '#checkout') {
        setView('checkout');
      } else if (h === '#tracking') {
        setView('tracking');
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
    return PRODUCTS.filter((p) => {
      if (activeCategory !== 'All' && p.category !== activeCategory) return false;
      if (activeBrand && p.brand.toLowerCase() !== activeBrand.toLowerCase()) return false;
      if (activeMaxPrice && p.price > activeMaxPrice) return false;
      if (activeOccasion && p.occasion !== activeOccasion) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const match =
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [activeCategory, activeBrand, activeMaxPrice, activeOccasion, searchQuery]);

  const handleAddToBag = (product: Product, size: string, colorName?: string) => {
    const resolvedColor = colorName || product.colors[0].name;
    setBag((prev) => {
      const idx = prev.findIndex((i) => i.id === product.id && i.size === size);
      if (idx > -1) {
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

  const handleCompleteOrder = (receipt: OrderReceipt) => {
    const record = buildTrackingFromReceipt(receipt);
    setTrackingOrders((prev) => [record, ...prev]);
    setTrackedOrderId(receipt.orderId);
    setBag([]);
    setCoupon(null);
    showToast(`Order ${receipt.orderId} confirmed!`);
  };

  const activeProduct = PRODUCTS.find((p) => p.id === activeProductId) || PRODUCTS[0];
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
            allProductCount={PRODUCTS.length}
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

        {view === 'pdp' && (
          <ProductDetailView
            product={activeProduct}
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
      </div>

      <Footer
        onSelectCategory={handleSelectCategory}
        onNavigate={(v) => navigateTo(v)}
        onNotify={showToast}
      />

      <Overlays
        bagOpen={bagOpen}
        wishlistOpen={wishlistOpen}
        mobileMenuOpen={mobileMenuOpen}
        authOpen={authOpen}
        sizeGuideOpen={sizeGuideOpen}
        quickViewProduct={quickViewProduct}
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

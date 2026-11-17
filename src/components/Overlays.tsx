import { FormEvent, useEffect, useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { formatINR } from '../data/catalog';
import { BagItem, Category, Product, ViewMode } from '../types';
import { BrandLogo } from './BrandLogo';
import { ResilientImage } from './ResilientImage';

interface OverlaysProps {
  bagOpen: boolean;
  wishlistOpen: boolean;
  mobileMenuOpen: boolean;
  authOpen: boolean;
  sizeGuideOpen: boolean;
  quickViewProduct: Product | null;
  products: Product[];
  bag: BagItem[];
  wishlistIds: number[];
  coupon: string | null;
  onCloseAll: () => void;
  onUpdateQty: (idx: number, delta: number) => void;
  onRemoveBagItem: (idx: number) => void;
  onApplyCoupon: (code: string) => void;
  onProceedCheckout: () => void;
  onAddToBag: (product: Product, size: string) => void;
  onToggleWishlist: (id: number) => void;
  onOpenProduct: (id: number) => void;
  onSignIn: (name: string) => void;
  onSelectCategory: (cat: Category) => void;
  onNavigate: (view: ViewMode) => void;
}

export function Overlays({
  bagOpen,
  wishlistOpen,
  mobileMenuOpen,
  authOpen,
  sizeGuideOpen,
  quickViewProduct,
  products,
  bag,
  wishlistIds,
  coupon,
  onCloseAll,
  onUpdateQty,
  onRemoveBagItem,
  onApplyCoupon,
  onProceedCheckout,
  onAddToBag,
  onToggleWishlist,
  onOpenProduct,
  onSignIn,
  onSelectCategory,
  onNavigate,
}: OverlaysProps) {
  const [couponCode, setCouponCode] = useState(coupon || '');
  const [authName, setAuthName] = useState('');
  const [qvSize, setQvSize] = useState('');

  useEffect(() => {
    if (quickViewProduct) {
      const firstInStock =
        quickViewProduct.sizes.find((s) => (quickViewProduct.sizeStock[s] ?? 0) > 0) ||
        quickViewProduct.sizes[0];
      setQvSize(firstInStock);
    }
  }, [quickViewProduct]);

  useEffect(() => {
    setCouponCode(coupon || '');
  }, [coupon]);

  const anyOpen =
    bagOpen ||
    wishlistOpen ||
    mobileMenuOpen ||
    authOpen ||
    sizeGuideOpen ||
    Boolean(quickViewProduct);

  if (!anyOpen) return null;

  const subtotal = bag.reduce((s, item) => s + item.price * item.qty, 0);
  let discount = 0;
  if (coupon === 'JHONTY15') discount = Math.round(subtotal * 0.15);
  if (coupon === 'JH1000' && subtotal >= 3999) discount = 1000;
  const total = Math.max(0, subtotal - discount);

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  const handleAuthSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!authName.trim()) return;
    onSignIn(authName.trim());
    setAuthName('');
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        onClick={onCloseAll}
        className="fixed inset-0 bg-black/50 backdrop-blur-[1px]"
        aria-hidden="true"
      />

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <aside className="fixed inset-y-0 left-0 w-72 bg-white z-10 p-5 flex flex-col shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
            <BrandLogo compact />
            <button
              type="button"
              onClick={onCloseAll}
              aria-label="Close menu"
              className="p-2 text-neutral-600 hover:text-neutral-950"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex flex-col divide-y divide-neutral-100 mt-2">
            {(
              ['Shirts & Polos', 'Denim & Chinos', 'Outerwear', 'Footwear', 'Accessories'] as Category[]
            ).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  onSelectCategory(cat);
                  onCloseAll();
                }}
                className="text-left py-3.5 text-base font-semibold text-neutral-900 hover:text-[#d98200]"
              >
                {cat}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                onNavigate('stores');
                onCloseAll();
              }}
              className="text-left py-3.5 text-base font-semibold text-neutral-900 hover:text-[#d98200]"
            >
              Store Locator
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate('tracking');
                onCloseAll();
              }}
              className="text-left py-3.5 text-base font-semibold text-neutral-900 hover:text-[#d98200]"
            >
              Track Order
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate('admin');
                onCloseAll();
              }}
              className="text-left py-3.5 text-base font-semibold text-[#d98200] hover:text-neutral-950"
            >
              Admin Console
            </button>
          </nav>
        </aside>
      )}

      {/* Shopping Basket Drawer */}
      {bagOpen && (
        <aside className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-10 flex flex-col shadow-2xl">
          <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="text-base font-bold text-neutral-950 tabular-nums">
              Shopping Basket ({bag.reduce((s, i) => s + i.qty, 0)})
            </h3>
            <button
              type="button"
              onClick={onCloseAll}
              aria-label="Close shopping basket"
              className="p-1.5 text-neutral-500 hover:text-neutral-950"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {bag.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-base font-bold text-neutral-950 mb-1">
                  Your Shopping Basket is Empty
                </p>
                <p className="text-sm text-neutral-500 mb-6">
                  Explore trending fashion, footwear, and beauty styles.
                </p>
                <button
                  type="button"
                  onClick={onCloseAll}
                  className="px-6 py-2.5 bg-[#faa619] text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-md"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {bag.map((item, idx) => (
                  <div
                    key={`${item.id}-${item.size}-${idx}`}
                    className="flex gap-3.5 pb-4 border-b border-neutral-200"
                  >
                    <div className="w-20 h-24 rounded-md overflow-hidden bg-neutral-100 shrink-0">
                      <ResilientImage
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold uppercase text-neutral-500">
                        {item.brand} · Size {item.size}
                      </div>
                      <h4 className="text-sm font-semibold text-neutral-950 line-clamp-2 mt-0.5">
                        {item.title}
                      </h4>
                      <div className="text-sm font-bold text-neutral-950 tabular-nums mt-1">
                        {formatINR(item.price * item.qty)}
                      </div>

                      <div className="flex items-center justify-between mt-2.5">
                        <div className="inline-flex items-center border border-neutral-200 rounded-md">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(idx, -1)}
                            aria-label="Decrease quantity"
                            className="w-7 h-7 text-sm font-bold hover:bg-neutral-100"
                          >
                            -
                          </button>
                          <span className="px-2.5 text-xs font-semibold tabular-nums">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(idx, 1)}
                            aria-label="Increase quantity"
                            className="w-7 h-7 text-sm font-bold hover:bg-neutral-100"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveBagItem(idx)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {bag.length > 0 && (
            <div className="p-5 bg-neutral-50 border-t border-neutral-200">
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Promo code (JHONTY15 or JH1000)"
                  className="flex-1 h-9 px-3 bg-white border border-neutral-200 rounded-md text-xs uppercase focus:border-[#faa619] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => onApplyCoupon(couponCode)}
                  className="px-3.5 h-9 border border-neutral-950 text-xs font-bold rounded-md hover:bg-neutral-950 hover:text-white transition-colors"
                >
                  Apply
                </button>
              </div>

              <div className="space-y-1.5 text-sm tabular-nums mb-4">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Promo Discount</span>
                  <span>-{formatINR(discount)}</span>
                </div>
                <div className="flex justify-between font-bold text-base text-neutral-950 pt-2 border-t border-neutral-200">
                  <span>Total</span>
                  <span>{formatINR(total)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onProceedCheckout}
                className="w-full h-11 bg-[#faa619] hover:bg-[#e6950c] text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-md transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </aside>
      )}

      {/* Wishlist Drawer */}
      {wishlistOpen && (
        <aside className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-10 flex flex-col shadow-2xl">
          <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="text-base font-bold text-neutral-950">
              Saved Wishlist ({wishlistProducts.length})
            </h3>
            <button
              type="button"
              onClick={onCloseAll}
              aria-label="Close wishlist"
              className="p-1.5 text-neutral-500 hover:text-neutral-950"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {wishlistProducts.length === 0 ? (
              <p className="text-center text-sm text-neutral-500 py-14">
                No styles saved yet. Tap the heart icon on any product to save it here.
              </p>
            ) : (
              <div className="space-y-4">
                {wishlistProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex gap-3.5 pb-4 border-b border-neutral-200"
                  >
                    <div className="w-20 h-24 rounded-md overflow-hidden bg-neutral-100 shrink-0">
                      <ResilientImage
                        src={p.gallery[0]}
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold uppercase text-neutral-500">
                        {p.brand}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onOpenProduct(p.id);
                          onCloseAll();
                        }}
                        className="text-left text-sm font-semibold text-neutral-950 hover:text-[#d98200] line-clamp-2 mt-0.5"
                      >
                        {p.title}
                      </button>
                      <div className="text-sm font-bold text-neutral-950 tabular-nums mt-1">
                        {formatINR(p.price)}
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-2.5">
                        <button
                          type="button"
                          onClick={() => onAddToBag(p, p.sizes[0])}
                          className="px-3 py-1.5 border border-neutral-950 text-xs font-bold uppercase rounded-md hover:bg-[#faa619] hover:border-[#faa619]"
                        >
                          Move to Basket
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleWishlist(p.id)}
                          className="text-xs font-semibold text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-2xl bg-white rounded-lg z-10 overflow-hidden shadow-2xl">
          <button
            type="button"
            onClick={onCloseAll}
            aria-label="Close quick view"
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/90 text-neutral-700 hover:text-neutral-950"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2">
            <div className="aspect-[3/4] bg-neutral-100">
              <ResilientImage
                src={quickViewProduct.gallery[0]}
                alt={quickViewProduct.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[#d98200]">
                  {quickViewProduct.brand}
                </div>
                <h3 className="text-lg font-bold text-neutral-950 leading-snug">
                  {quickViewProduct.title}
                </h3>
                <div className="flex items-baseline gap-2.5 tabular-nums">
                  <span className="text-xl font-bold text-neutral-950">
                    {formatINR(quickViewProduct.price)}
                  </span>
                  <span className="text-sm text-neutral-400 line-through">
                    {formatINR(quickViewProduct.mrp)}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {quickViewProduct.description}
                </p>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-700 mb-2">
                    <span>Select Size: {qvSize}</span>
                    <span
                      className={`tabular-nums ${
                        (quickViewProduct.sizeStock[qvSize] ?? 0) === 0
                          ? 'text-red-600'
                          : (quickViewProduct.sizeStock[qvSize] ?? 0) <= 3
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {(quickViewProduct.sizeStock[qvSize] ?? 0) === 0
                        ? 'Out of Stock'
                        : `${quickViewProduct.sizeStock[qvSize]} left`}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {quickViewProduct.sizes.map((s) => {
                      const qtyLeft = quickViewProduct.sizeStock[s] ?? 0;
                      const soldOut = qtyLeft <= 0;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setQvSize(s)}
                          className={`min-w-[44px] h-9 px-3 text-xs font-semibold rounded-md border ${
                            qvSize === s
                              ? 'bg-neutral-950 text-white border-neutral-950'
                              : soldOut
                              ? 'bg-neutral-100 text-neutral-400 border-neutral-200 line-through'
                              : 'bg-white text-neutral-900 border-neutral-300'
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={(quickViewProduct.sizeStock[qvSize] ?? 0) <= 0}
                  onClick={() => {
                    onAddToBag(quickViewProduct, qvSize || quickViewProduct.sizes[0]);
                    onCloseAll();
                  }}
                  className="w-full h-11 bg-[#faa619] hover:bg-[#e6950c] disabled:bg-neutral-200 disabled:text-neutral-500 text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-md"
                >
                  {(quickViewProduct.sizeStock[qvSize] ?? 0) <= 0
                    ? 'Out of Stock in Selected Size'
                    : 'Add To Basket'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenProduct(quickViewProduct.id);
                    onCloseAll();
                  }}
                  className="w-full h-10 border border-neutral-300 hover:border-neutral-950 text-neutral-900 text-xs font-bold uppercase tracking-wider rounded-md"
                >
                  View Full Product Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-md bg-white rounded-lg z-10 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-neutral-950">Standard Size Guide (Inches)</h3>
            <button
              type="button"
              onClick={onCloseAll}
              aria-label="Close size guide"
              className="p-1 text-neutral-500 hover:text-neutral-950"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-neutral-600 mb-4">
            Standard body measurements across Jhonty Hub menswear collections:
          </p>
          <table className="w-full text-xs border-collapse tabular-nums">
            <thead>
              <tr className="bg-neutral-100 text-neutral-900">
                <th className="border border-neutral-200 p-2 text-left">Size</th>
                <th className="border border-neutral-200 p-2">Chest / Bust</th>
                <th className="border border-neutral-200 p-2">Waist</th>
                <th className="border border-neutral-200 p-2">Hip</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['XS / 36', '34–35"', '27–28"', '36–37"'],
                ['S / 38', '36–37"', '29–30"', '38–39"'],
                ['M / 40', '38–39"', '31–32"', '40–41"'],
                ['L / 42', '40–42"', '33–35"', '42–44"'],
                ['XL / 44', '43–45"', '36–38"', '45–47"'],
              ].map((row) => (
                <tr key={row[0]}>
                  <td className="border border-neutral-200 p-2 font-bold">{row[0]}</td>
                  <td className="border border-neutral-200 p-2 text-center">{row[1]}</td>
                  <td className="border border-neutral-200 p-2 text-center">{row[2]}</td>
                  <td className="border border-neutral-200 p-2 text-center">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sign In Modal */}
      {authOpen && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-md bg-white rounded-lg z-10 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-neutral-950">Sign In / Sign Up</h3>
            <button
              type="button"
              onClick={onCloseAll}
              aria-label="Close sign in"
              className="p-1 text-neutral-500 hover:text-neutral-950"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-neutral-600 mb-5">
            Access Jhonty Club member deals, saved wishlists, and faster Madhapur store pickup.
          </p>
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Your Name or Mobile Number
              </label>
              <input
                type="text"
                required
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
                placeholder="e.g. Aarav / +91 98765 43210"
                className="w-full h-11 px-3 border border-neutral-200 rounded-md text-sm focus:border-[#faa619] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full h-11 bg-[#faa619] hover:bg-[#e6950c] text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-md"
            >
              Continue
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

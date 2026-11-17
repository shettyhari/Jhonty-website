import { FormEvent, useEffect, useState } from 'react';
import { CheckCircle2, Heart, Ruler, ShieldCheck, Star, Truck } from 'lucide-react';
import { formatINR } from '../data/catalog';
import { Category, Product } from '../types';
import { ProductCard } from './ProductCard';
import { ResilientImage } from './ResilientImage';

interface ProductDetailViewProps {
  product: Product;
  allProducts: Product[];
  isWishlisted: boolean;
  wishlistIds: number[];
  onNavigateHome: () => void;
  onSelectCategory: (cat: Category) => void;
  onOpenProduct: (id: number) => void;
  onQuickView: (product: Product) => void;
  onToggleWishlist: (id: number) => void;
  onAddToBag: (product: Product, size: string, colorName?: string) => void;
  onBuyNow: (product: Product, size: string, colorName?: string) => void;
  onOpenSizeGuide: () => void;
}

export function ProductDetailView({
  product,
  allProducts,
  isWishlisted,
  wishlistIds,
  onNavigateHome,
  onSelectCategory,
  onOpenProduct,
  onQuickView,
  onToggleWishlist,
  onAddToBag,
  onBuyNow,
  onOpenSizeGuide,
}: ProductDetailViewProps) {
  const firstAvailableSize =
    product.sizes.find((s) => (product.sizeStock?.[s] ?? 0) > 0) || product.sizes[0];
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState(firstAvailableSize);
  const [pincode, setPincode] = useState('');
  const [pincodeMessage, setPincodeMessage] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  useEffect(() => {
    setGalleryIdx(0);
    setSelectedColorIdx(0);
    const nextFirst =
      product.sizes.find((s) => (product.sizeStock?.[s] ?? 0) > 0) || product.sizes[0];
    setSelectedSize(nextFirst);
    setPincodeMessage(null);
  }, [product.id, product.sizes, product.sizeStock]);

  const discountPct = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const selectedColor = product.colors[selectedColorIdx] || product.colors[0];
  const rewardPoints = Math.max(10, Math.round(product.price / 20));
  const selectedSizeQty = product.sizeStock?.[selectedSize] ?? 0;

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .sort((a, b) => (a.category === product.category ? -1 : 1) - (b.category === product.category ? -1 : 1))
    .slice(0, 4);

  const handlePincodeCheck = (e: FormEvent) => {
    e.preventDefault();
    const cleaned = pincode.trim();
    if (!/^[1-9][0-9]{5}$/.test(cleaned)) {
      setPincodeMessage({
        ok: false,
        text: 'Please enter a valid 6-digit Indian pincode (e.g. 560034).',
      });
      return;
    }
    setPincodeMessage({
      ok: true,
      text: `Free Express Delivery to ${cleaned} within 2–3 business days · Cash on Delivery & Click & Collect available.`,
    });
  };

  return (
    <main className="bg-white dark:bg-[#080808] pb-24 lg:pb-16 transition-colors">
      {/* Breadcrumb Bar */}
      <div className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 py-3.5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <button
            type="button"
            onClick={onNavigateHome}
            className="font-semibold text-neutral-900 dark:text-neutral-100 hover:text-[#d98200] dark:hover:text-[#faa619]"
          >
            Home
          </button>
          <span aria-hidden="true">/</span>
          <button
            type="button"
            onClick={() => onSelectCategory(product.category)}
            className="font-semibold text-neutral-900 dark:text-neutral-100 hover:text-[#d98200] dark:hover:text-[#faa619]"
          >
            {product.category}
          </button>
          <span aria-hidden="true">/</span>
          <span className="text-neutral-500 dark:text-neutral-400 truncate">
            {product.brand} — {product.title}
          </span>
        </div>
      </div>

      {/* Main PDP Split */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-8 pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Sticky Multi-Image Gallery */}
          <div className="lg:col-span-7 lg:sticky lg:top-24 grid grid-cols-1 sm:grid-cols-[84px_1fr] gap-3.5">
            {product.gallery.length > 1 && (
              <div className="order-2 sm:order-1 flex sm:flex-col gap-2.5 overflow-x-auto">
                {product.gallery.map((img, i) => (
                  <button
                    key={img + i}
                    type="button"
                    onClick={() => setGalleryIdx(i)}
                    aria-label={`View angle ${i + 1}`}
                    className={`w-16 sm:w-full aspect-[3/4] rounded-md overflow-hidden border-2 shrink-0 transition-opacity ${
                      galleryIdx === i
                        ? 'border-[#faa619] opacity-100'
                        : 'border-neutral-200 dark:border-neutral-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <ResilientImage
                      src={img}
                      alt={`${product.title} view ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div
              className={`order-1 sm:order-2 aspect-[3/4] rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 ${
                product.gallery.length === 1 ? 'sm:col-span-2' : ''
              }`}
            >
              <ResilientImage
                src={product.gallery[galleryIdx] || product.gallery[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right: Contiguous Purchase Module */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center justify-between gap-4 text-xs mb-2">
                <span className="font-bold uppercase tracking-widest text-[#d98200] dark:text-[#faa619]">
                  {product.brand}
                </span>
                <div className="inline-flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 font-semibold tabular-nums">
                  <Star className="w-3.5 h-3.5 fill-[#faa619] text-[#faa619]" />
                  <span>{product.rating}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-neutral-500 dark:text-neutral-400">
                    {product.reviews} Reviews
                  </span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 dark:text-neutral-50 leading-snug">
                {product.title}
              </h1>
            </div>

            {/* Price Summary */}
            <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
              <div className="flex items-baseline gap-3 tabular-nums">
                <span className="text-2xl font-bold text-neutral-950 dark:text-white">
                  {formatINR(product.price)}
                </span>
                <span className="text-sm text-neutral-400 dark:text-neutral-500 line-through">
                  MRP {formatINR(product.mrp)}
                </span>
                <span className="text-sm font-bold text-[#d98200] dark:text-[#faa619]">
                  {discountPct}% OFF
                </span>
              </div>
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mt-1.5">
                Inclusive of all taxes · Earn {rewardPoints} Jhonty Club Points
              </p>
            </div>

            {/* Color Swatches */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2.5">
                Color:{' '}
                <span className="text-neutral-950 dark:text-white">{selectedColor.name}</span>
              </div>
              <div className="flex items-center gap-3">
                {product.colors.map((c, idx) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColorIdx(idx)}
                    aria-label={`Select color ${c.name}`}
                    title={c.name}
                    style={{ backgroundColor: c.hex }}
                    className={`w-8 h-8 rounded-full border-2 border-white dark:border-neutral-900 transition-all ${
                      selectedColorIdx === idx
                        ? 'ring-2 ring-neutral-950 dark:ring-[#faa619] scale-105'
                        : 'ring-1 ring-neutral-300 dark:ring-neutral-700 hover:ring-neutral-500'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Size: <span className="text-neutral-950 dark:text-white">{selectedSize}</span>
                  <span
                    className={`ml-2 normal-case font-semibold tabular-nums ${
                      selectedSizeQty <= 0
                        ? 'text-red-600 dark:text-red-400'
                        : selectedSizeQty <= 3
                        ? 'text-amber-700 dark:text-amber-400'
                        : 'text-emerald-700 dark:text-emerald-400'
                    }`}
                  >
                    {selectedSizeQty <= 0
                      ? 'Out of Stock'
                      : `${selectedSizeQty} available at ${product.storeLocation}`}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={onOpenSizeGuide}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#d98200] dark:text-[#faa619] hover:text-neutral-950 dark:hover:text-white underline"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Guide</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const qty = product.sizeStock?.[size] ?? 0;
                  const soldOut = qty <= 0;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[52px] h-10 px-3.5 text-sm font-semibold rounded-md border transition-colors ${
                        selectedSize === size
                          ? 'bg-neutral-950 text-white border-neutral-950 dark:bg-[#faa619] dark:text-neutral-950 dark:border-[#faa619]'
                          : soldOut
                          ? 'bg-neutral-100 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-600 border-neutral-200 dark:border-neutral-800 line-through'
                          : 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700 hover:border-neutral-950 dark:hover:border-neutral-400'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                disabled={selectedSizeQty <= 0}
                onClick={() => onAddToBag(product, selectedSize, selectedColor.name)}
                className="h-12 px-6 bg-[#faa619] hover:bg-[#e6950c] disabled:bg-neutral-200 dark:disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 text-sm font-bold uppercase tracking-wider rounded-md transition-colors"
              >
                {selectedSizeQty <= 0 ? 'Size Out of Stock' : 'Add To Basket'}
              </button>
              <button
                type="button"
                disabled={selectedSizeQty <= 0}
                onClick={() => onBuyNow(product, selectedSize, selectedColor.name)}
                className="h-12 px-6 bg-neutral-950 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:bg-neutral-300 dark:disabled:bg-neutral-800 text-white dark:text-neutral-950 text-sm font-bold uppercase tracking-wider rounded-md transition-colors"
              >
                Buy Now
              </button>
            </div>

            <button
              type="button"
              onClick={() => onToggleWishlist(product.id)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white py-1"
            >
              <Heart
                className={`w-4 h-4 ${
                  isWishlisted
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
                fill={isWishlisted ? 'currentColor' : 'none'}
              />
              <span>{isWishlisted ? 'Saved in Wishlist' : 'Save to Wishlist'}</span>
            </button>

            {/* Indian Pincode Checker */}
            <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900">
              <div className="flex items-center gap-2 text-sm font-bold text-neutral-950 dark:text-neutral-50 mb-2">
                <Truck className="w-4 h-4 text-[#d98200] dark:text-[#faa619]" />
                <span>Check Delivery &amp; Click &amp; Collect</span>
              </div>
              <form onSubmit={handlePincodeCheck} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter 6-digit pincode (e.g. 500081)"
                  aria-label="Delivery pincode"
                  className="flex-1 h-10 px-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 text-neutral-950 dark:text-neutral-100 rounded-md text-sm focus:border-[#faa619] focus:outline-none tabular-nums"
                />
                <button
                  type="submit"
                  className="px-4 h-10 border border-neutral-950 dark:border-neutral-600 text-neutral-950 dark:text-neutral-100 hover:bg-neutral-950 hover:text-white dark:hover:bg-[#faa619] dark:hover:text-neutral-950 dark:hover:border-[#faa619] text-xs font-bold uppercase tracking-wider rounded-md transition-colors"
                >
                  Check
                </button>
              </form>
              {pincodeMessage && (
                <p
                  className={`mt-2.5 text-xs font-semibold flex items-start gap-1.5 ${
                    pincodeMessage.ok
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {pincodeMessage.ok && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
                  <span>{pincodeMessage.text}</span>
                </p>
              )}
            </div>

            {/* Product Details & Specifications */}
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-950 dark:text-neutral-50 mb-1.5">
                  Product Overview
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm pt-2">
                <div>
                  <dt className="text-xs text-neutral-500 dark:text-neutral-400">
                    Fabric / Material
                  </dt>
                  <dd className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {product.fabric}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-500 dark:text-neutral-400">
                    Fit / Specification
                  </dt>
                  <dd className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {product.fit}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-500 dark:text-neutral-400">
                    Wash &amp; Care
                  </dt>
                  <dd className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {product.care}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-500 dark:text-neutral-400">
                    Country of Origin
                  </dt>
                  <dd className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {product.origin}
                  </dd>
                </div>
              </dl>

              <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 pt-2">
                <ShieldCheck className="w-4 h-4 text-neutral-700 dark:text-neutral-300 shrink-0" />
                <span>
                  100% Authentic Jhonty Hub Merchandise · Easy Exchange at Madhapur Stores
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Styles */}
        <section className="mt-16 pt-10 border-t border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-6">
            Similar Styles You May Like
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                isWishlisted={wishlistIds.includes(rel.id)}
                onOpenProduct={onOpenProduct}
                onQuickView={onQuickView}
                onToggleWishlist={onToggleWishlist}
                onAddToBag={(p, s) => onAddToBag(p, s)}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Mobile Sticky Bottom Buy Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 px-4 py-3 flex items-center justify-between gap-3">
        <div className="tabular-nums">
          <div className="text-base font-bold text-neutral-950 dark:text-white">
            {formatINR(product.price)}
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Size: {selectedSize}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-1 max-w-[260px]">
          <button
            type="button"
            disabled={selectedSizeQty <= 0}
            onClick={() => onAddToBag(product, selectedSize, selectedColor.name)}
            className="flex-1 h-11 bg-[#faa619] disabled:bg-neutral-200 dark:disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-md"
          >
            {selectedSizeQty <= 0 ? 'Sold Out' : 'Add Basket'}
          </button>
          <button
            type="button"
            disabled={selectedSizeQty <= 0}
            onClick={() => onBuyNow(product, selectedSize, selectedColor.name)}
            className="flex-1 h-11 bg-neutral-950 dark:bg-white disabled:bg-neutral-300 dark:disabled:bg-neutral-800 text-white dark:text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-md"
          >
            Buy Now
          </button>
        </div>
      </div>
    </main>
  );
}

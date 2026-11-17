import { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Search } from 'lucide-react';
import {
  FEATURED_BRANDS,
  HERO_SLIDES,
  TOP_CATEGORIES,
  formatINR,
} from '../data/catalog';
import { Category, Occasion, Product } from '../types';
import { ProductCard } from './ProductCard';
import { ResilientImage } from './ResilientImage';

interface HomeViewProps {
  products: Product[];
  allProductCount: number;
  activeCategory: Category;
  activeBrand: string | null;
  activeMaxPrice: number | null;
  activeOccasion: Occasion | null;
  searchQuery: string;
  wishlistIds: number[];
  onSelectCategory: (cat: Category) => void;
  onSelectBrand: (brand: string) => void;
  onSelectMaxPrice: (price: number | null) => void;
  onSelectOccasion: (occ: Occasion) => void;
  onSearchChange: (q: string) => void;
  onResetFilters: () => void;
  onOpenProduct: (id: number) => void;
  onQuickView: (product: Product) => void;
  onToggleWishlist: (id: number) => void;
  onAddToBag: (product: Product, size: string) => void;
  onOpenStores: () => void;
}

const CATEGORY_TABS: Category[] = [
  'All',
  'Shirts & Polos',
  'Denim & Chinos',
  'Outerwear',
  'Footwear',
  'Accessories',
];
const PRICE_CAPS = [999, 1299, 1499, 1999];
const OCCASIONS: { title: string; subtitle: string; occasion: Occasion }[] = [
  { title: 'Workwear', subtitle: 'Giza shirts, overshirts & laptop totes', occasion: 'Workwear' },
  { title: 'Casual Weekend', subtitle: 'Plaid overshirts, polos & stretch denim', occasion: 'Casual' },
  { title: 'Active & Street', subtitle: 'Bomber jackets & cushioned runners', occasion: 'Active' },
  { title: 'Evening & Smart', subtitle: 'Mandarin linen & tailored layers', occasion: 'Festive' },
];

export function HomeView({
  products,
  activeCategory,
  activeBrand,
  activeMaxPrice,
  activeOccasion,
  searchQuery,
  wishlistIds,
  onSelectCategory,
  onSelectBrand,
  onSelectMaxPrice,
  onSelectOccasion,
  onSearchChange,
  onResetFilters,
  onOpenProduct,
  onQuickView,
  onToggleWishlist,
  onAddToBag,
  onOpenStores,
}: HomeViewProps) {
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, []);

  const scrollToCatalog = () => {
    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const hasActiveFilter =
    activeCategory !== 'All' ||
    Boolean(activeBrand) ||
    Boolean(activeMaxPrice) ||
    Boolean(activeOccasion) ||
    Boolean(searchQuery);

  const activeFilterSummary = [
    activeCategory !== 'All' ? `Category: ${activeCategory}` : null,
    activeBrand ? `Brand: ${activeBrand}` : null,
    activeMaxPrice ? `Under ${formatINR(activeMaxPrice)}` : null,
    activeOccasion ? `Edit: ${activeOccasion}` : null,
    searchQuery ? `Search: "${searchQuery}"` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <main>
      {/* 1. Hero Campaign */}
      <section className="relative overflow-hidden bg-neutral-950">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${slideIdx * 100}%)` }}
        >
          {HERO_SLIDES.map((slide) => (
            <div
              key={slide.id}
              className="min-w-full relative h-[430px] sm:h-[490px] flex items-center"
            >
              <ResilientImage
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/92 via-neutral-950/60 to-neutral-950/15" />

              <div className="relative z-10 max-w-[1320px] w-full mx-auto px-6">
                <div className="max-w-xl text-white">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#faa619] mb-3">
                    {slide.kicker}
                  </p>
                  <h1 className="font-display text-4xl sm:text-5xl font-bold leading-[1.1] tracking-tight mb-4 max-w-lg">
                    {slide.title}
                  </h1>
                  <p className="text-sm sm:text-base text-neutral-200 leading-relaxed mb-7 max-w-md">
                    {slide.subtitle}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (slide.action.type === 'occasion') {
                        onSelectOccasion(slide.action.value);
                      } else {
                        onSelectCategory('All');
                      }
                      scrollToCatalog();
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#faa619] hover:bg-[#e6950c] text-neutral-950 text-sm font-bold uppercase tracking-wider rounded-md transition-colors"
                  >
                    <span>{slide.ctaLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setSlideIdx((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          aria-label="Previous campaign slide"
          className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-[#faa619] text-neutral-950 items-center justify-center shadow-md transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => setSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length)}
          aria-label="Next campaign slide"
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-[#faa619] text-neutral-950 items-center justify-center shadow-md transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {HERO_SLIDES.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSlideIdx(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all ${
                idx === slideIdx ? 'w-7 bg-[#faa619]' : 'w-2.5 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 2. Menswear Departments & Featured Brands */}
      <section className="py-12 border-b border-neutral-200 bg-white">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-950">
                Shop by Menswear Department
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                Branded casualwear, tailored shirts, denim, and sneakers curated in Madhapur
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenStores}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-900 hover:text-[#d98200] transition-colors"
            >
              <MapPin className="w-4 h-4 text-[#d98200]" />
              <span>Visit Hitech City Metro &amp; Madhapur Stores</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
            {TOP_CATEGORIES.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  onSelectCategory(item.category);
                  scrollToCatalog();
                }}
                className="group text-left"
              >
                <div className="aspect-[3/4] rounded-md overflow-hidden bg-neutral-100 border border-neutral-200 group-hover:border-[#faa619] transition-colors mb-2">
                  <ResilientImage
                    src={item.image}
                    alt={item.label}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <span className="block text-[13px] font-semibold text-neutral-900 group-hover:text-[#d98200] transition-colors">
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          <div className="pt-8 border-t border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-700">
                Featured Labels at Jhonty Hub
              </h3>
              {activeBrand && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="text-xs font-semibold text-[#d98200] hover:underline"
                >
                  Show all labels
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {FEATURED_BRANDS.map((b) => {
                const selected = activeBrand?.toLowerCase() === b.name.toLowerCase();
                return (
                  <button
                    key={b.name}
                    type="button"
                    onClick={() => {
                      onSelectBrand(b.name);
                      scrollToCatalog();
                    }}
                    className={`p-3.5 rounded-md border text-center transition-colors ${
                      selected
                        ? 'bg-neutral-950 text-white border-neutral-950'
                        : 'bg-neutral-50 hover:bg-white border-neutral-200 hover:border-[#faa619]'
                    }`}
                  >
                    <div className="text-xs font-bold tracking-wider truncate">{b.name}</div>
                    <div
                      className={`text-[11px] font-semibold mt-1 ${
                        selected ? 'text-[#faa619]' : 'text-[#d98200]'
                      }`}
                    >
                      {b.offer}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Jhonty Hub Value Rack & Catalog */}
      <section id="catalog-section" className="py-12 bg-neutral-50">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-950">
                Jhonty Hub Value Collection
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                Up to 50% off showroom MRPs · Select any piece for sizing, pincode check, or pickup
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap items-center gap-1 p-1 bg-white border border-neutral-200 rounded-lg">
                {CATEGORY_TABS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => onSelectCategory(cat)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                      activeCategory === cat
                        ? 'bg-neutral-950 text-white'
                        : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-neutral-600 mr-1">Price Point:</span>
              {PRICE_CAPS.map((cap) => {
                const isSelected = activeMaxPrice === cap;
                return (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => onSelectMaxPrice(isSelected ? null : cap)}
                    className={`px-3 py-1.5 rounded-md border font-semibold tabular-nums transition-colors ${
                      isSelected
                        ? 'bg-[#faa619] border-[#faa619] text-neutral-950'
                        : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    Under {formatINR(cap)}
                  </button>
                );
              })}
            </div>

            <div className="md:hidden relative w-full sm:w-64">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search shirts, denim, brands..."
                aria-label="Search catalog mobile"
                className="w-full h-10 pl-3.5 pr-9 text-sm bg-white border border-neutral-200 rounded-md focus:border-[#faa619] focus:outline-none"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {hasActiveFilter && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-neutral-200 rounded-md px-4 py-3 mb-6 text-sm">
              <div className="text-neutral-700">
                Showing <strong className="tabular-nums text-neutral-950">{products.length}</strong>{' '}
                style(s) <span aria-hidden="true">·</span>{' '}
                <span className="font-medium text-neutral-900">{activeFilterSummary}</span>
              </div>
              <button
                type="button"
                onClick={onResetFilters}
                className="text-xs font-bold uppercase tracking-wider text-[#d98200] hover:text-neutral-950"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {products.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
              <h3 className="text-lg font-bold text-neutral-950 mb-2">
                No styles match your current selection
              </h3>
              <p className="text-sm text-neutral-600 mb-5">
                Try clearing active filters or exploring another menswear department.
              </p>
              <button
                type="button"
                onClick={onResetFilters}
                className="px-6 py-2.5 bg-[#faa619] hover:bg-[#e6950c] text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-md"
              >
                View All Styles
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWishlisted={wishlistIds.includes(product.id)}
                  onOpenProduct={onOpenProduct}
                  onQuickView={onQuickView}
                  onToggleWishlist={onToggleWishlist}
                  onAddToBag={onAddToBag}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Style Edits */}
      <section className="py-12 bg-white border-t border-neutral-200">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
          <div className="mb-7">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-950">
              Shop by Wardrobe Edit
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Everyday comfort, workdays in Hitech City, and weekend street looks
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {OCCASIONS.map((item) => {
              const isSelected = activeOccasion === item.occasion;
              return (
                <button
                  key={item.occasion}
                  type="button"
                  onClick={() => {
                    onSelectOccasion(item.occasion);
                    scrollToCatalog();
                  }}
                  className={`p-6 rounded-lg border text-left transition-all flex flex-col justify-between min-h-[128px] ${
                    isSelected
                      ? 'bg-neutral-950 text-white border-neutral-950'
                      : 'bg-neutral-50 hover:bg-white border-neutral-200 hover:border-[#faa619]'
                  }`}
                >
                  <div>
                    <h3 className="text-lg font-bold">{item.title}</h3>
                    <p
                      className={`text-xs mt-1 ${
                        isSelected ? 'text-neutral-300' : 'text-neutral-600'
                      }`}
                    >
                      {item.subtitle}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mt-4 ${
                      isSelected ? 'text-[#faa619]' : 'text-neutral-900'
                    }`}
                  >
                    <span>Explore Edit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

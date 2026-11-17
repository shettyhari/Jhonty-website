import { useState } from 'react';
import { Heart, MapPin, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { Category, ViewMode } from '../types';

interface HeaderProps {
  activeCategory: Category;
  activeView: ViewMode;
  searchQuery: string;
  bagCount: number;
  wishlistCount: number;
  userName: string | null;
  onSelectCategory: (cat: Category) => void;
  onNavigate: (view: ViewMode) => void;
  onSearchChange: (q: string) => void;
  onSearchSubmit: () => void;
  onOpenBag: () => void;
  onOpenWishlist: () => void;
  onOpenAuth: () => void;
  onOpenMobileMenu: () => void;
  onResetHome: () => void;
}

const NAV_LINKS: { label: string; category: Category }[] = [
  { label: 'Women', category: 'Women' },
  { label: 'Men', category: 'Men' },
  { label: 'Kids', category: 'Kids' },
  { label: 'Shoes & Bags', category: 'Shoes & Bags' },
  { label: 'Beauty', category: 'Beauty' },
];

export function Header({
  activeCategory,
  activeView,
  searchQuery,
  bagCount,
  wishlistCount,
  userName,
  onSelectCategory,
  onNavigate,
  onSearchChange,
  onSearchSubmit,
  onOpenBag,
  onOpenWishlist,
  onOpenAuth,
  onOpenMobileMenu,
  onResetHome,
}: HeaderProps) {
  const [promoDismissed, setPromoDismissed] = useState(false);

  return (
    <>
      {!promoDismissed && (
        <div className="bg-neutral-950 text-white text-xs h-9 flex items-center justify-between px-4 sm:px-6 border-b border-neutral-800">
          <div className="hidden lg:flex items-center gap-4 text-neutral-300 whitespace-nowrap shrink-0">
            <span>Free Shipping above ₹999</span>
            <span aria-hidden="true">·</span>
            <span>Click &amp; Collect in 90+ Stores</span>
          </div>
          <button
            type="button"
            onClick={() => onSelectCategory('All')}
            className="mx-auto lg:mx-0 text-center font-medium text-neutral-100 hover:text-[#faa619] transition-colors truncate"
          >
            Limited Time: Use <span className="text-[#faa619] font-semibold">SALE15</span> for 15% Off or{' '}
            <span className="text-[#faa619] font-semibold">LS1000</span> above ₹3,999
          </button>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('stores')}
              className="hidden sm:inline-flex items-center gap-1 text-neutral-300 hover:text-[#faa619] transition-colors whitespace-nowrap"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Store Locator</span>
            </button>
            <button
              type="button"
              onClick={() => setPromoDismissed(true)}
              aria-label="Dismiss announcement"
              className="text-neutral-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 lg:gap-8">
          {/* Zone 1: Brand Wordmark + Mobile Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenMobileMenu}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 -ml-2 text-neutral-900 hover:bg-neutral-100 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Menu className="w-5 h-5" />
            </button>

            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                onResetHome();
              }}
              className="text-2xl font-bold tracking-tight text-neutral-950 whitespace-nowrap shrink-0 pb-0.5 border-b-2 border-[#faa619]"
            >
              lifestyle
            </a>
          </div>

          {/* Zone 2: Clean Single-Line Navigation Links */}
          <nav
            className="hidden lg:flex items-center gap-6 h-full"
            aria-label="Primary departments"
          >
            {NAV_LINKS.map((item) => {
              const isActive = activeView === 'home' && activeCategory === item.category;
              return (
                <button
                  key={item.category}
                  type="button"
                  onClick={() => onSelectCategory(item.category)}
                  className={`h-full inline-flex items-center text-sm font-semibold whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                    isActive
                      ? 'text-[#d98200] border-[#faa619]'
                      : 'text-neutral-800 border-transparent hover:text-[#d98200]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => onNavigate('stores')}
              className={`h-full inline-flex items-center text-sm font-semibold whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                activeView === 'stores'
                  ? 'text-[#d98200] border-[#faa619]'
                  : 'text-neutral-800 border-transparent hover:text-[#d98200]'
              }`}
            >
              Stores
            </button>
          </nav>

          {/* Zone 3: Search & Primary Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSearchSubmit();
              }}
              className="hidden md:block relative w-56 xl:w-72"
            >
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search brands, styles..."
                aria-label="Search catalog"
                className="w-full h-10 pl-3.5 pr-9 text-sm bg-neutral-100 border border-neutral-200 rounded-md focus:bg-white focus:border-[#faa619] focus:outline-none transition-colors"
              />
              <button
                type="submit"
                aria-label="Submit search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            <button
              type="button"
              onClick={onOpenAuth}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-100 rounded-md whitespace-nowrap shrink-0 min-h-[40px]"
            >
              <User className="w-4 h-4" />
              <span className="max-w-[110px] truncate">
                {userName ? `Hi, ${userName.split(' ')[0]}` : 'Sign In'}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenWishlist}
              aria-label={`Open wishlist (${wishlistCount} items)`}
              className="relative inline-flex items-center justify-center p-2 text-neutral-800 hover:bg-neutral-100 rounded-md min-h-[40px] min-w-[40px]"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-neutral-950 text-white text-[10px] font-bold tabular-nums flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenBag}
              aria-label={`Open shopping basket (${bagCount} items)`}
              className="relative inline-flex items-center gap-2 px-3.5 py-2 bg-[#faa619] hover:bg-[#e6950c] text-neutral-950 text-sm font-bold rounded-md whitespace-nowrap shrink-0 transition-colors min-h-[40px]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Basket</span>
              <span className="tabular-nums">({bagCount})</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

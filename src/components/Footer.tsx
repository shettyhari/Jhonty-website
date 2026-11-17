import { FormEvent, useState } from 'react';
import { Category, ViewMode } from '../types';

interface FooterProps {
  onSelectCategory: (cat: Category) => void;
  onNavigate: (view: ViewMode) => void;
  onNotify: (msg: string) => void;
}

export function Footer({ onSelectCategory, onNavigate, onNotify }: FooterProps) {
  const [email, setEmail] = useState('');

  const handleNewsletter = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    onNotify(`Subscribed ${email.trim()} to Lifestyle offers & Landmark Rewards`);
    setEmail('');
  };

  return (
    <footer className="bg-neutral-50 border-t border-neutral-200">
      {/* Newsletter Band */}
      <div className="border-b border-neutral-200 py-10">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-neutral-950">
              Subscribe to Lifestyle offers &amp; style edits
            </h3>
            <p className="text-sm text-neutral-600 mt-1">
              Get early access to seasonal sales, Landmark Rewards perks, and new drops.
            </p>
          </div>
          <form onSubmit={handleNewsletter} className="flex gap-2.5 w-full md:w-auto md:min-w-[400px]">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              aria-label="Email address for newsletter"
              className="flex-1 h-11 px-3.5 bg-white border border-neutral-200 rounded-md text-sm focus:border-[#faa619] focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 h-11 bg-[#faa619] hover:bg-[#e6950c] text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-md whitespace-nowrap transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Links & Contact */}
      <div className="bg-white py-12">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pb-10 border-b border-neutral-200 text-sm">
            <div>
              <h4 className="font-bold text-neutral-950 mb-3.5">Women</h4>
              <ul className="space-y-2 text-neutral-600">
                <li>
                  <button type="button" onClick={() => onSelectCategory('Women')} className="hover:text-[#d98200]">
                    Ethnic &amp; Fusion Wear
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onSelectCategory('Women')} className="hover:text-[#d98200]">
                    Tops, Tees &amp; Denim
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onSelectCategory('Women')} className="hover:text-[#d98200]">
                    Dresses &amp; Workwear
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-neutral-950 mb-3.5">Men</h4>
              <ul className="space-y-2 text-neutral-600">
                <li>
                  <button type="button" onClick={() => onSelectCategory('Men')} className="hover:text-[#d98200]">
                    Formal &amp; Casual Shirts
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onSelectCategory('Men')} className="hover:text-[#d98200]">
                    Polos &amp; T-Shirts
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onSelectCategory('Men')} className="hover:text-[#d98200]">
                    Activewear &amp; Chinos
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-neutral-950 mb-3.5">Kids, Shoes &amp; Beauty</h4>
              <ul className="space-y-2 text-neutral-600">
                <li>
                  <button type="button" onClick={() => onSelectCategory('Kids')} className="hover:text-[#d98200]">
                    Boys &amp; Girls Apparel
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onSelectCategory('Shoes & Bags')} className="hover:text-[#d98200]">
                    Footwear &amp; Tote Bags
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onSelectCategory('Beauty')} className="hover:text-[#d98200]">
                    Makeup &amp; Fragrances
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-neutral-950 mb-3.5">Stores &amp; Help</h4>
              <ul className="space-y-2 text-neutral-600">
                <li>
                  <button type="button" onClick={() => onNavigate('stores')} className="hover:text-[#d98200]">
                    Store Locator
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onNavigate('stores')} className="hover:text-[#d98200]">
                    Click &amp; Collect
                  </button>
                </li>
                <li>
                  <span className="text-neutral-500">Toll-Free: 1800-123-1555</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-neutral-500">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold tracking-tight text-neutral-950 pb-0.5 border-b-2 border-[#faa619]">
                lifestyle
              </span>
              <span>100% Authentic Products · 30-Day Easy Returns</span>
            </div>
            <p>&copy; 2026 Lifestyle Stores India · Terms &amp; Conditions · Privacy Policy</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

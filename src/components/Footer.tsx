import { FormEvent, useState } from 'react';
import { Category, ViewMode } from '../types';
import { BrandLogo } from './BrandLogo';

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
    onNotify(`Subscribed ${email.trim()} to Jhonty Hub drops & value deals`);
    setEmail('');
  };

  return (
    <footer className="bg-neutral-50 border-t border-neutral-200">
      {/* Newsletter Band */}
      <div className="border-b border-neutral-200 py-10">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-neutral-950">
              Get Jhonty Hub restock alerts &amp; value drops
            </h3>
            <p className="text-sm text-neutral-600 mt-1">
              Fresh branded menswear arrivals at Madhapur &amp; Hitech City Metro every week.
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

      {/* Links & Flagship Location */}
      <div className="bg-white py-12">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pb-10 border-b border-neutral-200 text-sm">
            <div>
              <h4 className="font-bold text-neutral-950 mb-3.5">Menswear</h4>
              <ul className="space-y-2 text-neutral-600">
                <li>
                  <button
                    type="button"
                    onClick={() => onSelectCategory('Shirts & Polos')}
                    className="hover:text-[#d98200]"
                  >
                    Overshirts, Shirts &amp; Polos
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onSelectCategory('Denim & Chinos')}
                    className="hover:text-[#d98200]"
                  >
                    Stretch Denim &amp; Chinos
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onSelectCategory('Outerwear')}
                    className="hover:text-[#d98200]"
                  >
                    Bomber Jackets &amp; Shackets
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-neutral-950 mb-3.5">Footwear &amp; Carry</h4>
              <ul className="space-y-2 text-neutral-600">
                <li>
                  <button
                    type="button"
                    onClick={() => onSelectCategory('Footwear')}
                    className="hover:text-[#d98200]"
                  >
                    Running &amp; Casual Sneakers
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onSelectCategory('Accessories')}
                    className="hover:text-[#d98200]"
                  >
                    Laptop Totes &amp; Everyday Carry
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-neutral-950 mb-3.5">Services</h4>
              <ul className="space-y-2 text-neutral-600">
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('stores')}
                    className="hover:text-[#d98200]"
                  >
                    Hyderabad Store Locator
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('tracking')}
                    className="hover:text-[#d98200]"
                  >
                    Track Order
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('stores')}
                    className="hover:text-[#d98200]"
                  >
                    Hitech City Click &amp; Collect
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('admin')}
                    className="hover:text-[#d98200] font-semibold text-neutral-800"
                  >
                    Admin Inventory Panel
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-neutral-950 mb-3.5">Madhapur Flagship</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                1st Floor, Lower Concourse Level, Hitech City Metro Station, Silicon Valley,
                Madhapur, Hyderabad - 500081
              </p>
              <p className="text-xs font-semibold text-neutral-900 mt-2">
                Opens Daily · 10:00 AM – 10:00 PM
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-neutral-500">
            <div className="flex items-center gap-4">
              <BrandLogo compact />
              <span>Branded Menswear · Madhapur, Hyderabad</span>
            </div>
            <p>&copy; 2026 Jhonty Hub Hyderabad · All Rights Reserved</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

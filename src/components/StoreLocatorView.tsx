import { useState } from 'react';
import { CheckCircle2, Clock, MapPin, Phone, Search } from 'lucide-react';
import { STORES_DATA } from '../data/catalog';
import { StoreLocation } from '../types';

interface StoreLocatorViewProps {
  selectedStoreId: string;
  onSelectStore: (store: StoreLocation) => void;
  onContinueToCheckout: () => void;
  onBackHome: () => void;
}

export function StoreLocatorView({
  selectedStoreId,
  onSelectStore,
  onContinueToCheckout,
  onBackHome,
}: StoreLocatorViewProps) {
  const [selectedCity, setSelectedCity] = useState('All');
  const [query, setQuery] = useState('');

  const cities = ['All', ...Array.from(new Set(STORES_DATA.map((s) => s.city)))];

  const filteredStores = STORES_DATA.filter((s) => {
    if (selectedCity !== 'All' && s.city !== selectedCity) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.pincode.includes(q)
      );
    }
    return true;
  });

  const activeStore =
    STORES_DATA.find((s) => s.id === selectedStoreId) || filteredStores[0] || STORES_DATA[0];

  return (
    <main className="bg-white">
      {/* Banner */}
      <section className="bg-neutral-950 text-white py-12">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#faa619] mb-2">
              Madhapur · Hitech City Metro · Kukatpally
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Jhonty Hub Hyderabad Stores
            </h1>
            <p className="text-sm text-neutral-300 mt-2 max-w-xl">
              Visit our flagship store on the 1st Floor Lower Concourse at Hitech City Metro
              Station or our Venkata Ramana Colony hub in Madhapur — open daily from 10:00 AM.
            </p>
          </div>
          <button
            type="button"
            onClick={onBackHome}
            className="self-start md:self-auto text-xs font-bold uppercase tracking-wider text-neutral-300 hover:text-[#faa619]"
          >
            &larr; Back to Storefront
          </button>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-7">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-100 rounded-lg">
            {cities.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCity(city)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                  selectedCity === city
                    ? 'bg-white text-neutral-950 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-80">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search mall, area, or pincode..."
              aria-label="Search stores by mall, area, or pincode"
              className="w-full h-10 pl-3.5 pr-9 bg-neutral-50 border border-neutral-200 rounded-md text-sm focus:bg-white focus:border-[#faa619] focus:outline-none"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* 2-Column Store List + Sticky Store Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-10">
          <div className="lg:col-span-7 space-y-3.5">
            {filteredStores.length === 0 ? (
              <div className="border border-neutral-200 rounded-lg p-8 text-center">
                <p className="text-sm font-semibold text-neutral-900 mb-1">
                  No Jhonty Hub stores matched "{query}"
                </p>
                <p className="text-xs text-neutral-500 mb-4">
                  Try clearing your search or selecting another city.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSelectedCity('All');
                  }}
                  className="px-4 py-2 bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider rounded-md"
                >
                  Reset Search
                </button>
              </div>
            ) : (
              filteredStores.map((store) => {
                const isSelected = activeStore.id === store.id;
                return (
                  <div
                    key={store.id}
                    onClick={() => onSelectStore(store)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectStore(store);
                      }
                    }}
                    className={`p-5 rounded-lg border transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-[#faa619] bg-[#fffcf5]'
                        : 'border-neutral-200 bg-white hover:border-neutral-400'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                          {store.city} · {store.pincode}
                        </span>
                        <h2 className="text-base font-bold text-neutral-950 mt-0.5">
                          {store.name}
                        </h2>
                      </div>
                      {store.clickCollect && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Click &amp; Collect Ready</span>
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-neutral-600 mb-3">{store.address}</p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                      <span>Hours: {store.hours}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{store.phone}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-neutral-700 font-medium">
                        {store.services.join(' / ')}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Sticky Store Details Panel */}
          <aside className="lg:col-span-5 lg:sticky lg:top-24 border border-neutral-200 rounded-lg overflow-hidden bg-white">
            <div className="h-52 bg-neutral-100 relative flex flex-col items-center justify-center p-6 border-b border-neutral-200">
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #d4d4d4 1px, transparent 1px), linear-gradient(to bottom, #d4d4d4 1px, transparent 1px)',
                  backgroundSize: '28px 28px',
                }}
              />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-11 h-11 rounded-full bg-neutral-950 text-[#faa619] flex items-center justify-center shadow-md mb-2.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="px-3.5 py-1.5 bg-white border border-neutral-200 rounded-md text-xs font-bold text-neutral-950 shadow-sm">
                  {activeStore.name}
                </span>
                <span className="mt-2 text-[11px] font-mono text-neutral-600 tabular-nums">
                  {activeStore.coordinates.lat}, {activeStore.coordinates.lng}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#d98200]">
                  Selected Flagship Store
                </div>
                <h3 className="text-lg font-bold text-neutral-950 mt-1">{activeStore.name}</h3>
                <p className="text-sm text-neutral-600 mt-1">
                  {activeStore.address} — {activeStore.pincode}
                </p>
              </div>

              <div className="space-y-2 text-sm text-neutral-700 pt-2 border-t border-neutral-200">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-neutral-500 shrink-0" />
                  <span>Open Daily: {activeStore.hours}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-neutral-500 shrink-0" />
                  <span className="tabular-nums">{activeStore.phone}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-200">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Available Store Services
                </div>
                <p className="text-xs font-medium text-neutral-800">
                  {activeStore.services.join(' · ')}
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onSelectStore(activeStore);
                    onContinueToCheckout();
                  }}
                  className="w-full h-11 bg-[#faa619] hover:bg-[#e6950c] text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-md transition-colors"
                >
                  Select Store for Click &amp; Collect
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

import { FormEvent, useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Search,
  Truck,
} from 'lucide-react';
import { formatINR } from '../data/catalog';
import { OrderTrackingRecord, TrackingPoint } from '../data/tracking';

interface OrderTrackingViewProps {
  theme: 'light' | 'dark';
  orders: OrderTrackingRecord[];
  initialOrderId: string | null;
  onBackHome: () => void;
}

export function OrderTrackingView({
  theme,
  orders,
  initialOrderId,
  onBackHome,
}: OrderTrackingViewProps) {
  const isDark = theme === 'dark';
  const defaultOrder =
    orders.find((o) => o.orderId === initialOrderId) || orders[0];

  const [inputOrderId, setInputOrderId] = useState(defaultOrder.orderId);
  const [activeOrder, setActiveOrder] = useState<OrderTrackingRecord>(defaultOrder);
  const [lookupError, setLookupError] = useState('');
  const [selectedWaypoint, setSelectedWaypoint] = useState<TrackingPoint>(
    defaultOrder.waypoints.find((w) => w.current) || defaultOrder.waypoints[0]
  );

  useEffect(() => {
    if (initialOrderId) {
      const matched = orders.find(
        (o) => o.orderId.toUpperCase() === initialOrderId.toUpperCase()
      );
      if (matched) {
        setInputOrderId(matched.orderId);
        setActiveOrder(matched);
        setSelectedWaypoint(
          matched.waypoints.find((w) => w.current) || matched.waypoints[0]
        );
        setLookupError('');
      }
    }
  }, [initialOrderId, orders]);

  const selectOrderRecord = (record: OrderTrackingRecord) => {
    setInputOrderId(record.orderId);
    setActiveOrder(record);
    setSelectedWaypoint(
      record.waypoints.find((w) => w.current) || record.waypoints[0]
    );
    setLookupError('');
  };

  const handleLookup = (e: FormEvent) => {
    e.preventDefault();
    const q = inputOrderId.trim().toUpperCase();
    if (!q) {
      setLookupError('Please enter an Order ID (for example: JH-482910).');
      return;
    }
    const found = orders.find((o) => o.orderId.toUpperCase() === q);
    if (!found) {
      setLookupError(
        `No shipment found for "${q}". Try one of the quick-select order IDs below.`
      );
      return;
    }
    selectOrderRecord(found);
  };

  const completedPoints = activeOrder.waypoints.filter((w) => w.completed);
  const allPoints = activeOrder.waypoints;

  const fullPathD = allPoints
    .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`)
    .join(' ');
  const completedPathD = completedPoints
    .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`)
    .join(' ');

  return (
    <main className="bg-neutral-50 dark:bg-neutral-950 min-h-[75vh] pb-16 transition-colors">
      {/* Header Banner */}
      <section className="bg-neutral-950 text-white py-11 border-b border-transparent dark:border-neutral-800">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#faa619] mb-2">
              Live Shipment Lookup
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Track Your Jhonty Hub Order
            </h1>
            <p className="text-sm text-neutral-300 mt-2 max-w-xl">
              Enter your Jhonty Hub Order ID to check real-time transit milestones, estimated
              delivery date, and package route progress from Madhapur.
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

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 -mt-6">
        {/* Search Input Card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 sm:p-6 shadow-sm mb-8">
          <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputOrderId}
                onChange={(e) => setInputOrderId(e.target.value)}
                placeholder="Enter Order ID (e.g. JH-482910)"
                aria-label="Order ID"
                className="w-full h-12 pl-4 pr-10 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm font-semibold uppercase tracking-wide tabular-nums text-neutral-950 dark:text-neutral-100 placeholder:text-neutral-400 focus:bg-white dark:focus:bg-neutral-950 focus:border-[#faa619] focus:outline-none"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="h-12 px-7 bg-[#faa619] hover:bg-[#e6950c] text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-md whitespace-nowrap transition-colors"
            >
              Track Package
            </button>
          </form>

          {lookupError && (
            <p className="mt-3 text-xs font-semibold text-red-600 dark:text-red-400">
              {lookupError}
            </p>
          )}

          <div className="mt-4 pt-3.5 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-neutral-500 dark:text-neutral-400 mr-1">
              Recent &amp; Sample Orders:
            </span>
            {orders.map((ord) => {
              const isSelected = ord.orderId === activeOrder.orderId;
              return (
                <button
                  key={ord.orderId}
                  type="button"
                  onClick={() => selectOrderRecord(ord)}
                  className={`px-3 py-1.5 rounded-md border font-semibold tabular-nums transition-colors ${
                    isSelected
                      ? 'bg-neutral-950 dark:bg-[#faa619] text-white dark:text-neutral-950 border-neutral-950 dark:border-[#faa619]'
                      : 'bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600'
                  }`}
                >
                  {ord.orderId} · {ord.status}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Summary Strip */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Order Reference
              </div>
              <div className="text-lg font-bold text-neutral-950 dark:text-white tabular-nums mt-1">
                {activeOrder.orderId}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Placed {activeOrder.placedAt} · {formatINR(activeOrder.total)}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Current Status
              </div>
              <div className="flex items-center gap-2 text-lg font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                {activeOrder.status === 'Delivered' ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                ) : (
                  <Truck className="w-5 h-5 shrink-0 text-[#d98200] dark:text-[#faa619]" />
                )}
                <span>{activeOrder.status}</span>
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 tabular-nums">
                {activeOrder.progressPct}% journey completed
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Estimated Delivery
              </div>
              <div className="flex items-center gap-1.5 text-lg font-bold text-neutral-950 dark:text-white mt-1">
                <Clock className="w-4 h-4 text-[#d98200] dark:text-[#faa619] shrink-0" />
                <span>{activeOrder.estimatedDelivery}</span>
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {activeOrder.destinationCity}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Courier &amp; Tracking AWB
              </div>
              <div className="text-base font-bold text-neutral-950 dark:text-white mt-1">
                {activeOrder.carrier}
              </div>
              <div className="text-xs font-mono text-neutral-600 dark:text-neutral-400 tabular-nums mt-0.5">
                {activeOrder.awb}
              </div>
            </div>
          </div>

          {/* Progress Track */}
          <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#faa619] transition-all duration-300"
                style={{ width: `${activeOrder.progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2-Column Route Map + Transit Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Shipment Timeline & Package Items */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
              <h2 className="text-base font-bold text-neutral-950 dark:text-white mb-5 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#d98200] dark:text-[#faa619]" />
                <span>Transit Milestones</span>
              </h2>

              <ol className="space-y-5">
                {activeOrder.waypoints.map((wp, idx) => {
                  const isLast = idx === activeOrder.waypoints.length - 1;
                  const isFocused = selectedWaypoint.id === wp.id;
                  return (
                    <li key={wp.id} className="relative flex gap-3.5">
                      <div className="flex flex-col items-center">
                        <span
                          className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 mt-1 ${
                            wp.current
                              ? 'bg-[#faa619] border-neutral-950 dark:border-white'
                              : wp.completed
                                ? 'bg-emerald-700 border-emerald-700 dark:bg-emerald-500 dark:border-emerald-500'
                                : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700'
                          }`}
                        />
                        {!isLast && (
                          <span
                            className={`w-px flex-1 mt-1.5 ${
                              wp.completed
                                ? 'bg-neutral-300 dark:bg-neutral-700'
                                : 'bg-neutral-200 dark:bg-neutral-800'
                            }`}
                          />
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedWaypoint(wp)}
                        className={`flex-1 text-left pb-1 rounded-md transition-colors ${
                          isFocused ? 'opacity-100' : 'opacity-90 hover:opacity-100'
                        }`}
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span
                            className={`text-sm font-bold ${
                              wp.current
                                ? 'text-neutral-950 dark:text-white'
                                : wp.completed
                                  ? 'text-neutral-900 dark:text-neutral-100'
                                  : 'text-neutral-400 dark:text-neutral-500'
                            }`}
                          >
                            {wp.label}
                          </span>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
                            {wp.timestamp}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-[#d98200] dark:text-[#faa619] mt-0.5">
                          {wp.city}
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                          {wp.detail}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-3">
                Delivery Destination &amp; Items
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                {activeOrder.destinationAddress}
              </p>
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800 mt-2">
                {activeOrder.items.map((item, idx) => (
                  <div
                    key={`${item.title}-${idx}`}
                    className="py-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-neutral-950 dark:text-white">
                        {item.brand}
                      </span>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        {' '}
                        · {item.title} ({item.size}) × {item.qty}
                      </span>
                    </div>
                    <span className="font-bold text-neutral-950 dark:text-white tabular-nums shrink-0">
                      {formatINR(item.price * item.qty)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Interactive Corridor Route Map */}
          <div className="lg:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#d98200] dark:text-[#faa619]" />
                  <span>Package Route Map</span>
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Click any checkpoint pin on the route to inspect transit details
                </p>
              </div>
              <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Completed Route · Remaining Corridor
              </div>
            </div>

            {/* Stylized India Logistics Corridor SVG Map */}
            <div className="relative bg-[#f5f4f0] dark:bg-[#0d0d10] border-b border-neutral-200 dark:border-neutral-800">
              <svg
                viewBox="0 0 600 420"
                className="w-full h-[360px] sm:h-[420px] select-none"
                role="img"
                aria-label={`Delivery route map for order ${activeOrder.orderId}`}
              >
                <defs>
                  <pattern
                    id="routeGrid"
                    width="28"
                    height="28"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 28 0 L 0 0 0 28"
                      fill="none"
                      stroke={isDark ? '#1f1f24' : '#e5e2da'}
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>

                <rect width="600" height="420" fill="url(#routeGrid)" />

                {/* Stylized India Mainland Silhouette */}
                <path
                  d="M 248 44 L 298 62 L 325 104 L 386 144 L 468 174 L 492 204 L 444 236 L 404 264 L 352 308 L 326 364 L 284 402 L 246 376 L 218 320 L 178 274 L 154 220 L 122 184 L 156 156 L 194 128 L 214 78 Z"
                  fill={isDark ? '#17171b' : '#ffffff'}
                  stroke={isDark ? '#33333b' : '#d6d3cb'}
                  strokeWidth="2"
                  strokeLinejoin="round"
                />

                {/* Reference Major Hubs (quiet labels) */}
                {[
                  { name: 'Delhi', x: 268, y: 128 },
                  { name: 'Mumbai', x: 184, y: 274 },
                  { name: 'Hyderabad', x: 286, y: 294 },
                  { name: 'Bengaluru', x: 270, y: 348 },
                  { name: 'Chennai', x: 318, y: 344 },
                  { name: 'Kolkata', x: 432, y: 222 },
                ].map((city) => (
                  <g key={city.name}>
                    <circle
                      cx={city.x}
                      cy={city.y}
                      r="2.5"
                      fill={isDark ? '#52525b' : '#d4d4d8'}
                    />
                    <text
                      x={city.x + 7}
                      y={city.y + 3}
                      fontSize="10"
                      fill={isDark ? '#71717a' : '#a1a1aa'}
                      fontFamily="DM Sans, sans-serif"
                    >
                      {city.name}
                    </text>
                  </g>
                ))}

                {/* Full Planned Route (Dashed) */}
                {allPoints.length > 1 && (
                  <path
                    d={fullPathD}
                    fill="none"
                    stroke={isDark ? '#52525b' : '#a3a3a3'}
                    strokeWidth="2.5"
                    strokeDasharray="6 5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Completed Transit Route (Solid Amber) */}
                {completedPoints.length > 1 && (
                  <path
                    d={completedPathD}
                    fill="none"
                    stroke="#faa619"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Waypoint Markers */}
                {allPoints.map((pt, idx) => {
                  const isSelected = selectedWaypoint.id === pt.id;
                  const pinOutline = isDark ? '#f4f4f5' : '#111111';
                  return (
                    <g
                      key={pt.id}
                      onClick={() => setSelectedWaypoint(pt)}
                      className="cursor-pointer"
                    >
                      {pt.current && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="16"
                          fill="#faa619"
                          fillOpacity="0.28"
                        />
                      )}
                      {isSelected && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="12"
                          fill="none"
                          stroke={isDark ? '#faa619' : '#111111'}
                          strokeWidth="1.5"
                        />
                      )}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={pt.current ? '7.5' : '6'}
                        fill={
                          pt.current
                            ? '#faa619'
                            : pt.completed
                              ? isDark
                                ? '#fafafa'
                                : '#111111'
                              : isDark
                                ? '#18181b'
                                : '#ffffff'
                        }
                        stroke={pt.current && isDark ? '#09090b' : pinOutline}
                        strokeWidth="2"
                      />
                      <text
                        x={pt.x}
                        y={pt.y - 12}
                        textAnchor="middle"
                        fontSize="10.5"
                        fontWeight="700"
                        fill={isDark ? '#fafafa' : '#111111'}
                        fontFamily="DM Sans, sans-serif"
                      >
                        {idx + 1}. {pt.city}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Selected Checkpoint Detail Bar */}
            <div className="p-5 bg-white dark:bg-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#d98200] dark:text-[#faa619]">
                  Selected Checkpoint · {selectedWaypoint.city}
                </div>
                <div className="text-sm font-bold text-neutral-950 dark:text-white mt-0.5">
                  {selectedWaypoint.label}
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                  {selectedWaypoint.detail}
                </p>
              </div>
              <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 tabular-nums shrink-0">
                {selectedWaypoint.timestamp}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

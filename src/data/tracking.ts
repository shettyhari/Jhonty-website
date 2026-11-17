import { DeliveryMode, OrderReceipt } from '../types';

export interface TrackingPoint {
  id: string;
  label: string;
  city: string;
  timestamp: string;
  detail: string;
  completed: boolean;
  current?: boolean;
  x: number;
  y: number;
}

export interface OrderTrackingRecord {
  orderId: string;
  status:
    | 'Order Placed'
    | 'Packed at Jhonty Hub'
    | 'In Transit'
    | 'Out for Delivery'
    | 'Delivered'
    | 'Ready for Store Pickup';
  placedAt: string;
  estimatedDelivery: string;
  carrier: string;
  awb: string;
  deliveryMode: DeliveryMode;
  destinationAddress: string;
  destinationCity: string;
  progressPct: number;
  waypoints: TrackingPoint[];
  items: {
    brand: string;
    title: string;
    size: string;
    qty: number;
    price: number;
  }[];
  total: number;
}

const CITY_COORDS: Record<string, { x: number; y: number }> = {
  Delhi: { x: 268, y: 128 },
  'New Delhi': { x: 268, y: 128 },
  Hyderabad: { x: 286, y: 294 },
  Madhapur: { x: 286, y: 294 },
  Kukatpally: { x: 278, y: 286 },
  Pune: { x: 205, y: 288 },
  Mumbai: { x: 184, y: 274 },
  Bengaluru: { x: 270, y: 348 },
  Chennai: { x: 318, y: 344 },
  Kolkata: { x: 432, y: 222 },
  Jaipur: { x: 230, y: 168 },
  Ahmedabad: { x: 178, y: 215 },
};

function resolveCityCoords(city: string): { x: number; y: number } {
  const key = Object.keys(CITY_COORDS).find((k) =>
    city.toLowerCase().includes(k.toLowerCase())
  );
  return key ? CITY_COORDS[key] : { x: 286, y: 294 };
}

export const SAMPLE_TRACKING_ORDERS: OrderTrackingRecord[] = [
  {
    orderId: 'JH-482910',
    status: 'In Transit',
    placedAt: '14 Nov 2026',
    estimatedDelivery: 'Thu, 19 Nov 2026',
    carrier: 'BlueDart Express',
    awb: 'BD-884920144',
    deliveryMode: 'home',
    destinationAddress: '402 Sea Breeze Apartments, Bandra West, Mumbai - 400050',
    destinationCity: 'Mumbai',
    progressPct: 68,
    items: [
      {
        brand: 'JHONTY ORIGINALS',
        title: 'Men Olive & Charcoal Brushed Cotton Plaid Overshirt',
        size: 'L',
        qty: 1,
        price: 1199,
      },
      {
        brand: 'CALVIN KLEIN',
        title: 'Structured Cognac Vegan Leather Executive Work Tote',
        size: 'One Size',
        qty: 1,
        price: 1299,
      },
    ],
    total: 2498,
    waypoints: [
      {
        id: 'wp-1',
        label: 'Packed at Jhonty Hub',
        city: 'Madhapur, Hyderabad',
        timestamp: '14 Nov, 06:40 PM',
        detail: 'Dispatched from Jhonty Hub Hitech City Metro Flagship, Madhapur.',
        completed: true,
        x: 286,
        y: 294,
      },
      {
        id: 'wp-2',
        label: 'Arrived at Sortation Hub',
        city: 'Pune Gateway',
        timestamp: '16 Nov, 08:25 AM',
        detail: 'Sorted and cleared onto Westbound Express Linehaul.',
        completed: true,
        current: true,
        x: 205,
        y: 288,
      },
      {
        id: 'wp-3',
        label: 'Out for Delivery',
        city: 'Mumbai - 400050',
        timestamp: 'Expected 19 Nov',
        detail: 'Final-mile courier dispatch to Bandra West, Mumbai.',
        completed: false,
        x: 184,
        y: 274,
      },
    ],
  },
  {
    orderId: 'JH-719304',
    status: 'Out for Delivery',
    placedAt: '16 Nov 2026',
    estimatedDelivery: 'Today, by 8:00 PM',
    carrier: 'Jhonty Express Local',
    awb: 'JH-HYD-302948',
    deliveryMode: 'home',
    destinationAddress: 'Plot 44, Jubilee Hills Road No. 36, Hyderabad - 500033',
    destinationCity: 'Hyderabad',
    progressPct: 90,
    items: [
      {
        brand: 'U.S. POLO ASSN.',
        title: 'Men Tailored Slim Fit Two-Ply Giza Cotton Formal Shirt',
        size: '40',
        qty: 2,
        price: 1099,
      },
    ],
    total: 2198,
    waypoints: [
      {
        id: 'wp-1',
        label: 'Packed at Flagship',
        city: 'Hitech City Metro',
        timestamp: '16 Nov, 02:10 PM',
        detail: 'Quality checked and sealed at Jhonty Hub Madhapur.',
        completed: true,
        x: 280,
        y: 298,
      },
      {
        id: 'wp-2',
        label: 'Local Rider Assigned',
        city: 'Madhapur Hub',
        timestamp: '17 Nov, 09:45 AM',
        detail: 'Same-day Hyderabad express rider en route toward Jubilee Hills.',
        completed: true,
        current: true,
        x: 290,
        y: 290,
      },
      {
        id: 'wp-3',
        label: 'Delivered',
        city: 'Jubilee Hills - 500033',
        timestamp: 'Expected Today',
        detail: 'Handover at Jubilee Hills Road No. 36 destination.',
        completed: false,
        x: 298,
        y: 282,
      },
    ],
  },
  {
    orderId: 'JH-905118',
    status: 'Delivered',
    placedAt: '10 Nov 2026',
    estimatedDelivery: 'Delivered on 13 Nov 2026',
    carrier: 'Delhivery Air',
    awb: 'DLV-550192837',
    deliveryMode: 'home',
    destinationAddress: '12th Main Road, Indiranagar, Bengaluru - 560038',
    destinationCity: 'Bengaluru',
    progressPct: 100,
    items: [
      {
        brand: 'ADIDAS',
        title: 'Men Stride Foamcell Cushioned Running Sneakers',
        size: 'UK 8',
        qty: 1,
        price: 2299,
      },
    ],
    total: 2299,
    waypoints: [
      {
        id: 'wp-1',
        label: 'Dispatched',
        city: 'Hyderabad FC',
        timestamp: '10 Nov, 07:00 PM',
        detail: 'Left Jhonty Hub Central Dispatch, Madhapur.',
        completed: true,
        x: 286,
        y: 294,
      },
      {
        id: 'wp-2',
        label: 'Arrived Bengaluru Hub',
        city: 'Bengaluru DC',
        timestamp: '12 Nov, 08:40 AM',
        detail: 'Scanned at East Bengaluru Delivery Station.',
        completed: true,
        x: 274,
        y: 342,
      },
      {
        id: 'wp-3',
        label: 'Delivered',
        city: 'Bengaluru - 560038',
        timestamp: '13 Nov, 02:18 PM',
        detail: 'Delivered and signed at Indiranagar destination.',
        completed: true,
        current: true,
        x: 270,
        y: 348,
      },
    ],
  },
];

export function buildTrackingFromReceipt(receipt: OrderReceipt): OrderTrackingRecord {
  const destCity = receipt.store?.city || receipt.address.city || 'Hyderabad';
  const destCoords = resolveCityCoords(destCity);
  const originCoords = CITY_COORDS.Hyderabad;

  const isPickup = receipt.deliveryMode === 'pickup';
  const midX = Math.round((originCoords.x + destCoords.x) / 2);
  const midY = Math.round((originCoords.y + destCoords.y) / 2);

  const waypoints: TrackingPoint[] = isPickup
    ? [
        {
          id: 'wp-1',
          label: 'Order Confirmed',
          city: 'Jhonty Hub Online',
          timestamp: receipt.placedAt,
          detail: 'Order received and assigned to Madhapur / Kukatpally store inventory.',
          completed: true,
          x: destCoords.x - 14,
          y: destCoords.y + 10,
        },
        {
          id: 'wp-2',
          label: 'Preparing at Store',
          city: receipt.store?.name || destCity,
          timestamp: 'In Progress',
          detail: 'Store associates are packing your order for Click & Collect.',
          completed: true,
          current: true,
          x: destCoords.x,
          y: destCoords.y,
        },
        {
          id: 'wp-3',
          label: 'Ready for Pickup',
          city: receipt.store?.city || destCity,
          timestamp: 'Within 2 Hours',
          detail: 'Show your Order ID at the Jhonty Hub pickup counter.',
          completed: false,
          x: destCoords.x + 10,
          y: destCoords.y - 8,
        },
      ]
    : [
        {
          id: 'wp-1',
          label: 'Order Placed & Verified',
          city: 'Madhapur, Hyderabad',
          timestamp: receipt.placedAt,
          detail: 'Order confirmed and queued for dispatch at Jhonty Hub Flagship.',
          completed: true,
          current: true,
          x: originCoords.x,
          y: originCoords.y,
        },
        {
          id: 'wp-2',
          label: 'Regional Linehaul Transit',
          city: 'Transit Hub',
          timestamp: 'Upcoming',
          detail: `Scheduled express transit toward ${destCity}.`,
          completed: false,
          x: midX,
          y: midY,
        },
        {
          id: 'wp-3',
          label: 'Estimated Delivery',
          city: destCity,
          timestamp: 'Within 2–3 Days',
          detail: `Final delivery to ${receipt.address.addressLine}, ${destCity} - ${receipt.address.pincode}.`,
          completed: false,
          x: destCoords.x,
          y: destCoords.y,
        },
      ];

  return {
    orderId: receipt.orderId,
    status: isPickup ? 'Ready for Store Pickup' : 'Order Placed',
    placedAt: receipt.placedAt,
    estimatedDelivery: isPickup ? 'Ready within 2 Hours' : 'Within 2–3 Business Days',
    carrier: isPickup ? 'Jhonty Hub Click & Collect' : 'BlueDart Express',
    awb: `JH-${receipt.orderId.replace('JH-', '')}HYD`,
    deliveryMode: receipt.deliveryMode,
    destinationAddress: isPickup
      ? `${receipt.store?.name || ''}, ${receipt.store?.address || ''}`
      : `${receipt.address.addressLine}, ${destCity} - ${receipt.address.pincode}`,
    destinationCity: destCity,
    progressPct: isPickup ? 55 : 25,
    waypoints,
    items: receipt.items.map((i) => ({
      brand: i.brand,
      title: i.title,
      size: i.size,
      qty: i.qty,
      price: i.price,
    })),
    total: receipt.total,
  };
}

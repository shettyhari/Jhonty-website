export type Category =
  | 'All'
  | 'Shirts & Polos'
  | 'Denim & Chinos'
  | 'Outerwear'
  | 'Footwear'
  | 'Accessories';

export type Occasion = 'Workwear' | 'Festive' | 'Casual' | 'Active';
export type ViewMode = 'home' | 'pdp' | 'stores' | 'checkout' | 'tracking' | 'admin';
export type DeliveryMode = 'home' | 'pickup';
export type PaymentMode = 'upi' | 'card' | 'netbanking' | 'cod';

export type StaffRole = 'admin' | 'team';

export type StaffPermission =
  | 'manage_inventory'
  | 'manage_catalog'
  | 'manage_orders'
  | 'manage_stores'
  | 'manage_users';

export type StoreScope =
  | 'All Stores'
  | 'Hitech City Metro'
  | 'Venkata Ramana Colony'
  | 'Kukatpally Hub';

export interface StaffUser {
  id: string;
  fullName: string;
  username: string;
  password: string;
  role: StaffRole;
  assignedStore: StoreScope;
  permissions: StaffPermission[];
  active: boolean;
  createdAt: string;
  createdBy?: string;
}

export type PublicStaffUser = Omit<StaffUser, 'password'>;

export interface AdminSession {
  user: PublicStaffUser;
  token: string;
}

export interface Product {
  id: number;
  sku: string;
  brand: string;
  title: string;
  category: Exclude<Category, 'All'>;
  occasion: Occasion;
  price: number;
  mrp: number;
  rating: string;
  reviews: number;
  sizes: string[];
  stock: number;
  sizeStock: Record<string, number>;
  reorderLevel: number;
  storeLocation: string;
  updatedAt: string;
  colors: { name: string; hex: string }[];
  fabric: string;
  fit: string;
  care: string;
  origin: string;
  description: string;
  gallery: string[];
}

export interface BagItem {
  id: number;
  brand: string;
  title: string;
  price: number;
  mrp: number;
  image: string;
  size: string;
  colorName: string;
  qty: number;
}

export interface StoreLocation {
  id: string;
  city: string;
  name: string;
  address: string;
  pincode: string;
  phone: string;
  hours: string;
  clickCollect: boolean;
  services: string[];
  coordinates: { lat: string; lng: string };
}

export interface ShippingAddress {
  name: string;
  phone: string;
  pincode: string;
  addressLine: string;
  city: string;
  state: string;
}

export interface OrderReceipt {
  orderId: string;
  placedAt: string;
  deliveryMode: DeliveryMode;
  paymentMode: PaymentMode;
  store?: StoreLocation;
  address: ShippingAddress;
  items: BagItem[];
  subtotal: number;
  discount: number;
  total: number;
}

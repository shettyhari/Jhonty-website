import { Occasion, Product, StoreLocation } from '../types';

export const HERO_SLIDES = [
  {
    id: 'madhapur-flagship',
    kicker: 'Madhapur · Hitech City Metro',
    title: 'Branded Menswear Without the Markup',
    subtitle:
      "Curated overshirts, tailored formals, tapered denim, and everyday sneakers from Jhonty Hub's Hyderabad flagship collection.",
    ctaLabel: 'Shop New Drops',
    image: '/src/assets/images/jhonty_hub_hero_1794941649302.jpg',
    action: { type: 'category' as const, value: 'All' },
  },
  {
    id: 'street-layering',
    kicker: 'Weekend & Workwear Edit',
    title: 'Built for Comfort, Priced for Value',
    subtitle:
      'Explore brushed cotton overshirts, structured bomber jackets, and Giza cotton shirts with same-day Hyderabad pickup.',
    ctaLabel: 'Explore Outerwear',
    image: '/src/assets/images/jhonty_mens_overshirt_1794941649529.jpg',
    action: { type: 'occasion' as const, value: 'Casual' as Occasion },
  },
];

export const TOP_CATEGORIES: {
  label: string;
  category: Product['category'];
  image: string;
}[] = [
  {
    label: 'Checked Overshirts',
    category: 'Shirts & Polos',
    image: '/src/assets/images/jhonty_mens_overshirt_1794941649529.jpg',
  },
  {
    label: 'Formal Shirts',
    category: 'Shirts & Polos',
    image: '/src/assets/images/prod_formal_shirt_1794940942746.jpg',
  },
  {
    label: 'Polos & Tees',
    category: 'Shirts & Polos',
    image: '/src/assets/images/prod_mens_polo_1794940943524.jpg',
  },
  {
    label: 'Denim & Chinos',
    category: 'Denim & Chinos',
    image: '/src/assets/images/jhonty_mens_denim_1794941650819.jpg',
  },
  {
    label: 'Bomber Jackets',
    category: 'Outerwear',
    image: '/src/assets/images/jhonty_mens_jacket_1794941649320.jpg',
  },
  {
    label: 'Sneakers & Carry',
    category: 'Footwear',
    image: '/src/assets/images/prod_running_sneakers_1794940944846.jpg',
  },
];

export const FEATURED_BRANDS = [
  { name: 'JHONTY ORIGINALS', offer: 'From ₹499' },
  { name: 'U.S. POLO ASSN.', offer: 'Up to 50% Off' },
  { name: "LEVI'S", offer: 'Denim Deals' },
  { name: 'JACK & JONES', offer: 'Flat 45% Off' },
  { name: 'RARE RABBIT', offer: 'New Arrivals' },
  { name: 'TOMMY HILFIGER', offer: 'Value Drop' },
  { name: 'ADIDAS', offer: 'Flat 40% Off' },
  { name: 'CALVIN KLEIN', offer: 'Showroom Edit' },
];

export const PRODUCTS: Product[] = [
  {
    id: 1,
    brand: 'JHONTY ORIGINALS',
    title: 'Men Olive & Charcoal Brushed Cotton Plaid Overshirt',
    category: 'Shirts & Polos',
    occasion: 'Casual',
    price: 1199,
    mrp: 2499,
    rating: '4.8',
    reviews: 342,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Olive Charcoal', hex: '#4d5d42' },
      { name: 'Rust Slate', hex: '#7c2d12' },
      { name: 'Midnight Check', hex: '#1e293b' },
    ],
    fabric: '100% Heavyweight Brushed Cotton',
    fit: 'Relaxed Layering Fit',
    care: 'Machine Wash Cold',
    origin: 'Made in India',
    description:
      "Jhonty Hub's signature Madhapur bestseller—a heavyweight brushed twill overshirt with dual chest utility pockets, ideal over crisp crew tees.",
    gallery: [
      '/src/assets/images/jhonty_mens_overshirt_1794941649529.jpg',
      '/src/assets/images/jhonty_hub_hero_1794941649302.jpg',
    ],
  },
  {
    id: 2,
    brand: 'JACK & JONES',
    title: 'Men Matte Black Structured Utility Bomber Jacket',
    category: 'Outerwear',
    occasion: 'Active',
    price: 1899,
    mrp: 3799,
    rating: '4.7',
    reviews: 215,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Matte Black', hex: '#18181b' },
      { name: 'Olive Drab', hex: '#3f4a3c' },
    ],
    fabric: 'Water-Resistant Poly-Cotton Twill',
    fit: 'Tailored Regular Fit',
    care: 'Gentle Machine Wash',
    origin: 'Made in India',
    description:
      'Clean-lined urban bomber jacket with ribbed collar, metallic zip closure, and breathable mesh lining built for evening rides and travel.',
    gallery: ['/src/assets/images/jhonty_mens_jacket_1794941649320.jpg'],
  },
  {
    id: 3,
    brand: 'RARE RABBIT',
    title: 'Men Ivory Linen Mandarin Shirt & Tapered Denim Pairing',
    category: 'Denim & Chinos',
    occasion: 'Casual',
    price: 1349,
    mrp: 2699,
    rating: '4.6',
    reviews: 189,
    sizes: ['30', '32', '34', '36'],
    colors: [
      { name: 'Mid-Wash Indigo', hex: '#1d4ed8' },
      { name: 'Dark Rinse', hex: '#172554' },
    ],
    fabric: '98% Cotton, 2% Lycra Stretch Denim',
    fit: 'Slim Tapered Fit',
    care: 'Wash Inside Out',
    origin: 'Made in India',
    description:
      'Breathable mid-wash stretch denim engineered for all-day comfort in Hyderabad weather, paired cleanly with crisp mandarin linen.',
    gallery: ['/src/assets/images/jhonty_mens_denim_1794941650819.jpg'],
  },
  {
    id: 4,
    brand: 'U.S. POLO ASSN.',
    title: 'Men Tailored Slim Fit Two-Ply Giza Cotton Formal Shirt',
    category: 'Shirts & Polos',
    occasion: 'Workwear',
    price: 1099,
    mrp: 2199,
    rating: '4.6',
    reviews: 310,
    sizes: ['38', '40', '42', '44'],
    colors: [
      { name: 'Powder Sky', hex: '#93c5fd' },
      { name: 'Crisp White', hex: '#f8fafc' },
      { name: 'Midnight Navy', hex: '#1e3a8a' },
    ],
    fabric: '100% Two-Ply Giza Cotton',
    fit: 'Tailored Slim Fit',
    care: 'Machine Wash Warm',
    origin: 'Made in India',
    description:
      'Wrinkle-resistant formal shirt tailored for Hitech City workdays with a structured spread collar and two-button mitered cuffs.',
    gallery: ['/src/assets/images/prod_formal_shirt_1794940942746.jpg'],
  },
  {
    id: 5,
    brand: 'TOMMY HILFIGER',
    title: 'Men Solid Combed Cotton Pique Regular Fit Polo',
    category: 'Shirts & Polos',
    occasion: 'Casual',
    price: 949,
    mrp: 1899,
    rating: '4.7',
    reviews: 425,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Classic Navy', hex: '#1e293b' },
      { name: 'Crimson Red', hex: '#b91c1c' },
      { name: 'Forest Pine', hex: '#14532d' },
    ],
    fabric: '100% Combed Cotton Pique',
    fit: 'Regular Fit',
    care: 'Machine Wash Cold',
    origin: 'Made in India',
    description:
      'Signature honeycomb pique polo with ribbed collar structure, twin-button placket, and breathable side-slit hem.',
    gallery: ['/src/assets/images/prod_mens_polo_1794940943524.jpg'],
  },
  {
    id: 6,
    brand: "LEVI'S",
    title: 'Men Olive Field Overshirt & Raw Selvedge Denim Edit',
    category: 'Outerwear',
    occasion: 'Workwear',
    price: 1499,
    mrp: 2999,
    rating: '4.8',
    reviews: 274,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Army Olive', hex: '#3f6212' },
      { name: 'Charcoal Stone', hex: '#3f3f46' },
    ],
    fabric: '100% Cotton Ripstop Twill',
    fit: 'Structured Standard Fit',
    care: 'Machine Wash Cold',
    origin: 'Made in India',
    description:
      'Showroom-favorite olive shacket cut in durable ripstop cotton with matte snap buttons and reinforced chest pockets.',
    gallery: ['/src/assets/images/jhonty_hub_hero_1794941649302.jpg'],
  },
  {
    id: 7,
    brand: 'ADIDAS',
    title: 'Men Stride Foamcell Cushioned Running Sneakers',
    category: 'Footwear',
    occasion: 'Active',
    price: 2299,
    mrp: 3999,
    rating: '4.7',
    reviews: 512,
    sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'],
    colors: [
      { name: 'Crimson / Black', hex: '#991b1b' },
      { name: 'Obsidian Black', hex: '#18181b' },
    ],
    fabric: 'Engineered Knit Mesh & EVA Outsole',
    fit: 'True to UK Size',
    care: 'Wipe with Clean Dry Cloth',
    origin: 'Made in India',
    description:
      'Responsive dual-density Foamcell midsole paired with breathable knit upper and high-traction rubber grip for daily runs.',
    gallery: ['/src/assets/images/prod_running_sneakers_1794940944846.jpg'],
  },
  {
    id: 8,
    brand: 'CALVIN KLEIN',
    title: 'Structured Cognac Vegan Leather Executive Work Tote',
    category: 'Accessories',
    occasion: 'Workwear',
    price: 1299,
    mrp: 2499,
    rating: '4.5',
    reviews: 133,
    sizes: ['One Size'],
    colors: [
      { name: 'Warm Cognac', hex: '#9a5b25' },
      { name: 'Espresso Black', hex: '#1c1917' },
    ],
    fabric: 'Pebbled Vegan Leather',
    fit: 'Fits up to 14" Laptop',
    care: 'Wipe with Damp Cloth',
    origin: 'Made in India',
    description:
      'Architectural commute carryall featuring brushed brass buckle straps, detachable shoulder strap, and padded laptop sleeve.',
    gallery: ['/src/assets/images/prod_vegan_tote_1794940946088.jpg'],
  },
];

export const STORES_DATA: StoreLocation[] = [
  {
    id: 'HYD-HTC',
    city: 'Madhapur',
    name: 'Jhonty Hub — Hitech City Metro Station (Flagship)',
    address:
      '1st Floor, Lower Concourse Level, Hitech City Metro Station, Silicon Valley, Madhapur, Hyderabad',
    pincode: '500081',
    phone: 'Walk-in Store · Open Daily',
    hours: '10:00 AM – 10:00 PM',
    clickCollect: true,
    services: ['Click & Collect', 'Branded Value Racks', 'Instant Size Exchange'],
    coordinates: { lat: '17.4485° N', lng: '78.3808° E' },
  },
  {
    id: 'HYD-VRC',
    city: 'Madhapur',
    name: 'Jhonty Hub — Venkata Ramana Colony, Madhapur',
    address:
      'Venkata Ramana Colony Main Rd, Near Mindspace Junction, Madhapur, Hyderabad',
    pincode: '500081',
    phone: 'Walk-in Store · Open Daily',
    hours: '10:00 AM – 10:00 PM',
    clickCollect: true,
    services: ['Click & Collect', 'Menswear Denim Studio', 'Express Exchange'],
    coordinates: { lat: '17.4436° N', lng: '78.3887° E' },
  },
  {
    id: 'HYD-KPHB',
    city: 'Kukatpally',
    name: 'Jhonty Hub — Kukatpally Hub',
    address: 'KPHB Main Road, Near Metro Pillar A-742, Kukatpally, Hyderabad',
    pincode: '500072',
    phone: 'Walk-in Store · Open Daily',
    hours: '10:00 AM – 10:00 PM',
    clickCollect: true,
    services: ['Click & Collect', 'Casual & Formal Edits', 'Instant Exchange'],
    coordinates: { lat: '17.4849° N', lng: '78.4138° E' },
  },
];

export const INDIAN_STATES = [
  'Telangana',
  'Andhra Pradesh',
  'Karnataka',
  'Maharashtra',
  'Delhi',
  'Tamil Nadu',
  'Gujarat',
  'West Bengal',
  'Kerala',
  'Rajasthan',
];

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

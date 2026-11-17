import { StaffPermission, StaffRole, StaffUser, StoreScope } from '../types';

export const STORE_SCOPES: StoreScope[] = [
  'All Stores',
  'Hitech City Metro',
  'Venkata Ramana Colony',
  'Kukatpally Hub',
];

export const PERMISSION_DEFINITIONS: {
  key: StaffPermission;
  label: string;
  description: string;
}[] = [
  {
    key: 'manage_inventory',
    label: 'Inventory & Stock Control',
    description: 'Adjust per-size stock counts, +5 quick restock, and refresh low stock.',
  },
  {
    key: 'manage_catalog',
    label: 'Catalog & Pricing',
    description: 'Create new products, edit titles/MRP/selling prices, and delete SKUs.',
  },
  {
    key: 'manage_orders',
    label: 'Orders & Fulfillment',
    description: 'View customer orders and update dispatch & Click & Collect status.',
  },
  {
    key: 'manage_stores',
    label: 'Hyderabad Store Overview',
    description: 'Inspect store-level stock summaries, unit counts, and alert badges.',
  },
  {
    key: 'manage_users',
    label: 'Team & User Credentials',
    description: 'Create store-wise Admin/Team accounts and manage role permissions.',
  },
];

export const DEFAULT_ROLE_PERMISSIONS: Record<StaffRole, StaffPermission[]> = {
  admin: [
    'manage_inventory',
    'manage_catalog',
    'manage_orders',
    'manage_stores',
    'manage_users',
  ],
  team: ['manage_inventory', 'manage_orders', 'manage_stores'],
};

export const INITIAL_STAFF_USERS: StaffUser[] = [
  {
    id: 'USR-ADMIN-01',
    fullName: 'Jhonty Master Admin',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    assignedStore: 'All Stores',
    permissions: [
      'manage_inventory',
      'manage_catalog',
      'manage_orders',
      'manage_stores',
      'manage_users',
    ],
    active: true,
    createdAt: '2026-01-10T09:00:00.000Z',
    createdBy: 'System',
  },
  {
    id: 'USR-TEAM-01',
    fullName: 'Madhapur Store Lead',
    username: 'madhapur_team',
    password: 'team123',
    role: 'team',
    assignedStore: 'Hitech City Metro',
    permissions: ['manage_inventory', 'manage_orders', 'manage_stores'],
    active: true,
    createdAt: '2026-02-14T10:30:00.000Z',
    createdBy: 'admin',
  },
];

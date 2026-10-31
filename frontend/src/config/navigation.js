import {
  LayoutDashboard,
  Users,
  FolderKanban,
  ClipboardCheck,
  Satellite,
  SlidersHorizontal,
  TrendingUp,
  FileText,
  Boxes,
  QrCode,
  Truck,
  HardHat,
  Wrench,
  ShieldCheck,
  Headphones,
  Wallet,
  Landmark,
  BarChart3,
  UserCog,
  Settings,
} from 'lucide-react';

// NavKey type removed (TypeScript only)
// NavItem interface removed (TypeScript only)

export const NAV_ITEMS = [
  { key: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, group: 'Operations' },
  { key: 'customers', label: 'Customer Management', icon: Users, group: 'Operations' },
  { key: 'projects', label: 'Project Management', icon: FolderKanban, group: 'Operations' },
  { key: 'surveys', label: 'Roof Survey Management', icon: ClipboardCheck, group: 'Operations' },
  { key: 'roof-intelligence', label: 'Roof Intelligence', icon: Satellite, group: 'Intelligence Suite' },
  { key: 'solar-configuration', label: 'Solar Configuration Intelligence', icon: SlidersHorizontal, group: 'Intelligence Suite' },
  { key: 'predictive-intelligence', label: 'Predictive Intelligence', icon: TrendingUp, group: 'Intelligence Suite' },
  { key: 'quotations', label: 'Quotations & BOM', icon: FileText, group: 'Operations' },
  { key: 'inventory', label: 'Inventory Management', icon: Boxes, group: 'Management' },
  { key: 'qr-intelligence', label: 'QR Intelligence', icon: QrCode, group: 'Intelligence Suite' },
  { key: 'dispatch', label: 'Dispatch Management', icon: Truck, group: 'Management' },
  { key: 'technicians', label: 'Technician Management', icon: HardHat, group: 'Management' },
  { key: 'installations', label: 'Installation Management', icon: Wrench, group: 'Management' },
  { key: 'warranty', label: 'Warranty Management', icon: ShieldCheck, group: 'Management' },
  { key: 'service', label: 'Service & Complaints', icon: Headphones, group: 'Management' },
  { key: 'finance', label: 'Payments & Finance', icon: Wallet, group: 'Management' },
  { key: 'subsidy', label: 'Subsidy Management', icon: Landmark, group: 'Management' },
  { key: 'analytics', label: 'Analytics & Reports', icon: BarChart3, group: 'Management' },
  { key: 'users', label: 'User & Role Management', icon: UserCog, group: 'Management' },
  { key: 'settings', label: 'Settings', icon: Settings, group: 'Management' },
];

export const NAV_GROUPS = [
  'Operations',
  'Intelligence Suite',
  'Management',
];


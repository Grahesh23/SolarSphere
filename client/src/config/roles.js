import {
  LayoutDashboard, Users, FolderKanban, ClipboardCheck, FileText, Boxes, QrCode, Truck,
  HardHat, Wrench, ShieldCheck, Headphones, Wallet, Landmark, BarChart3, UserCog, Settings,
  Satellite, SlidersHorizontal, TrendingUp, Sun, UserPlus, Calendar, Phone, Bell,
  Image, MapPin, CheckCircle2, ScanLine, PackageCheck, ClipboardList, History, AlertTriangle,
  Search, Settings2, FileCog, Receipt, IndianRupee, CreditCard, BookOpen, FileBarChart,
  Home, PanelTop, ClipboardCheck as SurveyIcon, Lightbulb, Mail, User,
} from 'lucide-react';

// LucideIcon import type removed
// PageKey type removed (TypeScript only)
// RoleNavItem interface removed (TypeScript only)
// RoleNavConfig interface removed (TypeScript only)

const adminItems = [
  { key: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, group: 'Operations' },
  { key: 'customers', label: 'Customer Management', icon: Users, group: 'Operations' },
  { key: 'projects', label: 'Project Management', icon: FolderKanban, group: 'Operations' },
  { key: 'surveys', label: 'Roof Survey Management', icon: ClipboardCheck, group: 'Operations' },
  { key: 'quotations', label: 'Quotations & BOM', icon: FileText, group: 'Operations' },
  { key: 'predictive-intelligence', label: 'Predictive Analytics', icon: TrendingUp, group: 'Intelligence Suite' },
  { key: 'risk-intelligence', label: 'Project Risk Overview', icon: AlertTriangle, group: 'Intelligence Suite' },
  { key: 'analytics', label: 'Intelligence & Business Insights', icon: BarChart3, group: 'Intelligence Suite' },
  { key: 'inventory', label: 'Inventory Management', icon: Boxes, group: 'Management' },
  { key: 'qr-intelligence', label: 'QR Intelligence', icon: QrCode, group: 'Management' },
  { key: 'dispatch', label: 'Dispatch Management', icon: Truck, group: 'Management' },
  { key: 'technicians', label: 'Technician Management', icon: HardHat, group: 'Management' },
  { key: 'installations', label: 'Installation Management', icon: Wrench, group: 'Management' },
  { key: 'warranty', label: 'Warranty Management', icon: ShieldCheck, group: 'Management' },
  { key: 'service', label: 'Service & Complaints', icon: Headphones, group: 'Management' },
  { key: 'finance', label: 'Payments & Finance', icon: Wallet, group: 'Management' },
  { key: 'subsidy', label: 'Subsidy Management', icon: Landmark, group: 'Management' },
  { key: 'users', label: 'User & Role Management', icon: UserCog, group: 'Management' },
  { key: 'settings', label: 'System Settings', icon: Settings, group: 'Management' },
];

const salesItems = [
  { key: 'dashboard', label: 'Sales Dashboard', icon: LayoutDashboard, group: 'Sales' },
  { key: 'enquiries', label: 'Customer Enquiries', icon: UserPlus, group: 'Sales' },
  { key: 'leads', label: 'Lead Management', icon: Users, group: 'Sales' },
  { key: 'directory', label: 'Customer Directory', icon: BookOpen, group: 'Sales' },
  { key: 'followups', label: 'Follow-ups & Meetings', icon: Phone, group: 'Sales' },
  { key: 'survey-requests', label: 'Roof Survey Requests', icon: ClipboardCheck, group: 'Sales' },
  { key: 'solar-configuration', label: 'Solar Recommendations', icon: SlidersHorizontal, group: 'Sales' },
  { key: 'quotations', label: 'Quotations', icon: FileText, group: 'Sales' },
  { key: 'my-projects', label: 'My Projects', icon: FolderKanban, group: 'Sales' },
  { key: 'notifications', label: 'Notifications', icon: Bell, group: 'Sales' },
];

const surveyorItems = [
  { key: 'dashboard', label: 'Survey Dashboard', icon: LayoutDashboard, group: 'Surveys' },
  { key: 'assigned', label: 'Assigned Surveys', icon: ClipboardList, group: 'Surveys' },
  { key: 'calendar', label: 'Survey Calendar', icon: Calendar, group: 'Surveys' },
  { key: 'measurements', label: 'Roof Measurements', icon: MapPin, group: 'Surveys' },
  { key: 'solar-configuration', label: 'Roof Configuration Intelligence', icon: SlidersHorizontal, group: 'Surveys' },
  { key: 'reports', label: 'Survey Reports', icon: FileText, group: 'Surveys' },
  { key: 'completed', label: 'Completed Surveys', icon: CheckCircle2, group: 'Surveys' },
];

const warehouseItems = [
  { key: 'dashboard', label: 'Warehouse Dashboard', icon: LayoutDashboard, group: 'Warehouse' },
  { key: 'catalogue', label: 'Product Catalogue', icon: Boxes, group: 'Warehouse' },
  { key: 'inventory', label: 'Inventory Overview', icon: PackageCheck, group: 'Warehouse' },
  { key: 'qr-intelligence', label: 'Serial Number Registry', icon: QrCode, group: 'Warehouse' },
  { key: 'scan', label: 'QR Scanner', icon: ScanLine, group: 'Warehouse' },
  { key: 'dispatch', label: 'Dispatch Orders', icon: Truck, group: 'Warehouse' },
  { key: 'suppliers', label: 'Suppliers', icon: UserCog, group: 'Warehouse' },
  { key: 'alerts', label: 'Low Stock Alerts', icon: AlertTriangle, group: 'Warehouse' },
];

const technicianItems = [
  { key: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard, group: 'Jobs' },
  { key: 'assigned', label: 'Assigned Jobs', icon: ClipboardList, group: 'Jobs' },
  { key: 'calendar', label: 'Installation Calendar', icon: Calendar, group: 'Jobs' },
  { key: 'job-details', label: 'Job Details', icon: FileText, group: 'Jobs' },
  { key: 'verify', label: 'Equipment Verification', icon: PackageCheck, group: 'Jobs' },
  { key: 'scan', label: 'QR Scanner', icon: ScanLine, group: 'Jobs' },
  { key: 'checklist', label: 'Installation Checklist', icon: ClipboardCheck, group: 'Jobs' },
  { key: 'photos', label: 'Photo Documentation', icon: Image, group: 'Jobs' },
  { key: 'commissioning', label: 'Testing & Commissioning', icon: CheckCircle2, group: 'Jobs' },
  { key: 'completion', label: 'Completion Reports', icon: FileText, group: 'Jobs' },
  { key: 'roof-intelligence', label: 'Roof Intelligence', icon: Satellite, group: 'Jobs' },
];

const serviceItems = [
  { key: 'dashboard', label: 'Service Dashboard', icon: LayoutDashboard, group: 'Service' },
  { key: 'complaints', label: 'Customer Complaints', icon: Headphones, group: 'Service' },
  { key: 'scan', label: 'QR Equipment Scanner', icon: ScanLine, group: 'Service' },
  { key: 'serial-search', label: 'Serial Number Search', icon: Search, group: 'Service' },
  { key: 'warranty', label: 'Warranty Verification', icon: ShieldCheck, group: 'Service' },
  { key: 'tickets', label: 'Service Tickets', icon: FileText, group: 'Service' },
  { key: 'repair', label: 'Repair & Replacement', icon: Wrench, group: 'Service' },
  { key: 'troubleshoot', label: 'Troubleshooting Assistant', icon: Lightbulb, group: 'Service' },
  { key: 'history', label: 'Service History', icon: History, group: 'Service' },
];

const financeItems = [
  { key: 'dashboard', label: 'Finance Dashboard', icon: LayoutDashboard, group: 'Finance' },
  { key: 'customer-payments', label: 'Customer Payments', icon: CreditCard, group: 'Finance' },
  { key: 'outstanding', label: 'Outstanding Balances', icon: IndianRupee, group: 'Finance' },
  { key: 'supplier-payments', label: 'Supplier Payments', icon: Wallet, group: 'Finance' },
  { key: 'technician-payments', label: 'Technician Payments', icon: HardHat, group: 'Finance' },
  { key: 'expenses', label: 'Project Expenses', icon: Receipt, group: 'Finance' },
  { key: 'invoices', label: 'Customer Invoices', icon: FileText, group: 'Finance' },
  { key: 'subsidy', label: 'Subsidy Tracking', icon: Landmark, group: 'Finance' },
  { key: 'profit-loss', label: 'Profit & Loss', icon: BarChart3, group: 'Finance' },
  { key: 'reports', label: 'Financial Reports', icon: FileBarChart, group: 'Finance' },
];

const customerItems = [
  { key: 'dashboard', label: 'My Dashboard', icon: Home, group: 'My Solar Journey' },
  { key: 'project', label: 'My Solar Project', icon: PanelTop, group: 'My Solar Journey' },
  { key: 'survey', label: 'Survey Schedule', icon: SurveyIcon, group: 'My Solar Journey' },
  { key: 'recommendation', label: 'Solar Recommendation', icon: Lightbulb, group: 'My Solar Journey' },
  { key: 'quotation', label: 'My Quotation', icon: FileText, group: 'My Solar Journey' },
  { key: 'payments', label: 'Payments & Invoices', icon: IndianRupee, group: 'My Solar Journey' },
  { key: 'installation', label: 'Installation Tracking', icon: Wrench, group: 'My Solar Journey' },
  { key: 'equipment', label: 'My Equipment', icon: Boxes, group: 'My Solar Journey' },
  { key: 'warranty', label: 'Warranty Details', icon: ShieldCheck, group: 'My Solar Journey' },
  { key: 'service', label: 'Service Requests', icon: Headphones, group: 'My Solar Journey' },
  { key: 'notifications', label: 'Notifications', icon: Bell, group: 'My Solar Journey' },
  { key: 'profile', label: 'My Profile', icon: User, group: 'My Solar Journey' },
];

export const ROLE_CONFIGS = {
  Admin: { role: 'Admin', title: 'Administrator', subtitle: 'Solar Operations', accent: 'navy', items: adminItems, groups: ['Operations', 'Intelligence Suite', 'Management'] },
  Sales: { role: 'Sales', title: 'Sales Executive', subtitle: 'Lead & Quotation', accent: 'emerald', items: salesItems, groups: ['Sales'] },
  Surveyor: { role: 'Surveyor', title: 'Survey Technician', subtitle: 'Field Operations', accent: 'grape', items: surveyorItems, groups: ['Surveys'] },
  SURVEY_TECHNICIAN: { role: 'SURVEY_TECHNICIAN', title: 'Survey Technician', subtitle: 'Field Operations', accent: 'grape', items: surveyorItems, groups: ['Surveys'] },
  Warehouse: { role: 'Warehouse', title: 'Warehouse Manager', subtitle: 'Stock & Dispatch', accent: 'amber', items: warehouseItems, groups: ['Warehouse'] },
  Service: { role: 'Service', title: 'Service & Support', subtitle: 'Warranty & Repairs', accent: 'rose', items: serviceItems, groups: ['Service'] },
  Finance: { role: 'Finance', title: 'Finance Manager', subtitle: 'Accounting & Reports', accent: 'navy', items: financeItems, groups: ['Finance'] },
  Technician: { role: 'Technician', title: 'Installation Technician', subtitle: 'Field Installation', accent: 'violet', items: technicianItems, groups: ['Jobs'] },
  INSTALLATION_TECHNICIAN: { role: 'INSTALLATION_TECHNICIAN', title: 'Installation Technician', subtitle: 'Field Installation', accent: 'violet', items: technicianItems, groups: ['Jobs'] },
  Customer: { role: 'Customer', title: 'Customer Portal', subtitle: 'My Solar Journey', accent: 'emerald', items: customerItems, groups: ['My Solar Journey'] },
  Client: { role: 'Client', title: 'Customer Portal', subtitle: 'My Solar Journey', accent: 'emerald', items: customerItems, groups: ['My Solar Journey'] },
};

import { useState, useMemo } from 'react';
import {
  Boxes, PackageCheck, QrCode, ScanLine, Truck, AlertTriangle, IndianRupee,
  ClipboardList, History, Plus, CheckCircle2, XCircle,
} from 'lucide-react';
import { useData } from '@/data/DataContext';
import { PortalLayout, PageContainer, PageHeader } from '@/components/layout/PortalLayout';
import { KpiCard } from '@/components/ui/KpiCard';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { StatusBadgeAuto, AlertBanner } from '@/components/ui/Status';
import { fmtINR, fmtNum, fmtDate, genId } from '@/lib/format';
import { InventoryManagement } from '@/pages/InventoryManagement';
import { DispatchManagement } from '@/pages/DispatchManagement';
import { QRIntelligence } from '@/pages/QRIntelligence';

export function WarehousePortal() {
  const [active, setActive] = useState('dashboard');
  return (
    <PortalLayout active={active} onNavigate={setActive}>
      <WarehousePage active={active} onNavigate={setActive} />
    </PortalLayout>
  );
}

function WarehousePage({ active, onNavigate }) {
  switch (active) {
    case 'dashboard': return <WarehouseDashboard onNavigate={onNavigate} />;
    case 'catalogue': return <InventoryManagement />;
    case 'inventory': return <InventoryOverview />;
    case 'qr-intelligence': return <QRIntelligence />;
    case 'scan': return <ScannerPage />;
    case 'dispatch': return <DispatchManagement />;
    case 'suppliers': return <SuppliersPage />;
    case 'alerts': return <AlertsPage />;
    default: return <WarehouseDashboard onNavigate={onNavigate} />;
  }
}

function WarehouseDashboard({ onNavigate }) {
  const { data } = useData();
  const totalValue = useMemo(() => data.inventory.reduce((s, i) => s + i.stock * i.unitPrice, 0), [data.inventory]);
  const lowStock = data.inventory.filter((i) => i.stock <= i.reorderLevel);
  const pendingDispatch = data.dispatches.filter((d) => d.status === 'Pending' || d.status === 'Packed');
  const unregistered = data.equipment.filter((e) => e.status === 'In Stock');
  const reserved = data.equipment.filter((e) => e.status === 'Reserved');

  return (
    <PageContainer>
      <PageHeader title="Warehouse Dashboard" description="Stock levels, dispatch status, and serial registration overview." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Product Categories" value={new Set(data.inventory.map((i) => i.category)).size} icon={Boxes} tone="navy" />
        <KpiCard label="Inventory Value" value={fmtINR(totalValue)} icon={IndianRupee} tone="emerald" onClick={() => onNavigate('inventory')} />
        <KpiCard label="Pending Dispatches" value={pendingDispatch.length} icon={Truck} tone="amber" onClick={() => onNavigate('dispatch')} />
        <KpiCard label="Low Stock Items" value={lowStock.length} icon={AlertTriangle} tone="rose" onClick={() => onNavigate('alerts')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="section-title mb-3">Low Stock Alerts</h3>
          <div className="space-y-2">
            {lowStock.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div><div className="font-medium text-navy-800">{item.name}</div><div className="text-xs text-slate-400">{item.brand} · {item.sku}</div></div>
                <span className="badge-rose">{item.stock} {item.unit}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="section-title mb-3">Pending Dispatches</h3>
          <div className="space-y-2">
            {pendingDispatch.map((d) => {
              const p = data.projects.find((p) => p.id === d.projectId);
              return <div key={d.id} className="flex items-center justify-between text-sm"><div className="font-medium text-navy-800">{d.code}</div><div className="text-xs text-slate-500">{p?.code}</div></div>;
            })}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function InventoryOverview() {
  const { data } = useData();
  const columns = [
    { key: 'sku', label: 'SKU', sortValue: (r) => r.sku, render: (r) => <span className="font-mono text-xs text-slate-500">{r.sku}</span> },
    { key: 'name', label: 'Product', sortValue: (r) => r.name, render: (r) => <div><div className="font-medium text-navy-800">{r.name}</div><div className="text-xs text-slate-400">{r.brand}</div></div> },
    { key: 'category', label: 'Category', render: (r) => r.category },
    { key: 'stock', label: 'Stock', sortValue: (r) => r.stock, render: (r) => `${r.stock} ${r.unit}` },
    { key: 'reorderLevel', label: 'Reorder', sortValue: (r) => r.reorderLevel, render: (r) => r.reorderLevel },
    { key: 'value', label: 'Value', sortValue: (r) => r.stock * r.unitPrice, render: (r) => fmtINR(r.stock * r.unitPrice) },
  ];
  return (
    <PageContainer>
      <PageHeader title="Inventory Overview" description="Full stock levels and valuations across all products." />
      <DataTable columns={columns} rows={data.inventory} searchKeys={['name', 'sku']} searchPlaceholder="Search inventory..." />
    </PageContainer>
  );
}

function ScannerPage() {
  const { data, setData } = useData();
  const [serial, setSerial] = useState('');
  const [found, setFound] = useState(null);
  const [error, setError] = useState('');

  const search = () => {
    setError(''); setFound(null);
    if (!serial.trim()) return;
    const eq = data.equipment.find((e) => e.serialNumber.toLowerCase() === serial.toLowerCase().trim());
    if (!eq) { setError('No equipment found with that serial number.'); return; }
    setFound(eq);
  };

  return (
    <PageContainer>
      <PageHeader title="QR Scanner" description="Scan or search equipment by serial number." />
      <div className="card p-6 max-w-2xl">
        <div className="flex gap-2">
          <input className="input flex-1" placeholder="Enter serial number..." value={serial} onChange={(e) => setSerial(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} />
          <button className="btn-primary" onClick={search}><ScanLine className="w-4 h-4" />Scan</button>
        </div>
        {error && <AlertBanner type="error" message={error} />}
        {found && (
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Serial Number</span><span className="font-mono text-navy-800">{found.serialNumber}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Status</span><StatusBadgeAuto status={found.status} /></div>
            <div className="flex justify-between"><span className="text-slate-500">Warranty</span><span>{found.warrantyStatus}</span></div>
            {found.projectId && <div className="flex justify-between"><span className="text-slate-500">Project</span><span>{data.projects.find((p) => p.id === found.projectId)?.code}</span></div>}
          </div>
        )}
        <p className="text-xs text-slate-400 mt-4">Camera scanning requires device access. Enter a serial like "WA-PAN-001" to test.</p>
      </div>
    </PageContainer>
  );
}

function SuppliersPage() {
  const { data } = useData();
  return (
    <PageContainer>
      <PageHeader title="Suppliers" description="Vendor directory and categories." />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.suppliers.map((s) => (
          <div key={s.id} className="card p-4">
            <div className="font-medium text-navy-800">{s.name}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.category}</div>
            <div className="text-xs text-slate-400 mt-2">{s.contact} · {s.phone}</div>
            <div className="text-xs text-slate-400">{s.email}</div>
            <div className="mt-2"><span className="badge-navy">★ {s.rating}</span></div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}

function AlertsPage() {
  const { data } = useData();
  const lowStock = data.inventory.filter((i) => i.stock <= i.reorderLevel);
  return (
    <PageContainer>
      <PageHeader title="Low Stock Alerts" description="Products at or below reorder level." />
      <div className="space-y-2">
        {lowStock.map((item) => (
          <div key={item.id} className="card p-4 flex items-center justify-between">
            <div><div className="font-medium text-navy-800">{item.name}</div><div className="text-xs text-slate-500">{item.brand} · {item.sku}</div></div>
            <div className="flex items-center gap-3">
              <div className="text-right"><div className="text-sm font-semibold text-rose-600">{item.stock} {item.unit}</div><div className="text-xs text-slate-400">Reorder at {item.reorderLevel}</div></div>
            </div>
          </div>
        ))}
        {lowStock.length === 0 && <p className="text-sm text-slate-400">All products are above reorder levels.</p>}
      </div>
    </PageContainer>
  );
}

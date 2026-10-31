import { useState, useMemo } from 'react';
import { Plus, AlertTriangle, Package, TrendingDown, TrendingUp, Boxes, Search } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useData } from '@/data/DataContext';
import { PageContainer } from '@/components/layout/MobileSidebar';
import { PageHeader } from '@/components/layout/Header';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadgeAuto, EmptyState } from '@/components/ui/Status';
import { Modal } from '@/components/ui/Modal';
import { fmtINR, fmtNum, fmtUnitsRecharts } from '@/lib/format';

const CATEGORIES = ['Panel', 'Inverter', 'Battery', 'Charge Controller', 'Mounting', 'Cable', 'Accessory'];

export function InventoryManagement() {
  const { data, setData } = useData();
  const [filterCat, setFilterCat] = useState('All');
  const [addOpen, setAddOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [adjustMode, setAdjustMode] = useState('in');
  const [adjustQty, setAdjustQty] = useState(1);

  const filtered = useMemo(
    () => filterCat === 'All' ? data.inventory : data.inventory.filter((i) => i.category === filterCat),
    [data.inventory, filterCat]
  );

  const totalStockValue = data.inventory.reduce((s, i) => s + i.stock * i.unitPrice, 0);
  const lowStock = data.inventory.filter((i) => i.stock <= i.reorderLevel);

  const categoryData = CATEGORIES.map((cat) => {
    const items = data.inventory.filter((i) => i.category === cat);
    return { category: cat, stock: items.reduce((s, i) => s + i.stock, 0), value: items.reduce((s, i) => s + i.stock * i.unitPrice, 0) };
  }).filter((d) => d.stock > 0);

  const columns = [
    { key: 'sku', label: 'SKU', sortValue: (r) => r.sku, render: (r) => <span className="font-mono text-xs text-slate-500">{r.sku}</span> },
    {
      key: 'name', label: 'Product', sortValue: (r) => r.name, render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-navy-50 text-navy-500 flex items-center justify-center shrink-0"><Package className="w-4 h-4" /></div>
          <div className="min-w-0"><div className="font-medium text-navy-800 truncate">{r.name}</div><div className="text-xs text-slate-400">{r.brand}</div></div>
        </div>
      ),
    },
    { key: 'category', label: 'Category', sortValue: (r) => r.category, render: (r) => <span className="badge-navy">{r.category}</span> },
    { key: 'stock', label: 'Stock', sortValue: (r) => r.stock, render: (r) => {
      const low = r.stock <= r.reorderLevel;
      return <div className="flex items-center gap-2"><span className={`font-medium ${low ? 'text-rose-600' : 'text-navy-800'}`}>{fmtNum(r.stock)} {r.unit}</span>{low && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}</div>;
    } },
    { key: 'reorderLevel', label: 'Reorder At', sortValue: (r) => r.reorderLevel, render: (r) => `${r.reorderLevel} ${r.unit}` },
    { key: 'unitPrice', label: 'Unit Price', sortValue: (r) => r.unitPrice, render: (r) => fmtINR(r.unitPrice) },
    { key: 'stockValue', label: 'Stock Value', sortValue: (r) => r.stock * r.unitPrice, render: (r) => <span className="font-medium">{fmtINR(r.stock * r.unitPrice)}</span> },
    {
      key: 'actions', label: 'Actions', render: (r) => (
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); setAdjustTarget(r); setAdjustMode('in'); setAdjustQty(1); }} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600" title="Stock In"><TrendingUp className="w-4 h-4" /></button>
          <button onClick={(e) => { e.stopPropagation(); setAdjustTarget(r); setAdjustMode('out'); setAdjustQty(1); }} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600" title="Stock Out"><TrendingDown className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  const adjustStock = () => {
    if (!adjustTarget) return;
    setData((p) => ({
      ...p,
      inventory: p.inventory.map((i) => i.id === adjustTarget.id ? {
        ...i,
        stock: adjustMode === 'in' ? i.stock + adjustQty : Math.max(0, i.stock - adjustQty),
      } : i),
    }));
    setAdjustTarget(null);
  };

  const [form, setForm] = useState({ sku: '', name: '', category: 'Panel', brand: '', unit: 'pcs', stock: 0, reorderLevel: 5, unitPrice: 0, supplierId: '' });

  const addItem = () => {
    if (!form.name || !form.sku) return;
    setData((p) => ({
      ...p,
      inventory: [...p.inventory, { id: `inv-${Date.now()}`, ...form, supplierId: form.supplierId || (data.suppliers[0]?.id ?? ''), specs: {} }],
    }));
    setAddOpen(false);
    setForm({ sku: '', name: '', category: 'Panel', brand: '', unit: 'pcs', stock: 0, reorderLevel: 5, unitPrice: 0, supplierId: '' });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Inventory Management"
        description="Track stock levels, manage stock-in/out, monitor reorder alerts, and maintain product catalogue."
        actions={<button className="btn-primary" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" />Add Product</button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="card p-4"><div className="text-xs text-slate-500">Total Products</div><div className="text-2xl font-display font-bold text-navy-800">{data.inventory.length}</div></div>
        <div className="card p-4"><div className="text-xs text-slate-500">Stock Value</div><div className="text-2xl font-display font-bold text-navy-800">{fmtINR(totalStockValue)}</div></div>
        <div className="card p-4"><div className="text-xs text-slate-500">Low Stock Items</div><div className="text-2xl font-display font-bold text-amber-600">{lowStock.length}</div></div>
        <div className="card p-4"><div className="text-xs text-slate-500">Suppliers</div><div className="text-2xl font-display font-bold text-navy-800">{data.suppliers.length}</div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="card p-5 lg:col-span-2">
          <h3 className="section-title mb-3 flex items-center gap-2"><Boxes className="w-4 h-4 text-navy-500" />Stock by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} margin={{ left: -16, right: 8, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={fmtUnitsRecharts} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="stock" radius={[6, 6, 0, 0]}>
                {categoryData.map((_, i) => <Cell key={i} fill={['#2b4787', '#7e22ce', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899'][i % 7]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="section-title mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" />Low Stock Alerts</h3>
          {lowStock.length === 0 ? <EmptyState title="All Stocked" message="No items below reorder level." /> : (
            <div className="space-y-2">
              {lowStock.map((i) => (
                <div key={i.id} className="flex items-center justify-between p-2.5 rounded-lg border border-amber-200 bg-amber-50/50">
                  <div className="min-w-0"><div className="text-sm font-medium text-navy-800 truncate">{i.name}</div><div className="text-xs text-slate-400">{i.brand}</div></div>
                  <div className="text-right"><div className="text-sm font-semibold text-amber-600">{i.stock}</div><div className="text-xs text-slate-400">reorder {i.reorderLevel}</div></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-sm text-slate-500 mr-1">Category:</span>
        {['All', ...CATEGORIES].map((c) => (
          <button key={c} onClick={() => setFilterCat(c)} className={`px-3 py-1 rounded-full text-xs font-medium border transition ${filterCat === c ? 'bg-navy-800 text-white border-navy-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>{c}</button>
        ))}
      </div>

      <DataTable columns={columns} rows={filtered} searchKeys={['name', 'sku', 'brand']} searchPlaceholder="Search products..." emptyMessage="No products in this category." />

      {/* Stock adjust modal */}
      <Modal open={!!adjustTarget} onClose={() => setAdjustTarget(null)} title={`Stock ${adjustMode === 'in' ? 'In' : 'Out'}`} description={adjustTarget?.name}
        footer={<><button className="btn-outline" onClick={() => setAdjustTarget(null)}>Cancel</button><button className={adjustMode === 'in' ? 'btn-emerald' : 'btn-danger'} onClick={adjustStock}>Confirm</button></>}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Current Stock</span><span className="font-medium">{adjustTarget?.stock} {adjustTarget?.unit}</span>
          </div>
          <div><label className="label">Quantity to {adjustMode === 'in' ? 'add' : 'remove'}</label><input type="number" min={1} className="input" value={adjustQty} onChange={(e) => setAdjustQty(Math.max(1, +e.target.value))} /></div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">New Stock</span><span className="font-semibold text-navy-800">{adjustTarget ? (adjustMode === 'in' ? adjustTarget.stock + adjustQty : Math.max(0, adjustTarget.stock - adjustQty)) : 0} {adjustTarget?.unit}</span>
          </div>
        </div>
      </Modal>

      {/* Add product modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Product" description="Create a new inventory item." size="lg"
        footer={<><button className="btn-outline" onClick={() => setAddOpen(false)}>Cancel</button><button className="btn-primary" onClick={addItem}>Add Product</button></>}
      >
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">SKU *</label><input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
          <div><label className="label">Name *</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">Category</label><select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div><label className="label">Brand</label><input className="input" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></div>
          <div><label className="label">Unit</label><input className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
          <div><label className="label">Initial Stock</label><input type="number" className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value })} /></div>
          <div><label className="label">Reorder Level</label><input type="number" className="input" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: +e.target.value })} /></div>
          <div><label className="label">Unit Price (INR)</label><input type="number" className="input" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: +e.target.value })} /></div>
          <div className="col-span-2"><label className="label">Supplier</label><select className="input" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}><option value="">Select supplier...</option>{data.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        </div>
      </Modal>
    </PageContainer>
  );
}

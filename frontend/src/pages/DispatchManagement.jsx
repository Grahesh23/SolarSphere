import { useState } from 'react';
import { Plus, Truck, CheckCircle2, Package, MapPin, Calendar, ClipboardCheck } from 'lucide-react';
import { useData } from '@/data/DataContext';
import { PageContainer } from '@/components/layout/MobileSidebar';
import { PageHeader } from '@/components/layout/Header';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadgeAuto, AlertBanner, EmptyState } from '@/components/ui/Status';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { fmtDate, genId } from '@/lib/format';

export function DispatchManagement() {
  const { data, setData } = useData();
  const [selected, setSelected] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [shipTarget, setShipTarget] = useState(null);
  const [deliverTarget, setDeliverTarget] = useState(null);

  const active = selected ? data.dispatches.find((d) => d.id === selected.id) ?? selected : null;
  const activeProject = active ? data.projects.find((p) => p.id === active.projectId) : null;
  const activeCustomer = activeProject ? data.customers.find((c) => c.id === activeProject.customerId) : null;
  const activeTech = active ? data.technicians.find((t) => t.id === active.technicianId) : null;

  const columns = [
    { key: 'code', label: 'Code', sortValue: (r) => r.code, render: (r) => <span className="font-mono text-xs text-slate-500">{r.code}</span> },
    {
      key: 'project', label: 'Project / Customer', sortValue: (r) => r.code, render: (r) => {
        const proj = data.projects.find((p) => p.id === r.projectId);
        const cust = proj ? data.customers.find((c) => c.id === proj.customerId) : null;
        return <div><div className="font-medium text-navy-800">{proj?.code}</div><div className="text-xs text-slate-400">{cust?.name}</div></div>;
      },
    },
    { key: 'items', label: 'Items', render: (r) => `${r.equipmentIds.length} units` },
    {
      key: 'technician', label: 'Technician', sortValue: (r) => data.technicians.find((t) => t.id === r.technicianId)?.name ?? '', render: (r) => {
        const t = data.technicians.find((t) => t.id === r.technicianId);
        return t?.name ?? '—';
      },
    },
    { key: 'createdAt', label: 'Created', sortValue: (r) => r.createdAt, render: (r) => fmtDate(r.createdAt) },
    { key: 'deliveredAt', label: 'Delivered', sortValue: (r) => r.deliveredAt ?? '', render: (r) => r.deliveredAt ? fmtDate(r.deliveredAt) : '—' },
    { key: 'status', label: 'Status', sortValue: (r) => r.status, render: (r) => <StatusBadgeAuto status={r.status} /> },
  ];

  const [form, setForm] = useState({ projectId: '', technicianId: '' });

  const createDispatch = () => {
    if (!form.projectId || !form.technicianId) return;
    const project = data.projects.find((p) => p.id === form.projectId);
    if (!project) return;
    const quote = data.quotations.find((q) => q.id === project.quotationId);
    if (!quote?.bomApproved) { alert('BOM must be approved before dispatch.'); return; }
    const equipmentForProject = data.equipment.filter((e) => e.projectId === project.id && e.status !== 'Dispatched');
    const newDispatch = {
      id: genId('dsp'),
      code: `DSP-${String(data.dispatches.length + 1).padStart(3, '0')}`,
      projectId: project.id,
      equipmentIds: equipmentForProject.map((e) => e.id),
      technicianId: form.technicianId,
      status: 'Pending',
      createdAt: new Date().toISOString().slice(0, 10),
      checklist: [
        { label: 'Panels verified against BOM', done: false },
        { label: 'Inverter serial recorded', done: false },
        { label: 'Mounting kit packed', done: false },
        { label: 'Cables packed', done: false },
        { label: 'Earthing kit included', done: false },
      ],
    };
    setData((p) => ({ ...p, dispatches: [...p.dispatches, newDispatch] }));
    setAddOpen(false);
    setForm({ projectId: '', technicianId: '' });
  };

  const ship = () => {
    if (!shipTarget) return;
    setData((p) => ({
      ...p,
      dispatches: p.dispatches.map((d) => d.id === shipTarget.id ? { ...d, status: 'Shipped', shippedAt: new Date().toISOString().slice(0, 10) } : d),
      equipment: p.equipment.map((e) => shipTarget.equipmentIds.includes(e.id) ? { ...e, status: 'Dispatched' } : e),
    }));
    setShipTarget(null);
  };

  const deliver = () => {
    if (!deliverTarget) return;
    const today = new Date().toISOString().slice(0, 10);
    setData((p) => ({
      ...p,
      dispatches: p.dispatches.map((d) => d.id === deliverTarget.id ? { ...d, status: 'Delivered', deliveredAt: today } : d),
      equipment: p.equipment.map((e) => deliverTarget.equipmentIds.includes(e.id) ? { ...e, status: 'Dispatched', deliveredAt: today, warrantyStart: today, warrantyEnd: new Date(Date.now() + 1095 * 86400000).toISOString().slice(0, 10) } : e),
    }));
    setDeliverTarget(null);
  };

  const eligibleProjects = data.projects.filter((p) => {
    const q = data.quotations.find((q) => q.id === p.quotationId);
    return q?.bomApproved;
  });

  return (
    <PageContainer>
      <PageHeader
        title="Dispatch Management"
        description="Pack and ship equipment to project sites. Dispatch requires an approved BOM and valid stock."
        actions={<button className="btn-primary" onClick={() => setAddOpen(true)} disabled={eligibleProjects.length === 0}><Plus className="w-4 h-4" />Create Dispatch</button>}
      />

      {eligibleProjects.length === 0 && (
        <div className="mb-4"><AlertBanner type="info" message="No projects are ready for dispatch. BOM must be approved before equipment can be dispatched." /></div>
      )}

      <DataTable columns={columns} rows={data.dispatches} searchKeys={['code']} searchPlaceholder="Search dispatches..." onRowClick={setSelected} />

      {active && activeProject && activeCustomer && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title={active.code} description={`${activeProject.code} · ${activeCustomer.name}`} size="lg"
          footer={
            <>
              {active.status === 'Pending' && <button className="btn-emerald" onClick={() => setShipTarget(active)}><Truck className="w-4 h-4" />Mark Shipped</button>}
              {active.status === 'Shipped' && <button className="btn-emerald" onClick={() => setDeliverTarget(active)}><CheckCircle2 className="w-4 h-4" />Confirm Delivery</button>}
              <button className="btn-ghost" onClick={() => setSelected(null)}>Close</button>
            </>
          }
        >
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="card p-3"><div className="text-xs text-slate-500">Status</div><div className="mt-1"><StatusBadgeAuto status={active.status} /></div></div>
              <div className="card p-3"><div className="text-xs text-slate-500">Technician</div><div className="text-sm font-medium text-navy-800 mt-1">{activeTech?.name ?? '—'}</div></div>
              <div className="card p-3"><div className="text-xs text-slate-500">Created</div><div className="text-sm font-medium text-navy-800 mt-1">{fmtDate(active.createdAt)}</div></div>
              <div className="card p-3"><div className="text-xs text-slate-500">Items</div><div className="text-sm font-medium text-navy-800 mt-1">{active.equipmentIds.length} units</div></div>
            </div>

            <div>
              <h4 className="section-title text-sm mb-2 flex items-center gap-2"><Package className="w-4 h-4 text-navy-500" />Dispatched Equipment</h4>
              <div className="space-y-2">
                {active.equipmentIds.map((eid) => {
                  const e = data.equipment.find((e) => e.id === eid);
                  const item = e ? data.inventory.find((i) => i.id === e.itemId) : null;
                  return (
                    <div key={eid} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                      <div><div className="text-sm font-medium text-navy-800">{item?.name ?? 'Unknown'}</div><div className="text-xs text-slate-400 font-mono">SN: {e?.serialNumber}</div></div>
                      {e && <StatusBadgeAuto status={e.status} />}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="section-title text-sm mb-3 flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-emerald-500" />Dispatch Checklist</h4>
              <div className="space-y-2">
                {active.checklist.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {c.done ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <div className="w-4 h-4 rounded border-2 border-slate-300" />}
                    <span className={c.done ? 'text-navy-700' : 'text-slate-400'}>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{activeProject.location}</span>
              {active.shippedAt && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />Shipped: {fmtDate(active.shippedAt)}</span>}
              {active.deliveredAt && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />Delivered: {fmtDate(active.deliveredAt)}</span>}
            </div>
          </div>
        </Modal>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Create Dispatch" description="Select a project with an approved BOM."
        footer={<><button className="btn-outline" onClick={() => setAddOpen(false)}>Cancel</button><button className="btn-primary" onClick={createDispatch}>Create</button></>}
      >
        <div className="space-y-4">
          <div>
            <label className="label">Project *</label>
            <select className="input" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
              <option value="">Select project...</option>
              {eligibleProjects.map((p) => { const c = data.customers.find((c) => c.id === p.customerId); return <option key={p.id} value={p.id}>{p.code} — {c?.name}</option>; })}
            </select>
          </div>
          <div>
            <label className="label">Technician *</label>
            <select className="input" value={form.technicianId} onChange={(e) => setForm({ ...form, technicianId: e.target.value })}>
              <option value="">Select technician...</option>
              {data.technicians.map((t) => <option key={t.id} value={t.id}>{t.name} — {t.availability}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!shipTarget} title="Mark as Shipped?" message="Equipment will be marked as dispatched and removed from available stock." confirmLabel="Confirm Shipped" onConfirm={ship} onCancel={() => setShipTarget(null)} />
      <ConfirmDialog open={!!deliverTarget} title="Confirm Delivery?" message="Delivery confirmation activates warranty start dates for the dispatched equipment." confirmLabel="Confirm Delivery" onConfirm={deliver} onCancel={() => setDeliverTarget(null)} />
    </PageContainer>
  );
}

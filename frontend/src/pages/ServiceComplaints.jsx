import { useState } from 'react';
import { Plus, Headphones, Search, User, ShieldCheck, Wrench, CheckCircle2, Clock } from 'lucide-react';
import { useData } from '@/data/DataContext';
import { PageContainer } from '@/components/layout/MobileSidebar';
import { PageHeader } from '@/components/layout/Header';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadgeAuto, EmptyState } from '@/components/ui/Status';
import { Modal } from '@/components/ui/Modal';
import { fmtINR, fmtDate, genId } from '@/lib/format';

export function ServiceComplaints() {
  const { data, setData } = useData();
  const [selected, setSelected] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [resolveTarget, setResolveTarget] = useState(null);
  const [form, setForm] = useState({ customerId: '', type: 'Warranty', subject: '', description: '', equipmentId: '' });

  const active = selected ? data.services.find((s) => s.id === selected.id) ?? selected : null;
  const activeCustomer = active ? data.customers.find((c) => c.id === active.customerId) : null;
  const activeProject = active?.projectId ? data.projects.find((p) => p.id === active.projectId) : null;
  const activeEquipment = active?.equipmentId ? data.equipment.find((e) => e.id === active.equipmentId) : null;
  const activeWarranty = activeEquipment ? data.warranties.find((w) => w.equipmentId === activeEquipment.id) : null;

  const columns = [
    { key: 'code', label: 'Ticket', sortValue: (r) => r.code, render: (r) => <span className="font-mono text-xs text-slate-500">{r.code}</span> },
    {
      key: 'customer', label: 'Customer', sortValue: (r) => data.customers.find((c) => c.id === r.customerId)?.name ?? '', render: (r) => {
        const c = data.customers.find((c) => c.id === r.customerId);
        return <div className="font-medium text-navy-800">{c?.name ?? '—'}</div>;
      },
    },
    { key: 'type', label: 'Type', sortValue: (r) => r.type, render: (r) => <StatusBadgeAuto status={r.type} /> },
    { key: 'subject', label: 'Subject', sortValue: (r) => r.subject, render: (r) => <span className="text-navy-700">{r.subject}</span> },
    { key: 'assignedTo', label: 'Assigned To', render: (r) => r.assignedTo ?? <span className="text-slate-400">Unassigned</span> },
    { key: 'createdAt', label: 'Created', sortValue: (r) => r.createdAt, render: (r) => fmtDate(r.createdAt) },
    { key: 'status', label: 'Status', sortValue: (r) => r.status, render: (r) => <StatusBadgeAuto status={r.status} /> },
  ];

  const createTicket = () => {
    if (!form.customerId || !form.subject) return;
    const newTicket = {
      id: genId('svc'),
      code: `TKT-${String(data.services.length + 1).padStart(3, '0')}`,
      customerId: form.customerId,
      projectId: data.projects.find((p) => p.customerId === form.customerId)?.id,
      equipmentId: form.equipmentId || undefined,
      type: form.type,
      subject: form.subject,
      description: form.description,
      status: 'Open',
      createdAt: new Date().toISOString().slice(0, 10),
      partsCost: 0,
      labourCost: 0,
      customerConfirmed: false,
    };
    setData((p) => ({ ...p, services: [newTicket, ...p.services] }));
    setAddOpen(false);
    setForm({ customerId: '', type: 'Warranty', subject: '', description: '', equipmentId: '' });
  };

  const resolve = () => {
    if (!resolveTarget) return;
    setData((p) => ({
      ...p,
      services: p.services.map((s) => s.id === resolveTarget.id ? { ...s, status: 'Resolved', resolvedAt: new Date().toISOString().slice(0, 10) } : s),
    }));
    setResolveTarget(null);
  };

  const assign = (id, tech) => {
    setData((p) => ({ ...p, services: p.services.map((s) => s.id === id ? { ...s, assignedTo: tech, status: 'Assigned' } : s) }));
  };

  return (
    <PageContainer>
      <PageHeader
        title="Service & Complaints"
        description="Register complaints, verify warranty status, assign technicians, and track repair costs."
        actions={<button className="btn-primary" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" />New Ticket</button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="card p-4"><div className="text-xs text-slate-500">Open Tickets</div><div className="text-2xl font-display font-bold text-amber-600">{data.services.filter((s) => !['Resolved', 'Closed'].includes(s.status)).length}</div></div>
        <div className="card p-4"><div className="text-xs text-slate-500">Warranty Claims</div><div className="text-2xl font-display font-bold text-grape-600">{data.services.filter((s) => s.type === 'Warranty').length}</div></div>
        <div className="card p-4"><div className="text-xs text-slate-500">Chargeable</div><div className="text-2xl font-display font-bold text-navy-700">{data.services.filter((s) => s.type === 'Chargeable').length}</div></div>
        <div className="card p-4"><div className="text-xs text-slate-500">Resolved</div><div className="text-2xl font-display font-bold text-emerald-600">{data.services.filter((s) => ['Resolved', 'Closed'].includes(s.status)).length}</div></div>
      </div>

      <DataTable columns={columns} rows={data.services} searchKeys={['code', 'subject']} searchPlaceholder="Search tickets..." onRowClick={setSelected} />

      {active && activeCustomer && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title={active.code} description={active.subject} size="lg"
          footer={
            <>
              {!['Resolved', 'Closed'].includes(active.status) && <button className="btn-emerald" onClick={() => setResolveTarget(active)}><CheckCircle2 className="w-4 h-4" />Mark Resolved</button>}
              <button className="btn-ghost" onClick={() => setSelected(null)}>Close</button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="card p-3"><div className="text-xs text-slate-500">Status</div><div className="mt-1"><StatusBadgeAuto status={active.status} /></div></div>
              <div className="card p-3"><div className="text-xs text-slate-500">Type</div><div className="mt-1"><StatusBadgeAuto status={active.type} /></div></div>
              <div className="card p-3"><div className="text-xs text-slate-500">Customer</div><div className="text-sm font-medium text-navy-800 mt-1 truncate">{activeCustomer.name}</div></div>
              <div className="card p-3"><div className="text-xs text-slate-500">Created</div><div className="text-sm font-medium text-navy-800 mt-1">{fmtDate(active.createdAt)}</div></div>
            </div>

            <div>
              <h4 className="section-title text-sm mb-2">Description</h4>
              <p className="text-sm text-slate-600 p-3 rounded-lg bg-slate-50 border border-slate-200">{active.description}</p>
            </div>

            {activeEquipment && (
              <div className="p-4 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-navy-800">Equipment: {data.inventory.find((i) => i.id === activeEquipment.itemId)?.name}</div>
                    <div className="text-xs text-slate-400 font-mono">SN: {activeEquipment.serialNumber}</div>
                  </div>
                  {activeWarranty ? <StatusBadgeAuto status={`Warranty ${activeWarranty.status}`} /> : <span className="badge-rose">No Warranty</span>}
                </div>
              </div>
            )}

            <div>
              <h4 className="section-title text-sm mb-2">Assignment</h4>
              {active.assignedTo ? (
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                  <span className="text-sm text-navy-700">Assigned to <span className="font-medium">{active.assignedTo}</span></span>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-slate-500 mb-2">Not assigned. Select a technician:</p>
                  <div className="flex flex-wrap gap-2">
                    {data.technicians.map((t) => (
                      <button key={t.id} onClick={() => assign(active.id, t.name)} className="btn-outline text-xs">{t.name}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="card p-3"><div className="text-xs text-slate-500">Parts Cost</div><div className="text-lg font-semibold text-navy-800">{fmtINR(active.partsCost)}</div></div>
              <div className="card p-3"><div className="text-xs text-slate-500">Labour Cost</div><div className="text-lg font-semibold text-navy-800">{fmtINR(active.labourCost)}</div></div>
            </div>

            <div className="card p-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">Customer Confirmation</span>
              {active.customerConfirmed ? <span className="badge-emerald">Confirmed</span> : <span className="badge-amber">Pending</span>}
            </div>
          </div>
        </Modal>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New Service Ticket" size="lg"
        footer={<><button className="btn-outline" onClick={() => setAddOpen(false)}>Cancel</button><button className="btn-primary" onClick={createTicket} disabled={!form.customerId || !form.subject}>Create Ticket</button></>}
      >
        <div className="space-y-3">
          <div>
            <label className="label">Customer *</label>
            <select className="input" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
              <option value="">Select customer...</option>
              {data.customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option>Warranty</option><option>Chargeable</option><option>Maintenance</option><option>Installation Issue</option>
              </select>
            </div>
            <div>
              <label className="label">Equipment (optional)</label>
              <select className="input" value={form.equipmentId} onChange={(e) => setForm({ ...form, equipmentId: e.target.value })}>
                <option value="">None</option>
                {data.equipment.filter((e) => data.projects.find((p) => p.id === e.projectId)?.customerId === form.customerId).map((e) => {
                  const item = data.inventory.find((i) => i.id === e.itemId);
                  return <option key={e.id} value={e.id}>{item?.name} — {e.serialNumber}</option>;
                })}
              </select>
            </div>
          </div>
          <div><label className="label">Subject *</label><input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
          <div><label className="label">Description</label><textarea className="input min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        </div>
      </Modal>
    </PageContainer>
  );
}

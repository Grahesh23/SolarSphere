import { useState } from 'react';
import { ShieldCheck, Plus, Calendar, AlertTriangle, FileText, Wrench, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useData } from '@/data/DataContext';
import { PageContainer } from '@/components/layout/MobileSidebar';
import { PageHeader } from '@/components/layout/Header';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadgeAuto, EmptyState } from '@/components/ui/Status';
import { Modal } from '@/components/ui/Modal';
import { fmtDate, genId, daysBetween } from '@/lib/format';

const today = '2026-10-31';

export function WarrantyManagement() {
  const { data, setData } = useData();
  const [selected, setSelected] = useState(null);
  const [claimTarget, setClaimTarget] = useState(null);
  const [claimForm, setClaimForm] = useState({ issue: '' });

  const active = selected ? data.warranties.find((w) => w.id === selected.id) ?? selected : null;
  const activeEquipment = active ? data.equipment.find((e) => e.id === active.equipmentId) : null;
  const activeItem = activeEquipment ? data.inventory.find((i) => i.id === activeEquipment.itemId) : null;
  const activeProject = active ? data.projects.find((p) => p.id === active.projectId) : null;
  const activeCustomer = activeProject ? data.customers.find((c) => c.id === activeProject.customerId) : null;

  const columns = [
    { key: 'id', label: 'Warranty ID', sortValue: (r) => r.id, render: (r) => <span className="font-mono text-xs text-slate-500">{r.id.toUpperCase()}</span> },
    {
      key: 'equipment', label: 'Equipment', sortValue: (r) => data.equipment.find((e) => e.id === r.equipmentId)?.serialNumber ?? '', render: (r) => {
        const e = data.equipment.find((e) => e.id === r.equipmentId);
        const item = e ? data.inventory.find((i) => i.id === e.itemId) : null;
        return <div><div className="font-medium text-navy-800">{item?.name ?? 'Unknown'}</div><div className="text-xs text-slate-400 font-mono">SN: {e?.serialNumber}</div></div>;
      },
    },
    {
      key: 'customer', label: 'Customer', sortValue: (r) => data.projects.find((p) => p.id === r.projectId)?.code ?? '', render: (r) => {
        const proj = data.projects.find((p) => p.id === r.projectId);
        const cust = proj ? data.customers.find((c) => c.id === proj.customerId) : null;
        return <div className="text-sm text-navy-700">{cust?.name ?? '—'}</div>;
      },
    },
    { key: 'startDate', label: 'Start', sortValue: (r) => r.startDate, render: (r) => fmtDate(r.startDate) },
    { key: 'endDate', label: 'End', sortValue: (r) => r.endDate, render: (r) => fmtDate(r.endDate) },
    { key: 'daysLeft', label: 'Days Left', sortValue: (r) => daysBetween(today, r.endDate), render: (r) => {
      const d = daysBetween(today, r.endDate);
      return <span className={d > 0 ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>{d > 0 ? `${d}d` : 'Expired'}</span>;
    } },
    { key: 'status', label: 'Status', sortValue: (r) => r.status, render: (r) => <StatusBadgeAuto status={r.status} /> },
    { key: 'claims', label: 'Claims', render: (r) => `${r.claims.length}` },
  ];

  const fileClaim = () => {
    if (!claimTarget || !claimForm.issue) return;
    setData((p) => ({
      ...p,
      warranties: p.warranties.map((w) => w.id === claimTarget.id ? {
        ...w,
        status: 'Claim In Progress',
        claims: [...w.claims, { id: genId('cl'), date: today, issue: claimForm.issue, status: 'Open', note: 'Awaiting technician inspection' }],
      } : w),
    }));
    setClaimTarget(null);
    setClaimForm({ issue: '' });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Warranty Management"
        description="Track equipment warranties, file claims, and manage replacements. Warranties activate only after confirmed delivery."
        actions={null}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="card p-4"><div className="text-xs text-slate-500">Active Warranties</div><div className="text-2xl font-display font-bold text-emerald-600">{data.warranties.filter((w) => w.status === 'Active').length}</div></div>
        <div className="card p-4"><div className="text-xs text-slate-500">Claims In Progress</div><div className="text-2xl font-display font-bold text-amber-600">{data.warranties.filter((w) => w.status === 'Claim In Progress').length}</div></div>
        <div className="card p-4"><div className="text-xs text-slate-500">Expired</div><div className="text-2xl font-display font-bold text-rose-600">{data.warranties.filter((w) => w.status === 'Expired').length}</div></div>
        <div className="card p-4"><div className="text-xs text-slate-500">Pending Activation</div><div className="text-2xl font-display font-bold text-slate-500">{data.equipment.filter((e) => e.warrantyStatus === 'Pending' && e.status === 'In Stock').length}</div></div>
      </div>

      <DataTable columns={columns} rows={data.warranties} searchKeys={['id']} searchPlaceholder="Search warranties..." onRowClick={setSelected} />

      {active && activeEquipment && activeItem && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title={`Warranty ${active.id.toUpperCase()}`} description={activeItem.name} size="lg"
          footer={
            <>
              {active.status === 'Active' && <button className="btn-emerald" onClick={() => setClaimTarget(active)}><FileText className="w-4 h-4" />File Claim</button>}
              <button className="btn-ghost" onClick={() => setSelected(null)}>Close</button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="card p-3"><div className="text-xs text-slate-500">Status</div><div className="mt-1"><StatusBadgeAuto status={active.status} /></div></div>
              <div className="card p-3"><div className="text-xs text-slate-500">Serial</div><div className="text-sm font-mono text-navy-700 mt-1">{activeEquipment.serialNumber}</div></div>
              <div className="card p-3"><div className="text-xs text-slate-500">Customer</div><div className="text-sm font-medium text-navy-800 mt-1 truncate">{activeCustomer?.name ?? '—'}</div></div>
              <div className="card p-3"><div className="text-xs text-slate-500">Days Left</div><div className={`text-sm font-semibold mt-1 ${daysBetween(today, active.endDate) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{daysBetween(today, active.endDate) > 0 ? `${daysBetween(today, active.endDate)} days` : 'Expired'}</div></div>
            </div>

            <div className="p-4 rounded-lg border border-grape-100 bg-grape-50">
              <div className="flex items-center gap-2 text-grape-700 font-medium text-sm mb-1"><ShieldCheck className="w-4 h-4" />Warranty Terms</div>
              <p className="text-sm text-grape-700">{active.terms}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-grape-600">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Start: {fmtDate(active.startDate)}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />End: {fmtDate(active.endDate)}</span>
              </div>
            </div>

            <div>
              <h4 className="section-title text-sm mb-2 flex items-center gap-2"><Wrench className="w-4 h-4 text-navy-500" />Claims History ({active.claims.length})</h4>
              {active.claims.length === 0 ? <EmptyState title="No Claims" message="No warranty claims have been filed for this equipment." /> : (
                <div className="space-y-2">
                  {active.claims.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                      <div><div className="text-sm font-medium text-navy-800">{c.issue}</div><div className="text-xs text-slate-400">{fmtDate(c.date)} · {c.note}</div></div>
                      <StatusBadgeAuto status={c.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      <Modal open={!!claimTarget} onClose={() => { setClaimTarget(null); setClaimForm({ issue: '' }); }} title="File Warranty Claim"
        footer={<><button className="btn-outline" onClick={() => { setClaimTarget(null); setClaimForm({ issue: '' }); }}>Cancel</button><button className="btn-emerald" onClick={fileClaim} disabled={!claimForm.issue}>Submit Claim</button></>}
      >
        <div className="space-y-3">
          <div className="text-sm text-slate-600">Filing a claim for <span className="font-medium text-navy-800">{activeItem?.name}</span> (SN: {activeEquipment?.serialNumber}).</div>
          <div>
            <label className="label">Issue Description *</label>
            <textarea className="input min-h-[100px]" value={claimForm.issue} onChange={(e) => setClaimForm({ ...claimForm, issue: e.target.value })} placeholder="Describe the fault or issue..." />
          </div>
          <div className="text-xs text-slate-400">Claims are reviewed by a technician. Covered repairs are at no cost; chargeable repairs require customer confirmation.</div>
        </div>
      </Modal>
    </PageContainer>
  );
}

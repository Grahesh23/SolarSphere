import { useState } from 'react';
import { Plus, Landmark, FileText, CheckCircle2, Clock, Download, IndianRupee } from 'lucide-react';
import { useData } from '@/data/DataContext';
import { PageContainer } from '@/components/layout/MobileSidebar';
import { PageHeader } from '@/components/layout/Header';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadgeAuto, EmptyState } from '@/components/ui/Status';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { fmtINR, fmtDate, genId } from '@/lib/format';

const SCHEMES = [
  'PM Surya Ghar Muft Bijli Yojana',
  'MNRE Grid-Connected Rooftop',
  'State Solar Subsidy (Maharashtra)',
  'Kisan Urja Suraksha Yojana',
];

export function SubsidyManagement() {
  const { data, setData } = useData();
  const [addOpen, setAddOpen] = useState(false);
  const [applyTarget, setApplyTarget] = useState(null);
  const [disburseTarget, setDisburseTarget] = useState(null);
  const [form, setForm] = useState({ projectId: '', scheme: SCHEMES[0], eligibleAmount: 0 });

  const columns = [
    { key: 'code', label: 'Code', sortValue: (r) => r.code, render: (r) => <span className="font-mono text-xs text-slate-500">{r.code}</span> },
    {
      key: 'project', label: 'Project / Customer', sortValue: (r) => data.projects.find((p) => p.id === r.projectId)?.code ?? '', render: (r) => {
        const proj = data.projects.find((p) => p.id === r.projectId);
        const cust = proj ? data.customers.find((c) => c.id === proj.customerId) : null;
        return <div><div className="font-medium text-navy-800">{proj?.code}</div><div className="text-xs text-slate-400">{cust?.name}</div></div>;
      },
    },
    { key: 'scheme', label: 'Scheme', sortValue: (r) => r.scheme, render: (r) => <span className="text-navy-700">{r.scheme}</span> },
    { key: 'eligibleAmount', label: 'Eligible', sortValue: (r) => r.eligibleAmount, render: (r) => fmtINR(r.eligibleAmount) },
    { key: 'disbursedAmount', label: 'Disbursed', sortValue: (r) => r.disbursedAmount, render: (r) => <span className="font-medium text-emerald-600">{fmtINR(r.disbursedAmount)}</span> },
    { key: 'appliedDate', label: 'Applied', sortValue: (r) => r.appliedDate, render: (r) => fmtDate(r.appliedDate) },
    { key: 'status', label: 'Status', sortValue: (r) => r.status, render: (r) => <StatusBadgeAuto status={r.status} /> },
  ];

  const createSubsidy = () => {
    if (!form.projectId) return;
    const proj = data.projects.find((p) => p.id === form.projectId);
    if (!proj) return;
    const eligible = form.eligibleAmount || Math.round(proj.capacity * 18000);
    const newSub = {
      id: genId('sub'),
      code: `SUB-${String(data.subsidies.length + 1).padStart(3, '0')}`,
      projectId: proj.id,
      customerId: proj.customerId,
      scheme: form.scheme,
      eligibleAmount: eligible,
      appliedAmount: eligible,
      disbursedAmount: 0,
      status: 'Applied',
      appliedDate: new Date().toISOString().slice(0, 10),
      documents: ['application.pdf', 'property_proof.pdf'],
    };
    setData((p) => ({ ...p, subsidies: [...p.subsidies, newSub] }));
    setAddOpen(false);
    setForm({ projectId: '', scheme: SCHEMES[0], eligibleAmount: 0 });
  };

  const approve = () => {
    if (!applyTarget) return;
    setData((p) => ({ ...p, subsidies: p.subsidies.map((s) => s.id === applyTarget.id ? { ...s, status: 'Approved', approvedDate: new Date().toISOString().slice(0, 10) } : s) }));
    setApplyTarget(null);
  };

  const disburse = () => {
    if (!disburseTarget) return;
    const today = new Date().toISOString().slice(0, 10);
    setData((p) => ({ ...p, subsidies: p.subsidies.map((s) => s.id === disburseTarget.id ? { ...s, status: 'Disbursed', disbursedAmount: s.eligibleAmount, disbursedDate: today } : s) }));
    setDisburseTarget(null);
  };

  const totalEligible = data.subsidies.reduce((s, x) => s + x.eligibleAmount, 0);
  const totalDisbursed = data.subsidies.reduce((s, x) => s + x.disbursedAmount, 0);
  const pending = data.subsidies.filter((s) => ['Applied', 'Under Review', 'Approved'].includes(s.status)).length;

  const eligibleProjects = data.projects.filter((p) => !data.subsidies.some((s) => s.projectId === p.id));

  return (
    <PageContainer>
      <PageHeader
        title="Subsidy Management"
        description="Apply for government solar subsidies, track application status, and record disbursements."
        actions={<button className="btn-primary" onClick={() => setAddOpen(true)} disabled={eligibleProjects.length === 0}><Plus className="w-4 h-4" />Apply for Subsidy</button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="card p-4"><div className="text-xs text-slate-500 flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5 text-navy-500" />Total Eligible</div><div className="text-2xl font-display font-bold text-navy-800 mt-1">{fmtINR(totalEligible)}</div></div>
        <div className="card p-4"><div className="text-xs text-slate-500 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />Disbursed</div><div className="text-2xl font-display font-bold text-emerald-600 mt-1">{fmtINR(totalDisbursed)}</div></div>
        <div className="card p-4"><div className="text-xs text-slate-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-500" />In Progress</div><div className="text-2xl font-display font-bold text-amber-600 mt-1">{pending}</div></div>
        <div className="card p-4"><div className="text-xs text-slate-500">Total Applications</div><div className="text-2xl font-display font-bold text-navy-800 mt-1">{data.subsidies.length}</div></div>
      </div>

      <DataTable columns={columns} rows={data.subsidies} searchKeys={['code', 'scheme']} searchPlaceholder="Search subsidies..." />

      {/* Action panel */}
      <div className="mt-5 card p-5">
        <h3 className="section-title mb-3 flex items-center gap-2"><Landmark className="w-4 h-4 text-navy-500" />Subsidy Actions</h3>
        <div className="space-y-2">
          {data.subsidies.map((s) => {
            const proj = data.projects.find((p) => p.id === s.projectId);
            return (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                <div><div className="text-sm font-medium text-navy-800">{s.code} · {proj?.code}</div><div className="text-xs text-slate-400">{s.scheme}</div></div>
                <div className="flex items-center gap-2">
                  <StatusBadgeAuto status={s.status} />
                  {s.status === 'Under Review' && <button className="btn-emerald text-xs" onClick={() => setApplyTarget(s)}>Approve</button>}
                  {s.status === 'Approved' && <button className="btn-emerald text-xs" onClick={() => setDisburseTarget(s)}>Disburse</button>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Apply for Subsidy"
        footer={<><button className="btn-outline" onClick={() => setAddOpen(false)}>Cancel</button><button className="btn-primary" onClick={createSubsidy} disabled={!form.projectId}>Submit Application</button></>}
      >
        <div className="space-y-3">
          <div>
            <label className="label">Project *</label>
            <select className="input" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
              <option value="">Select project...</option>
              {eligibleProjects.map((p) => { const c = data.customers.find((c) => c.id === p.customerId); return <option key={p.id} value={p.id}>{p.code} — {c?.name}</option>; })}
            </select>
          </div>
          <div>
            <label className="label">Scheme</label>
            <select className="input" value={form.scheme} onChange={(e) => setForm({ ...form, scheme: e.target.value })}>
              {SCHEMES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Eligible Amount (INR)</label>
            <input type="number" className="input" value={form.eligibleAmount} onChange={(e) => setForm({ ...form, eligibleAmount: +e.target.value })} placeholder="Auto-calculated if 0" />
            <div className="text-xs text-slate-400 mt-1">PM Surya Ghar: ₹30,000-78,000 based on capacity (1-5 kW).</div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!applyTarget} title="Approve Subsidy?" message="The subsidy application will be marked as approved by the authority." confirmLabel="Approve" onConfirm={approve} onCancel={() => setApplyTarget(null)} />
      <ConfirmDialog open={!!disburseTarget} title="Disburse Subsidy?" message="The eligible amount will be recorded as disbursed to the project." confirmLabel="Confirm Disbursement" onConfirm={disburse} onCancel={() => setDisburseTarget(null)} />
    </PageContainer>
  );
}

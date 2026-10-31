import { useState } from 'react';
import { Plus, Wrench, CheckCircle2, Clock, Calendar, Camera, Zap, FileCheck, UserCheck } from 'lucide-react';
import { useData } from '@/data/DataContext';
import { PageContainer } from '@/components/layout/MobileSidebar';
import { PageHeader } from '@/components/layout/Header';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadgeAuto, AlertBanner } from '@/components/ui/Status';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FileUploader } from '@/components/ui/FileUploader';
import { fmtDate, genId } from '@/lib/format';

export function InstallationManagement() {
  const { data, setData } = useData();
  const [selected, setSelected] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [acceptTarget, setAcceptTarget] = useState(null);
  const [form, setForm] = useState({ projectId: '', technicianId: '', scheduledDate: '' });

  const active = selected ? data.installations.find((i) => i.id === selected.id) ?? selected : null;
  const activeProject = active ? data.projects.find((p) => p.id === active.projectId) : null;
  const activeCustomer = activeProject ? data.customers.find((c) => c.id === activeProject.customerId) : null;
  const activeTech = active ? data.technicians.find((t) => t.id === active.technicianId) : null;

  const columns = [
    { key: 'id', label: 'Job ID', sortValue: (r) => r.id, render: (r) => <span className="font-mono text-xs text-slate-500">{r.id.toUpperCase()}</span> },
    {
      key: 'project', label: 'Project / Customer', sortValue: (r) => data.projects.find((p) => p.id === r.projectId)?.code ?? '', render: (r) => {
        const proj = data.projects.find((p) => p.id === r.projectId);
        const cust = proj ? data.customers.find((c) => c.id === proj.customerId) : null;
        return <div><div className="font-medium text-navy-800">{proj?.code}</div><div className="text-xs text-slate-400">{cust?.name}</div></div>;
      },
    },
    {
      key: 'technician', label: 'Technician', sortValue: (r) => data.technicians.find((t) => t.id === r.technicianId)?.name ?? '', render: (r) => {
        const t = data.technicians.find((t) => t.id === r.technicianId);
        return t?.name ?? '—';
      },
    },
    { key: 'scheduledDate', label: 'Scheduled', sortValue: (r) => r.scheduledDate, render: (r) => fmtDate(r.scheduledDate) },
    { key: 'checklist', label: 'Checklist', render: (r) => `${r.checklist.filter((c) => c.done).length}/${r.checklist.length}` },
    { key: 'status', label: 'Status', sortValue: (r) => r.status, render: (r) => <StatusBadgeAuto status={r.status} /> },
  ];

  const schedule = () => {
    if (!form.projectId || !form.technicianId || !form.scheduledDate) return;
    const proj = data.projects.find((p) => p.id === form.projectId);
    if (!proj) return;
    const dispatch = data.dispatches.find((d) => d.projectId === proj.id);
    if (!dispatch || dispatch.status !== 'Delivered') { alert('Equipment must be delivered before installation can be scheduled.'); return; }
    const newInst = {
      id: genId('ins'),
      projectId: proj.id,
      technicianId: form.technicianId,
      scheduledDate: form.scheduledDate,
      status: 'Scheduled',
      photos: [],
      checklist: [
        { label: 'Panel mounting complete', done: false },
        { label: 'DC wiring complete', done: false },
        { label: 'Inverter commissioned', done: false },
        { label: 'Earthing verified', done: false },
        { label: 'Grid sync test', done: false },
      ],
      earthingConfirmed: false,
      customerAccepted: false,
    };
    setData((p) => ({ ...p, installations: [...p.installations, newInst] }));
    setAddOpen(false);
    setForm({ projectId: '', technicianId: '', scheduledDate: '' });
  };

  const toggleChecklist = (idx) => {
    if (!active) return;
    setData((p) => ({
      ...p,
      installations: p.installations.map((i) => i.id === active.id ? {
        ...i,
        checklist: i.checklist.map((c, ci) => ci === idx ? { ...c, done: !c.done } : c),
        status: i.checklist.every((c, ci) => ci === idx || c.done) && !i.checklist[idx].done ? 'Testing' : i.status,
      } : i),
    }));
  };

  const accept = () => {
    if (!acceptTarget) return;
    const today = new Date().toISOString().slice(0, 10);
    setData((p) => ({
      ...p,
      installations: p.installations.map((i) => i.id === acceptTarget.id ? { ...i, status: 'Accepted', customerAccepted: true, acceptedAt: today, acceptedByName: data.customers.find((c) => c.id === (data.projects.find((pr) => pr.id === i.projectId)?.customerId))?.name } : i),
      projects: p.projects.map((pr) => pr.id === acceptTarget.projectId ? { ...pr, status: 'Completed', completion: 100 } : pr),
    }));
    setAcceptTarget(null);
  };

  const eligibleProjects = data.projects.filter((p) => {
    const d = data.dispatches.find((d) => d.projectId === p.id);
    return d?.status === 'Delivered' && !data.installations.some((i) => i.projectId === p.id);
  });

  return (
    <PageContainer>
      <PageHeader
        title="Installation Management"
        description="Schedule installations, track checklist completion, confirm earthing, and capture customer digital acceptance."
        actions={<button className="btn-primary" onClick={() => setAddOpen(true)} disabled={eligibleProjects.length === 0}><Plus className="w-4 h-4" />Schedule Installation</button>}
      />

      {eligibleProjects.length === 0 && (
        <div className="mb-4"><AlertBanner type="info" message="No projects are ready for installation. Equipment must be delivered before an installation can be scheduled." /></div>
      )}

      <DataTable columns={columns} rows={data.installations} searchKeys={['id']} searchPlaceholder="Search installations..." onRowClick={setSelected} />

      {active && activeProject && activeCustomer && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title={`Installation ${active.id.toUpperCase()}`} description={`${activeProject.code} · ${activeCustomer.name}`} size="lg"
          footer={
            <>
              {active.status === 'Testing' && <button className="btn-emerald" onClick={() => setAcceptTarget(active)}><UserCheck className="w-4 h-4" />Customer Acceptance</button>}
              <button className="btn-ghost" onClick={() => setSelected(null)}>Close</button>
            </>
          }
        >
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="card p-3"><div className="text-xs text-slate-500">Status</div><div className="mt-1"><StatusBadgeAuto status={active.status} /></div></div>
              <div className="card p-3"><div className="text-xs text-slate-500">Technician</div><div className="text-sm font-medium text-navy-800 mt-1">{activeTech?.name ?? '—'}</div></div>
              <div className="card p-3"><div className="text-xs text-slate-500">Scheduled</div><div className="text-sm font-medium text-navy-800 mt-1">{fmtDate(active.scheduledDate)}</div></div>
              <div className="card p-3"><div className="text-xs text-slate-500">Progress</div><div className="text-sm font-medium text-navy-800 mt-1">{active.checklist.filter((c) => c.done).length}/{active.checklist.length}</div></div>
            </div>

            {active.status === 'Scheduled' && (
              <AlertBanner type="info" message="Toggle checklist items to mark progress. Once all items are verified, the status moves to Testing for customer acceptance." />
            )}

            <div>
              <h4 className="section-title text-sm mb-3 flex items-center gap-2"><FileCheck className="w-4 h-4 text-emerald-500" />Installation Checklist</h4>
              <div className="space-y-2">
                {active.checklist.map((c, i) => (
                  <button key={i} onClick={() => toggleChecklist(i)} className="w-full flex items-center gap-2 text-sm p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-left">
                    {c.done ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <div className="w-4 h-4 rounded border-2 border-slate-300" />}
                    <span className={c.done ? 'text-navy-700' : 'text-slate-500'}>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="card p-3">
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" />Earthing Confirmed</div>
                {active.earthingConfirmed ? <span className="badge-emerald">Verified</span> : <span className="badge-amber">Pending</span>}
              </div>
              <div className="card p-3">
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5" />Customer Acceptance</div>
                {active.customerAccepted ? <span className="badge-emerald">{active.acceptedByName} · {fmtDate(active.acceptedAt)}</span> : <span className="badge-amber">Awaiting</span>}
              </div>
            </div>

            <div>
              <h4 className="section-title text-sm mb-2 flex items-center gap-2"><Camera className="w-4 h-4 text-navy-500" />Installation Photos</h4>
              {active.photos.length === 0 ? (
                <div className="text-sm text-slate-400 p-4 rounded-lg border border-dashed border-slate-200 text-center">No photos uploaded yet.</div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {active.photos.map((p) => <div key={p} className="aspect-square rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400 border border-slate-200">{p}</div>)}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Schedule Installation"
        footer={<><button className="btn-outline" onClick={() => setAddOpen(false)}>Cancel</button><button className="btn-primary" onClick={schedule}>Schedule</button></>}
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
            <label className="label">Technician *</label>
            <select className="input" value={form.technicianId} onChange={(e) => setForm({ ...form, technicianId: e.target.value })}>
              <option value="">Select technician...</option>
              {data.technicians.map((t) => <option key={t.id} value={t.id}>{t.name} — {t.availability}</option>)}
            </select>
          </div>
          <div><label className="label">Scheduled Date *</label><input type="date" className="input" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} /></div>
        </div>
      </Modal>

      <ConfirmDialog open={!!acceptTarget} title="Confirm Customer Acceptance?" message="This will mark the installation as accepted by the customer, complete the project, and activate warranties." confirmLabel="Confirm Acceptance" onConfirm={accept} onCancel={() => setAcceptTarget(null)} />
    </PageContainer>
  );
}

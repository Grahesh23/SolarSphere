import { useState, useMemo } from 'react';
import { Plus, ClipboardCheck, CheckCircle2, XCircle, Calendar } from 'lucide-react';
import { useData } from '@/data/DataContext';
import { PageContainer } from '@/components/layout/MobileSidebar';
import { PageHeader } from '@/components/layout/Header';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadgeAuto, AlertBanner, EmptyState } from '@/components/ui/Status';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FileUploader } from '@/components/ui/FileUploader';
import { fmtDate, genId } from '@/lib/format';

export function RoofSurveyManagement() {
  const { data, setData } = useData();
  const [selected, setSelected] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  const activeSurvey = selected ? data.surveys.find((s) => s.id === selected.id) ?? selected : null;
  const activeProject = activeSurvey ? data.projects.find((p) => p.id === activeSurvey.projectId) : null;
  const activeCustomer = activeSurvey ? data.customers.find((c) => c.id === activeSurvey.customerId) : null;

  const columns = [
    { key: 'id', label: 'Survey ID', sortValue: (r) => r.id, render: (r) => <span className="font-mono text-xs text-slate-500">{r.id.toUpperCase()}</span> },
    {
      key: 'project', label: 'Project / Customer', sortValue: (r) => data.projects.find((p) => p.id === r.projectId)?.code ?? '', render: (r) => {
        const proj = data.projects.find((p) => p.id === r.projectId);
        const cust = data.customers.find((c) => c.id === r.customerId);
        return <div><div className="font-medium text-navy-800">{proj?.code}</div><div className="text-xs text-slate-400">{cust?.name}</div></div>;
      },
    },
    { key: 'scheduledDate', label: 'Scheduled', sortValue: (r) => r.scheduledDate, render: (r) => fmtDate(r.scheduledDate) },
    {
      key: 'technician', label: 'Technician', sortValue: (r) => data.technicians.find((t) => t.id === r.technicianId)?.name ?? '', render: (r) => {
        const t = data.technicians.find((t) => t.id === r.technicianId);
        return t?.name ?? '—';
      },
    },
    { key: 'usableArea', label: 'Usable Area', sortValue: (r) => r.usableArea, render: (r) => r.usableArea ? `${r.usableArea} m²` : '—' },
    { key: 'orientation', label: 'Orientation', render: (r) => r.orientation || '—' },
    { key: 'status', label: 'Status', sortValue: (r) => r.status, render: (r) => <StatusBadgeAuto status={r.status} /> },
    {
      key: 'actions', label: 'Actions', render: (r) => (
        <div className="flex items-center gap-1">
          {r.status === 'Submitted' && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setApproveTarget(r); }} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600" title="Approve"><CheckCircle2 className="w-4 h-4" /></button>
              <button onClick={(e) => { e.stopPropagation(); setRejectTarget(r); }} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600" title="Reject"><XCircle className="w-4 h-4" /></button>
            </>
          )}
        </div>
      ),
    },
  ];

  const approve = () => {
    if (!approveTarget) return;
    setData((p) => ({
      ...p,
      surveys: p.surveys.map((s) => s.id === approveTarget.id ? { ...s, status: 'Approved', approvedAt: new Date().toISOString().slice(0, 10), approvedBy: 'Administrator' } : s),
    }));
    setApproveTarget(null);
  };
  const reject = () => {
    if (!rejectTarget) return;
    setData((p) => ({ ...p, surveys: p.surveys.map((s) => s.id === rejectTarget.id ? { ...s, status: 'Rejected' } : s) }));
    setRejectTarget(null);
  };

  const [form, setForm] = useState({ projectId: '', technicianId: '', scheduledDate: '' });
  const schedule = () => {
    if (!form.projectId || !form.technicianId || !form.scheduledDate) return;
    const proj = data.projects.find((p) => p.id === form.projectId);
    if (!proj) return;
    const newSurvey = {
      id: genId('srv'), projectId: form.projectId, customerId: proj.customerId, technicianId: form.technicianId,
      scheduledDate: form.scheduledDate, status: 'Scheduled',
      roofLength: 0, roofWidth: 0, usableArea: 0, orientation: '', tilt: 0, shading: 'None',
      obstacles: [], cableDistance: 0, photos: [], remarks: '',
    };
    setData((p) => ({ ...p, surveys: [...p.surveys, newSurvey] }));
    setAddOpen(false);
    setForm({ projectId: '', technicianId: '', scheduledDate: '' });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Roof Survey Management"
        description="Schedule and review rooftop inspections. Quotation generation is locked until a survey is approved."
        actions={<button className="btn-primary" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" />Schedule Survey</button>}
      />

      <div className="mb-4">
        <AlertBanner type="info" message="Surveys must be approved before final quotation generation. Submitted surveys await approval below." />
      </div>

      <DataTable
        columns={columns}
        rows={data.surveys}
        searchKeys={['id', 'projectId']}
        searchPlaceholder="Search surveys..."
        onRowClick={setSelected}
      />

      {/* Survey detail */}
      {activeSurvey && activeProject && activeCustomer && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title={`Survey ${activeSurvey.id.toUpperCase()}`} description={`${activeProject.code} · ${activeCustomer.name}`} size="lg"
          footer={<>
            {activeSurvey.status === 'Submitted' && <><button className="btn-emerald" onClick={() => setApproveTarget(activeSurvey)}><CheckCircle2 className="w-4 h-4" />Approve</button><button className="btn-danger" onClick={() => setRejectTarget(activeSurvey)}><XCircle className="w-4 h-4" />Reject</button></>}
            <button className="btn-outline" onClick={() => setSelected(null)}>Close</button>
          </>}
        >
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Field label="Scheduled Date" value={fmtDate(activeSurvey.scheduledDate)} />
              <Field label="Technician" value={data.technicians.find((t) => t.id === activeSurvey.technicianId)?.name ?? '—'} />
              <Field label="Status" value={<StatusBadgeAuto status={activeSurvey.status} />} />
              <Field label="Approved" value={activeSurvey.approvedAt ? fmtDate(activeSurvey.approvedAt) : '—'} />
            </div>

            {activeSurvey.status !== 'Approved' && activeSurvey.status !== 'Rejected' && (
              <AlertBanner type="warning" message="This survey is not yet approved. Quotation generation remains blocked." />
            )}

            <div>
              <h4 className="section-title text-sm mb-2">Roof Measurements</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Field label="Length" value={activeSurvey.roofLength ? `${activeSurvey.roofLength} m` : '—'} />
                <Field label="Width" value={activeSurvey.roofWidth ? `${activeSurvey.roofWidth} m` : '—'} />
                <Field label="Usable Area" value={activeSurvey.usableArea ? `${activeSurvey.usableArea} m²` : '—'} />
                <Field label="Orientation" value={activeSurvey.orientation || '—'} />
                <Field label="Tilt" value={activeSurvey.tilt ? `${activeSurvey.tilt}°` : '—'} />
                <Field label="Shading" value={activeSurvey.shading} />
                <Field label="Cable Distance" value={activeSurvey.cableDistance ? `${activeSurvey.cableDistance} m` : '—'} />
              </div>
            </div>

            <div>
              <h4 className="section-title text-sm mb-2">Obstacles</h4>
              {activeSurvey.obstacles.length === 0 ? <p className="text-sm text-slate-400">None detected.</p> : (
                <div className="flex flex-wrap gap-2">{activeSurvey.obstacles.map((o) => <span key={o} className="badge-amber">{o}</span>)}</div>
              )}
            </div>

            {activeSurvey.photos.length > 0 && (
              <div>
                <h4 className="section-title text-sm mb-2">Rooftop Photos</h4>
                <div className="grid grid-cols-4 gap-2">
                  {activeSurvey.photos.map((p) => <div key={p} className="aspect-square rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400 border border-slate-200">{p}</div>)}
                </div>
              </div>
            )}

            <div>
              <h4 className="section-title text-sm mb-2">Technician Remarks</h4>
              <p className="text-sm text-slate-600">{activeSurvey.remarks || 'No remarks recorded.'}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Schedule survey */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Schedule Roof Survey" description="Assign a technician and date for the inspection."
        footer={<><button className="btn-outline" onClick={() => setAddOpen(false)}>Cancel</button><button className="btn-primary" onClick={schedule}>Schedule</button></>}
      >
        <div className="space-y-4">
          <div>
            <label className="label">Project *</label>
            <select className="input" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
              <option value="">Select project...</option>
              {data.projects.filter((p) => !data.surveys.some((s) => s.projectId === p.id && s.status !== 'Rejected')).map((p) => {
                const c = data.customers.find((c) => c.id === p.customerId);
                return <option key={p.id} value={p.id}>{p.code} — {c?.name}</option>;
              })}
            </select>
          </div>
          <div>
            <label className="label">Technician *</label>
            <select className="input" value={form.technicianId} onChange={(e) => setForm({ ...form, technicianId: e.target.value })}>
              <option value="">Select technician...</option>
              {data.technicians.map((t) => <option key={t.id} value={t.id}>{t.name} — {t.availability}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Scheduled Date *</label>
            <input type="date" className="input" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!approveTarget} title="Approve Survey?" message="Approving this survey will unlock quotation generation for the project."
        confirmLabel="Approve" tone="default" onConfirm={approve} onCancel={() => setApproveTarget(null)}
      />
      <ConfirmDialog
        open={!!rejectTarget} title="Reject Survey?" message="The survey will be marked rejected and a new survey must be scheduled."
        confirmLabel="Reject" tone="danger" onConfirm={reject} onCancel={() => setRejectTarget(null)}
      />
    </PageContainer>
  );
}

function Field({ label, value }) {
  return <div className="card p-3"><div className="text-xs text-slate-500 mb-1">{label}</div><div className="text-sm font-medium text-navy-800">{value}</div></div>;
}

import { useState } from 'react';
import { Plus, ClipboardCheck, CheckCircle2, XCircle } from 'lucide-react';
import { PageContainer } from '@/components/layout/MobileSidebar';
import { PageHeader } from '@/components/layout/Header';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadgeAuto, AlertBanner, EmptyState } from '@/components/ui/Status';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { fmtDate } from '@/lib/format';
import { useWorkflow } from '@/data/WorkflowContext';
import { useAuth } from '@/data/AuthContext';

export function RoofSurveyManagement() {
  const { user } = useAuth();
  const { customers, projects, surveys, error, loading, request, refresh } = useWorkflow();
  const [selected, setSelected] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [measureTarget, setMeasureTarget] = useState(null);
  const [measurements, setMeasurements] = useState({ roofLength: 0, roofWidth: 0, usableArea: 0, orientation: 'South', tilt: 0, shading: 'None', cableDistance: 0, remarks: '' });
  const [actionError, setActionError] = useState('');

  const activeSurvey = selected ? surveys.find((s) => s.id === selected.id) ?? selected : null;
  const activeProject = activeSurvey ? projects.find((p) => p.id === activeSurvey.projectId) : null;
  const activeCustomer = activeSurvey ? customers.find((c) => c.id === activeSurvey.customerId) : null;

  const columns = [
    { key: 'id', label: 'Survey ID', sortValue: (r) => r.id, render: (r) => <span className="font-mono text-xs text-slate-500">{r.id.toUpperCase()}</span> },
    {
      key: 'project', label: 'Project / Customer', sortValue: (r) => projects.find((p) => p.id === r.projectId)?.code ?? '', render: (r) => {
        const proj = projects.find((p) => p.id === r.projectId);
        const cust = customers.find((c) => c.id === r.customerId);
        return <div><div className="font-medium text-navy-800">{proj?.code}</div><div className="text-xs text-slate-400">{cust?.name}</div></div>;
      },
    },
    { key: 'scheduledDate', label: 'Scheduled', sortValue: (r) => r.scheduledDate, render: (r) => fmtDate(r.scheduledDate) },
    {
      key: 'technician', label: 'Assigned To', render: (r) => r.assignedTo || '—',
    },
    { key: 'usableArea', label: 'Usable Area', sortValue: (r) => r.usableArea, render: (r) => r.usableArea ? `${r.usableArea} m²` : '—' },
    { key: 'orientation', label: 'Orientation', render: (r) => r.orientation || '—' },
    { key: 'status', label: 'Status', sortValue: (r) => r.status, render: (r) => <StatusBadgeAuto status={r.status} /> },
    {
      key: 'actions', label: 'Actions', render: (r) => (
        <div className="flex items-center gap-1">
          {r.status === 'Submitted' && user?.role === 'Admin' && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setApproveTarget(r); }} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600" title="Approve"><CheckCircle2 className="w-4 h-4" /></button>
              <button onClick={(e) => { e.stopPropagation(); setRejectTarget(r); }} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600" title="Reject"><XCircle className="w-4 h-4" /></button>
            </>
          )}
        </div>
      ),
    },
  ];

  const approve = async () => {
    if (!approveTarget) return;
    try {
      await request(`/workflow/surveys/${approveTarget.id}/review`, { method: 'PATCH', body: JSON.stringify({ decision: 'approve' }) });
      await refresh();
      setApproveTarget(null);
    } catch (requestError) { setActionError(requestError.message); }
  };
  const reject = async () => {
    if (!rejectTarget) return;
    try {
      await request(`/workflow/surveys/${rejectTarget.id}/review`, { method: 'PATCH', body: JSON.stringify({ decision: 'reject' }) });
      await refresh();
      setRejectTarget(null);
    } catch (requestError) { setActionError(requestError.message); }
  };

  const [form, setForm] = useState({ customerId: '', technicianId: '', scheduledDate: '' });
  const schedule = async () => {
    if (!form.customerId || !form.scheduledDate) return;
    try {
      await request(`/workflow/enquiries/${form.customerId}/surveys`, { method: 'POST', body: JSON.stringify(form) });
      await refresh();
      setAddOpen(false);
      setForm({ customerId: '', technicianId: '', scheduledDate: '' });
    } catch (requestError) { setActionError(requestError.message); }
  };
  const submitMeasurements = async () => {
    if (!measureTarget) return;
    try {
      await request(`/workflow/surveys/${measureTarget.id}`, { method: 'PATCH', body: JSON.stringify(measurements) });
      await refresh();
      setMeasureTarget(null);
      setSelected(null);
    } catch (requestError) { setActionError(requestError.message); }
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
      {(error || actionError) && <div className="card p-3 mb-4 bg-rose-50 text-sm text-rose-700">{actionError || error}</div>}

      {loading ? <div className="card p-8 text-center text-slate-500">Loading surveys...</div> : <DataTable
        columns={columns}
        rows={surveys}
        searchKeys={['id', 'projectId']}
        searchPlaceholder="Search surveys..."
        onRowClick={setSelected}
      />}

      {/* Survey detail */}
      {activeSurvey && activeProject && activeCustomer && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title={`Survey ${activeSurvey.id.toUpperCase()}`} description={`${activeProject.code} · ${activeCustomer.name}`} size="lg"
          footer={<>
            {['Scheduled', 'In Progress'].includes(activeSurvey.status) && <button className="btn-primary" onClick={() => { setMeasurements({ roofLength: activeSurvey.roofLength, roofWidth: activeSurvey.roofWidth, usableArea: activeSurvey.usableArea, orientation: activeSurvey.orientation || 'South', tilt: activeSurvey.tilt, shading: activeSurvey.shading || 'None', cableDistance: activeSurvey.cableDistance, remarks: activeSurvey.remarks || '' }); setMeasureTarget(activeSurvey); }}>Submit Measurements</button>}
            {activeSurvey.status === 'Submitted' && user?.role === 'Admin' && <><button className="btn-emerald" onClick={() => setApproveTarget(activeSurvey)}><CheckCircle2 className="w-4 h-4" />Approve</button><button className="btn-danger" onClick={() => setRejectTarget(activeSurvey)}><XCircle className="w-4 h-4" />Reject</button></>}
            <button className="btn-outline" onClick={() => setSelected(null)}>Close</button>
          </>}
        >
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Field label="Scheduled Date" value={fmtDate(activeSurvey.scheduledDate)} />
              <Field label="Technician" value={activeSurvey.assignedTo || '—'} />
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
            <label className="label">Enquiry *</label>
            <select className="input" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
              <option value="">Select enquiry...</option>
              {customers.filter((c) => !surveys.some((s) => s.customerId === c.id && s.status !== 'Rejected')).map((c) => (
                <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Assigned Surveyor</label>
            <input className="input" value={form.technicianId} onChange={(e) => setForm({ ...form, technicianId: e.target.value })} placeholder="Surveyor name (optional)" />
          </div>
          <div>
            <label className="label">Scheduled Date *</label>
            <input type="date" className="input" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} />
          </div>
        </div>
      </Modal>

      <Modal open={!!measureTarget} onClose={() => setMeasureTarget(null)} title="Submit Roof Measurements" description="Submitting sends the survey to an administrator for approval."
        footer={<><button className="btn-outline" onClick={() => setMeasureTarget(null)}>Cancel</button><button className="btn-primary" onClick={submitMeasurements}>Submit for Approval</button></>}>
        <div className="grid grid-cols-2 gap-3">
          {[
            ['roofLength', 'Roof length (m)'], ['roofWidth', 'Roof width (m)'], ['usableArea', 'Usable area (m²)'],
            ['tilt', 'Tilt (degrees)'], ['cableDistance', 'Cable distance (m)'],
          ].map(([field, label]) => <div key={field}><label className="label">{label}</label><input type="number" min="0" className="input" value={measurements[field]} onChange={(e) => setMeasurements({ ...measurements, [field]: Number(e.target.value) })} /></div>)}
          <div><label className="label">Orientation</label><select className="input" value={measurements.orientation} onChange={(e) => setMeasurements({ ...measurements, orientation: e.target.value })}>{['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'].map((value) => <option key={value}>{value}</option>)}</select></div>
          <div><label className="label">Shading</label><select className="input" value={measurements.shading} onChange={(e) => setMeasurements({ ...measurements, shading: e.target.value })}>{['None', 'Low', 'Moderate', 'High'].map((value) => <option key={value}>{value}</option>)}</select></div>
          <div className="col-span-2"><label className="label">Survey notes</label><textarea className="input" rows={3} value={measurements.remarks} onChange={(e) => setMeasurements({ ...measurements, remarks: e.target.value })} /></div>
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

import { useState, useMemo } from 'react';
import {
  ClipboardList, Calendar, MapPin, FileText, CheckCircle2,
  Clock, Save, AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/data/AuthContext';
import { useWorkflow } from '@/data/WorkflowContext';
import { PortalLayout, PageContainer, PageHeader } from '@/components/layout/PortalLayout';
import { SolarConfigurationIntelligence } from '@/pages/SolarConfigurationIntelligence';
import { KpiCard } from '@/components/ui/KpiCard';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { StatusBadgeAuto, AlertBanner } from '@/components/ui/Status';
import { fmtDate, fmtINR, fmtNum } from '@/lib/format';
import { getVisibleSurveysForSurveyor } from '@/lib/surveyAccess';

export function SurveyorPortal() {
  const [active, setActive] = useState('dashboard');
  return (
    <PortalLayout active={active} onNavigate={setActive}>
      <SurveyorPage active={active} onNavigate={setActive} />
    </PortalLayout>
  );
}

function SurveyorPage({ active, onNavigate }) {
  switch (active) {
    case 'dashboard': return <SurveyDashboard onNavigate={onNavigate} />;
    case 'assigned': return <AssignedSurveysPage />;
    case 'calendar': return <CalendarPage />;
    case 'measurements': return <MeasurementsPage />;
    case 'solar-configuration': return <SolarConfigurationIntelligence />;
    case 'reports': return <ReportsPage />;
    case 'completed': return <CompletedPage />;
    default: return <SurveyDashboard onNavigate={onNavigate} />;
  }
}

function useMySurveys() {
  const { surveys, projects, customers, loading, error, request, refresh } = useWorkflow();
  const { user } = useAuth();
  const mySurveys = useMemo(() => {
    const surveyTechRoles = ['Surveyor', 'SURVEY_TECHNICIAN'];
    if (!surveyTechRoles.includes(user?.role)) return [];

    return getVisibleSurveysForSurveyor({ surveys, user });
  }, [surveys, user]);
  return { surveys: mySurveys, projects, customers, loading, error, request, refresh };
}

function SurveyDashboard({ onNavigate }) {
  const { surveys: mySurveys, projects, customers, loading, error } = useMySurveys();
  const assigned = mySurveys.length;
  const now = new Date();
  const todayDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const today = mySurveys.filter((s) => s.scheduledDate === todayDate).length;
  const pending = mySurveys.filter((s) => s.status === 'Scheduled' || s.status === 'In Progress').length;
  const awaiting = mySurveys.filter((s) => s.status === 'Submitted').length;

  return (
    <PageContainer>
      <PageHeader title="Survey Dashboard" description="Your assigned surveys, today's inspections, and pending reports." />
      {error && <div className="card p-3 mb-4 bg-rose-50 text-sm text-rose-700">{error}</div>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Surveys Assigned" value={assigned} icon={ClipboardList} tone="navy" onClick={() => onNavigate('assigned')} />
        <KpiCard label="Today's Inspections" value={today} icon={Clock} tone="amber" />
        <KpiCard label="Pending Inspections" value={pending} icon={Calendar} tone="rose" onClick={() => onNavigate('assigned')} />
        <KpiCard label="Awaiting Approval" value={awaiting} icon={CheckCircle2} tone="emerald" onClick={() => onNavigate('reports')} />
      </div>

      <div className="card p-5">
        <h3 className="section-title mb-3">Upcoming Surveys</h3>
        {loading ? <p className="text-sm text-slate-400">Loading surveys...</p> : (
          <div className="space-y-2">
            {mySurveys.filter((s) => s.status === 'Scheduled').slice(0, 5).map((s) => {
              const project = projects.find((p) => p.id === s.projectId);
              const customer = customers.find((c) => c.id === s.customerId);
              return (
                <div key={s.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50">
                  <div>
                    <div className="font-medium text-navy-800 text-sm">{customer?.name || 'Customer'} · {project?.code || 'Project'}</div>
                    <div className="text-xs text-slate-500">{fmtDate(s.scheduledDate)} · {[customer?.address, customer?.city, customer?.state].filter(Boolean).join(', ') || 'Location not provided'}</div>
                  </div>
                  <StatusBadgeAuto status={s.status} />
                </div>
              );
            })}
            {mySurveys.filter((s) => s.status === 'Scheduled').length === 0 && <p className="text-sm text-slate-400">No scheduled surveys.</p>}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function AssignedSurveysPage() {
  const { surveys: mySurveys, projects, customers, loading, error } = useMySurveys();
  const [selected, setSelected] = useState(null);
  const columns = [
    { key: 'scheduledDate', label: 'Date', sortValue: (r) => r.scheduledDate, render: (r) => fmtDate(r.scheduledDate) },
    {
      key: 'project', label: 'Project / Customer', sortValue: (r) => customers.find((c) => c.id === r.customerId)?.name ?? '', render: (r) => {
        const project = projects.find((p) => p.id === r.projectId);
        const customer = customers.find((c) => c.id === r.customerId);
        return <div><div className="font-medium text-navy-800">{customer?.name || 'Customer details unavailable'}</div><div className="text-xs text-slate-400">{project?.code || 'Project'} · {project?.capacity ?? customer?.desiredCapacity ?? '—'} kW</div></div>;
      },
    },
    {
      key: 'location', label: 'Location / Contact', render: (r) => {
        const customer = customers.find((c) => c.id === r.customerId);
        return <div><div>{[customer?.address, customer?.city, customer?.state].filter(Boolean).join(', ') || '—'}</div><div className="text-xs text-slate-400">{customer?.phone || customer?.email || '—'}</div></div>;
      },
    },
    { key: 'status', label: 'Status', sortValue: (r) => r.status, render: (r) => <StatusBadgeAuto status={r.status} /> },
  ];
  return (
    <PageContainer>
      <PageHeader title="Assigned Surveys" description="Scheduled inspections and customer details for your field visits." />
      {error && <div className="card p-3 mb-4 bg-rose-50 text-sm text-rose-700">{error}</div>}
      {loading ? <div className="card p-8 text-center text-slate-500">Loading surveys...</div> : (
        <DataTable columns={columns} rows={mySurveys} searchKeys={['id', 'projectId', 'customerId']} searchPlaceholder="Search surveys..." emptyMessage="No surveys are assigned to you or awaiting assignment." onRowClick={setSelected} />
      )}
      {selected && (() => {
        const project = projects.find((p) => p.id === selected.projectId);
        const customer = customers.find((c) => c.id === selected.customerId);
        return (
          <Modal open onClose={() => setSelected(null)} title={`Survey ${selected.id.toUpperCase()}`} description={`${customer?.name || 'Customer'} · ${project?.code || 'Project'}`} size="lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Detail label="Scheduled date" value={fmtDate(selected.scheduledDate)} />
              <Detail label="Status" value={<StatusBadgeAuto status={selected.status} />} />
              <Detail label="Customer" value={customer?.name || '—'} />
              <Detail label="Phone / Email" value={[customer?.phone, customer?.email].filter(Boolean).join(' · ') || '—'} />
              <Detail label="Address" value={[customer?.address, customer?.city, customer?.state, customer?.pincode].filter(Boolean).join(', ') || '—'} />
              <Detail label="System size" value={`${project?.capacity ?? customer?.desiredCapacity ?? '—'} kW`} />
              <Detail label="Monthly electricity bill" value={customer?.monthlyBill ? fmtINR(customer.monthlyBill) : '—'} />
              <Detail label="Monthly consumption" value={customer?.electricityConsumption ? `${customer.electricityConsumption} kWh` : '—'} />
              <Detail label="Assigned surveyor" value={selected.assignedTo || 'Unassigned'} />
            </div>
          </Modal>
        );
      })()}
    </PageContainer>
  );
}

function Detail({ label, value }) {
  return (
    <div className="card p-3">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="text-sm font-medium text-navy-800">{value}</div>
    </div>
  );
}

function CalendarPage() {
  const { surveys: mySurveys, projects, customers } = useMySurveys();
  const sorted = [...mySurveys].sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  return (
    <PageContainer>
      <PageHeader title="Survey Calendar" description="Your survey schedule timeline." />
      <div className="space-y-3">
        {sorted.map((s) => {
          const project = projects.find((p) => p.id === s.projectId);
          const customer = customers.find((c) => c.id === s.customerId);
          return (
            <div key={s.id} className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-grape-50 text-grape-600 flex flex-col items-center justify-center shrink-0">
                <span className="text-xs font-medium">{new Date(s.scheduledDate).toLocaleDateString('en-IN', { month: 'short' })}</span>
                <span className="text-lg font-bold">{new Date(s.scheduledDate).getDate()}</span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-navy-800">{customer?.name || 'Customer'} — {project?.code || 'Project'}</div>
                <div className="text-xs text-slate-500">{[customer?.address, customer?.city, customer?.state].filter(Boolean).join(', ') || 'Location not provided'} · {customer?.phone || customer?.email || 'No contact details'}</div>
              </div>
              <StatusBadgeAuto status={s.status} />
            </div>
          );
        })}
      </div>
      {sorted.length === 0 && <div className="card p-6 text-sm text-slate-500">No surveys in your schedule.</div>}
    </PageContainer>
  );
}

function MeasurementsPage() {
  const { surveys: mySurveys, projects, customers, error, request, refresh } = useMySurveys();
  const [selected, setSelected] = useState(null);
  const [actionError, setActionError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ roofLength: 0, roofWidth: 0, usableArea: 0, orientation: 'South', tilt: 22, cableDistance: 10, shading: 'None', obstacles: '', remarks: '' });

  const openMeasure = (survey) => {
    setSelected(survey);
    setForm({ roofLength: survey.roofLength, roofWidth: survey.roofWidth, usableArea: survey.usableArea, orientation: survey.orientation || 'South', tilt: survey.tilt, cableDistance: survey.cableDistance, shading: survey.shading || 'None', obstacles: (survey.obstacles || []).join(', '), remarks: survey.remarks || '' });
  };
  const submitMeasurements = async () => {
    if (!selected) return;
    setSaving(true);
    setActionError('');
    try {
      await request(`/workflow/surveys/${selected.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ ...form, obstacles: form.obstacles.split(',').map((item) => item.trim()).filter(Boolean) }),
      });
      await refresh();
      setSelected(null);
    } catch (submitError) {
      setActionError(submitError.message || 'Could not submit survey measurements.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader title="Roof Measurements" description="Record and submit field measurements for scheduled surveys." />
      {(error || actionError) && <div className="card p-3 mb-4 bg-rose-50 text-sm text-rose-700">{actionError || error}</div>}
      <div className="space-y-2">
        {mySurveys.filter((s) => s.status !== 'Approved' && s.status !== 'Rejected').map((s) => {
          const project = projects.find((p) => p.id === s.projectId);
          const customer = customers.find((c) => c.id === s.customerId);
          return (
            <div key={s.id} className="card p-4 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="font-medium text-navy-800">{customer?.name || 'Customer'} — {project?.code || 'Project'}</div>
                <div className="text-xs text-slate-500">{[customer?.address, customer?.city, customer?.state].filter(Boolean).join(', ') || 'Location not provided'} · {fmtDate(s.scheduledDate)}</div>
                <div className="text-xs text-slate-500">Usable: {s.usableArea}m² · {s.orientation || '—'} · Tilt: {s.tilt}°</div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadgeAuto status={s.status} />
                <button className="btn-outline" onClick={() => openMeasure(s)}><MapPin className="w-4 h-4" />Record Measurements</button>
              </div>
            </div>
          );
        })}
        {mySurveys.filter((s) => s.status !== 'Approved' && s.status !== 'Rejected').length === 0 && <div className="card p-6 text-sm text-slate-500">No surveys need measurements.</div>}
      </div>
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Submit Roof Measurements" description="Submitting sends the survey to an administrator for approval."
        footer={<><button className="btn-outline" onClick={() => setSelected(null)} disabled={saving}>Cancel</button><button className="btn-primary" onClick={submitMeasurements} disabled={saving}><Save className="w-4 h-4" />{saving ? 'Submitting...' : 'Submit for Approval'}</button></>}>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Roof Length (m)</label><input type="number" min="0" className="input" value={form.roofLength} onChange={(e) => setForm({ ...form, roofLength: Number(e.target.value) })} /></div>
          <div><label className="label">Roof Width (m)</label><input type="number" min="0" className="input" value={form.roofWidth} onChange={(e) => setForm({ ...form, roofWidth: Number(e.target.value) })} /></div>
          <div><label className="label">Usable Area (m²)</label><input type="number" min="0" className="input" value={form.usableArea} onChange={(e) => setForm({ ...form, usableArea: Number(e.target.value) })} /></div>
          <div><label className="label">Orientation</label><select className="input" value={form.orientation} onChange={(e) => setForm({ ...form, orientation: e.target.value })}><option>South</option><option>East</option><option>West</option><option>North</option></select></div>
          <div><label className="label">Tilt (degrees)</label><input type="number" min="0" className="input" value={form.tilt} onChange={(e) => setForm({ ...form, tilt: Number(e.target.value) })} /></div>
          <div><label className="label">Cable Distance (m)</label><input type="number" min="0" className="input" value={form.cableDistance} onChange={(e) => setForm({ ...form, cableDistance: Number(e.target.value) })} /></div>
          <div><label className="label">Shading</label><select className="input" value={form.shading} onChange={(e) => setForm({ ...form, shading: e.target.value })}><option>None</option><option>Low</option><option>Moderate</option><option>High</option></select></div>
          <div><label className="label">Obstacles (comma separated)</label><input className="input" value={form.obstacles} onChange={(e) => setForm({ ...form, obstacles: e.target.value })} /></div>
          <div className="col-span-2"><label className="label">Remarks</label><textarea className="input" rows={2} value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></div>
        </div>
      </Modal>
    </PageContainer>
  );
}

function ReportsPage() {
  const { surveys: mySurveys, projects, customers } = useMySurveys();
  return (
    <PageContainer>
      <PageHeader title="Survey Reports" description="Review submitted survey reports and approval status." />
      <div className="space-y-2">
        {mySurveys.filter((s) => s.status === 'Submitted' || s.status === 'Approved' || s.status === 'Rejected').map((s) => {
          const project = projects.find((p) => p.id === s.projectId);
          const customer = customers.find((c) => c.id === s.customerId);
          return (
            <div key={s.id} className="card p-4 flex items-start justify-between gap-3">
              <div>
                <div className="font-medium text-navy-800">{customer?.name || 'Customer'} — {project?.code || 'Project'}</div>
                <div className="text-xs text-slate-500 mt-1">{s.usableArea}m² usable · {s.orientation} · {s.tilt}° tilt · {s.cableDistance}m cable</div>
                {s.shading !== 'None' && <div className="text-xs text-amber-600 mt-0.5">Shading: {s.shading} · {(s.obstacles || []).join(', ')}</div>}
                {s.remarks && <div className="text-xs text-slate-500 mt-1">{s.remarks}</div>}
              </div>
              <div className="text-right">
                <StatusBadgeAuto status={s.status} />
                {s.approvedBy && <div className="text-xs text-slate-400 mt-1">By {s.approvedBy} · {fmtDate(s.approvedAt)}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}

function CompletedPage() {
  const { surveys: mySurveys, projects, customers } = useMySurveys();
  const done = mySurveys.filter((s) => s.status === 'Approved');
  return (
    <PageContainer>
      <PageHeader title="Completed Surveys" description="Approved surveys you have completed." />
      <div className="space-y-2">
        {done.map((s) => {
          const project = projects.find((p) => p.id === s.projectId);
          const customer = customers.find((c) => c.id === s.customerId);
          return (
            <div key={s.id} className="card p-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-navy-800">{customer?.name || 'Customer'} — {project?.code || 'Project'}</div>
                <div className="text-xs text-slate-500">{fmtNum(s.usableArea)}m² · Approved {fmtDate(s.approvedAt)}</div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}

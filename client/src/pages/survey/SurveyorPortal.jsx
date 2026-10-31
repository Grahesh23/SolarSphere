import { useState, useMemo } from 'react';
import {
  ClipboardList, Calendar, MapPin, Image, Satellite, FileText, CheckCircle2,
  Clock, Plus, Save, AlertCircle, Upload,
} from 'lucide-react';
import { useData } from '@/data/DataContext';
import { useAuth } from '@/data/AuthContext';
import { PortalLayout, PageContainer, PageHeader } from '@/components/layout/PortalLayout';
import { KpiCard } from '@/components/ui/KpiCard';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { StatusBadgeAuto, AlertBanner } from '@/components/ui/Status';
import { fmtDate, daysBetween, fmtNum } from '@/lib/format';
import { RoofIntelligence } from '@/pages/RoofIntelligence';

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
    case 'upload': return <UploadPage />;
    case 'roof-intelligence': return <RoofIntelligence />;
    case 'reports': return <ReportsPage />;
    case 'completed': return <CompletedPage />;
    default: return <SurveyDashboard onNavigate={onNavigate} />;
  }
}

function useMySurveys() {
  const { data } = useData();
  const { user } = useAuth();
  return useMemo(() => {
    const techId = user?.technicianId;
    const byId = data.surveys.filter((s) => s.technicianId === techId);
    const byName = data.surveys.filter((s) => {
      const tech = data.technicians.find((t) => t.id === s.technicianId);
      return tech?.name === user?.name;
    });
    return byId.length > 0 ? byId : byName.length > 0 ? byName : data.surveys;
  }, [data.surveys, data.technicians, user]);
}

function SurveyDashboard({ onNavigate }) {
  const mySurveys = useMySurveys();
  const assigned = mySurveys.length;
  const today = mySurveys.filter((s) => daysBetween(s.scheduledDate, '2026-10-31') === 0).length;
  const pending = mySurveys.filter((s) => s.status === 'Scheduled' || s.status === 'In Progress').length;
  const submitted = mySurveys.filter((s) => s.status === 'Submitted').length;
  const awaiting = mySurveys.filter((s) => s.status === 'Submitted').length;

  return (
    <PageContainer>
      <PageHeader title="Survey Dashboard" description="Your assigned surveys, today's inspections, and pending reports." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Surveys Assigned" value={assigned} icon={ClipboardList} tone="navy" onClick={() => onNavigate('assigned')} />
        <KpiCard label="Today's Inspections" value={today} icon={Clock} tone="amber" />
        <KpiCard label="Pending Inspections" value={pending} icon={Calendar} tone="rose" onClick={() => onNavigate('assigned')} />
        <KpiCard label="Awaiting Approval" value={awaiting} icon={CheckCircle2} tone="emerald" onClick={() => onNavigate('reports')} />
      </div>

      <div className="card p-5">
        <h3 className="section-title mb-3">Upcoming Surveys</h3>
        <div className="space-y-2">
          {mySurveys.filter((s) => s.status === 'Scheduled').slice(0, 5).map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50">
              <div>
                <div className="font-medium text-navy-800 text-sm">{s.id}</div>
                <div className="text-xs text-slate-500">{fmtDate(s.scheduledDate)}</div>
              </div>
              <StatusBadgeAuto status={s.status} />
            </div>
          ))}
          {mySurveys.filter((s) => s.status === 'Scheduled').length === 0 && <p className="text-sm text-slate-400">No scheduled surveys.</p>}
        </div>
      </div>
    </PageContainer>
  );
}

function AssignedSurveysPage() {
  const mySurveys = useMySurveys();
  const { data } = useData();
  const columns = [
    { key: 'scheduledDate', label: 'Date', sortValue: (r) => r.scheduledDate, render: (r) => fmtDate(r.scheduledDate) },
    { key: 'project', label: 'Project', sortValue: (r) => r.projectId, render: (r) => { const p = data.projects.find((p) => p.id === r.projectId); const c = data.customers.find((c) => c.id === r.customerId); return <div><div className="font-medium text-navy-800">{p?.code}</div><div className="text-xs text-slate-400">{c?.name}</div></div>; } },
    { key: 'location', label: 'Location', render: (r) => { const p = data.projects.find((p) => p.id === r.projectId); return p?.location ?? '—'; } },
    { key: 'status', label: 'Status', sortValue: (r) => r.status, render: (r) => <StatusBadgeAuto status={r.status} /> },
  ];
  return (
    <PageContainer>
      <PageHeader title="Assigned Surveys" description="Surveys assigned to you for field inspection." />
      <DataTable columns={columns} rows={mySurveys} searchKeys={[]} searchPlaceholder="Search surveys..." />
    </PageContainer>
  );
}

function CalendarPage() {
  const mySurveys = useMySurveys();
  const sorted = [...mySurveys].sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  return (
    <PageContainer>
      <PageHeader title="Survey Calendar" description="Your survey schedule timeline." />
      <div className="space-y-3">
        {sorted.map((s) => {
          const p = data_projects_lookup(s.projectId);
          const c = data_customers_lookup(s.customerId);
          return (
            <div key={s.id} className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-grape-50 text-grape-600 flex flex-col items-center justify-center shrink-0">
                <span className="text-xs font-medium">{new Date(s.scheduledDate).toLocaleDateString('en-IN', { month: 'short' })}</span>
                <span className="text-lg font-bold">{new Date(s.scheduledDate).getDate()}</span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-navy-800">{p?.code} — {c?.name}</div>
                <div className="text-xs text-slate-500">{p?.location}</div>
              </div>
              <StatusBadgeAuto status={s.status} />
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}

function data_projects_lookup(id) {
  const { data } = useData();
  return data.projects.find((p) => p.id === id);
}
function data_customers_lookup(id) {
  const { data } = useData();
  return data.customers.find((c) => c.id === id);
}

function MeasurementsPage() {
  const mySurveys = useMySurveys();
  const { data, setData } = useData();
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ roofLength: 0, roofWidth: 0, usableArea: 0, orientation: 'South', tilt: 22, cableDistance: 10, shading: 'None', obstacles: '', remarks: '' });

  const openMeasure = (s) => { setSelected(s); setForm({ roofLength: s.roofLength, roofWidth: s.roofWidth, usableArea: s.usableArea, orientation: s.orientation || 'South', tilt: s.tilt, cableDistance: s.cableDistance, shading: s.shading, obstacles: s.obstacles.join(', '), remarks: s.remarks }); };
  const save = () => {
    if (!selected) return;
    setData((p) => ({ ...p, surveys: p.surveys.map((s) => s.id === selected.id ? { ...s, ...form, obstacles: form.obstacles.split(',').map((o) => o.trim()).filter(Boolean), status: s.status === 'Scheduled' ? 'In Progress' : s.status } : s) }));
    setSelected(null);
  };
  const submit = (s) => {
    setData((p) => ({ ...p, surveys: p.surveys.map((sv) => sv.id === s.id ? { ...sv, status: 'Submitted' } : sv) }));
  };

  return (
    <PageContainer>
      <PageHeader title="Roof Measurements" description="Record field measurements for assigned surveys." />
      <div className="space-y-2">
        {mySurveys.filter((s) => s.status !== 'Approved' && s.status !== 'Rejected').map((s) => {
          const p = data.projects.find((p) => p.id === s.projectId);
          const c = data.customers.find((c) => c.id === s.customerId);
          return (
            <div key={s.id} className="card p-4 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="font-medium text-navy-800">{p?.code} — {c?.name}</div>
                <div className="text-xs text-slate-500">Usable: {s.usableArea}m² · {s.orientation || '—'} · Tilt: {s.tilt}°</div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadgeAuto status={s.status} />
                <button className="btn-outline" onClick={() => openMeasure(s)}><MapPin className="w-4 h-4" />Measure</button>
                {s.status === 'In Progress' && s.usableArea > 0 && <button className="btn-emerald" onClick={() => submit(s)}><CheckCircle2 className="w-4 h-4" />Submit</button>}
              </div>
            </div>
          );
        })}
      </div>
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Roof Measurements" description="Record field measurements and observations."
        footer={<><button className="btn-outline" onClick={() => setSelected(null)}>Cancel</button><button className="btn-primary" onClick={save}><Save className="w-4 h-4" />Save</button></>}>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Roof Length (m)</label><input type="number" className="input" value={form.roofLength} onChange={(e) => setForm({ ...form, roofLength: Number(e.target.value) })} /></div>
          <div><label className="label">Roof Width (m)</label><input type="number" className="input" value={form.roofWidth} onChange={(e) => setForm({ ...form, roofWidth: Number(e.target.value) })} /></div>
          <div><label className="label">Usable Area (m²)</label><input type="number" className="input" value={form.usableArea} onChange={(e) => setForm({ ...form, usableArea: Number(e.target.value) })} /></div>
          <div><label className="label">Orientation</label><select className="input" value={form.orientation} onChange={(e) => setForm({ ...form, orientation: e.target.value })}><option>South</option><option>East</option><option>West</option><option>North</option></select></div>
          <div><label className="label">Tilt (degrees)</label><input type="number" className="input" value={form.tilt} onChange={(e) => setForm({ ...form, tilt: Number(e.target.value) })} /></div>
          <div><label className="label">Cable Distance (m)</label><input type="number" className="input" value={form.cableDistance} onChange={(e) => setForm({ ...form, cableDistance: Number(e.target.value) })} /></div>
          <div><label className="label">Shading</label><select className="input" value={form.shading} onChange={(e) => setForm({ ...form, shading: e.target.value })}><option>None</option><option>Low</option><option>Moderate</option><option>High</option></select></div>
          <div><label className="label">Obstacles (comma separated)</label><input className="input" value={form.obstacles} onChange={(e) => setForm({ ...form, obstacles: e.target.value })} /></div>
          <div className="col-span-2"><label className="label">Remarks</label><textarea className="input" rows={2} value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></div>
        </div>
      </Modal>
    </PageContainer>
  );
}

function UploadPage() {
  const mySurveys = useMySurveys();
  const { data, setData } = useData();
  const [selected, setSelected] = useState(null);

  const addPhoto = (s, url) => {
    setData((p) => ({ ...p, surveys: p.surveys.map((sv) => sv.id === s.id ? { ...sv, photos: [...sv.photos, url] } : sv) }));
    setSelected(null);
  };

  return (
    <PageContainer>
      <PageHeader title="Roof Image Upload" description="Upload rooftop photographs for assigned surveys." />
      <div className="space-y-3">
        {mySurveys.filter((s) => s.status !== 'Approved').map((s) => {
          const p = data.projects.find((p) => p.id === s.projectId);
          return (
            <div key={s.id} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium text-navy-800">{p?.code}</div>
                <span className="text-xs text-slate-500">{s.photos.length} photo(s)</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {s.photos.map((ph, i) => (
                  <div key={i} className="w-20 h-20 rounded-lg bg-slate-200 flex items-center justify-center text-xs text-slate-500">{ph}</div>
                ))}
                <button className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-600" onClick={() => setSelected(s)}><Plus className="w-5 h-5" /></button>
              </div>
            </div>
          );
        })}
      </div>
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Add Roof Photo" description="Upload a rooftop photograph."
        footer={<><button className="btn-outline" onClick={() => setSelected(null)}>Cancel</button><button className="btn-primary" onClick={() => selected && addPhoto(selected, `photo-${selected.photos.length + 1}.jpg`)}><Upload className="w-4 h-4" />Upload</button></>}>
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
          <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Click upload to add a photo placeholder.</p>
          <p className="text-xs text-slate-400 mt-1">In production, this connects to a file storage service.</p>
        </div>
      </Modal>
    </PageContainer>
  );
}

function ReportsPage() {
  const mySurveys = useMySurveys();
  const { data } = useData();
  return (
    <PageContainer>
      <PageHeader title="Survey Reports" description="Review submitted survey reports and approval status." />
      <div className="space-y-2">
        {mySurveys.filter((s) => s.status === 'Submitted' || s.status === 'Approved' || s.status === 'Rejected').map((s) => {
          const p = data.projects.find((p) => p.id === s.projectId);
          const c = data.customers.find((c) => c.id === s.customerId);
          return (
            <div key={s.id} className="card p-4 flex items-start justify-between gap-3">
              <div>
                <div className="font-medium text-navy-800">{p?.code} — {c?.name}</div>
                <div className="text-xs text-slate-500 mt-1">{s.usableArea}m² usable · {s.orientation} · {s.tilt}° tilt · {s.cableDistance}m cable</div>
                {s.shading !== 'None' && <div className="text-xs text-amber-600 mt-0.5">Shading: {s.shading} · {s.obstacles.join(', ')}</div>}
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
  const mySurveys = useMySurveys();
  const { data } = useData();
  const done = mySurveys.filter((s) => s.status === 'Approved');
  return (
    <PageContainer>
      <PageHeader title="Completed Surveys" description="Approved surveys you have completed." />
      <div className="space-y-2">
        {done.map((s) => {
          const p = data.projects.find((p) => p.id === s.projectId);
          const c = data.customers.find((c) => c.id === s.customerId);
          return (
            <div key={s.id} className="card p-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-navy-800">{p?.code} — {c?.name}</div>
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

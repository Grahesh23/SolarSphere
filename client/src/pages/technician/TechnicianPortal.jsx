import { useState, useMemo } from 'react';
import {
  ClipboardList, Calendar, FileText, PackageCheck, ScanLine, ClipboardCheck,
  Image, CheckCircle2, Clock, MapPin, Play, Camera, XCircle, AlertCircle, ArrowLeft,
} from 'lucide-react';
import { useData } from '@/data/DataContext';
import { useAuth } from '@/data/AuthContext';
import { PortalLayout, PageContainer, PageHeader } from '@/components/layout/PortalLayout';
import { RoofIntelligence } from '@/pages/RoofIntelligence';
import { KpiCard } from '@/components/ui/KpiCard';
import { Modal } from '@/components/ui/Modal';
import { StatusBadgeAuto, AlertBanner } from '@/components/ui/Status';
import { fmtDate, daysBetween, fmtNum } from '@/lib/format';
import { canStartInstallation, canCompleteInstallation, validateCapacity } from '@/lib/workflowRules';

export function TechnicianPortal() {
  const [active, setActive] = useState('dashboard');
  return (
    <PortalLayout active={active} onNavigate={setActive}>
      <TechnicianPage active={active} onNavigate={setActive} />
    </PortalLayout>
  );
}

function TechnicianPage({ active, onNavigate }) {
  switch (active) {
    case 'dashboard': return <TechDashboard onNavigate={onNavigate} />;
    case 'assigned': return <AssignedJobsPage />;
    case 'calendar': return <CalendarPage />;
    case 'job-details': return <JobDetailsPage />;
    case 'verify': return <VerifyPage />;
    case 'scan': return <ScanPage />;
    case 'checklist': return <ChecklistPage />;
    case 'photos': return <PhotosPage />;
    case 'commissioning': return <CommissioningPage />;
    case 'completion': return <CompletionPage />;
    case 'roof-intelligence': return <RoofIntelligence />;
    default: return <TechDashboard onNavigate={onNavigate} />;
  }
}

function useMyInstallations() {
  const { data } = useData();
  const { user } = useAuth();
  return useMemo(() => {
    const installationTechRoles = ['Technician', 'INSTALLATION_TECHNICIAN'];
    if (!installationTechRoles.includes(user?.role)) return [];

    const byId = data.installations.filter((i) => i.technicianId === user?.technicianId || i.technicianId === user?.id);
    const byName = data.installations.filter((i) => {
      const tech = data.technicians.find((t) => t.id === i.technicianId);
      return tech?.name === user?.name;
    });
    return byId.length > 0 ? byId : byName.length > 0 ? byName : [];
  }, [data.installations, data.technicians, user]);
}

function TechDashboard({ onNavigate }) {
  const myJobs = useMyInstallations();
  const assigned = myJobs.length;
  const today = myJobs.filter((i) => daysBetween(i.scheduledDate, '2026-10-31') === 0).length;
  const pending = myJobs.filter((i) => i.status === 'Scheduled').length;
  const inProgress = myJobs.filter((i) => i.status === 'In Progress' || i.status === 'Testing').length;
  const completed = myJobs.filter((i) => i.status === 'Completed' || i.status === 'Accepted').length;
  const delayed = myJobs.filter((i) => i.status === 'Scheduled' && daysBetween(i.scheduledDate, '2026-10-31') < 0).length;

  return (
    <PageContainer>
      <PageHeader title="My Dashboard" description="Your installation jobs, today's schedule, and work status." />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <KpiCard label="Assigned Jobs" value={assigned} icon={ClipboardList} tone="navy" onClick={() => onNavigate('assigned')} />
        <KpiCard label="Today's Jobs" value={today} icon={Clock} tone="amber" />
        <KpiCard label="Pending" value={pending} icon={Calendar} tone="rose" />
        <KpiCard label="In Progress" value={inProgress} icon={Play} tone="grape" onClick={() => onNavigate('assigned')} />
        <KpiCard label="Completed" value={completed} icon={CheckCircle2} tone="emerald" onClick={() => onNavigate('completion')} />
        <KpiCard label="Delayed" value={delayed} icon={AlertCircle} tone="rose" />
      </div>

      <div className="card p-5">
        <h3 className="section-title mb-3">Active Jobs</h3>
        <div className="space-y-2">
          {myJobs.filter((i) => i.status !== 'Accepted').slice(0, 5).map((i) => {
            const p = lookup_project(i.projectId);
            return (
              <div key={i.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50">
                <div><div className="font-medium text-navy-800 text-sm">{p?.code}</div><div className="text-xs text-slate-500">{fmtDate(i.scheduledDate)}</div></div>
                <StatusBadgeAuto status={i.status} />
              </div>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}

function AssignedJobsPage() {
  const myJobs = useMyInstallations();
  const { data, setData } = useData();
  const [active, setActive] = useState(null);

  const startJob = (i) => {
    const project = data.projects.find((p) => p.id === i.projectId);
    const dispatch = data.dispatches.find((d) => d.projectId === project?.id);
    const ready = canStartInstallation({
      installation: i,
      project,
      dispatch,
      payments: data.payments,
      equipment: data.equipment,
    });

    if (!ready.allowed) {
      alert(ready.reason);
      return;
    }

    const startedAt = new Date().toISOString();
    setData((p) => ({
      ...p,
      installations: p.installations.map((ins) => ins.id === i.id ? {
        ...ins,
        status: 'In Progress',
        startedAt,
        history: [...(ins.history || []), { action: 'Start Installation', at: startedAt }],
      } : ins),
    }));
    setActive(null);
  };

  return (
    <PageContainer>
      <PageHeader title="Assigned Jobs" description="Installation jobs assigned to you." />
      <div className="space-y-3">
        {myJobs.map((i) => {
          const p = data.projects.find((p) => p.id === i.projectId);
          const c = data.customers.find((c) => c.id === p?.customerId);
          return (
            <div key={i.id} className="card p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="font-medium text-navy-800">{p?.code} — {c?.name}</div>
                  <div className="text-xs text-slate-500">{p?.location} · {fmtDate(i.scheduledDate)}</div>
                </div>
                <StatusBadgeAuto status={i.status} />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button className="btn-outline" onClick={() => setActive(i)}><FileText className="w-4 h-4" />Details</button>
                {i.status === 'Scheduled' && <button className="btn-emerald" onClick={() => startJob(i)}><Play className="w-4 h-4" />Start</button>}
              </div>
            </div>
          );
        })}
      </div>
      {active && (
        <Modal open onClose={() => setActive(null)} title="Job Details" description={data.projects.find((p) => p.id === active.projectId)?.code}
          footer={<button className="btn-outline" onClick={() => setActive(null)}>Close</button>}>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Customer</span><span className="text-navy-800">{data.customers.find((c) => c.id === data.projects.find((p) => p.id === active.projectId)?.customerId)?.name}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Location</span><span className="text-navy-800">{data.projects.find((p) => p.id === active.projectId)?.location}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Capacity</span><span className="text-navy-800">{data.projects.find((p) => p.id === active.projectId)?.capacity} kW</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Grid Type</span><span className="text-navy-800">{data.projects.find((p) => p.id === active.projectId)?.gridType}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Scheduled</span><span className="text-navy-800">{fmtDate(active.scheduledDate)}</span></div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
}

function lookup_project(id) {
  const { data } = useData();
  return data.projects.find((p) => p.id === id);
}

function CalendarPage() {
  const myJobs = useMyInstallations();
  const sorted = [...myJobs].sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  return (
    <PageContainer>
      <PageHeader title="Installation Calendar" description="Your installation schedule timeline." />
      <div className="space-y-3">
        {sorted.map((i) => {
          const p = lookup_project(i.projectId);
          const c = data_customers_lookup(p?.customerId || '');
          return (
            <div key={i.id} className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex flex-col items-center justify-center shrink-0">
                <span className="text-xs font-medium">{new Date(i.scheduledDate).toLocaleDateString('en-IN', { month: 'short' })}</span>
                <span className="text-lg font-bold">{new Date(i.scheduledDate).getDate()}</span>
              </div>
              <div className="flex-1"><div className="font-medium text-navy-800">{p?.code} — {c?.name}</div><div className="text-xs text-slate-500">{p?.location}</div></div>
              <StatusBadgeAuto status={i.status} />
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}

function data_customers_lookup(id) {
  const { data } = useData();
  return data.customers.find((c) => c.id === id);
}

function JobDetailsPage() {
  const myJobs = useMyInstallations();
  const { data } = useData();
  return (
    <PageContainer>
      <PageHeader title="Job Details" description="View configuration and BOM for assigned jobs." />
      <div className="space-y-3">
        {myJobs.filter((i) => i.status !== 'Accepted').map((i) => {
          const p = data.projects.find((p) => p.id === i.projectId);
          const c = data.customers.find((c) => c.id === p?.customerId);
          const config = data.configs.find((c) => c.id === p?.configId);
          const quote = data.quotations.find((q) => q.id === p?.quotationId);
          return (
            <div key={i.id} className="card p-4">
              <div className="font-medium text-navy-800 mb-2">{p?.code} — {c?.name}</div>
              {config && (
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-3">
                  <div>Capacity: <span className="font-medium text-navy-700">{config.recommendedCapacity} kW</span></div>
                  <div>Type: <span className="font-medium text-navy-700">{config.gridType}</span></div>
                  <div>Panels: <span className="font-medium text-navy-700">{config.panelCount} × {config.panelModel}</span></div>
                  <div>Inverter: <span className="font-medium text-navy-700">{config.inverterModel}</span></div>
                </div>
              )}
              {quote && (
                <div className="text-xs text-slate-500">BOM: {quote.items.length} components · {fmtNum(quote.items.reduce((s, i) => s + i.qty, 0))} units total</div>
              )}
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}

function VerifyPage() {
  const { data } = useData();
  const [serial, setSerial] = useState('');
  const [result, setResult] = useState(null);
  const verify = () => {
    if (!serial.trim()) return;
    const eq = data.equipment.find((e) => e.serialNumber.toLowerCase() === serial.toLowerCase().trim());
    if (!eq) { setResult({ ok: false, msg: 'Serial not found in registry.' }); return; }
    const proj = data.projects.find((p) => p.id === eq.projectId);
    setResult({ ok: true, msg: `${eq.serialNumber} verified · ${proj?.code ?? 'unassigned'} · ${eq.status}` });
  };
  return (
    <PageContainer>
      <PageHeader title="Equipment Verification" description="Verify equipment serial numbers before installation." />
      <div className="card p-6 max-w-2xl">
        <div className="flex gap-2">
          <input className="input flex-1" placeholder="Enter serial number..." value={serial} onChange={(e) => setSerial(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && verify()} />
          <button className="btn-primary" onClick={verify}><PackageCheck className="w-4 h-4" />Verify</button>
        </div>
        {result && <div className={`mt-3 text-sm ${result.ok ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'} rounded-lg px-3 py-2`}>{result.ok ? <CheckCircle2 className="w-4 h-4 inline mr-1" /> : <XCircle className="w-4 h-4 inline mr-1" />}{result.msg}</div>}
      </div>
    </PageContainer>
  );
}

function ScanPage() {
  const { data } = useData();
  const [serial, setSerial] = useState('');
  const [found, setFound] = useState(null);
  const search = () => {
    const eq = data.equipment.find((e) => e.serialNumber.toLowerCase() === serial.toLowerCase().trim());
    setFound(eq || null);
  };
  return (
    <PageContainer>
      <PageHeader title="QR Scanner" description="Scan equipment QR codes to verify identity." />
      <div className="card p-6 max-w-2xl">
        <div className="flex gap-2">
          <input className="input flex-1" placeholder="Enter serial or scan QR..." value={serial} onChange={(e) => setSerial(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} />
          <button className="btn-primary" onClick={search}><ScanLine className="w-4 h-4" />Scan</button>
        </div>
        {found && (
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Serial</span><span className="font-mono text-navy-800">{found.serialNumber}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Status</span><StatusBadgeAuto status={found.status} /></div>
            <div className="flex justify-between"><span className="text-slate-500">Warranty</span><span>{found.warrantyStatus}</span></div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function ChecklistPage() {
  const myJobs = useMyInstallations();
  const { data, setData } = useData();
  const [active, setActive] = useState(null);

  const toggle = (idx) => {
    if (!active) return;
    const updated = active.checklist.map((c, i) => i === idx ? { ...c, done: !c.done } : c);
    setActive({ ...active, checklist: updated });
    setData((p) => ({ ...p, installations: p.installations.map((i) => i.id === active.id ? { ...i, checklist: updated } : i) }));
  };

  const allDone = active?.checklist.every((c) => c.done);

  return (
    <PageContainer>
      <PageHeader title="Installation Checklist" description="Complete the installation checklist for each job." />
      <div className="space-y-2">
        {myJobs.filter((i) => i.status === 'In Progress' || i.status === 'Testing').map((i) => {
          const p = data.projects.find((p) => p.id === i.projectId);
          return (
            <button key={i.id} className="card p-4 w-full text-left flex items-center justify-between" onClick={() => setActive(i)}>
              <div className="font-medium text-navy-800">{p?.code}</div>
              <span className="text-xs text-slate-500">{i.checklist.filter((c) => c.done).length}/{i.checklist.length} done</span>
            </button>
          );
        })}
      </div>
      {active && (
        <Modal open onClose={() => setActive(null)} title="Installation Checklist" footer={<button className="btn-outline" onClick={() => setActive(null)}>Close</button>}>
          <div className="space-y-2">
            {active.checklist.map((c, idx) => (
              <button key={idx} className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-left" onClick={() => toggle(idx)}>
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${c.done ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300'}`}>{c.done && <CheckCircle2 className="w-4 h-4" />}</div>
                <span className={`text-sm ${c.done ? 'line-through text-slate-400' : 'text-navy-800'}`}>{c.label}</span>
              </button>
            ))}
          </div>
          {allDone && <div className="mt-3"><AlertBanner type="success" message="All checklist items complete. Proceed to commissioning." /></div>}
        </Modal>
      )}
    </PageContainer>
  );
}

function PhotosPage() {
  const myJobs = useMyInstallations();
  const { data, setData } = useData();
  const [active, setActive] = useState(null);

  const addPhoto = (url) => {
    if (!active) return;
    setData((p) => ({ ...p, installations: p.installations.map((i) => i.id === active.id ? { ...i, photos: [...i.photos, url] } : i) }));
    setActive(null);
  };

  return (
    <PageContainer>
      <PageHeader title="Photo Documentation" description="Upload before-and-after installation photographs." />
      <div className="space-y-3">
        {myJobs.filter((i) => i.status !== 'Scheduled').map((i) => {
          const p = data.projects.find((p) => p.id === i.projectId);
          return (
            <div key={i.id} className="card p-4">
              <div className="flex items-center justify-between mb-2"><div className="font-medium text-navy-800">{p?.code}</div><span className="text-xs text-slate-500">{i.photos.length} photo(s)</span></div>
              <div className="flex gap-2 flex-wrap">
                {i.photos.map((ph, idx) => <div key={idx} className="w-20 h-20 rounded-lg bg-slate-200 flex items-center justify-center text-xs text-slate-500">{ph}</div>)}
                <button className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-emerald-500" onClick={() => setActive(i)}><Camera className="w-5 h-5" /></button>
              </div>
            </div>
          );
        })}
      </div>
      {active && <Modal open onClose={() => setActive(null)} title="Add Photo" footer={<><button className="btn-outline" onClick={() => setActive(null)}>Cancel</button><button className="btn-primary" onClick={() => addPhoto(`inst-${active.photos.length + 1}.jpg`)}>Upload</button></>}>
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center"><Camera className="w-10 h-10 text-slate-400 mx-auto mb-2" /><p className="text-sm text-slate-500">Click upload to add a photo placeholder.</p></div>
      </Modal>}
    </PageContainer>
  );
}

function CommissioningPage() {
  const myJobs = useMyInstallations();
  const { data, setData } = useData();
  const complete = (i) => {
    const ready = canCompleteInstallation({ installation: i });
    if (!ready.allowed) {
      alert(ready.reason);
      return;
    }

    const project = data.projects.find((p) => p.id === i.projectId);
    const config = data.configs.find((c) => c.id === project?.configId);
    const approvedCapacity = Number(project?.capacity || config?.recommendedCapacity || 0);
    const actualCapacity = Number(i.actualInstalledCapacity ?? approvedCapacity);
    const validation = validateCapacity({ approvedCapacity, actualInstalledCapacity: actualCapacity });
    const allDone = i.checklist.every((c) => c.done);

    if (!allDone || !i.earthingConfirmed) {
      alert('Complete checklist and confirm earthing before completing the installation.');
      return;
    }

    setData((p) => ({
      ...p,
      installations: p.installations.map((ins) => ins.id === i.id ? {
        ...ins,
        status: validation.matches ? 'Completed' : 'Pending Verification',
        finishedAt: new Date().toISOString(),
        actualInstalledCapacity: actualCapacity,
        capacityMismatch: !validation.matches,
        reviewRequired: !validation.matches,
        history: [...(ins.history || []), { action: 'Installation Finished', at: new Date().toISOString() }],
      } : ins),
    }));
  };
  const confirmEarthing = (i) => {
    setData((p) => ({ ...p, installations: p.installations.map((ins) => ins.id === i.id ? { ...ins, earthingConfirmed: true } : ins) }));
  };

  return (
    <PageContainer>
      <PageHeader title="Testing & Commissioning" description="Confirm system testing and complete installation." />
      <div className="space-y-3">
        {myJobs.filter((i) => i.status === 'In Progress' || i.status === 'Testing').map((i) => {
          const p = data.projects.find((p) => p.id === i.projectId);
          const allDone = i.checklist.every((c) => c.done);
          return (
            <div key={i.id} className="card p-4">
              <div className="font-medium text-navy-800 mb-2">{p?.code}</div>
              <div className="text-xs text-slate-500 mb-2">Checklist: {i.checklist.filter((c) => c.done).length}/{i.checklist.length} · Earthing: {i.earthingConfirmed ? 'Confirmed' : 'Pending'}</div>
              {!i.earthingConfirmed && <button className="btn-outline mr-2" onClick={() => confirmEarthing(i)}>Confirm Earthing</button>}
              <button className="btn-emerald" disabled={!allDone || !i.earthingConfirmed} onClick={() => complete(i)}><CheckCircle2 className="w-4 h-4" />Complete Installation</button>
              {(!allDone || !i.earthingConfirmed) && <p className="text-xs text-amber-600 mt-1">Complete checklist and confirm earthing before completing.</p>}
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}

function CompletionPage() {
  const myJobs = useMyInstallations();
  const { data, setData } = useData();
  const [reportJob, setReportJob] = useState(null);
  const [reportForm, setReportForm] = useState({
    installationDate: '',
    actualCapacity: '',
    safetyInspection: '',
    powerTest: '',
    technicianRemarks: '',
    customerSignature: '',
    photoRefs: '',
  });

  const done = myJobs.filter((i) => i.status === 'Completed' || i.status === 'Accepted' || i.status === 'Pending Verification');

  const openReport = (i) => {
    const project = data.projects.find((p) => p.id === i.projectId);
    const config = data.configs.find((c) => c.id === project?.configId);
    const approvedCapacity = Number(project?.capacity || config?.recommendedCapacity || 0);
    setReportJob(i);
    setReportForm({
      installationDate: i.installationDate || new Date().toISOString().slice(0, 10),
      actualCapacity: i.actualInstalledCapacity ?? String(approvedCapacity),
      safetyInspection: i.safetyInspection || '',
      powerTest: i.powerTest || '',
      technicianRemarks: i.technicianRemarks || '',
      customerSignature: i.customerSignature || '',
      photoRefs: (i.photos || []).join(', '),
    });
  };

  const saveReport = () => {
    if (!reportJob) return;
    const project = data.projects.find((p) => p.id === reportJob.projectId);
    const config = data.configs.find((c) => c.id === project?.configId);
    const approvedCapacity = Number(project?.capacity || config?.recommendedCapacity || 0);
    const currentCapacity = Number(reportForm.actualCapacity || approvedCapacity);
    const validation = validateCapacity({ approvedCapacity, actualInstalledCapacity: currentCapacity });

    setData((p) => ({
      ...p,
      installations: p.installations.map((ins) => ins.id === reportJob.id ? {
        ...ins,
        installationDate: reportForm.installationDate,
        actualInstalledCapacity: currentCapacity,
        capacityMismatch: !validation.matches,
        reviewRequired: !validation.matches,
        safetyInspection: reportForm.safetyInspection,
        powerTest: reportForm.powerTest,
        technicianRemarks: reportForm.technicianRemarks,
        customerSignature: reportForm.customerSignature,
        photos: reportForm.photoRefs ? reportForm.photoRefs.split(',').map((item) => item.trim()).filter(Boolean) : ins.photos,
        status: validation.matches ? 'Completed' : 'Pending Verification',
        finishedAt: new Date().toISOString(),
        history: [...(ins.history || []), { action: 'Completion Report Submitted', at: new Date().toISOString() }],
      } : ins),
    }));
    setReportJob(null);
  };

  const accept = (i) => {
    if (!i.customerSignature) {
      alert('Customer signature is required before acceptance can be recorded.');
      return;
    }
    setData((p) => ({
      ...p,
      installations: p.installations.map((ins) => ins.id === i.id ? {
        ...ins,
        status: 'Accepted',
        customerAccepted: true,
        acceptedAt: new Date().toISOString(),
        acceptedByName: data.customers.find((c) => c.id === data.projects.find((pr) => pr.id === i.projectId)?.customerId)?.name,
      } : ins),
    }));
  };

  return (
    <PageContainer>
      <PageHeader title="Completion Reports" description="Submit installation evidence and capture customer acceptance after installation." />
      <div className="space-y-3">
        {done.map((i) => {
          const p = data.projects.find((p) => p.id === i.projectId);
          const c = data.customers.find((c) => c.id === p?.customerId);
          return (
            <div key={i.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div><div className="font-medium text-navy-800">{p?.code} — {c?.name}</div><div className="text-xs text-slate-500">{i.reviewRequired ? 'Capacity review required' : 'Finished ' + fmtDate(i.finishedAt)} · {i.photos.length} photos</div></div>
                <div className="flex items-center gap-2">
                  <StatusBadgeAuto status={i.status} />
                  <button className="btn-outline text-xs" onClick={() => openReport(i)}>Report</button>
                  {i.status === 'Completed' && <button className="btn-emerald text-xs" onClick={() => accept(i)}>Get Acceptance</button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {reportJob && (
        <Modal open onClose={() => setReportJob(null)} title="Installation Completion Form" description={`Project ${data.projects.find((p) => p.id === reportJob.projectId)?.code}`} footer={<><button className="btn-outline" onClick={() => setReportJob(null)}>Cancel</button><button className="btn-primary" onClick={saveReport}>Submit Completion</button></>}>
          <div className="space-y-3 text-sm">
            <div><label className="label">Installation Date</label><input type="date" className="input" value={reportForm.installationDate} onChange={(e) => setReportForm({ ...reportForm, installationDate: e.target.value })} /></div>
            <div><label className="label">Actual Installed Capacity (kW)</label><input type="number" step="0.1" className="input" value={reportForm.actualCapacity} onChange={(e) => setReportForm({ ...reportForm, actualCapacity: e.target.value })} /></div>
            <div><label className="label">Electrical & Safety Inspection</label><textarea className="input min-h-[80px]" value={reportForm.safetyInspection} onChange={(e) => setReportForm({ ...reportForm, safetyInspection: e.target.value })} /></div>
            <div><label className="label">Power Generation / Test Results</label><textarea className="input min-h-[80px]" value={reportForm.powerTest} onChange={(e) => setReportForm({ ...reportForm, powerTest: e.target.value })} /></div>
            <div><label className="label">Technician Remarks</label><textarea className="input min-h-[80px]" value={reportForm.technicianRemarks} onChange={(e) => setReportForm({ ...reportForm, technicianRemarks: e.target.value })} /></div>
            <div><label className="label">Installation Photographs</label><input className="input" value={reportForm.photoRefs} onChange={(e) => setReportForm({ ...reportForm, photoRefs: e.target.value })} placeholder="inst-1.jpg, inst-2.jpg" /></div>
            <div><label className="label">Customer Digital Signature</label><input className="input" value={reportForm.customerSignature} onChange={(e) => setReportForm({ ...reportForm, customerSignature: e.target.value })} placeholder="Customer signature before accepting" /></div>
            {validateCapacity({ approvedCapacity: Number(data.projects.find((p) => p.id === reportJob.projectId)?.capacity || data.configs.find((c) => c.id === data.projects.find((p) => p.id === reportJob.projectId)?.configId)?.recommendedCapacity || 0), actualInstalledCapacity: Number(reportForm.actualCapacity || 0) }).matches ? <AlertBanner type="success" message="Installed capacity matches the approved configuration." /> : <AlertBanner type="warning" message="Capacity differs from the approved system. The installation will be flagged for Administrator verification." />}
          </div>
        </Modal>
      )}
    </PageContainer>
  );
}

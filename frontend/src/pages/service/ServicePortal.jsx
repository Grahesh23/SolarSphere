import { useState, useMemo } from 'react';
import {
  Headphones, ScanLine, Search, ShieldCheck, FileText, Wrench, Lightbulb, History,
  Plus, CheckCircle2, XCircle, AlertCircle, Send,
} from 'lucide-react';
import { useData } from '@/data/DataContext';
import { PortalLayout, PageContainer, PageHeader } from '@/components/layout/PortalLayout';
import { KpiCard } from '@/components/ui/KpiCard';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { StatusBadgeAuto, AlertBanner } from '@/components/ui/Status';
import { fmtDate, fmtINR, genId } from '@/lib/format';
import { ServiceComplaints } from '@/pages/ServiceComplaints';
import { WarrantyManagement } from '@/pages/WarrantyManagement';
import { QRIntelligence } from '@/pages/QRIntelligence';

export function ServicePortal() {
  const [active, setActive] = useState('dashboard');
  return (
    <PortalLayout active={active} onNavigate={setActive}>
      <ServicePage active={active} onNavigate={setActive} />
    </PortalLayout>
  );
}

function ServicePage({ active, onNavigate }) {
  switch (active) {
    case 'dashboard': return <ServiceDashboard onNavigate={onNavigate} />;
    case 'complaints': return <ServiceComplaints />;
    case 'scan': return <ServiceScanPage />;
    case 'serial-search': return <SerialSearchPage />;
    case 'warranty': return <WarrantyManagement />;
    case 'tickets': return <TicketsPage />;
    case 'repair': return <RepairPage />;
    case 'troubleshoot': return <TroubleshootPage />;
    case 'history': return <HistoryPage />;
    default: return <ServiceDashboard onNavigate={onNavigate} />;
  }
}

function ServiceDashboard({ onNavigate }) {
  const { data } = useData();
  const open = data.services.filter((s) => s.status === 'Open').length;
  const warrantyClaims = data.services.filter((s) => s.type === 'Warranty' && s.status !== 'Closed').length;
  const outOfWarranty = data.services.filter((s) => s.type === 'Chargeable').length;
  const pendingRepair = data.services.filter((s) => s.status === 'Assigned' || s.status === 'In Repair' || s.status === 'Awaiting Parts').length;
  const resolved = data.services.filter((s) => s.status === 'Resolved' || s.status === 'Closed').length;
  const activeWarranties = data.warranties.filter((w) => w.status === 'Active').length;

  return (
    <PageContainer>
      <PageHeader title="Service Dashboard" description="Complaints, warranty claims, and repair status overview." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Open Complaints" value={open} icon={Headphones} tone="rose" onClick={() => onNavigate('complaints')} />
        <KpiCard label="Warranty Claims" value={warrantyClaims} icon={ShieldCheck} tone="navy" onClick={() => onNavigate('warranty')} />
        <KpiCard label="Pending Repairs" value={pendingRepair} icon={Wrench} tone="amber" onClick={() => onNavigate('tickets')} />
        <KpiCard label="Resolved Tickets" value={resolved} icon={CheckCircle2} tone="emerald" onClick={() => onNavigate('history')} />
        <KpiCard label="Out-of-Warranty" value={outOfWarranty} icon={XCircle} tone="rose" />
        <KpiCard label="Active Warranties" value={activeWarranties} icon={ShieldCheck} tone="emerald" onClick={() => onNavigate('warranty')} />
        <KpiCard label="Total Tickets" value={data.services.length} icon={FileText} tone="navy" onClick={() => onNavigate('tickets')} />
        <KpiCard label="Service Agents" value={1} icon={Headphones} tone="grape" />
      </div>

      <div className="card p-5">
        <h3 className="section-title mb-3">Open Service Tickets</h3>
        <div className="space-y-2">
          {data.services.filter((s) => s.status !== 'Closed' && s.status !== 'Resolved').map((s) => {
            const c = data.customers.find((c) => c.id === s.customerId);
            return (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <div><div className="font-medium text-navy-800 text-sm">{s.code} — {c?.name}</div><div className="text-xs text-slate-500">{s.subject}</div></div>
                <StatusBadgeAuto status={s.status} />
              </div>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}

function ServiceScanPage() {
  const { data } = useData();
  const [serial, setSerial] = useState('');
  const [found, setFound] = useState(null);
  const search = () => {
    const eq = data.equipment.find((e) => e.serialNumber.toLowerCase() === serial.toLowerCase().trim());
    setFound(eq || null);
  };
  return (
    <PageContainer>
      <PageHeader title="QR Equipment Scanner" description="Scan equipment to retrieve installation and warranty info." />
      <div className="card p-6 max-w-2xl">
        <div className="flex gap-2">
          <input className="input flex-1" placeholder="Enter serial..." value={serial} onChange={(e) => setSerial(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} />
          <button className="btn-primary" onClick={search}><ScanLine className="w-4 h-4" />Scan</button>
        </div>
        {found && (
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Serial</span><span className="font-mono text-navy-800">{found.serialNumber}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Status</span><StatusBadgeAuto status={found.status} /></div>
            <div className="flex justify-between"><span className="text-slate-500">Warranty</span><span>{found.warrantyStatus}</span></div>
            {found.projectId && <div className="flex justify-between"><span className="text-slate-500">Project</span><span>{data.projects.find((p) => p.id === found.projectId)?.code}</span></div>}
            <div className="flex justify-between"><span className="text-slate-500">Delivered</span><span>{found.deliveredAt ? fmtDate(found.deliveredAt) : '—'}</span></div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function SerialSearchPage() {
  const { data } = useData();
  const [serial, setSerial] = useState('');
  const [found, setFound] = useState(null);
  const search = () => {
    const eq = data.equipment.find((e) => e.serialNumber.toLowerCase().includes(serial.toLowerCase().trim()));
    setFound(eq || null);
  };
  return (
    <PageContainer>
      <PageHeader title="Serial Number Search" description="Search equipment by serial number across all records." />
      <div className="card p-6 max-w-2xl">
        <div className="flex gap-2">
          <input className="input flex-1" placeholder="Enter serial number..." value={serial} onChange={(e) => setSerial(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} />
          <button className="btn-primary" onClick={search}><Search className="w-4 h-4" />Search</button>
        </div>
        {found && (
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Serial</span><span className="font-mono text-navy-800">{found.serialNumber}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Item</span><span className="text-navy-800">{data.inventory.find((i) => i.id === found.itemId)?.name ?? '—'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Status</span><StatusBadgeAuto status={found.status} /></div>
            <div className="flex justify-between"><span className="text-slate-500">Warranty</span><span>{found.warrantyStatus} ({found.warrantyStart ? fmtDate(found.warrantyStart) : '—'} to {found.warrantyEnd ? fmtDate(found.warrantyEnd) : '—'})</span></div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function TicketsPage() {
  const { data, setData } = useData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ customerId: '', subject: '', description: '', type: 'Warranty', equipmentId: '' });

  const create = () => {
    if (!form.customerId || !form.subject) return;
    const t = {
      id: genId('svc'), code: `TKT-${String(data.services.length + 1).padStart(3, '0')}`,
      customerId: form.customerId, type: form.type, subject: form.subject, description: form.description,
      status: 'Open', createdAt: new Date().toISOString().slice(0, 10),
      partsCost: 0, labourCost: 0, customerConfirmed: false, equipmentId: form.equipmentId || undefined,
    };
    setData((p) => ({ ...p, services: [...p.services, t] }));
    setOpen(false); setForm({ customerId: '', subject: '', description: '', type: 'Warranty', equipmentId: '' });
  };

  const assign = (s) => setData((p) => ({ ...p, services: p.services.map((sv) => sv.id === s.id ? { ...sv, status: 'Assigned', assignedTo: 'Suresh Kumar' } : sv) }));
  const resolve = (s) => setData((p) => ({ ...p, services: p.services.map((sv) => sv.id === s.id ? { ...sv, status: 'Resolved', resolvedAt: new Date().toISOString().slice(0, 10) } : sv) }));

  const columns = [
    { key: 'code', label: 'Code', render: (r) => <span className="font-mono text-xs text-slate-500">{r.code}</span> },
    { key: 'subject', label: 'Subject', sortValue: (r) => r.subject, render: (r) => <div className="font-medium text-navy-800">{r.subject}</div> },
    { key: 'type', label: 'Type', render: (r) => <span className="badge-navy">{r.type}</span> },
    { key: 'status', label: 'Status', sortValue: (r) => r.status, render: (r) => <StatusBadgeAuto status={r.status} /> },
    { key: 'createdAt', label: 'Created', sortValue: (r) => r.createdAt, render: (r) => fmtDate(r.createdAt) },
    { key: 'actions', label: 'Actions', render: (r) => (
      <div className="flex gap-1">
        {r.status === 'Open' && <button className="btn-outline text-xs" onClick={() => assign(r)}>Assign</button>}
        {(r.status === 'Assigned' || r.status === 'In Repair') && <button className="btn-emerald text-xs" onClick={() => resolve(r)}>Resolve</button>}
      </div>
    ) },
  ];

  return (
    <PageContainer>
      <PageHeader title="Service Tickets" description="Create and manage service tickets for customer complaints." actions={<button className="btn-primary" onClick={() => setOpen(true)}><Plus className="w-4 h-4" />New Ticket</button>} />
      <DataTable columns={columns} rows={data.services} searchKeys={['code', 'subject']} searchPlaceholder="Search tickets..." />
      <Modal open={open} onClose={() => setOpen(false)} title="New Service Ticket" footer={<><button className="btn-outline" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" onClick={create}>Create</button></>}>
        <div className="space-y-3">
          <div><label className="label">Customer *</label><select className="input" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}><option value="">Select...</option>{data.customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label className="label">Type</label><select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option>Warranty</option><option>Chargeable</option><option>Maintenance</option><option>Installation Issue</option></select></div>
          <div><label className="label">Subject *</label><input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
          <div><label className="label">Description</label><textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        </div>
      </Modal>
    </PageContainer>
  );
}

function RepairPage() {
  const { data, setData } = useData();
  const [costs, setCosts] = useState({});

  const setCost = (id, parts, labour) => setCosts((p) => ({ ...p, [id]: { parts, labour } }));
  const save = (s) => {
    const c = costs[s.id];
    if (!c) return;
    setData((p) => ({ ...p, services: p.services.map((sv) => sv.id === s.id ? { ...sv, partsCost: c.parts, labourCost: c.labour } : sv) }));
  };

  return (
    <PageContainer>
      <PageHeader title="Repair & Replacement" description="Track repair costs and approve replacements." />
      <div className="space-y-3">
        {data.services.filter((s) => s.status === 'In Repair' || s.status === 'Awaiting Parts').map((s) => {
          const c = data.customers.find((c) => c.id === s.customerId);
          return (
            <div key={s.id} className="card p-4">
              <div className="flex items-center justify-between mb-2"><div className="font-medium text-navy-800">{s.code} — {c?.name}</div><StatusBadgeAuto status={s.status} /></div>
              <div className="text-xs text-slate-500 mb-2">{s.subject}</div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="label">Parts Cost (₹)</label><input type="number" className="input" value={costs[s.id]?.parts ?? s.partsCost} onChange={(e) => setCost(s.id, Number(e.target.value), costs[s.id]?.labour ?? s.labourCost)} /></div>
                <div><label className="label">Labour Cost (₹)</label><input type="number" className="input" value={costs[s.id]?.labour ?? s.labourCost} onChange={(e) => setCost(s.id, costs[s.id]?.parts ?? s.partsCost, Number(e.target.value))} /></div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button className="btn-primary" onClick={() => save(s)}>Save Costs</button>
                {s.type === 'Chargeable' && <span className="text-xs text-rose-600">Total: {fmtINR((costs[s.id]?.parts ?? s.partsCost) + (costs[s.id]?.labour ?? s.labourCost))}</span>}
                {s.type === 'Warranty' && <span className="text-xs text-emerald-600">Warranty covered — no charge</span>}
              </div>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}

function TroubleshootPage() {
  const { data } = useData();
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I can help troubleshoot solar equipment issues. Describe the problem or error code.' },
  ]);
  const [input, setInput] = useState('');

  const respond = (q) => {
    const lower = q.toLowerCase();
    let ans = 'Could you provide more detail about the error or symptom?';
    if (lower.includes('inverter') && lower.includes('error')) ans = 'Inverter error codes often indicate grid sync issues. Check: 1) Grid voltage stability, 2) DC input connections, 3) Firmware version. If the error persists, escalate to the manufacturer for RMA.';
    else if (lower.includes('panel') && lower.includes('not working')) ans = 'Non-producing panels may indicate: 1) Shading from new obstacles, 2) MC4 connector failure, 3) Bypass diode failure. Check string voltage and individual panel output.';
    else if (lower.includes('battery')) ans = 'Battery issues: 1) Check terminal connections and corrosion, 2) Verify charge levels and BMS status, 3) For tubular batteries, check water levels. Replace if beyond cycle life.';
    else if (lower.includes('grid')) ans = 'Grid sync failures: verify grid voltage (210-250V), check anti-islanding relay, and confirm net-metering authorization with DISCOM.';
    return ans;
  };

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((m) => [...m, { role: 'user', text: userMsg }]);
    setInput('');
    setTimeout(() => setMessages((m) => [...m, { role: 'ai', text: respond(userMsg) }]), 500);
  };

  return (
    <PageContainer>
      <PageHeader title="Troubleshooting Assistant" description="AI-powered troubleshooting guidance for solar equipment issues." />
      <div className="card p-0 max-w-3xl flex flex-col h-[60vh]">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.role === 'user' ? 'bg-navy-600 text-white' : 'bg-slate-100 text-navy-800'}`}>{m.text}</div>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-200 p-3 flex gap-2">
          <input className="input flex-1" placeholder="Describe the issue..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
          <button className="btn-primary" onClick={send}><Send className="w-4 h-4" /></button>
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-2">Troubleshooting guidance is based on common solar fault patterns. Always consult equipment manuals and escalate complex issues.</p>
    </PageContainer>
  );
}

function HistoryPage() {
  const { data } = useData();
  const closed = data.services.filter((s) => s.status === 'Resolved' || s.status === 'Closed');
  return (
    <PageContainer>
      <PageHeader title="Service History" description="Resolved and closed service tickets." />
      <div className="space-y-2">
        {closed.map((s) => {
          const c = data.customers.find((c) => c.id === s.customerId);
          return (
            <div key={s.id} className="card p-4 flex items-center justify-between">
              <div><div className="font-medium text-navy-800">{s.code} — {c?.name}</div><div className="text-xs text-slate-500">{s.subject} · Resolved {fmtDate(s.resolvedAt)}</div></div>
              <div className="text-right"><StatusBadgeAuto status={s.status} /><div className="text-xs text-slate-400 mt-1">{fmtINR(s.partsCost + s.labourCost)}</div></div>
            </div>
          );
        })}
        {closed.length === 0 && <p className="text-sm text-slate-400">No resolved tickets yet.</p>}
      </div>
    </PageContainer>
  );
}

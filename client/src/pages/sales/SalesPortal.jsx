import { useState, useMemo } from 'react';
import {
  Users, UserPlus, Phone, FileText, FolderKanban, Bell, ClipboardCheck, TrendingUp,
  CheckCircle2, XCircle, Calendar, IndianRupee, Sun, SlidersHorizontal, Mail, Plus,
} from 'lucide-react';
import { useData } from '@/data/DataContext';
import { useAuth } from '@/data/AuthContext';
import { PortalLayout, PageContainer, PageHeader } from '@/components/layout/PortalLayout';
import { KpiCard } from '@/components/ui/KpiCard';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { StatusBadgeAuto, AlertBanner } from '@/components/ui/Status';
import { fmtINR, fmtDate, fmtNum, genId } from '@/lib/format';

export function SalesPortal() {
  const [active, setActive] = useState('dashboard');
  return (
    <PortalLayout active={active} onNavigate={setActive}>
      <SalesPage active={active} onNavigate={setActive} />
    </PortalLayout>
  );
}

function SalesPage({ active, onNavigate }) {
  const { user } = useAuth();
  const { data, setData } = useData();

  const myCustomers = useMemo(
    () => data.customers.filter((c) => c.assignedTo === user?.name || true),
    [data.customers, user]
  );

  switch (active) {
    case 'dashboard': return <SalesDashboard onNavigate={onNavigate} />;
    case 'enquiries': return <EnquiriesPage />;
    case 'leads': return <LeadsPage />;
    case 'directory': return <DirectoryPage />;
    case 'followups': return <FollowupsPage />;
    case 'survey-requests': return <SurveyRequestsPage />;
    case 'solar-configuration': return <SolarConfigPage />;
    case 'quotations': return <SalesQuotationsPage />;
    case 'my-projects': return <MyProjectsPage />;
    case 'notifications': return <NotificationsPage />;
    default: return <SalesDashboard onNavigate={onNavigate} />;
  }
}

function SalesDashboard({ onNavigate }) {
  const { data } = useData();
  const { user } = useAuth();
  const myLeads = data.customers.filter((c) => c.assignedTo === user?.name);
  const newEnquiries = myLeads.filter((c) => c.leadStatus === 'New' || c.leadStatus === 'Contacted');
  const surveysPending = data.surveys.filter((s) => s.status === 'Scheduled');
  const surveysDone = data.surveys.filter((s) => s.status === 'Approved');
  const quotesPending = data.quotations.filter((q) => q.status === 'Sent');
  const won = myLeads.filter((c) => c.leadStatus === 'Won');
  const lost = myLeads.filter((c) => c.leadStatus === 'Lost');

  return (
    <PageContainer>
      <PageHeader title="Sales Dashboard" description={`Welcome back, ${user?.name}. Here's your lead pipeline and project activity.`} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="New Enquiries" value={newEnquiries.length} icon={UserPlus} tone="navy" onClick={() => onNavigate('enquiries')} />
        <KpiCard label="Leads Assigned" value={myLeads.length} icon={Users} tone="grape" onClick={() => onNavigate('leads')} />
        <KpiCard label="Surveys Pending" value={surveysPending.length} icon={ClipboardCheck} tone="amber" onClick={() => onNavigate('survey-requests')} />
        <KpiCard label="Surveys Completed" value={surveysDone.length} icon={CheckCircle2} tone="emerald" />
        <KpiCard label="Quotes Awaiting Approval" value={quotesPending.length} icon={FileText} tone="navy" onClick={() => onNavigate('quotations')} />
        <KpiCard label="Converted Customers" value={won.length} icon={TrendingUp} tone="emerald" onClick={() => onNavigate('my-projects')} />
        <KpiCard label="Lost Leads" value={lost.length} icon={XCircle} tone="rose" />
        <KpiCard label="Active Projects" value={data.projects.filter((p) => !['Completed', 'Handed Over'].includes(p.status)).length} icon={FolderKanban} tone="navy" onClick={() => onNavigate('my-projects')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="section-title mb-3">Lead Pipeline</h3>
          <div className="space-y-2.5">
            {(['New', 'Contacted', 'Survey Scheduled', 'Quoted', 'Won', 'Lost']).map((stage) => {
              const count = myLeads.filter((c) => c.leadStatus === stage).length;
              const pct = myLeads.length ? (count / myLeads.length) * 100 : 0;
              return (
                <div key={stage}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600">{stage}</span>
                    <span className="font-semibold text-navy-700">{count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${stage === 'Won' ? 'bg-emerald-500' : stage === 'Lost' ? 'bg-rose-400' : 'bg-navy-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="section-title mb-3">Recent Interactions</h3>
          <div className="space-y-2">
            {data.customers.flatMap((c) => c.interactions.map((i) => ({ ...i, customer: c.name }))).slice(0, 6).map((i) => (
              <div key={i.id} className="flex items-start gap-3 text-sm">
                <div className="w-7 h-7 rounded-full bg-navy-50 text-navy-600 flex items-center justify-center shrink-0"><Phone className="w-3.5 h-3.5" /></div>
                <div>
                  <div className="font-medium text-navy-800">{i.customer}</div>
                  <div className="text-xs text-slate-500">{i.note}</div>
                  <div className="text-xs text-slate-400">{fmtDate(i.date)} · {i.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function EnquiriesPage() {
  const { data, setData } = useData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', consumption: 400, bill: 6000, capacity: 3, source: 'Website' });

  const create = () => {
    if (!form.name || !form.phone) return;
    const c = {
      id: genId('cus'), code: `CUST-${String(data.customers.length + 1).padStart(3, '0')}`,
      name: form.name, email: form.email, phone: form.phone, address: '', city: form.city, state: '', pincode: '',
      electricityConsumption: Number(form.consumption), monthlyBill: Number(form.bill), desiredCapacity: Number(form.capacity),
      enquirySource: form.source, assignedTo: 'Meera Nair', leadStatus: 'New', createdAt: new Date().toISOString().slice(0, 10), interactions: [],
    };
    setData((p) => ({ ...p, customers: [...p.customers, c] }));
    setOpen(false);
    setForm({ name: '', email: '', phone: '', city: '', consumption: 400, bill: 6000, capacity: 3, source: 'Website' });
  };

  const columns = [
    { key: 'code', label: 'Code', sortValue: (r) => r.code, render: (r) => <span className="font-mono text-xs text-slate-500">{r.code}</span> },
    { key: 'name', label: 'Customer', sortValue: (r) => r.name, render: (r) => <div><div className="font-medium text-navy-800">{r.name}</div><div className="text-xs text-slate-400">{r.city}</div></div> },
    { key: 'phone', label: 'Phone', render: (r) => r.phone },
    { key: 'capacity', label: 'Desired kW', sortValue: (r) => r.desiredCapacity, render: (r) => `${r.desiredCapacity} kW` },
    { key: 'bill', label: 'Monthly Bill', sortValue: (r) => r.monthlyBill, render: (r) => fmtINR(r.monthlyBill) },
    { key: 'source', label: 'Source', render: (r) => r.enquirySource },
    { key: 'leadStatus', label: 'Status', sortValue: (r) => r.leadStatus, render: (r) => <StatusBadgeAuto status={r.leadStatus} /> },
  ];

  return (
    <PageContainer>
      <PageHeader title="Customer Enquiries" description="Register new customer enquiries and track initial contact." actions={<button className="btn-primary" onClick={() => setOpen(true)}><Plus className="w-4 h-4" />New Enquiry</button>} />
      <DataTable columns={columns} rows={data.customers} searchKeys={['name', 'phone', 'city']} searchPlaceholder="Search enquiries..." />
      <Modal open={open} onClose={() => setOpen(false)} title="New Customer Enquiry" description="Register a new solar enquiry and assign it to yourself."
        footer={<><button className="btn-outline" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" onClick={create}>Create Enquiry</button></>}>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Full Name *</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">Phone *</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><label className="label">Email</label><input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="label">City</label><input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
          <div><label className="label">Monthly Consumption (kWh)</label><input type="number" className="input" value={form.consumption} onChange={(e) => setForm({ ...form, consumption: Number(e.target.value) })} /></div>
          <div><label className="label">Monthly Bill (₹)</label><input type="number" className="input" value={form.bill} onChange={(e) => setForm({ ...form, bill: Number(e.target.value) })} /></div>
          <div><label className="label">Desired Capacity (kW)</label><input type="number" className="input" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} /></div>
          <div><label className="label">Lead Source</label><select className="input" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}><option>Website</option><option>Referral</option><option>Advertisement</option><option>Exhibition</option></select></div>
        </div>
      </Modal>
    </PageContainer>
  );
}

function LeadsPage() {
  const { data } = useData();
  const { user } = useAuth();
  const myLeads = data.customers.filter((c) => c.assignedTo === user?.name);
  const columns = [
    { key: 'code', label: 'Code', render: (r) => <span className="font-mono text-xs text-slate-500">{r.code}</span> },
    { key: 'name', label: 'Lead', sortValue: (r) => r.name, render: (r) => <div className="font-medium text-navy-800">{r.name}</div> },
    { key: 'source', label: 'Source', render: (r) => r.enquirySource },
    { key: 'capacity', label: 'Target', render: (r) => `${r.desiredCapacity} kW` },
    { key: 'bill', label: 'Bill', render: (r) => fmtINR(r.monthlyBill) },
    { key: 'leadStatus', label: 'Status', sortValue: (r) => r.leadStatus, render: (r) => <StatusBadgeAuto status={r.leadStatus} /> },
    { key: 'createdAt', label: 'Created', sortValue: (r) => r.createdAt, render: (r) => fmtDate(r.createdAt) },
  ];
  return (
    <PageContainer>
      <PageHeader title="Lead Management" description="Leads assigned to you — track status and progression." />
      <DataTable columns={columns} rows={myLeads} searchKeys={['name']} searchPlaceholder="Search leads..." />
    </PageContainer>
  );
}

function DirectoryPage() {
  const { data } = useData();
  const columns = [
    { key: 'code', label: 'Code', render: (r) => <span className="font-mono text-xs text-slate-500">{r.code}</span> },
    { key: 'name', label: 'Customer', sortValue: (r) => r.name, render: (r) => <div className="font-medium text-navy-800">{r.name}</div> },
    { key: 'phone', label: 'Phone', render: (r) => r.phone },
    { key: 'city', label: 'City', render: (r) => `${r.city}, ${r.state}` },
    { key: 'leadStatus', label: 'Status', sortValue: (r) => r.leadStatus, render: (r) => <StatusBadgeAuto status={r.leadStatus} /> },
  ];
  return (
    <PageContainer>
      <PageHeader title="Customer Directory" description="All customer records with contact details." />
      <DataTable columns={columns} rows={data.customers} searchKeys={['name', 'phone', 'city']} searchPlaceholder="Search customers..." />
    </PageContainer>
  );
}

function FollowupsPage() {
  const { data, setData } = useData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ customerId: '', type: 'Call', note: '' });

  const add = () => {
    if (!form.customerId || !form.note) return;
    const interaction = { id: genId('int'), date: new Date().toISOString().slice(0, 10), type: form.type, note: form.note, by: 'Meera Nair' };
    setData((p) => ({ ...p, customers: p.customers.map((c) => c.id === form.customerId ? { ...c, interactions: [interaction, ...c.interactions] } : c) }));
    setOpen(false);
    setForm({ customerId: '', type: 'Call', note: '' });
  };

  return (
    <PageContainer>
      <PageHeader title="Follow-ups & Meetings" description="Track customer interactions and scheduled follow-ups." actions={<button className="btn-primary" onClick={() => setOpen(true)}><Plus className="w-4 h-4" />Log Follow-up</button>} />
      <div className="space-y-2">
        {data.customers.flatMap((c) => c.interactions.map((i) => ({ ...i, customer: c.name, code: c.code }))).sort((a, b) => b.date.localeCompare(a.date)).map((i) => (
          <div key={i.id} className="card p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-navy-50 text-navy-600 flex items-center justify-center"><Phone className="w-4 h-4" /></div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-navy-800 text-sm">{i.customer}</div>
              <div className="text-xs text-slate-500">{i.note}</div>
            </div>
            <div className="text-right text-xs text-slate-400">{i.type} · {fmtDate(i.date)}</div>
          </div>
        ))}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Log Follow-up" footer={<><button className="btn-outline" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" onClick={add}>Save</button></>}>
        <div className="space-y-3">
          <div><label className="label">Customer</label><select className="input" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}><option value="">Select...</option>{data.customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label className="label">Type</label><select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option>Call</option><option>Email</option><option>Visit</option><option>WhatsApp</option></select></div>
          <div><label className="label">Notes</label><textarea className="input" rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
        </div>
      </Modal>
    </PageContainer>
  );
}

function SurveyRequestsPage() {
  const { data } = useData();
  return (
    <PageContainer>
      <PageHeader title="Roof Survey Requests" description="Track survey scheduling status for your customers." />
      <div className="space-y-2">
        {data.surveys.map((s) => {
          const proj = data.projects.find((p) => p.id === s.projectId);
          const cust = data.customers.find((c) => c.id === s.customerId);
          const tech = data.technicians.find((t) => t.id === s.technicianId);
          return (
            <div key={s.id} className="card p-4 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="font-medium text-navy-800">{cust?.name}</div>
                <div className="text-xs text-slate-500">{proj?.code} · Scheduled {fmtDate(s.scheduledDate)}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">{tech?.name}</span>
                <StatusBadgeAuto status={s.status} />
              </div>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}

function SolarConfigPage() {
  return <SolarConfigEmbed />;
}

import { SolarConfigurationIntelligence } from '@/pages/SolarConfigurationIntelligence';
function SolarConfigEmbed() { return <SolarConfigurationIntelligence />; }

function SalesQuotationsPage() {
  const { data, setData } = useData();
  const columns = [
    { key: 'code', label: 'Code', sortValue: (r) => r.code, render: (r) => <span className="font-mono text-xs text-slate-500">{r.code}</span> },
    { key: 'project', label: 'Project / Customer', sortValue: (r) => r.code, render: (r) => { const p = data.projects.find((p) => p.id === r.projectId); const c = data.customers.find((c) => c.id === r.customerId); return <div><div className="font-medium text-navy-800">{p?.code}</div><div className="text-xs text-slate-400">{c?.name}</div></div>; } },
    { key: 'total', label: 'Total', sortValue: (r) => r.total, render: (r) => fmtINR(r.total) },
    { key: 'status', label: 'Status', sortValue: (r) => r.status, render: (r) => <StatusBadgeAuto status={r.status} /> },
    { key: 'createdAt', label: 'Created', sortValue: (r) => r.createdAt, render: (r) => fmtDate(r.createdAt) },
  ];
  return (
    <PageContainer>
      <PageHeader title="Quotations" description="Generate and send quotations to customers for approval." />
      <DataTable columns={columns} rows={data.quotations} searchKeys={['code']} searchPlaceholder="Search quotations..." />
    </PageContainer>
  );
}

function MyProjectsPage() {
  const { data } = useData();
  const { user } = useAuth();
  const myProjects = data.projects.filter((p) => p.assignedEmployees.includes(user?.name || '') || true);
  const columns = [
    { key: 'code', label: 'Code', render: (r) => <span className="font-mono text-xs text-slate-500">{r.code}</span> },
    { key: 'customer', label: 'Customer', sortValue: (r) => r.code, render: (r) => { const c = data.customers.find((c) => c.id === r.customerId); return c?.name; } },
    { key: 'capacity', label: 'Capacity', render: (r) => `${r.capacity} kW ${r.gridType}` },
    { key: 'completion', label: 'Progress', sortValue: (r) => r.completion, render: (r) => <span className="badge-navy">{r.completion}%</span> },
    { key: 'status', label: 'Status', sortValue: (r) => r.status, render: (r) => <StatusBadgeAuto status={r.status} /> },
  ];
  return (
    <PageContainer>
      <PageHeader title="My Projects" description="Projects you are responsible for." />
      <DataTable columns={columns} rows={myProjects} searchKeys={['code']} searchPlaceholder="Search projects..." />
    </PageContainer>
  );
}

function NotificationsPage() {
  const { data } = useData();
  return (
    <PageContainer>
      <PageHeader title="Notifications" description="Alerts and updates relevant to your role." />
      <div className="space-y-2">
        {data.notifications.map((n) => (
          <div key={n.id} className={`card p-4 flex items-start gap-3 ${!n.read ? 'border-l-4 border-l-emerald-500' : ''}`}>
            <div className="w-9 h-9 rounded-lg bg-navy-50 text-navy-600 flex items-center justify-center"><Bell className="w-4 h-4" /></div>
            <div className="flex-1"><div className="font-medium text-navy-800 text-sm">{n.title}</div><div className="text-xs text-slate-500 mt-0.5">{n.message}</div><div className="text-xs text-slate-400 mt-1">{n.time}</div></div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}

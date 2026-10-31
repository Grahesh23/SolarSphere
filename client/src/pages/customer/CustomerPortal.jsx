import { useState, useMemo } from 'react';
import {
  Home, PanelTop, ClipboardCheck, Lightbulb, FileText, IndianRupee, Wrench, Boxes,
  ShieldCheck, Headphones, Bell, User, Sun, Zap, Clock, CheckCircle2, TrendingUp,
  Plus, Download, XCircle, AlertCircle, ChevronRight, MapPin,
} from 'lucide-react';
import { useData } from '@/data/DataContext';
import { useAuth } from '@/data/AuthContext';
import { PortalLayout, PageContainer, PageHeader } from '@/components/layout/PortalLayout';
import { KpiCard } from '@/components/ui/KpiCard';
import { Modal } from '@/components/ui/Modal';
import { StatusBadgeAuto, AlertBanner } from '@/components/ui/Status';
import { fmtINR, fmtDate, fmtNum, fmtPct, genId } from '@/lib/format';

export function CustomerPortal() {
  const [active, setActive] = useState('dashboard');
  return (
    <PortalLayout active={active} onNavigate={setActive}>
      <CustomerPage active={active} onNavigate={setActive} />
    </PortalLayout>
  );
}

function CustomerPage({ active, onNavigate }) {
  switch (active) {
    case 'dashboard': return <CustDashboard onNavigate={onNavigate} />;
    case 'project': return <MyProjectPage />;
    case 'survey': return <SurveySchedulePage />;
    case 'recommendation': return <RecommendationPage />;
    case 'quotation': return <QuotationPage />;
    case 'payments': return <PaymentsPage />;
    case 'installation': return <InstallationTrackingPage />;
    case 'equipment': return <EquipmentPage />;
    case 'warranty': return <WarrantyPage />;
    case 'service': return <ServicePage />;
    case 'notifications': return <NotificationsPage />;
    case 'profile': return <ProfilePage />;
    default: return <CustDashboard onNavigate={onNavigate} />;
  }
}

function useMyData() {
  const { data } = useData();
  const { user } = useAuth();
  const customerId = user?.customerId;
  return useMemo(() => ({
    customer: data.customers.find((c) => c.id === customerId) ?? null,
    projects: data.projects.filter((p) => p.customerId === customerId),
    surveys: data.surveys.filter((s) => s.customerId === customerId),
    quotations: data.quotations.filter((q) => q.customerId === customerId),
    payments: data.payments.filter((p) => p.customerId === customerId && p.type !== 'Supplier'),
    services: data.services.filter((s) => s.customerId === customerId),
    equipment: data.equipment.filter((e) => e.customerId === customerId),
    warranties: data.warranties.filter((w) => w.customerId === customerId),
    installations: data.installations.filter((i) => data.projects.some((p) => p.id === i.projectId && p.customerId === customerId)),
  }), [data, customerId]);
}

function CustDashboard({ onNavigate }) {
  const d = useMyData();
  const { user } = useAuth();
  const project = d.projects[0];
  const config = d.projects[0] ? data_configs_lookup(d.projects[0].configId) : null;
  const pendingPay = d.payments.filter((p) => p.status === 'Pending' || p.status === 'Overdue').reduce((s, p) => s + p.amount, 0);

  return (
    <PageContainer>
      <PageHeader title={`Welcome, ${user?.name?.split(' ')[0]}`} description="Your solar installation journey at a glance." />
      {project && (
        <div className="card p-6 mb-5 bg-gradient-to-br from-navy-50 to-emerald-50 border-emerald-200">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sun className="w-5 h-5 text-amber-500" />
                <span className="font-display font-bold text-navy-900 text-lg">{project.code}</span>
                <StatusBadgeAuto status={project.status} />
              </div>
              <div className="text-sm text-slate-600">{project.capacity} kW {project.gridType} system · {project.location}</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-display font-bold text-navy-900">{project.completion}%</div>
              <div className="text-xs text-slate-500">project progress</div>
            </div>
          </div>
          <div className="mt-3 h-2 bg-white rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: `${project.completion}%` }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KpiCard label="My Project" value={project?.code ?? '—'} icon={PanelTop} tone="navy" onClick={() => onNavigate('project')} />
        <KpiCard label="Pending Payments" value={fmtINR(pendingPay)} icon={IndianRupee} tone={pendingPay > 0 ? 'rose' : 'emerald'} onClick={() => onNavigate('payments')} />
        <KpiCard label="Quotation" value={d.quotations.length ? d.quotations[0].code : '—'} icon={FileText} tone="grape" onClick={() => onNavigate('quotation')} />
        <KpiCard label="Warranties" value={d.warranties.length} icon={ShieldCheck} tone="emerald" onClick={() => onNavigate('warranty')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="section-title mb-3">Installation Progress</h3>
          {project ? (
            <div className="space-y-2">
              {['Enquiry', 'Survey Scheduled', 'Quotation Sent', 'Payment Received', 'Dispatched', 'In Progress', 'Completed'].map((stage, i) => {
                const reached = project.completion >= (i / 6) * 100;
                return (
                  <div key={stage} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${reached ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      {reached ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs">{i + 1}</span>}
                    </div>
                    <span className={`text-sm ${reached ? 'text-navy-800 font-medium' : 'text-slate-400'}`}>{stage}</span>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-sm text-slate-400">No project yet.</p>}
        </div>

        <div className="card p-5">
          <h3 className="section-title mb-3">Recent Updates</h3>
          <div className="space-y-2">
            {d.services.slice(0, 3).map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <div><div className="font-medium text-navy-800">{s.subject}</div><div className="text-xs text-slate-500">{fmtDate(s.createdAt)}</div></div>
                <StatusBadgeAuto status={s.status} />
              </div>
            ))}
            {d.services.length === 0 && <p className="text-sm text-slate-400">No service requests.</p>}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function data_configs_lookup(id) {
  const { data } = useData();
  return data.configs.find((c) => c.id === id);
}

function MyProjectPage() {
  const d = useMyData();
  const project = d.projects[0];
  if (!project) return <PageContainer><PageHeader title="My Solar Project" /><AlertBanner type="info" message="No active project yet. Contact our sales team to begin your solar journey." /></PageContainer>;
  const config = data_configs_lookup(project.configId);
  const survey = d.surveys[0];

  return (
    <PageContainer>
      <PageHeader title="My Solar Project" description="Details, configuration, and milestones for your project." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="section-title mb-3">Project Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Project Code</span><span className="font-medium text-navy-800">{project.code}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Capacity</span><span className="text-navy-800">{project.capacity} kW</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Type</span><span className="text-navy-800">{project.gridType}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Location</span><span className="text-navy-800">{project.location}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Started</span><span className="text-navy-800">{fmtDate(project.startDate)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Target End</span><span className="text-navy-800">{fmtDate(project.targetEndDate)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Progress</span><span className="font-semibold text-emerald-600">{project.completion}%</span></div>
          </div>
        </div>
        <div className="card p-5">
          <h3 className="section-title mb-3">System Configuration</h3>
          {config ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Recommended</span><span className="text-navy-800">{config.recommendedCapacity} kW</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Panels</span><span className="text-navy-800">{config.panelCount} × {config.panelModel}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Inverter</span><span className="text-navy-800">{config.inverterModel}</span></div>
              {config.batteryCount > 0 && <div className="flex justify-between"><span className="text-slate-500">Batteries</span><span className="text-navy-800">{config.batteryCount} × {config.batteryModel}</span></div>}
              <div className="flex justify-between"><span className="text-slate-500">Est. Annual Output</span><span className="text-navy-800">{fmtNum(config.estimatedAnnual)} kWh</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Est. Payback</span><span className="text-navy-800">{config.paybackYears} years</span></div>
            </div>
          ) : <p className="text-sm text-slate-400">Configuration not yet finalized.</p>}
        </div>
      </div>
      {survey && (
        <div className="card p-5 mt-5">
          <h3 className="section-title mb-3">Survey Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><div className="text-xs text-slate-500">Usable Area</div><div className="font-medium text-navy-800">{survey.usableArea} m²</div></div>
            <div><div className="text-xs text-slate-500">Orientation</div><div className="font-medium text-navy-800">{survey.orientation}</div></div>
            <div><div className="text-xs text-slate-500">Tilt</div><div className="font-medium text-navy-800">{survey.tilt}°</div></div>
            <div><div className="text-xs text-slate-500">Shading</div><div className="font-medium text-navy-800">{survey.shading}</div></div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

function SurveySchedulePage() {
  const d = useMyData();
  return (
    <PageContainer>
      <PageHeader title="Survey Schedule" description="Your survey appointments and status." />
      <div className="space-y-3">
        {d.surveys.map((s) => {
          const tech = useTechLookup(s.technicianId);
          return (
            <div key={s.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-navy-800">{fmtDate(s.scheduledDate)}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Surveyor: {tech?.name ?? '—'} · {tech?.phone ?? ''}</div>
                  {s.remarks && <div className="text-xs text-slate-500 mt-1">{s.remarks}</div>}
                </div>
                <StatusBadgeAuto status={s.status} />
              </div>
              {s.status === 'Scheduled' && (
                <button className="btn-outline text-xs mt-3" onClick={() => alert('Reschedule request sent. Our team will contact you.')}>Request Reschedule</button>
              )}
            </div>
          );
        })}
        {d.surveys.length === 0 && <p className="text-sm text-slate-400">No surveys scheduled.</p>}
      </div>
    </PageContainer>
  );
}

function useTechLookup(id) {
  const { data } = useData();
  return data.technicians.find((t) => t.id === id);
}

function RecommendationPage() {
  const d = useMyData();
  const config = d.projects[0] ? data_configs_lookup(d.projects[0].configId) : null;
  return (
    <PageContainer>
      <PageHeader title="Solar Recommendation" description="Your personalized solar system recommendation." />
      <div className="mb-4"><AlertBanner type="info" message="These are estimates based on standard irradiance models. Actual performance depends on location, weather, and maintenance." /></div>
      {config ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card p-5">
            <h3 className="section-title mb-3">Recommended System</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Capacity</span><span className="font-medium text-navy-800">{config.recommendedCapacity} kW</span></div>
              <div className="flex justify-between"><span className="text-slate-500">System Type</span><span className="text-navy-800">{config.gridType}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Panels</span><span className="text-navy-800">{config.panelCount} × {config.panelModel}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Inverter</span><span className="text-navy-800">{config.inverterModel}</span></div>
              {config.batteryCount > 0 && <div className="flex justify-between"><span className="text-slate-500">Battery</span><span className="text-navy-800">{config.batteryCount} × {config.batteryModel}</span></div>}
            </div>
          </div>
          <div className="card p-5">
            <h3 className="section-title mb-3">Expected Performance</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Annual Generation</span><span className="font-medium text-emerald-600">{fmtNum(config.estimatedAnnual)} kWh</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Monthly Average</span><span className="text-navy-800">{fmtNum(Math.round(config.estimatedAnnual / 12))} kWh</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Daily Average</span><span className="text-navy-800">{fmtNum(Math.round(config.estimatedAnnual / 365))} kWh</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Est. Savings/Year</span><span className="font-medium text-emerald-600">{fmtINR(Math.round(config.estimatedAnnual * 7.5))}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Payback Period</span><span className="text-navy-800">{config.paybackYears} years</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Est. Cost</span><span className="text-navy-800">{fmtINR(config.estimatedCost)}</span></div>
            </div>
          </div>
        </div>
      ) : <p className="text-sm text-slate-400">No recommendation yet. Survey must be completed first.</p>}
    </PageContainer>
  );
}

function QuotationPage() {
  const d = useMyData();
  const quote = d.quotations[0];
  const { data, setData } = useData();
  if (!quote) return <PageContainer><PageHeader title="My Quotation" /><AlertBanner type="info" message="No quotation available yet. Once your survey is approved, a quotation will be generated." /></PageContainer>;

  const accept = () => setData((p) => ({ ...p, quotations: p.quotations.map((q) => q.id === quote.id ? { ...q, status: 'Accepted' } : q), projects: p.projects.map((pr) => pr.id === quote.projectId ? { ...pr, status: 'Customer Approved' } : pr) }));
  const reject = () => setData((p) => ({ ...p, quotations: p.quotations.map((q) => q.id === quote.id ? { ...q, status: 'Rejected' } : q) }));

  return (
    <PageContainer>
      <PageHeader title="My Quotation" description="Review and accept your solar quotation." actions={<button className="btn-outline"><Download className="w-4 h-4" />Download PDF</button>} />
      <div className="card p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div><div className="font-display font-bold text-navy-900">{quote.code}</div><div className="text-xs text-slate-500">Created {fmtDate(quote.createdAt)} · Valid until {fmtDate(quote.validUntil)}</div></div>
          <StatusBadgeAuto status={quote.status} />
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr><th className="text-left px-3 py-2 font-medium text-slate-600">Component</th><th className="text-left px-3 py-2 font-medium text-slate-600">Category</th><th className="text-right px-3 py-2 font-medium text-slate-600">Qty</th><th className="text-right px-3 py-2 font-medium text-slate-600">Price</th><th className="text-right px-3 py-2 font-medium text-slate-600">Total</th></tr>
          </thead>
          <tbody>
            {quote.items.map((it) => (
              <tr key={it.id} className="border-b border-slate-100">
                <td className="px-3 py-2.5 text-navy-800">{it.component}</td><td className="px-3 py-2.5"><span className="badge-navy">{it.category}</span></td>
                <td className="px-3 py-2.5 text-right">{it.qty}</td><td className="px-3 py-2.5 text-right">{fmtINR(it.unitPrice)}</td><td className="px-3 py-2.5 text-right font-medium">{fmtINR(it.qty * it.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end mt-3">
          <div className="w-56 space-y-1 text-sm">
            <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{fmtINR(quote.subtotal)}</span></div>
            <div className="flex justify-between text-slate-500"><span>GST</span><span>{fmtINR(quote.tax)}</span></div>
            <div className="flex justify-between text-base font-bold text-navy-900 border-t pt-1"><span>Total</span><span>{fmtINR(quote.total)}</span></div>
          </div>
        </div>
      </div>
      {quote.status === 'Sent' && (
        <div className="flex items-center gap-3">
          <button className="btn-emerald" onClick={accept}><CheckCircle2 className="w-4 h-4" />Accept Quotation</button>
          <button className="btn-outline" onClick={reject}><XCircle className="w-4 h-4" />Reject</button>
        </div>
      )}
      {quote.status === 'Accepted' && <AlertBanner type="success" message="Quotation accepted! Your project will proceed to the next stage." />}
    </PageContainer>
  );
}

function PaymentsPage() {
  const d = useMyData();
  const project = d.projects[0];
  const paid = d.payments.filter((p) => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
  const pending = d.payments.filter((p) => p.status === 'Pending' || p.status === 'Overdue').reduce((s, p) => s + p.amount, 0);

  return (
    <PageContainer>
      <PageHeader title="Payments & Invoices" description="Your payment history and outstanding balances." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <KpiCard label="Total Cost" value={fmtINR(project?.totalCost ?? 0)} icon={IndianRupee} tone="navy" />
        <KpiCard label="Paid" value={fmtINR(paid)} icon={CheckCircle2} tone="emerald" />
        <KpiCard label="Outstanding" value={fmtINR(pending)} icon={AlertCircle} tone={pending > 0 ? 'rose' : 'emerald'} />
      </div>
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr><th className="text-left px-4 py-2 font-medium text-slate-600">Code</th><th className="text-left px-4 py-2 font-medium text-slate-600">Type</th><th className="text-right px-4 py-2 font-medium text-slate-600">Amount</th><th className="text-left px-4 py-2 font-medium text-slate-600">Method</th><th className="text-left px-4 py-2 font-medium text-slate-600">Date</th><th className="text-left px-4 py-2 font-medium text-slate-600">Status</th></tr>
          </thead>
          <tbody>
            {d.payments.map((p) => (
              <tr key={p.id} className="border-b border-slate-100">
                <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{p.code}</td>
                <td className="px-4 py-2.5"><span className="badge-navy">{p.type}</span></td>
                <td className="px-4 py-2.5 text-right">{fmtINR(p.amount)}</td>
                <td className="px-4 py-2.5 text-slate-600">{p.method}</td>
                <td className="px-4 py-2.5 text-slate-600">{fmtDate(p.date)}</td>
                <td className="px-4 py-2.5"><StatusBadgeAuto status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}

function InstallationTrackingPage() {
  const d = useMyData();
  const project = d.projects[0];
  const installation = d.installations[0];
  return (
    <PageContainer>
      <PageHeader title="Installation Tracking" description="Visual timeline of your project from enquiry to completion." />
      {project ? (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            {['Enquiry', 'Survey', 'Quotation', 'Order Confirmed', 'Dispatch', 'Installation', 'Completed'].map((stage, i) => {
              const reached = project.completion >= (i / 6) * 100;
              return (
                <div key={stage} className="flex flex-col items-center flex-1 relative">
                  {i < 6 && <div className={`absolute top-3 left-1/2 w-full h-0.5 ${reached ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 relative ${reached ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    {reached ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs">{i + 1}</span>}
                  </div>
                  <span className={`text-xs mt-1 text-center ${reached ? 'text-navy-800 font-medium' : 'text-slate-400'}`}>{stage}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-sm text-slate-600">
            Current status: <span className="font-semibold text-navy-800">{project.status}</span>
            {installation && <div className="mt-1 text-xs text-slate-500">Installation: {fmtDate(installation.scheduledDate)} · <StatusBadgeAuto status={installation.status} /></div>}
          </div>
        </div>
      ) : <p className="text-sm text-slate-400">No project to track.</p>}
    </PageContainer>
  );
}

function EquipmentPage() {
  const d = useMyData();
  const { data } = useData();
  return (
    <PageContainer>
      <PageHeader title="My Equipment" description="Equipment installed at your location." />
      <div className="space-y-3">
        {d.equipment.map((eq) => {
          const item = data.inventory.find((i) => i.id === eq.itemId);
          return (
            <div key={eq.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-navy-800">{item?.name ?? eq.serialNumber}</div>
                  <div className="text-xs text-slate-500">{item?.brand} · Serial: <span className="font-mono">{eq.serialNumber}</span></div>
                  <div className="text-xs text-slate-500 mt-0.5">Delivered: {eq.deliveredAt ? fmtDate(eq.deliveredAt) : '—'}</div>
                </div>
                <StatusBadgeAuto status={eq.status} />
              </div>
            </div>
          );
        })}
        {d.equipment.length === 0 && <p className="text-sm text-slate-400">No equipment assigned yet.</p>}
      </div>
    </PageContainer>
  );
}

function WarrantyPage() {
  const d = useMyData();
  const { data } = useData();
  return (
    <PageContainer>
      <PageHeader title="Warranty Details" description="Warranty status for your installed equipment." />
      <div className="space-y-3">
        {d.warranties.map((w) => {
          const eq = data.equipment.find((e) => e.id === w.equipmentId);
          const item = eq ? data.inventory.find((i) => i.id === eq.itemId) : null;
          return (
            <div key={w.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-navy-800">{item?.name ?? 'Equipment'}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{w.terms}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{fmtDate(w.startDate)} — {fmtDate(w.endDate)}</div>
                </div>
                <StatusBadgeAuto status={w.status} />
              </div>
            </div>
          );
        })}
        {d.warranties.length === 0 && <p className="text-sm text-slate-400">No warranties active yet.</p>}
      </div>
    </PageContainer>
  );
}

function ServicePage() {
  const d = useMyData();
  const { data, setData } = useData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '', equipmentId: '' });

  const create = () => {
    if (!form.subject) return;
    const t = {
      id: genId('svc'), code: `TKT-${String(data.services.length + 1).padStart(3, '0')}`,
      customerId: d.customer?.id ?? '', type: 'Warranty', subject: form.subject, description: form.description,
      status: 'Open', createdAt: new Date().toISOString().slice(0, 10), partsCost: 0, labourCost: 0, customerConfirmed: false,
      equipmentId: form.equipmentId || undefined,
    };
    setData((p) => ({ ...p, services: [...p.services, t] }));
    setOpen(false); setForm({ subject: '', description: '', equipmentId: '' });
  };

  const confirm = (s) => setData((p) => ({ ...p, services: p.services.map((sv) => sv.id === s.id ? { ...sv, status: 'Closed', customerConfirmed: true, resolvedAt: new Date().toISOString().slice(0, 10) } : sv) }));

  return (
    <PageContainer>
      <PageHeader title="Service Requests" description="Register complaints and track resolution." actions={<button className="btn-primary" onClick={() => setOpen(true)}><Plus className="w-4 h-4" />New Complaint</button>} />
      <div className="space-y-2">
        {d.services.map((s) => (
          <div key={s.id} className="card p-4 flex items-start justify-between gap-3">
            <div><div className="font-medium text-navy-800">{s.code} — {s.subject}</div><div className="text-xs text-slate-500 mt-0.5">{s.description}</div><div className="text-xs text-slate-400 mt-1">{fmtDate(s.createdAt)}</div></div>
            <div className="flex items-center gap-2">
              <StatusBadgeAuto status={s.status} />
              {s.status === 'Resolved' && !s.customerConfirmed && <button className="btn-emerald text-xs" onClick={() => confirm(s)}>Confirm Resolved</button>}
            </div>
          </div>
        ))}
        {d.services.length === 0 && <p className="text-sm text-slate-400">No service requests.</p>}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="New Complaint" footer={<><button className="btn-outline" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" onClick={create}>Submit</button></>}>
        <div className="space-y-3">
          <div><label className="label">Affected Equipment</label><select className="input" value={form.equipmentId} onChange={(e) => setForm({ ...form, equipmentId: e.target.value })}><option value="">General issue</option>{d.equipment.map((eq) => <option key={eq.id} value={eq.id}>{data.inventory.find((i) => i.id === eq.itemId)?.name ?? eq.serialNumber}</option>)}</select></div>
          <div><label className="label">Subject *</label><input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
          <div><label className="label">Description</label><textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        </div>
      </Modal>
    </PageContainer>
  );
}

function NotificationsPage() {
  const { data } = useData();
  return (
    <PageContainer>
      <PageHeader title="Notifications" description="Updates about your solar project." />
      <div className="space-y-2">
        {data.notifications.map((n) => (
          <div key={n.id} className={`card p-4 flex items-start gap-3 ${!n.read ? 'border-l-4 border-l-emerald-500' : ''}`}>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><Bell className="w-4 h-4" /></div>
            <div className="flex-1"><div className="font-medium text-navy-800 text-sm">{n.title}</div><div className="text-xs text-slate-500 mt-0.5">{n.message}</div><div className="text-xs text-slate-400 mt-1">{n.time}</div></div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}

function ProfilePage() {
  const d = useMyData();
  const { user } = useAuth();
  return (
    <PageContainer>
      <PageHeader title="My Profile" description="Your account information." />
      <div className="card p-6 max-w-2xl">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-navy-800 text-white flex items-center justify-center text-xl font-semibold">{user?.name?.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
            <div><div className="font-display font-bold text-navy-900 text-lg">{user?.name}</div><div className="text-xs text-slate-500">{user?.email}</div></div>
          </div>
          {d.customer && (
            <>
              <div className="flex justify-between"><span className="text-slate-500">Phone</span><span className="text-navy-800">{d.customer.phone}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Address</span><span className="text-navy-800 text-right">{d.customer.address}, {d.customer.city}, {d.customer.state} {d.customer.pincode}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Customer Code</span><span className="text-navy-800">{d.customer.code}</span></div>
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

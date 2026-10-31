import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  Home, PanelTop, ClipboardCheck, Lightbulb, FileText, IndianRupee, Wrench, Boxes,
  ShieldCheck, Headphones, Bell, User, Sun, Zap, Clock, CheckCircle2, TrendingUp,
  Plus, Download, XCircle, AlertCircle, ChevronRight, MapPin,
} from 'lucide-react';
import { useAuth, AUTH_TOKEN_KEY, API_BASE } from '@/data/AuthContext';
import { PortalLayout, PageContainer, PageHeader } from '@/components/layout/PortalLayout';
import { KpiCard } from '@/components/ui/KpiCard';
import { Modal } from '@/components/ui/Modal';
import { StatusBadgeAuto, AlertBanner } from '@/components/ui/Status';
import { fmtINR, fmtDate, fmtNum, fmtPct, genId } from '@/lib/format';

const CustomerPortalDataContext = createContext(null);

export function CustomerPortal() {
  const [active, setActive] = useState('dashboard');
  return (
    <CustomerPortalDataProvider>
      <CustomerPortalLayout active={active} onNavigate={setActive}>
        <CustomerPortalContent active={active} onNavigate={setActive} />
      </CustomerPortalLayout>
    </CustomerPortalDataProvider>
  );
}

function CustomerPortalLayout({ active, onNavigate, children }) {
  const { portalData } = useCustomerPortalData();
  return (
    <PortalLayout
      active={active}
      onNavigate={onNavigate}
      notifications={portalData?.notifications || []}
    >
      {children}
    </PortalLayout>
  );
}

function CustomerPortalDataProvider({ children }) {
  const [portalData, setPortalData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const loadPortal = async () => {
      setLoading(true);
      setError('');

      try {
        const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
        if (!token) throw new Error('Your session is missing. Please sign in again.');

        const response = await fetch(`${API_BASE}/auth/customer-portal`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.message || 'Could not load your customer portal.');
        }
        if (!payload.data?.customer) {
          throw new Error('The server response did not include your customer profile.');
        }

        setPortalData(payload.data);
      } catch (loadError) {
        if (loadError.name !== 'AbortError') {
          setError(loadError.message || 'Could not load your customer portal.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadPortal();
    return () => controller.abort();
  }, [attempt]);

  const value = useMemo(
    () => ({ portalData, setPortalData, error, loading, refresh: () => setAttempt((value) => value + 1), retry: () => setAttempt((value) => value + 1) }),
    [portalData, error, loading]
  );

  return (
    <CustomerPortalDataContext.Provider value={value}>
      {children}
    </CustomerPortalDataContext.Provider>
  );
}

function CustomerPortalContent({ active, onNavigate }) {
  const { error, loading, retry } = useCustomerPortalData();
  if (loading) {
    return <PageContainer><PageHeader title="Loading your portal" description="Getting your customer information from SolarSphere." /></PageContainer>;
  }
  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Unable to load your portal" description={error} />
        <button className="btn-primary" onClick={retry}>Retry</button>
      </PageContainer>
    );
  }
  return <CustomerPage active={active} onNavigate={onNavigate} />;
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
  const { portalData, setPortalData } = useCustomerPortalData();
  return {
    ...portalData,
    setPortalData,
    projects: portalData.projects || [],
    surveys: portalData.surveys || [],
    quotations: portalData.quotations || [],
    payments: portalData.payments || [],
    services: portalData.services || [],
    equipment: portalData.equipment || [],
    warranties: portalData.warranties || [],
    installations: portalData.installations || [],
    configs: portalData.configs || [],
    notifications: portalData.notifications || [],
    inventory: portalData.inventory || [],
    technicians: portalData.technicians || [],
  };
}

function useCustomerPortalData() {
  const value = useContext(CustomerPortalDataContext);
  if (!value) throw new Error('Customer portal data must be used within CustomerPortalDataProvider');
  return value;
}

function CustDashboard({ onNavigate }) {
  const d = useMyData();
  const { refresh } = useCustomerPortalData();
  const { user } = useAuth();
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({
    phone: d.customer?.phone || '',
    address: d.customer?.address || '',
    city: d.customer?.city || '',
    state: d.customer?.state || '',
    pincode: d.customer?.pincode || '',
    electricityConsumption: d.customer?.electricityConsumption || 0,
    monthlyBill: d.customer?.monthlyBill || 0,
    desiredCapacity: d.customer?.desiredCapacity || 3,
  });
  const [enquirySaving, setEnquirySaving] = useState(false);
  const [enquiryError, setEnquiryError] = useState('');
  const [enquirySuccess, setEnquirySuccess] = useState('');
  const hasCustomerProfile = Boolean(d.customer);
  const hasSubmittedEnquiry = Boolean(
    d.customer && (
      (d.customer.enquirySource && d.customer.enquirySource !== 'Client registration') ||
      d.customer.code ||
      d.customer.city ||
      d.customer.address ||
      d.customer.phone ||
      d.customer.desiredCapacity ||
      d.projects.length > 0 ||
      d.quotations.length > 0 ||
      d.surveys.length > 0
    )
  );
  const showEnquirySummary = hasCustomerProfile || hasSubmittedEnquiry;
  const project = d.projects[0];
  const config = d.projects[0] ? d.configs.find((item) => item.id === d.projects[0].configId) : null;
  const pendingPay = d.payments.filter((p) => p.status === 'Pending' || p.status === 'Overdue').reduce((s, p) => s + p.amount, 0);

  const submitEnquiry = async (event) => {
    event.preventDefault();
    setEnquirySaving(true);
    setEnquiryError('');
    setEnquirySuccess('');
    try {
      const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) throw new Error('Your session is missing. Please sign in again.');
      const response = await fetch(`${API_BASE}/auth/customer-enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(enquiryForm),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Could not submit your enquiry.');
      setEnquirySuccess(payload.message || 'Your enquiry was submitted.');
      setEnquiryOpen(false);
      await refresh();
    } catch (error) {
      setEnquiryError(error.message || 'Could not submit your enquiry.');
    } finally {
      setEnquirySaving(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ')[0]}`}
        description="Your solar installation journey at a glance."
        actions={<button className="btn-primary" onClick={() => { setEnquiryError(''); setEnquiryOpen(true); }}><Plus className="w-4 h-4" />Make an Enquiry</button>}
      />
      {enquirySuccess && <div className="card p-3 mb-4 bg-emerald-50 text-sm text-emerald-700">{enquirySuccess}</div>}
      {enquiryError && <div className="card p-3 mb-4 bg-rose-50 text-sm text-rose-700">{enquiryError}</div>}
      {showEnquirySummary && d.customer && (
        <div className="card p-5 mb-5 border-navy-100">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy-50 text-navy-600 flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-bold text-navy-900">Your enquiry</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {d.customer.code ? `Reference ${d.customer.code}` : 'Your customer profile is registered.'}
                  {d.customer.city ? ` · ${d.customer.city}` : ''}
                </p>
              </div>
            </div>
            <StatusBadgeAuto status={d.customer.leadStatus || 'New'} />
          </div>
        </div>
      )}
      {project && (
        <div className="card p-6 mb-5 bg-gradient-to-br from-navy-50 to-emerald-50 border-emerald-200">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sun className="w-5 h-5 text-amber-500" />
                <span className="font-display font-bold text-navy-900 text-lg">{project.code}</span>
                <StatusBadgeAuto status={project.status} />
              </div>
              <div className="text-sm text-slate-600">{project.capacity} kW {project.gridType} system Â· {project.location}</div>
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
        <KpiCard label="My Project" value={project?.code ?? 'â€”'} icon={PanelTop} tone="navy" onClick={() => onNavigate('project')} />
        <KpiCard label="Pending Payments" value={fmtINR(pendingPay)} icon={IndianRupee} tone={pendingPay > 0 ? 'rose' : 'emerald'} onClick={() => onNavigate('payments')} />
        <KpiCard label="Quotation" value={d.quotations.length ? d.quotations[0].code : 'â€”'} icon={FileText} tone="grape" onClick={() => onNavigate('quotation')} />
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
      <Modal
        open={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        title="Make a Solar Enquiry"
        description="Tell our team how to contact you and what kind of solar system you are considering."
        footer={<><button type="button" className="btn-outline" onClick={() => setEnquiryOpen(false)} disabled={enquirySaving}>Cancel</button><button type="submit" form="customer-enquiry-form" className="btn-primary" disabled={enquirySaving}>{enquirySaving ? 'Submitting...' : 'Submit Enquiry'}</button></>}
      >
        <form id="customer-enquiry-form" onSubmit={submitEnquiry} className="grid grid-cols-2 gap-3">
          {enquiryError && <div className="col-span-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{enquiryError}</div>}
          <div className="col-span-2"><label className="label">Contact phone *</label><input className="input" type="tel" value={enquiryForm.phone} onChange={(event) => setEnquiryForm({ ...enquiryForm, phone: event.target.value })} required /></div>
          <div><label className="label">City</label><input className="input" value={enquiryForm.city} onChange={(event) => setEnquiryForm({ ...enquiryForm, city: event.target.value })} /></div>
          <div><label className="label">State</label><input className="input" value={enquiryForm.state} onChange={(event) => setEnquiryForm({ ...enquiryForm, state: event.target.value })} /></div>
          <div className="col-span-2"><label className="label">Address</label><input className="input" value={enquiryForm.address} onChange={(event) => setEnquiryForm({ ...enquiryForm, address: event.target.value })} /></div>
          <div><label className="label">Monthly electricity use (kWh)</label><input className="input" type="number" min="0" value={enquiryForm.electricityConsumption} onChange={(event) => setEnquiryForm({ ...enquiryForm, electricityConsumption: Number(event.target.value) })} /></div>
          <div><label className="label">Monthly electricity bill (â‚¹)</label><input className="input" type="number" min="0" value={enquiryForm.monthlyBill} onChange={(event) => setEnquiryForm({ ...enquiryForm, monthlyBill: Number(event.target.value) })} /></div>
          <div><label className="label">Desired system capacity (kW) *</label><input className="input" type="number" min="0.1" max="100" step="0.1" value={enquiryForm.desiredCapacity} onChange={(event) => setEnquiryForm({ ...enquiryForm, desiredCapacity: Number(event.target.value) })} required /></div>
        </form>
      </Modal>
    </PageContainer>
  );
}

function MyProjectPage() {
  const d = useMyData();
  const project = d.projects[0];
  if (!project) return <PageContainer><PageHeader title="My Solar Project" /><AlertBanner type="info" message="No active project yet. Contact our sales team to begin your solar journey." /></PageContainer>;
  const config = d.configs.find((item) => item.id === project.configId);
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
              <div className="flex justify-between"><span className="text-slate-500">Panels</span><span className="text-navy-800">{config.panelCount} Ã— {config.panelModel}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Inverter</span><span className="text-navy-800">{config.inverterModel}</span></div>
              {config.batteryCount > 0 && <div className="flex justify-between"><span className="text-slate-500">Batteries</span><span className="text-navy-800">{config.batteryCount} Ã— {config.batteryModel}</span></div>}
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
            <div><div className="text-xs text-slate-500">Usable Area</div><div className="font-medium text-navy-800">{survey.usableArea} mÂ²</div></div>
            <div><div className="text-xs text-slate-500">Orientation</div><div className="font-medium text-navy-800">{survey.orientation}</div></div>
            <div><div className="text-xs text-slate-500">Tilt</div><div className="font-medium text-navy-800">{survey.tilt}Â°</div></div>
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
          const tech = d.technicians.find((item) => item.id === s.technicianId);
          return (
            <div key={s.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-navy-800">{fmtDate(s.scheduledDate)}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Surveyor: {s.assignedTo || tech?.name || 'â€”'} Â· {tech?.phone ?? ''}</div>
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

function RecommendationPage() {
  const d = useMyData();
  const config = d.projects[0] ? d.configs.find((item) => item.id === d.projects[0].configId) : null;
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
              <div className="flex justify-between"><span className="text-slate-500">Panels</span><span className="text-navy-800">{config.panelCount} Ã— {config.panelModel}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Inverter</span><span className="text-navy-800">{config.inverterModel}</span></div>
              {config.batteryCount > 0 && <div className="flex justify-between"><span className="text-slate-500">Battery</span><span className="text-navy-800">{config.batteryCount} Ã— {config.batteryModel}</span></div>}
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
  const { refresh } = useCustomerPortalData();
  const [actionError, setActionError] = useState('');
  const [saving, setSaving] = useState(false);
  if (!quote) return <PageContainer><PageHeader title="My Quotation" /><AlertBanner type="info" message="No quotation available yet. Once your survey is approved, a quotation will be generated." /></PageContainer>;

  const decide = async (decision) => {
    setSaving(true);
    setActionError('');
    try {
      const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
      const response = await fetch(`${API_BASE}/auth/quotations/${quote.id}/decision`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ decision }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Could not save your quotation decision.');
      await refresh();
    } catch (requestError) {
      setActionError(requestError.message || 'Could not save your quotation decision.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader title="My Quotation" description="Review and accept your solar quotation." actions={<button className="btn-outline"><Download className="w-4 h-4" />Download PDF</button>} />
      <div className="card p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div><div className="font-display font-bold text-navy-900">{quote.code}</div><div className="text-xs text-slate-500">Created {fmtDate(quote.createdAt)} Â· Valid until {fmtDate(quote.validUntil)}</div></div>
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
          <button className="btn-emerald" onClick={() => decide('accept')} disabled={saving}><CheckCircle2 className="w-4 h-4" />{saving ? 'Saving...' : 'Accept Quotation'}</button>
          <button className="btn-outline" onClick={() => decide('reject')} disabled={saving}><XCircle className="w-4 h-4" />Reject</button>
        </div>
      )}
      {actionError && <p className="mt-3 text-sm text-rose-600">{actionError}</p>}
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
            {installation && <div className="mt-1 text-xs text-slate-500">Installation: {fmtDate(installation.scheduledDate)} Â· <StatusBadgeAuto status={installation.status} /></div>}
          </div>
        </div>
      ) : <p className="text-sm text-slate-400">No project to track.</p>}
    </PageContainer>
  );
}

function EquipmentPage() {
  const d = useMyData();
  return (
    <PageContainer>
      <PageHeader title="My Equipment" description="Equipment installed at your location." />
      <div className="space-y-3">
        {d.equipment.map((eq) => {
          const item = d.inventory.find((i) => i.id === eq.itemId);
          return (
            <div key={eq.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-navy-800">{item?.name ?? eq.serialNumber}</div>
                  <div className="text-xs text-slate-500">{item?.brand} Â· Serial: <span className="font-mono">{eq.serialNumber}</span></div>
                  <div className="text-xs text-slate-500 mt-0.5">Delivered: {eq.deliveredAt ? fmtDate(eq.deliveredAt) : 'â€”'}</div>
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
  return (
    <PageContainer>
      <PageHeader title="Warranty Details" description="Warranty status for your installed equipment." />
      <div className="space-y-3">
        {d.warranties.map((w) => {
          const eq = d.equipment.find((e) => e.id === w.equipmentId);
          const item = eq ? d.inventory.find((i) => i.id === eq.itemId) : null;
          return (
            <div key={w.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-navy-800">{item?.name ?? 'Equipment'}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{w.terms}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{fmtDate(w.startDate)} â€” {fmtDate(w.endDate)}</div>
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
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '', equipmentId: '' });

  const create = () => {
    if (!form.subject) return;
    const t = {
      id: genId('svc'), code: `TKT-${String(d.services.length + 1).padStart(3, '0')}`,
      customerId: d.customer?.id ?? '', type: 'Warranty', subject: form.subject, description: form.description,
      status: 'Open', createdAt: new Date().toISOString().slice(0, 10), partsCost: 0, labourCost: 0, customerConfirmed: false,
      equipmentId: form.equipmentId || undefined,
    };
    d.setPortalData((p) => ({ ...p, services: [...p.services, t] }));
    setOpen(false); setForm({ subject: '', description: '', equipmentId: '' });
  };

  const confirm = (s) => d.setPortalData((p) => ({ ...p, services: p.services.map((sv) => sv.id === s.id ? { ...sv, status: 'Closed', customerConfirmed: true, resolvedAt: new Date().toISOString().slice(0, 10) } : sv) }));

  return (
    <PageContainer>
      <PageHeader title="Service Requests" description="Register complaints and track resolution." actions={<button className="btn-primary" onClick={() => setOpen(true)}><Plus className="w-4 h-4" />New Complaint</button>} />
      <div className="space-y-2">
        {d.services.map((s) => (
          <div key={s.id} className="card p-4 flex items-start justify-between gap-3">
            <div><div className="font-medium text-navy-800">{s.code} â€” {s.subject}</div><div className="text-xs text-slate-500 mt-0.5">{s.description}</div><div className="text-xs text-slate-400 mt-1">{fmtDate(s.createdAt)}</div></div>
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
          <div><label className="label">Affected Equipment</label><select className="input" value={form.equipmentId} onChange={(e) => setForm({ ...form, equipmentId: e.target.value })}><option value="">General issue</option>{d.equipment.map((eq) => <option key={eq.id} value={eq.id}>{d.inventory.find((i) => i.id === eq.itemId)?.name ?? eq.serialNumber}</option>)}</select></div>
          <div><label className="label">Subject *</label><input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
          <div><label className="label">Description</label><textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        </div>
      </Modal>
    </PageContainer>
  );
}

function NotificationsPage() {
  const { notifications } = useMyData();
  return (
    <PageContainer>
      <PageHeader title="Notifications" description="Updates about your solar project." />
      <div className="space-y-2">
        {notifications.map((n) => (
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

import { useData } from '@/data/DataContext';
import { StatusBadgeAuto, EmptyState, AlertBanner } from '@/components/ui/Status';
import { Timeline } from '@/components/ui/Timeline';
import { fmtINR, fmtDate, fmtNum, daysBetween } from '@/lib/format';
import {
  Building2, Ruler, Sun, Wind, Battery, AlertTriangle, CheckCircle2, Clock,
  Cpu, Cable, ShieldCheck,
} from 'lucide-react';

export function OverviewTab({ project }) {
  const { data } = useData();
  const customer = data.customers.find((c) => c.id === project.customerId);
  const survey = data.surveys.find((s) => s.id === project.surveyId);
  const config = data.configs.find((c) => c.id === project.configId);
  const quotation = data.quotations.find((q) => q.id === project.quotationId);
  const installation = data.installations.find((i) => i.projectId === project.id);
  const payments = data.payments.filter((p) => p.projectId === project.id);
  const warranties = data.warranties.filter((w) => w.projectId === project.id);

  const workflow = [
    { stage: 'Customer Enquiry', done: true, date: project.startDate },
    { stage: 'Roof Survey', done: !!project.surveyId, date: survey?.scheduledDate },
    { stage: 'Survey Approval', done: survey?.status === 'Approved', date: survey?.approvedAt },
    { stage: 'Solar Configuration', done: !!project.configId, date: config?.createdAt },
    { stage: 'Quotation Sent', done: !!project.quotationId, date: quotation?.createdAt },
    { stage: 'Customer Approval', done: ['Customer Approved', 'Payment Received', 'Inventory Reserved', 'Dispatched', 'In Progress', 'Completed', 'Handed Over'].includes(project.status) },
    { stage: 'Payment Received', done: ['Payment Received', 'Inventory Reserved', 'Dispatched', 'In Progress', 'Completed', 'Handed Over'].includes(project.status) },
    { stage: 'Inventory Reserved', done: ['Inventory Reserved', 'Dispatched', 'In Progress', 'Completed', 'Handed Over'].includes(project.status) },
    { stage: 'Dispatched', done: ['Dispatched', 'In Progress', 'Completed', 'Handed Over'].includes(project.status) },
    { stage: 'Installation', done: !!installation, date: installation?.scheduledDate },
    { stage: 'Customer Acceptance', done: installation?.customerAccepted === true, date: installation?.acceptedAt },
    { stage: 'Warranty Activated', done: warranties.length > 0, date: warranties[0]?.startDate },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-3"><div className="text-xs text-slate-500">Customer</div><div className="text-sm font-semibold text-navy-800 truncate">{customer?.name}</div></div>
        <div className="card p-3"><div className="text-xs text-slate-500">System</div><div className="text-sm font-semibold text-navy-800">{project.capacity} kW {project.gridType}</div></div>
        <div className="card p-3"><div className="text-xs text-slate-500">Project Value</div><div className="text-sm font-semibold text-navy-800">{fmtINR(project.totalCost)}</div></div>
        <div className="card p-3"><div className="text-xs text-slate-500">Advance Paid</div><div className="text-sm font-semibold text-navy-800">{fmtINR(project.advancePaid)}</div></div>
      </div>

      <div>
        <h4 className="section-title text-sm mb-3">Project Workflow</h4>
        <div className="flex flex-wrap gap-2">
          {workflow.map((w, i) => (
            <div key={w.stage} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${w.done ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}>
                {w.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                {w.stage}
              </div>
              {i < workflow.length - 1 && <Chevron />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h4 className="section-title text-sm mb-3">Key Milestones</h4>
          <Timeline events={workflow.filter((w) => w.date).map((w, i) => ({ id: `m${i}`, date: fmtDate(w.date), title: w.stage, tone: w.done ? 'emerald' : 'slate' }))} />
        </div>
        <div className="card p-4">
          <h4 className="section-title text-sm mb-3">Financial Summary</h4>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Project Value</span><span className="font-medium">{fmtINR(project.totalCost)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Advance Paid</span><span className="font-medium text-emerald-600">{fmtINR(project.advancePaid)}</span></div>
            <div className="flex justify-between border-t pt-2"><span className="text-slate-500">Balance Outstanding</span><span className="font-semibold text-rose-600">{fmtINR(project.totalCost - project.advancePaid)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Payments Recorded</span><span className="font-medium">{payments.length}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Warranties Active</span><span className="font-medium">{warranties.length}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chevron() {
  return <span className="text-slate-300 text-xs">›</span>;
}

export function SurveyTab({ project }) {
  const { data } = useData();
  const survey = data.surveys.find((s) => s.id === project.surveyId);

  if (!survey) {
    return (
      <div>
        <AlertBanner type="info" message="No survey has been scheduled for this project yet. A survey must be completed and approved before a quotation can be generated." />
        <div className="mt-4"><EmptyState title="No Survey Record" message="Schedule a roof survey from the Roof Survey Management module." /></div>
      </div>
    );
  }

  const tech = data.technicians.find((t) => t.id === survey.technicianId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-500">Survey ID</div>
          <div className="font-mono text-navy-800">{survey.id.toUpperCase()}</div>
        </div>
        <StatusBadgeAuto status={survey.status} />
      </div>

      {survey.status !== 'Approved' && (
        <AlertBanner type="warning" message="Quotation generation is blocked until this survey is approved." />
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Field icon={<Ruler className="w-4 h-4" />} label="Roof Dimensions" value={`${survey.roofLength}m × ${survey.roofWidth}m`} />
        <Field icon={<Building2 className="w-4 h-4" />} label="Usable Area" value={survey.usableArea ? `${survey.usableArea} m²` : '—'} />
        <Field icon={<Sun className="w-4 h-4" />} label="Orientation" value={survey.orientation || '—'} />
        <Field icon={<Wind className="w-4 h-4" />} label="Tilt" value={survey.tilt ? `${survey.tilt}°` : '—'} />
        <Field icon={<AlertTriangle className="w-4 h-4" />} label="Shading" value={survey.shading} />
        <Field icon={<Cable className="w-4 h-4" />} label="Cable Distance" value={survey.cableDistance ? `${survey.cableDistance} m` : '—'} />
      </div>

      <div className="card p-4">
        <h4 className="section-title text-sm mb-2">Obstacles</h4>
        {survey.obstacles.length === 0 ? (
          <p className="text-sm text-slate-400">No obstacles detected.</p>
        ) : (
          <div className="flex flex-wrap gap-2">{survey.obstacles.map((o) => <span key={o} className="badge-amber">{o}</span>)}</div>
        )}
      </div>

      {survey.photos.length > 0 && (
        <div className="card p-4">
          <h4 className="section-title text-sm mb-3">Rooftop Photos</h4>
          <div className="grid grid-cols-4 gap-3">
            {survey.photos.map((p) => (
              <div key={p} className="aspect-square rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs border border-slate-200">
                {p}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-4">
        <h4 className="section-title text-sm mb-2">Technician Remarks</h4>
        <p className="text-sm text-slate-600">{survey.remarks || 'No remarks recorded.'}</p>
        {survey.approvedAt && (
          <div className="mt-3 text-xs text-emerald-600">Approved on {fmtDate(survey.approvedAt)} by {survey.approvedBy}</div>
        )}
      </div>
    </div>
  );
}

export function IntelligenceTab({ project }) {
  const { data } = useData();
  const config = data.configs.find((c) => c.id === project.configId);

  if (!config) {
    return <EmptyState title="No Configuration Yet" message="Generate a solar configuration recommendation from the Solar Configuration Intelligence module." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-500">Recommended Configuration</div>
          <div className="text-lg font-semibold text-navy-900">{config.recommendedCapacity} kW {config.gridType}</div>
        </div>
        <StatusBadgeAuto status={config.status} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Field icon={<Sun className="w-4 h-4" />} label="Panels" value={`${config.panelCount} × ${config.panelModel}`} />
        <Field icon={<Cpu className="w-4 h-4" />} label="Inverter" value={config.inverterModel} />
        {config.batteryCount > 0 && <Field icon={<Battery className="w-4 h-4" />} label="Batteries" value={`${config.batteryCount} × ${config.batteryModel}`} />}
        <Field icon={<Building2 className="w-4 h-4" />} label="Est. Cost" value={fmtINR(config.estimatedCost)} />
        <Field icon={<CheckCircle2 className="w-4 h-4" />} label="Annual Gen." value={`${fmtNum(config.estimatedAnnual)} kWh`} />
        <Field icon={<Clock className="w-4 h-4" />} label="Payback" value={`${config.paybackYears} years`} />
      </div>

      <div className="card p-4 bg-grape-50 border-grape-100">
        <div className="flex items-center gap-2 text-grape-700">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-sm font-medium">Approved Configuration</span>
        </div>
        <p className="text-xs text-grape-600 mt-1">This configuration was approved and used to generate the project quotation.</p>
      </div>
    </div>
  );
}

export function QuotationTab({ project }) {
  const { data } = useData();
  const quotation = data.quotations.find((q) => q.id === project.quotationId);

  if (!quotation) return <EmptyState title="No Quotation Yet" message="Generate a quotation once the survey is approved and configuration is ready." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><div className="text-sm text-slate-500">Quotation</div><div className="font-mono text-navy-800">{quotation.code}</div></div>
        <StatusBadgeAuto status={quotation.status} />
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr><th className="text-left px-4 py-2 font-medium text-slate-600">Component</th><th className="text-left px-4 py-2 font-medium text-slate-600">Category</th><th className="text-right px-4 py-2 font-medium text-slate-600">Qty</th><th className="text-right px-4 py-2 font-medium text-slate-600">Unit Price</th><th className="text-right px-4 py-2 font-medium text-slate-600">Total</th></tr>
          </thead>
          <tbody>
            {quotation.items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="px-4 py-2.5 text-navy-800">{item.component}</td>
                <td className="px-4 py-2.5"><span className="badge-navy">{item.category}</span></td>
                <td className="px-4 py-2.5 text-right">{item.qty}</td>
                <td className="px-4 py-2.5 text-right">{fmtINR(item.unitPrice)}</td>
                <td className="px-4 py-2.5 text-right font-medium">{fmtINR(item.qty * item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end">
        <div className="w-64 space-y-1.5 text-sm">
          <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{fmtINR(quotation.subtotal)}</span></div>
          <div className="flex justify-between text-slate-500"><span>GST</span><span>{fmtINR(quotation.tax)}</span></div>
          <div className="flex justify-between text-base font-semibold text-navy-900 border-t pt-2"><span>Total</span><span>{fmtINR(quotation.total)}</span></div>
        </div>
      </div>
      <div className="text-xs text-slate-400">Valid until {fmtDate(quotation.validUntil)}</div>
    </div>
  );
}

export function BOMTab({ project }) {
  const { data } = useData();
  const quotation = data.quotations.find((q) => q.id === project.quotationId);

  if (!quotation) return <EmptyState title="No BOM Available" message="Bill of Materials is generated from an approved quotation." />;

  return (
    <div className="space-y-4">
      <AlertBanner type={quotation.bomApproved ? 'success' : 'warning'} message={quotation.bomApproved ? 'BOM has been approved and inventory is reserved.' : 'BOM is pending approval — inventory cannot be reserved until approved.'} />
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-slate-600">Component</th>
              <th className="text-left px-4 py-2 font-medium text-slate-600">Category</th>
              <th className="text-right px-4 py-2 font-medium text-slate-600">Required Qty</th>
              <th className="text-left px-4 py-2 font-medium text-slate-600">Inventory Match</th>
              <th className="text-left px-4 py-2 font-medium text-slate-600">Availability</th>
            </tr>
          </thead>
          <tbody>
            {quotation.items.map((item) => {
              const invMatch = data.inventory.find((inv) => inv.name.toLowerCase().includes(item.component.toLowerCase().split(' ')[0]) || inv.category === item.category);
              const enough = invMatch ? invMatch.stock >= item.qty : false;
              return (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="px-4 py-2.5 text-navy-800">{item.component}</td>
                  <td className="px-4 py-2.5"><span className="badge-navy">{item.category}</span></td>
                  <td className="px-4 py-2.5 text-right">{item.qty}</td>
                  <td className="px-4 py-2.5 text-slate-600">{invMatch?.name ?? 'No match'}</td>
                  <td className="px-4 py-2.5">{enough ? <span className="badge-emerald">In Stock</span> : invMatch ? <span className="badge-rose">Short by {item.qty - invMatch.stock}</span> : <span className="badge-slate">Unknown</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function InventoryTab({ project }) {
  const { data } = useData();
  const equipment = data.equipment.filter((e) => e.projectId === project.id);
  const dispatches = data.dispatches.filter((d) => d.projectId === project.id);

  if (equipment.length === 0 && dispatches.length === 0) {
    return <EmptyState title="No Inventory Assigned" message="Equipment will be reserved and dispatched for this project after BOM approval." />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="section-title text-sm mb-2">Assigned Equipment ({equipment.length})</h4>
        <div className="space-y-2">
          {equipment.map((e) => {
            const item = data.inventory.find((i) => i.id === e.itemId);
            return (
              <div key={e.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                <div><div className="font-medium text-navy-800 text-sm">{item?.name ?? 'Unknown'}</div><div className="text-xs text-slate-400 font-mono">SN: {e.serialNumber}</div></div>
                <StatusBadgeAuto status={e.status} />
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <h4 className="section-title text-sm mb-2">Dispatches ({dispatches.length})</h4>
        {dispatches.map((d) => (
          <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
            <div><div className="font-medium text-navy-800 text-sm">{d.code}</div><div className="text-xs text-slate-400">{fmtDate(d.createdAt)} · {d.equipmentIds.length} items</div></div>
            <StatusBadgeAuto status={d.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function InstallationTab({ project }) {
  const { data } = useData();
  const installation = data.installations.find((i) => i.projectId === project.id);
  const tech = installation ? data.technicians.find((t) => t.id === installation.technicianId) : null;

  if (!installation) return <EmptyState title="No Installation Scheduled" message="An installation will be scheduled once dispatch is complete." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><div className="text-sm text-slate-500">Scheduled</div><div className="font-medium text-navy-800">{fmtDate(installation.scheduledDate)}</div></div>
        <div><div className="text-sm text-slate-500">Technician</div><div className="font-medium text-navy-800">{tech?.name ?? '—'}</div></div>
        <StatusBadgeAuto status={installation.status} />
      </div>

      <div className="card p-4">
        <h4 className="section-title text-sm mb-3">Installation Checklist</h4>
        <div className="space-y-2">
          {installation.checklist.map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {c.done ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-slate-300" />}
              <span className={c.done ? 'text-navy-700' : 'text-slate-400'}>{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-3"><div className="text-xs text-slate-500">Earthing Confirmed</div><div>{installation.earthingConfirmed ? <span className="badge-emerald">Yes</span> : <span className="badge-amber">Pending</span>}</div></div>
        <div className="card p-3"><div className="text-xs text-slate-500">Customer Acceptance</div><div>{installation.customerAccepted ? <span className="badge-emerald">{fmtDate(installation.acceptedAt)}</span> : <span className="badge-amber">Awaiting</span>}</div></div>
      </div>
    </div>
  );
}

export function PaymentsTab({ project }) {
  const { data } = useData();
  const payments = data.payments.filter((p) => p.projectId === project.id);

  if (payments.length === 0) return <EmptyState title="No Payments" message="Payments will appear here once the customer makes a payment." />;

  return (
    <div className="space-y-3">
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b"><tr><th className="text-left px-4 py-2 font-medium text-slate-600">Code</th><th className="text-left px-4 py-2 font-medium text-slate-600">Type</th><th className="text-right px-4 py-2 font-medium text-slate-600">Amount</th><th className="text-left px-4 py-2 font-medium text-slate-600">Date</th><th className="text-left px-4 py-2 font-medium text-slate-600">Status</th></tr></thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-slate-100">
                <td className="px-4 py-2.5 font-mono text-xs">{p.code}</td>
                <td className="px-4 py-2.5">{p.type}</td>
                <td className="px-4 py-2.5 text-right font-medium">{fmtINR(p.amount)}</td>
                <td className="px-4 py-2.5">{fmtDate(p.date)}</td>
                <td className="px-4 py-2.5"><StatusBadgeAuto status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end">
        <div className="w-64 space-y-1.5 text-sm">
          <div className="flex justify-between text-slate-500"><span>Total Value</span><span>{fmtINR(project.totalCost)}</span></div>
          <div className="flex justify-between text-slate-500"><span>Received</span><span className="text-emerald-600">{fmtINR(project.advancePaid)}</span></div>
          <div className="flex justify-between font-semibold text-rose-600 border-t pt-1.5"><span>Balance</span><span>{fmtINR(project.totalCost - project.advancePaid)}</span></div>
        </div>
      </div>
    </div>
  );
}

export function WarrantyTab({ project }) {
  const { data } = useData();
  const warranties = data.warranties.filter((w) => w.projectId === project.id);

  if (warranties.length === 0) return <EmptyState title="No Warranties" message="Warranties activate once equipment is delivered and installation is accepted." />;

  const today = '2026-10-31';
  return (
    <div className="space-y-3">
      {warranties.map((w) => {
        const eq = data.equipment.find((e) => e.id === w.equipmentId);
        const item = data.inventory.find((i) => i.id === eq?.itemId);
        const daysLeft = daysBetween(today, w.endDate);
        return (
          <div key={w.id} className="card p-4 flex items-center justify-between">
            <div>
              <div className="font-medium text-navy-800">{item?.name ?? 'Equipment'}</div>
              <div className="text-xs text-slate-400 font-mono">SN: {eq?.serialNumber}</div>
              <div className="text-xs text-slate-500 mt-1">{w.terms}</div>
            </div>
            <div className="text-right">
              <StatusBadgeAuto status={w.status} />
              <div className="text-xs text-slate-500 mt-1">{fmtDate(w.startDate)} → {fmtDate(w.endDate)}</div>
              <div className={`text-xs font-medium ${daysLeft > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{daysLeft > 0 ? `${daysLeft} days remaining` : 'Expired'}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Field({ icon, label, value }) {
  return (
    <div className="card p-3">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">{icon}{label}</div>
      <div className="text-sm font-semibold text-navy-800">{value}</div>
    </div>
  );
}

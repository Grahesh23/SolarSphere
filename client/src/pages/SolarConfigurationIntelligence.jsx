import { useState, useMemo } from 'react';
import {
  SlidersHorizontal, Sun, Cpu, Battery, Zap, IndianRupee, Clock, Sparkles,
  CheckCircle2, FileText, ListChecks, Loader2, GitCompare, Building2, TrendingUp,
} from 'lucide-react';
import { useData } from '@/data/DataContext';
import { requiresRevisionForApprovedBom } from '@/lib/bomRevision';
import { PageContainer } from '@/components/layout/MobileSidebar';
import { PageHeader } from '@/components/layout/Header';
import { StatusBadgeAuto, AlertBanner } from '@/components/ui/Status';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { fmtINR, fmtNum, genId } from '@/lib/format';





const PANEL_W = 540;
const PANEL_AREA_M2 = 2.6;

function getSystemType(input) {
  return input.gridAvailable ? 'On-Grid' : 'Off-Grid';
}

function buildBom(rec, systemType) {
  const bom = [
    { component: rec.panelModel, category: 'Panels', qty: rec.panelCount, unitPrice: 16500, required: true },
    { component: systemType === 'On-Grid' ? 'Grid-Compatible Inverter' : 'Off-Grid Inverter', category: 'Inverter', qty: 1, unitPrice: systemType === 'On-Grid' ? 62000 : 30000, required: true },
    { component: 'Mounting Structure Kit', category: 'Mounting', qty: Math.max(1, Math.ceil(rec.capacity)), unitPrice: 6000, required: true },
    { component: 'DC & AC Cabling', category: 'Cables', qty: 1, unitPrice: 12000, required: true },
    { component: 'Distribution Box & Protection', category: 'Protection', qty: 1, unitPrice: 8000, required: true },
    { component: 'Earthing & Safety Kit', category: 'Safety', qty: 1, unitPrice: 5000, required: true },
  ];

  if (systemType === 'Off-Grid') {
    bom.push({ component: rec.batteryModel || 'Battery Bank 150Ah', category: 'Battery', qty: rec.batteryCount || Math.max(1, Math.ceil(rec.capacity)), unitPrice: 14500, required: true });
    bom.push({ component: 'MPPT Charge Controller', category: 'Charge Controller', qty: 1, unitPrice: 9000, required: true });
  }

  return bom;
}

function recommend(input) {
  const capacity = Math.min(Math.max(Math.ceil(input.consumption / 120), 1), 5);
  const systemType = getSystemType(input);
  const panelCount = Math.ceil((capacity * 1000) / PANEL_W);
  const fitsArea = Math.floor(input.roofArea / PANEL_AREA_M2);
  const finalPanels = Math.min(panelCount, Math.max(1, fitsArea));
  const finalCapacity = Math.round((finalPanels * PANEL_W) / 1000 * 10) / 10;

  const batteryCount = systemType === 'Off-Grid' ? Math.ceil(finalCapacity) : 0;
  const panelModel = input.budget >= 150000 ? 'Waaree 540W Mono PERC' : 'Vikram 540W';
  const inverterModel = systemType === 'On-Grid' ? 'SolarEdge 5kW Single Phase' : 'Luminous 3kVA Off-Grid';
  const batteryModel = batteryCount > 0 ? 'Exide 150Ah Tubular' : '';

  const mountCost = 18000 + finalCapacity * 2000;
  const panelCost = finalPanels * 16500;
  const inverterCost = systemType === 'On-Grid' ? 62000 : 30000;
  const batteryCost = batteryCount * 14500;
  const cablingCost = 12000;
  const protectionCost = 8000;
  const safetyCost = 5000;
  const chargeControllerCost = systemType === 'Off-Grid' ? 9000 : 0;
  const installCost = 22000;
  const estimatedCost = panelCost + inverterCost + batteryCost + mountCost + cablingCost + protectionCost + safetyCost + chargeControllerCost + installCost;

  const estimatedAnnual = Math.round(finalCapacity * 1650);
  const savingsMonthly = Math.round((estimatedAnnual / 12) * 7.5);
  const paybackYears = Math.round((estimatedCost / (savingsMonthly * 12)) * 10) / 10;

  const reasoning = [];
  reasoning.push(`Customer consumes ${input.consumption} kWh/month → recommended capacity ${finalCapacity} kW`);
  reasoning.push(`Roof area ${input.roofArea} m² fits ${fitsArea} panels → using ${finalPanels}`);
  reasoning.push(systemType === 'On-Grid' ? 'Grid available → On-Grid configuration (net metering)' : 'No grid → Off-Grid with battery backup');
  if (batteryCount > 0) reasoning.push(`${batteryCount} × 150Ah battery for ${finalCapacity} kW off-grid autonomy`);
  reasoning.push(`Budget ${fmtINR(input.budget)} → ${input.budget >= estimatedCost ? 'sufficient for premium components' : 'may require financing; standard components selected'}`);

  return {
    capacity: finalCapacity,
    gridType: systemType,
    panelCount: finalPanels,
    panelModel,
    inverterModel,
    batteryCount,
    batteryModel,
    estimatedCost,
    estimatedAnnual,
    paybackYears,
    savingsMonthly,
    reasoning,
    bom: buildBom({ ...arguments[0], capacity: finalCapacity, panelCount: finalPanels, panelModel, inverterModel, batteryCount, batteryModel }, systemType),
  };
}

export function SolarConfigurationIntelligence() {
  const { data, setData } = useData();
  const [input, setInput] = useState({
    consumption: 480, monthlyBill: 7200, roofArea: 80, location: 'Pune, MH',
    orientation: 'South', shading: 'Low', gridAvailable: true, budget: 300000,
    systemType: 'On-Grid', capacity: 3,
  });
  const [rec, setRec] = useState(null);
  const [computing, setComputing] = useState(false);
  const [alternatives, setAlternatives] = useState([]);
  const [approveOpen, setApproveOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [quoteOpen, setQuoteOpen] = useState(false);

  const compute = () => {
    setComputing(true);
    setRec(null);
    setTimeout(() => {
      const targetSystemType = input.systemType || getSystemType(input);
      const primary = recommend({ ...input, gridAvailable: targetSystemType === 'On-Grid', capacity: Number(input.capacity) || 3 });
      setRec(primary);
      const alt1 = recommend({ ...input, gridAvailable: targetSystemType === 'On-Grid', budget: 200000, capacity: Math.max(1, Math.min(5, Number(input.capacity) || 3)) });
      const alt2 = recommend({ ...input, gridAvailable: targetSystemType !== 'On-Grid', capacity: Math.max(1, Math.min(5, Number(input.capacity) || 3)) });
      setAlternatives([alt1, alt2]);
      setComputing(false);
    }, 1600);
  };

  const approve = () => {
    if (!rec || !selectedProjectId) return;

    const systemType = rec.gridType || getSystemType(input);
    const previousApprovedConfig = data.configs.find((config) => config.projectId === selectedProjectId && config.status === 'Approved');
    const nextBom = (rec.bom || buildBom(rec, systemType)).map((item) => ({ ...item, id: genId('bom') }));

    if (previousApprovedConfig && requiresRevisionForApprovedBom({ bomApproved: true, items: previousApprovedConfig.bom || [] }, nextBom)) {
      const revisionMessage = 'This project already has an approved BOM/configuration. A new revision must be created instead of overwriting the approved version.';
      window.alert(revisionMessage);
      return;
    }

    const newConfig = {
      id: genId('cfg'),
      projectId: selectedProjectId,
      previousConfigId: previousApprovedConfig?.id || null,
      revision: previousApprovedConfig ? (previousApprovedConfig.revision || 1) + 1 : 1,
      recommendedCapacity: rec.capacity,
      gridType: systemType,
      systemType,
      capacity: Number(input.capacity) || Number(rec.capacity),
      panelCount: rec.panelCount,
      panelModel: rec.panelModel,
      inverterModel: rec.inverterModel,
      batteryCount: rec.batteryCount,
      batteryModel: rec.batteryModel,
      estimatedCost: rec.estimatedCost,
      estimatedAnnual: rec.estimatedAnnual,
      paybackYears: rec.paybackYears,
      savingsMonthly: rec.savingsMonthly,
      bom: nextBom,
      reasoning: rec.reasoning,
      status: previousApprovedConfig ? 'Revision Approved' : 'Approved',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setData((p) => ({ ...p, configs: [...p.configs, newConfig], projects: p.projects.map((pr) => pr.id === selectedProjectId ? { ...pr, configId: newConfig.id, totalCost: rec.estimatedCost, gridType: systemType, capacity: Number(input.capacity) || Number(rec.capacity) } : pr) }));
    setApproveOpen(false);
  };

  return (
    <PageContainer>
      <div className="mb-4">
        <AlertBanner type="info" message="Surveyor handoff: complete the roof configuration intelligence here, then pass the approved recommendation to the administrator for predictive analysis and final review." />
      </div>
      <PageHeader
        title="Solar Configuration Intelligence"
        description="Recommend optimal solar configurations from customer inputs. Compare alternatives, approve, and generate quotations."
        actions={
          <>
            <button className="btn-outline" disabled={!rec} onClick={() => setQuoteOpen(true)}>
              <FileText className="w-4 h-4" />Generate Quotation
            </button>
            <button className="btn-emerald" disabled={!rec} onClick={() => setApproveOpen(true)}>
              <CheckCircle2 className="w-4 h-4" />Approve Configuration
            </button>
            <button className="btn-grape" disabled={computing} onClick={compute}>
              {computing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {computing ? 'Computing...' : 'Generate Recommendation'}
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Inputs */}
        <div className="card p-5">
          <h3 className="section-title flex items-center gap-2 mb-4"><SlidersHorizontal className="w-4 h-4 text-grape-500" />Customer Inputs</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">System Type</label>
                <select className="input" value={input.systemType || 'On-Grid'} onChange={(e) => setInput({ ...input, systemType: e.target.value, gridAvailable: e.target.value === 'On-Grid' })}>
                  <option value="On-Grid">On-Grid</option>
                  <option value="Off-Grid">Off-Grid</option>
                </select>
              </div>
              <div><label className="label">Capacity (kW)</label><input type="number" min="1" max="5" className="input" value={input.capacity} onChange={(e) => setInput({ ...input, capacity: Math.min(5, Math.max(1, +e.target.value || 1)) })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Consumption (kWh/mo)</label><input type="number" className="input" value={input.consumption} onChange={(e) => setInput({ ...input, consumption: +e.target.value })} /></div>
              <div><label className="label">Monthly Bill (INR)</label><input type="number" className="input" value={input.monthlyBill} onChange={(e) => setInput({ ...input, monthlyBill: +e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Roof Area (m²)</label><input type="number" className="input" value={input.roofArea} onChange={(e) => setInput({ ...input, roofArea: +e.target.value })} /></div>
              <div><label className="label">Budget (INR)</label><input type="number" className="input" value={input.budget} onChange={(e) => setInput({ ...input, budget: +e.target.value })} /></div>
            </div>
            <div><label className="label">Location</label><input className="input" value={input.location} onChange={(e) => setInput({ ...input, location: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Orientation</label>
                <select className="input" value={input.orientation} onChange={(e) => setInput({ ...input, orientation: e.target.value })}>
                  <option>South</option><option>North</option><option>East</option><option>West</option>
                </select>
              </div>
              <div>
                <label className="label">Shading</label>
                <select className="input" value={input.shading} onChange={(e) => setInput({ ...input, shading: e.target.value })}>
                  <option>None</option><option>Low</option><option>Moderate</option><option>High</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" id="grid" checked={input.gridAvailable} onChange={(e) => setInput({ ...input, gridAvailable: e.target.checked })} className="w-4 h-4 rounded text-grape-600" />
              <label htmlFor="grid" className="text-sm text-navy-700">Grid connection available</label>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="lg:col-span-2 space-y-4">
          {!rec && !computing && (
            <div className="card p-10 text-center">
              <Sparkles className="w-10 h-10 text-grape-300 mx-auto mb-3" />
              <h3 className="font-display font-semibold text-navy-800">Ready to Generate Recommendation</h3>
              <p className="text-sm text-slate-500 mt-1">Adjust inputs on the left and click "Generate Recommendation" to compute an optimal solar configuration.</p>
            </div>
          )}

          {computing && (
            <div className="card p-10 text-center">
              <Loader2 className="w-10 h-10 text-grape-500 mx-auto mb-3 animate-spin" />
              <h3 className="font-display font-semibold text-navy-800">Computing Optimal Configuration</h3>
              <p className="text-sm text-slate-500 mt-1">Analyzing consumption, roof area, shading and budget...</p>
            </div>
          )}

          {rec && (
            <>
              <div className="card p-5 border-grape-200 ring-1 ring-grape-100 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-grape-100 text-grape-600 flex items-center justify-center"><Sparkles className="w-5 h-5" /></div>
                    <div>
                      <h3 className="section-title">Recommended Configuration</h3>
                      <p className="text-xs text-slate-500">{rec.capacity} kW {rec.gridType} system</p>
                    </div>
                  </div>
                  <StatusBadgeAuto status="Recommended" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <Stat icon={<Sun className="w-4 h-4" />} label="Capacity" value={`${rec.capacity} kW`} />
                  <Stat icon={<Sun className="w-4 h-4" />} label="Panels" value={`${rec.panelCount} × 540W`} />
                  <Stat icon={<Cpu className="w-4 h-4" />} label="Inverter" value={rec.inverterModel} />
                  {rec.batteryCount > 0 && <Stat icon={<Battery className="w-4 h-4" />} label="Batteries" value={`${rec.batteryCount} × 150Ah`} />}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Stat icon={<IndianRupee className="w-4 h-4" />} label="Est. Cost" value={fmtINR(rec.estimatedCost)} tone="navy" />
                  <Stat icon={<Zap className="w-4 h-4" />} label="Annual Gen." value={`${fmtNum(rec.estimatedAnnual)} kWh`} tone="emerald" />
                  <Stat icon={<TrendingUp className="w-4 h-4" />} label="Monthly Savings" value={fmtINR(rec.savingsMonthly)} tone="emerald" />
                  <Stat icon={<Clock className="w-4 h-4" />} label="Payback" value={`${rec.paybackYears} yrs`} tone="grape" />
                </div>

                <div className="mt-4 p-3 rounded-lg bg-grape-50 border border-grape-100">
                  <div className="flex items-center gap-2 text-grape-700 text-sm font-medium mb-2"><ListChecks className="w-4 h-4" />Configuration Reasoning</div>
                  <ul className="space-y-1 text-sm text-grape-700">
                    {rec.reasoning.map((r, i) => <li key={i} className="flex gap-2"><span className="text-grape-400">•</span>{r}</li>)}
                  </ul>
                </div>
              </div>

              {/* Alternatives */}
              <div className="card p-5">
                <h3 className="section-title flex items-center gap-2 mb-3"><GitCompare className="w-4 h-4 text-navy-500" />Alternative Configurations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {alternatives.map((alt, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-navy-800">{alt.capacity} kW {alt.gridType}</span>
                        <span className="text-xs text-slate-400">Option {i + 1}</span>
                      </div>
                      <div className="text-xs text-slate-500 space-y-1">
                        <div>{alt.panelCount} panels · {alt.batteryCount > 0 ? `${alt.batteryCount} batteries` : 'no batteries'}</div>
                        <div className="flex justify-between"><span>Cost</span><span className="font-medium text-navy-700">{fmtINR(alt.estimatedCost)}</span></div>
                        <div className="flex justify-between"><span>Payback</span><span className="font-medium text-navy-700">{alt.paybackYears} yrs</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Approve dialog */}
      <ConfirmDialog
        open={approveOpen}
        title="Approve Configuration?"
        message="The configuration will be attached to the selected project. If a prior approved BOM already exists, a new revision is created instead of overwriting it."
        confirmLabel="Approve"
        onConfirm={approve}
        onCancel={() => setApproveOpen(false)}
      />
      {approveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div className="bg-white rounded-xl shadow-card-lg border border-slate-200 p-5 max-w-sm w-full pointer-events-auto -mt-32">
            <label className="label">Link to Project *</label>
            <select className="input" value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
              <option value="">Select project...</option>
              {data.projects.filter((p) => !p.configId).map((p) => {
                const c = data.customers.find((c) => c.id === p.customerId);
                return <option key={p.id} value={p.id}>{p.code} — {c?.name}</option>;
              })}
            </select>
            <div className="text-xs text-slate-400 mt-2">Only projects without an approved configuration are listed.</div>
          </div>
        </div>
      )}

      {/* Generate quotation notice */}
      {quoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-navy-950/40" onClick={() => setQuoteOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-card-lg border border-slate-200 p-6">
            <FileText className="w-8 h-8 text-grape-500 mb-3" />
            <h3 className="font-display font-semibold text-navy-900">Quotation Generated</h3>
            <p className="text-sm text-slate-500 mt-1">A draft quotation and BOM have been created from this configuration. Visit the Quotations & BOM module to review and send it to the customer.</p>
            <div className="flex justify-end mt-5"><button className="btn-primary" onClick={() => setQuoteOpen(false)}>Got it</button></div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

function Stat({ icon, label, value, tone = 'slate' }) {
  const cls = { slate: 'text-navy-800', navy: 'text-navy-800', emerald: 'text-emerald-600', grape: 'text-grape-600' }[tone];
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">{icon}{label}</div>
      <div className={`text-sm font-semibold ${cls}`}>{value}</div>
    </div>
  );
}

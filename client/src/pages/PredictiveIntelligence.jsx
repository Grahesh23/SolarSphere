import { useState, useMemo } from 'react';
import {
  TrendingUp, Sun, IndianRupee, Clock, Calendar, Zap, AlertCircle, Activity, BarChart3,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, RadialBarChart, RadialBar,
} from 'recharts';
import { useData } from '@/data/DataContext';
import { PageContainer } from '@/components/layout/MobileSidebar';
import { PageHeader } from '@/components/layout/Header';
import { AlertBanner } from '@/components/ui/Status';
import { fmtINR, fmtNum, fmtINRRecharts, fmtKwhRecharts } from '@/lib/format';

const SEASONS = [
  { season: 'Winter (Dec-Feb)', generation: 580, percentage: 18 },
  { season: 'Spring (Mar-May)', generation: 940, percentage: 29 },
  { season: 'Summer (Jun-Aug)', generation: 1180, percentage: 36 },
  { season: 'Autumn (Sep-Nov)', generation: 560, percentage: 17 },
];

const MONTHLY = [
  { month: 'Jan', forecast: 180, actual: null },
  { month: 'Feb', forecast: 200, actual: null },
  { month: 'Mar', forecast: 260, actual: 252 },
  { month: 'Apr', forecast: 290, actual: 288 },
  { month: 'May', forecast: 310, actual: 305 },
  { month: 'Jun', forecast: 340, actual: 335 },
  { month: 'Jul', forecast: 360, actual: 358 },
  { month: 'Aug', forecast: 345, actual: null },
  { month: 'Sep', forecast: 280, actual: null },
  { month: 'Oct', forecast: 240, actual: null },
  { month: 'Nov', forecast: 200, actual: null },
  { month: 'Dec', forecast: 175, actual: null },
];

export function PredictiveIntelligence() {
  const { data } = useData();
  const [selectedProjectId, setSelectedProjectId] = useState(data.projects[0]?.id ?? '');

  const project = data.projects.find((p) => p.id === selectedProjectId);
  const config = data.configs.find((c) => c.id === project?.configId);
  const customer = data.customers.find((c) => c.id === project?.customerId);

  const forecast = useMemo(() => {
    const capacity = config?.recommendedCapacity ?? project?.capacity ?? 3;
    const annual = config?.estimatedAnnual ?? Math.round(capacity * 1650);
    const daily = Math.round(annual / 365);
    const monthly = Math.round(annual / 12);
    const savingsMonthly = Math.round((annual / 12) * 7.5);
    const savingsAnnual = savingsMonthly * 12;
    const payback = config?.paybackYears ?? Math.round((285000 / savingsAnnual) * 10) / 10;
    const lifetime25 = savingsAnnual * 25;
    const lifetime20 = savingsAnnual * 20;
    return { daily, monthly, annual, savingsMonthly, savingsAnnual, payback, lifetime25, lifetime20, capacity };
  }, [config, project]);

  const forecastMonthly = MONTHLY.map((m) => ({ ...m, forecast: Math.round(m.forecast * forecast.capacity / 3) }));
  const seasonal = SEASONS.map((s) => ({ ...s, generation: Math.round(s.generation * forecast.capacity / 3) }));
  const annualTotal = seasonal.reduce((s, x) => s + x.generation, 0);
  const totalForecastMonthly = forecastMonthly.reduce((s, x) => s + x.forecast, 0);

  return (
    <PageContainer>
      <PageHeader
        title="Predictive Intelligence"
        description="Forecast generation, savings, and payback. Forecasts are estimates based on system capacity — not guaranteed performance."
        actions={
          <select className="input max-w-xs" value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
            {data.projects.map((p) => {
              const c = data.customers.find((c) => c.id === p.customerId);
              return <option key={p.id} value={p.id}>{p.code} — {c?.name}</option>;
            })}
          </select>
        }
      />

      <div className="mb-4">
        <AlertBanner type="info" message="Forecasts are illustrative estimates derived from system capacity and standard irradiance models. They are NOT measured or guaranteed performance figures." />
      </div>

      {project && (
        <div className="card p-4 mb-5 flex flex-wrap items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-grape-100 text-grape-600 flex items-center justify-center"><Sun className="w-5 h-5" /></div>
          <div>
            <div className="text-sm font-semibold text-navy-800">{project.code} — {customer?.name}</div>
            <div className="text-xs text-slate-500">{forecast.capacity} kW {project.gridType} system · {project.location}</div>
          </div>
          <div className="ml-auto flex items-center gap-3 text-xs text-slate-500">
            <span>Configuration: <span className="font-medium text-navy-700">{config ? 'Approved' : 'Pending'}</span></span>
          </div>
        </div>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <KpiStat icon={<Sun className="w-4 h-4" />} label="Daily Generation" value={`${forecast.daily} kWh`} tone="amber" />
        <KpiStat icon={<Calendar className="w-4 h-4" />} label="Monthly Avg." value={`${fmtNum(forecast.monthly)} kWh`} tone="navy" />
        <KpiStat icon={<Zap className="w-4 h-4" />} label="Annual Gen." value={`${fmtNum(forecast.annual)} kWh`} tone="emerald" />
        <KpiStat icon={<IndianRupee className="w-4 h-4" />} label="Monthly Savings" value={fmtINR(forecast.savingsMonthly)} tone="emerald" />
        <KpiStat icon={<Clock className="w-4 h-4" />} label="Payback Period" value={`${forecast.payback} yrs`} tone="grape" />
        <KpiStat icon={<TrendingUp className="w-4 h-4" />} label="25-Yr Savings" value={fmtINR(forecast.lifetime25)} tone="navy" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Monthly forecast vs actual */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="section-title">Monthly Generation Forecast</h3>
              <p className="text-xs text-slate-500 mt-0.5">kWh per month · forecast vs actual where available</p>
            </div>
            <Activity className="w-5 h-5 text-grape-400" />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={forecastMonthly} margin={{ left: -16, right: 8, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={fmtKwhRecharts} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="forecast" stroke="#7e22ce" strokeWidth={2.5} dot={{ r: 3 }} name="Forecast" />
              <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} name="Actual (where available)" connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="text-xs text-slate-400 mt-2">Total forecast: <span className="font-medium text-navy-600">{fmtNum(totalForecastMonthly)} kWh/yr</span></div>
        </div>

        {/* Payback radial */}
        <div className="card p-5">
          <h3 className="section-title mb-1">Payback Progress</h3>
          <p className="text-xs text-slate-500 mb-2">Years to recover investment</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadialBarChart innerRadius="50%" outerRadius="100%" data={[{ name: 'payback', value: Math.min((forecast.payback / 8) * 100, 100), fill: '#7e22ce' }]} startAngle={90} endAngle={-270}>
              <RadialBar background dataKey="value" cornerRadius={10} />
              <Tooltip formatter={() => `${forecast.payback} years`} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="text-center -mt-4">
            <div className="text-3xl font-display font-bold text-grape-600">{forecast.payback}</div>
            <div className="text-xs text-slate-500">years estimated</div>
          </div>
        </div>
      </div>

      {/* Seasonal + long-term */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="section-title mb-1 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-navy-500" />Seasonal Comparison</h3>
          <p className="text-xs text-slate-500 mb-4">Estimated generation by season (kWh)</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={seasonal} margin={{ left: -16, right: 8, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="season" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={fmtKwhRecharts} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="generation" radius={[6, 6, 0, 0]}>
                {seasonal.map((_, i) => (
                  <Bar key={i} dataKey="generation" fill={['#2b4787', '#7e22ce', '#10b981', '#f59e0b'][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="text-xs text-slate-400 mt-2">Total: <span className="font-medium text-navy-600">{fmtNum(annualTotal)} kWh/yr</span></div>
        </div>

        <div className="card p-5">
          <h3 className="section-title mb-1 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-500" />Long-Term Financial Benefits</h3>
          <p className="text-xs text-slate-500 mb-4">Projected cumulative savings</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={Array.from({ length: 25 }, (_, i) => ({
              year: `Yr ${i + 1}`,
              savings: forecast.savingsAnnual * (i + 1),
            }))} margin={{ left: 8, right: 8, top: 4 }}>
              <defs>
                <linearGradient id="lt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 100000}L`} />
              <Tooltip formatter={fmtINRRecharts} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Area type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={2.5} fill="url(#lt)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="rounded-lg bg-emerald-50 p-3 text-center">
              <div className="text-xs text-emerald-700">20-Year Savings</div>
              <div className="text-lg font-display font-bold text-emerald-700">{fmtINR(forecast.lifetime20)}</div>
            </div>
            <div className="rounded-lg bg-navy-50 p-3 text-center">
              <div className="text-xs text-navy-700">25-Year Savings</div>
              <div className="text-lg font-display font-bold text-navy-700">{fmtINR(forecast.lifetime25)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2 text-xs text-slate-400">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Forecast model uses standard Indian irradiance (~5.0 peak sun hours/day) derated by 20% for system losses. Actual generation depends on location, weather, panel degradation, and maintenance. Forecasts are estimates — not a guarantee of performance.</span>
      </div>
    </PageContainer>
  );
}

function KpiStat({ icon, label, value, tone }) {
  const cls = { amber: 'text-amber-600 bg-amber-50', navy: 'text-navy-600 bg-navy-50', emerald: 'text-emerald-600 bg-emerald-50', grape: 'text-grape-600 bg-grape-50' }[tone];
  return (
    <div className="card p-4">
      <div className={`w-8 h-8 rounded-lg ${cls} flex items-center justify-center mb-2`}>{icon}</div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-display font-bold text-navy-900">{value}</div>
    </div>
  );
}

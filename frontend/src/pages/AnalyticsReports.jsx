import { useState } from 'react';
import { BarChart3, Download, TrendingUp, Users, FolderKanban, IndianRupee, Sun, Calendar } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar,
} from 'recharts';
import { useData } from '@/data/DataContext';
import { PageContainer } from '@/components/layout/MobileSidebar';
import { PageHeader } from '@/components/layout/Header';
import { fmtINR, fmtNum, fmtINRRecharts } from '@/lib/format';

const leadSourceData = [
  { source: 'Website', value: 2, color: '#2b4787' },
  { source: 'Referral', value: 2, color: '#7e22ce' },
  { source: 'Advertisement', value: 1, color: '#10b981' },
  { source: 'Exhibition', value: 1, color: '#f59e0b' },
];

const conversionFunnel = [
  { stage: 'Enquiries', value: 6, fill: '#2b4787' },
  { stage: 'Surveys', value: 4, fill: '#3a5fa3' },
  { stage: 'Quotations', value: 3, fill: '#7e22ce' },
  { stage: 'Won', value: 2, fill: '#10b981' },
];

const capacityData = [
  { range: '1-2 kW', projects: 1 },
  { range: '3 kW', projects: 1 },
  { range: '4 kW', projects: 1 },
  { range: '5 kW', projects: 2 },
];

export function AnalyticsReports() {
  const { data } = useData();
  const [range, setRange] = useState('6m');

  const installTrend = [
    { month: 'May', installs: 0, revenue: 180000 },
    { month: 'Jun', installs: 1, revenue: 215000 },
    { month: 'Jul', installs: 1, revenue: 285000 },
    { month: 'Aug', installs: 0, revenue: 175000 },
    { month: 'Sep', installs: 0, revenue: 295000 },
    { month: 'Oct', installs: 1, revenue: 460000 },
  ];

  const technicianPerf = data.technicians.map((t) => ({
    name: t.name.split(' ')[0],
    jobs: t.completedJobs,
    rating: t.rating,
  }));

  return (
    <PageContainer>
      <PageHeader
        title="Analytics & Reports"
        description="Business intelligence across sales, operations, finance and performance — exportable for stakeholders."
        actions={
          <>
            <select className="input max-w-[140px]" value={range} onChange={(e) => setRange(e.target.value)}>
              <option value="3m">Last 3 months</option>
              <option value="6m">Last 6 months</option>
              <option value="1y">Last year</option>
            </select>
            <button className="btn-primary"><Download className="w-4 h-4" />Export Dashboard</button>
          </>
        }
      />

      {/* Summary tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="card p-4"><div className="flex items-center gap-2 text-xs text-slate-500"><Users className="w-3.5 h-3.5 text-navy-500" />Total Customers</div><div className="text-2xl font-display font-bold text-navy-800 mt-1">{data.customers.length}</div><div className="text-xs text-emerald-600 mt-0.5">+12% growth</div></div>
        <div className="card p-4"><div className="flex items-center gap-2 text-xs text-slate-500"><FolderKanban className="w-3.5 h-3.5 text-grape-500" />Projects Won</div><div className="text-2xl font-display font-bold text-grape-700 mt-1">{data.projects.filter((p) => p.status === 'Completed').length}</div><div className="text-xs text-slate-400 mt-0.5">of {data.projects.length} total</div></div>
        <div className="card p-4"><div className="flex items-center gap-2 text-xs text-slate-500"><IndianRupee className="w-3.5 h-3.5 text-emerald-500" />Revenue</div><div className="text-2xl font-display font-bold text-emerald-600 mt-1">{fmtINR(data.payments.filter((p) => p.status === 'Paid' && p.type !== 'Supplier').reduce((s, p) => s + p.amount, 0))}</div><div className="text-xs text-emerald-600 mt-0.5">+22% YoY</div></div>
        <div className="card p-4"><div className="flex items-center gap-2 text-xs text-slate-500"><Sun className="w-3.5 h-3.5 text-amber-500" />Capacity Installed</div><div className="text-2xl font-display font-bold text-navy-800 mt-1">{data.projects.reduce((s, p) => s + p.capacity, 0)} kW</div><div className="text-xs text-slate-400 mt-0.5">{fmtNum(data.configs.reduce((s, c) => s + c.estimatedAnnual, 0))} kWh/yr</div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Revenue trend */}
        <div className="card p-5">
          <h3 className="section-title mb-1 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-500" />Revenue & Install Trend</h3>
          <p className="text-xs text-slate-500 mb-3">Monthly revenue (INR) and installations</p>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={installTrend} margin={{ left: 8, right: 8, top: 4 }}>
              <defs>
                <linearGradient id="rev2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={fmtINRRecharts} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#rev2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Lead sources */}
        <div className="card p-5">
          <h3 className="section-title mb-1 flex items-center gap-2"><Users className="w-4 h-4 text-navy-500" />Lead Sources</h3>
          <p className="text-xs text-slate-500 mb-3">Customer acquisition channels</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={leadSourceData} dataKey="value" nameKey="source" innerRadius={50} outerRadius={85} paddingAngle={3} label>
                {leadSourceData.map((e) => <Cell key={e.source} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion funnel */}
        <div className="card p-5">
          <h3 className="section-title mb-1 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-grape-500" />Sales Conversion Funnel</h3>
          <p className="text-xs text-slate-500 mb-3">Enquiry → Survey → Quote → Won</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={conversionFunnel} layout="vertical" margin={{ left: 20, right: 20, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="stage" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {conversionFunnel.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Capacity distribution */}
        <div className="card p-5">
          <h3 className="section-title mb-1 flex items-center gap-2"><Sun className="w-4 h-4 text-amber-500" />Capacity Distribution</h3>
          <p className="text-xs text-slate-500 mb-3">Projects by system size</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={capacityData} margin={{ left: -16, right: 8, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="projects" fill="#7e22ce" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Technician performance */}
      <div className="card p-5">
        <h3 className="section-title mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-navy-500" />Technician Performance</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={technicianPerf} margin={{ left: -16, right: 8, top: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
            <Bar dataKey="jobs" fill="#2b4787" radius={[6, 6, 0, 0]} name="Completed Jobs" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </PageContainer>
  );
}

import { useMemo } from 'react';
import {
  Users, FolderKanban, CheckCircle2, ClipboardCheck, FileText, IndianRupee,
  AlertTriangle, ShieldCheck, Headphones, HardHat, TrendingUp, TrendingDown,
  Activity, Zap, Sun, Battery, ChevronRight,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useData } from '@/data/DataContext';
import { PageContainer } from '@/components/layout/MobileSidebar';
import { PageHeader } from '@/components/layout/Header';
import { KpiCard } from '@/components/ui/KpiCard';
import { StatusBadgeAuto } from '@/components/ui/Status';
import { Timeline } from '@/components/ui/Timeline';
import { fmtINR, fmtNum, fmtINRRecharts } from '@/lib/format';
import { getMonthlyPaymentSummary } from '@/lib/dataSummaries';

export function ExecutiveDashboard({ onNavigate }) {
  const { data } = useData();
  const revenueData = getMonthlyPaymentSummary(data.payments).map(({ month, income, expense }) => ({
    month,
    revenue: income,
    expense,
  }));
  const projectMix = Object.entries(data.projects.reduce((totals, project) => {
    const type = project.gridType || 'Unspecified';
    totals[type] = (totals[type] || 0) + 1;
    return totals;
  }, {})).map(([name, value]) => ({
    name,
    value,
    color: name === 'On-Grid' ? '#2b4787' : name === 'Off-Grid' ? '#9333ea' : '#10b981',
  }));

  const kpis = useMemo(() => {
    const revenue = data.payments.filter((p) => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
    const expenses = data.payments.filter((p) => p.type === 'Supplier').reduce((s, p) => s + p.amount, 0);
    return {
      customers: data.customers.length,
      activeProjects: data.projects.filter((p) => !['Completed', 'Handed Over'].includes(p.status)).length,
      completed: data.projects.filter((p) => p.status === 'Completed').length,
      pendingSurveys: data.surveys.filter((s) => s.status === 'Scheduled' || s.status === 'In Progress').length,
      pendingQuotations: data.quotations.filter((q) => q.status === 'Draft' || q.status === 'Sent').length,
      revenue,
      expenses,
      profit: revenue - expenses,
      lowStock: data.inventory.filter((i) => i.stock <= i.reorderLevel).length,
      warrantyClaims: data.warranties.length,
      serviceTickets: data.services.filter((s) => !['Resolved', 'Closed'].includes(s.status)).length,
      techAvailable: data.technicians.filter((t) => t.availability === 'Available').length,
    };
  }, [data]);

  const activityTimeline = useMemo(
    () => data.activities.map((a) => ({
      id: a.id,
      date: a.date,
      title: a.action,
      description: `${a.module} · ${a.by}`,
      tone: (a.module === 'Service' ? 'amber' : a.module === 'Dispatch' ? 'navy' : a.module === 'Subsidy' ? 'grape' : 'emerald'),
    })),
    [data]
  );

  return (
    <PageContainer>
      <PageHeader
        title="Executive Dashboard"
        description="Real-time overview of operations, finance and intelligence across all solar projects."
        actions={
          <>
            <button className="btn-outline">
              <Activity className="w-4 h-4" />Last 6 months
            </button>
            <button className="btn-emerald">
              <FileText className="w-4 h-4" />Export Report
            </button>
          </>
        }
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-6">
        <KpiCard label="Total Customers" value={kpis.customers} icon={Users} tone="navy" onClick={() => onNavigate('customers')} />
        <KpiCard label="Active Projects" value={kpis.activeProjects} icon={FolderKanban} tone="grape" onClick={() => onNavigate('projects')} />
        <KpiCard label="Completed Installs" value={kpis.completed} icon={CheckCircle2} tone="emerald" onClick={() => onNavigate('installations')} />
        <KpiCard label="Pending Surveys" value={kpis.pendingSurveys} icon={ClipboardCheck} tone="amber" onClick={() => onNavigate('surveys')} />
        <KpiCard label="Pending Quotations" value={kpis.pendingQuotations} icon={FileText} tone="navy" onClick={() => onNavigate('quotations')} />
        <KpiCard label="Open Tickets" value={kpis.serviceTickets} icon={Headphones} tone="rose" onClick={() => onNavigate('service')} />
        <KpiCard label="Revenue" value={fmtINR(kpis.revenue)} icon={IndianRupee} tone="emerald" onClick={() => onNavigate('finance')} />
        <KpiCard label="Expenses" value={fmtINR(kpis.expenses)} icon={TrendingDown} tone="rose" onClick={() => onNavigate('finance')} />
        <KpiCard label="Net Profit" value={fmtINR(kpis.profit)} icon={TrendingUp} tone="navy" onClick={() => onNavigate('finance')} />
        <KpiCard label="Low Stock Alerts" value={kpis.lowStock} icon={AlertTriangle} tone="amber" onClick={() => onNavigate('inventory')} />
        <KpiCard label="Active Warranties" value={data.warranties.length} icon={ShieldCheck} tone="emerald" onClick={() => onNavigate('warranty')} />
        <KpiCard label="Technicians Free" value={kpis.techAvailable} icon={HardHat} tone="grape" onClick={() => onNavigate('technicians')} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="section-title">Revenue vs Expenses</h3>
              <p className="text-xs text-slate-500 mt-0.5">Trailing 6 months · INR</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-navy-600" />Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400" />Expenses</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData} margin={{ left: -16, right: 8, top: 4 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2b4787" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#2b4787" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fb7185" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#fb7185" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={fmtINRRecharts} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#2b4787" strokeWidth={2} fill="url(#rev)" />
              <Area type="monotone" dataKey="expense" stroke="#fb7185" strokeWidth={2} fill="url(#exp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="section-title mb-1">Project Mix</h3>
          <p className="text-xs text-slate-500 mb-3">By grid configuration</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={projectMix} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={2}>
                {projectMix.map((e) => (
                  <Cell key={e.name} fill={e.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 flex items-center gap-1.5"><Sun className="w-4 h-4 text-amber-500" />Capacity installed</span>
              <span className="font-semibold text-navy-800">{data.projects.reduce((s, p) => s + p.capacity, 0)} kW</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 flex items-center gap-1.5"><Zap className="w-4 h-4 text-emerald-500" />Annual generation</span>
              <span className="font-semibold text-navy-800">{fmtNum(data.configs.reduce((s, c) => s + c.estimatedAnnual, 0))} kWh</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 flex items-center gap-1.5"><Battery className="w-4 h-4 text-grape-500" />Batteries deployed</span>
              <span className="font-semibold text-navy-800">{data.configs.reduce((s, c) => s + c.batteryCount, 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity + pipeline + inventory alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Recent Activity</h3>
            <button className="text-xs text-navy-600 hover:underline flex items-center gap-0.5">View all<ChevronRight className="w-3 h-3" /></button>
          </div>
          <Timeline events={activityTimeline} />
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="section-title mb-3">Project Pipeline</h3>
            <div className="space-y-2.5">
              {['Enquiry', 'Survey Scheduled', 'Quotation Sent', 'In Progress', 'Completed'].map((stage) => {
                const count = data.projects.filter((p) => p.status === stage).length;
                const pct = data.projects.length ? (count / data.projects.length) * 100 : 0;
                return (
                  <div key={stage}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-600">{stage}</span>
                      <span className="font-semibold text-navy-700">{count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="section-title mb-3">Inventory Alerts</h3>
            <div className="space-y-2">
              {data.inventory.filter((i) => i.stock <= i.reorderLevel).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0">
                    <div className="font-medium text-navy-800 truncate">{item.name}</div>
                    <div className="text-xs text-slate-400">{item.brand} · {item.sku}</div>
                  </div>
                  <StatusBadgeAuto status={`${item.stock} ${item.unit}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

import { useState, useMemo } from 'react';
import {
  LayoutDashboard, CreditCard, IndianRupee, Wallet, HardHat, Receipt, FileText,
  Landmark, BarChart3, Plus, TrendingUp, TrendingDown, AlertCircle, Download,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useData } from '@/data/DataContext';
import { PortalLayout, PageContainer, PageHeader } from '@/components/layout/PortalLayout';
import { KpiCard } from '@/components/ui/KpiCard';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { StatusBadgeAuto, AlertBanner } from '@/components/ui/Status';
import { fmtINR, fmtDate, fmtINRRecharts, genId } from '@/lib/format';
import { getMonthlyPaymentSummary } from '@/lib/dataSummaries';

export function FinancePortal() {
  const [active, setActive] = useState('dashboard');
  return (
    <PortalLayout active={active} onNavigate={setActive}>
      <FinancePage active={active} onNavigate={setActive} />
    </PortalLayout>
  );
}

function FinancePage({ active, onNavigate }) {
  switch (active) {
    case 'dashboard': return <FinanceDashboard onNavigate={onNavigate} />;
    case 'customer-payments': return <CustomerPaymentsPage />;
    case 'outstanding': return <OutstandingPage />;
    case 'supplier-payments': return <SupplierPaymentsPage />;
    case 'technician-payments': return <TechnicianPaymentsPage />;
    case 'expenses': return <ExpensesPage />;
    case 'invoices': return <InvoicesPage />;
    case 'subsidy': return <SubsidyPage />;
    case 'profit-loss': return <ProfitLossPage />;
    case 'reports': return <ReportsPage />;
    default: return <FinanceDashboard onNavigate={onNavigate} />;
  }
}

function FinanceDashboard({ onNavigate }) {
  const { data } = useData();
  const cashflowData = getMonthlyPaymentSummary(data.payments);
  const revenue = data.payments.filter((p) => p.status === 'Paid' && p.type !== 'Supplier').reduce((s, p) => s + p.amount, 0);
  const expenses = data.payments.filter((p) => p.type === 'Supplier').reduce((s, p) => s + p.amount, 0);
  const profit = revenue - expenses;
  const pending = data.payments.filter((p) => p.status === 'Pending' || p.status === 'Overdue').length;
  const overdue = data.payments.filter((p) => p.status === 'Overdue').length;

  return (
    <PageContainer>
      <PageHeader title="Finance Dashboard" description="Revenue, expenses, and profitability across all projects." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total Revenue" value={fmtINR(revenue)} icon={IndianRupee} tone="emerald" onClick={() => onNavigate('customer-payments')} />
        <KpiCard label="Total Expenses" value={fmtINR(expenses)} icon={TrendingDown} tone="rose" onClick={() => onNavigate('expenses')} />
        <KpiCard label="Net Profit" value={fmtINR(profit)} icon={TrendingUp} tone="navy" onClick={() => onNavigate('profit-loss')} />
        <KpiCard label="Pending Payments" value={pending} icon={AlertCircle} tone="amber" onClick={() => onNavigate('outstanding')} />
        <KpiCard label="Overdue" value={overdue} icon={AlertCircle} tone="rose" onClick={() => onNavigate('outstanding')} />
        <KpiCard label="Supplier Bills" value={data.payments.filter((p) => p.type === 'Supplier').length} icon={Wallet} tone="navy" onClick={() => onNavigate('supplier-payments')} />
        <KpiCard label="Subsidies Tracked" value={data.subsidies.length} icon={Landmark} tone="grape" onClick={() => onNavigate('subsidy')} />
        <KpiCard label="Active Projects" value={data.projects.filter((p) => !['Completed', 'Handed Over'].includes(p.status)).length} icon={BarChart3} tone="navy" onClick={() => onNavigate('reports')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="card p-5">
          <h3 className="section-title mb-3">Monthly Cash Flow</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={cashflowData} margin={{ left: -16, right: 8, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={fmtINRRecharts} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="#fb7185" radius={[4, 4, 0, 0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-5">
          <h3 className="section-title mb-3">Project Profitability</h3>
          <div className="space-y-2">
            {data.projects.map((p) => {
              const cust = data.customers.find((c) => c.id === p.customerId);
              const total = p.totalCost;
              const margin = Math.round(total * 0.18);
              return (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <div><div className="font-medium text-navy-800">{p.code}</div><div className="text-xs text-slate-400">{cust?.name}</div></div>
                  <div className="text-right"><div className="font-semibold text-emerald-600">{fmtINR(margin)}</div><div className="text-xs text-slate-400">{fmtINR(total)} · 18%</div></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function CustomerPaymentsPage() {
  const { data, setData } = useData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ projectId: '', type: 'Advance', amount: 0, method: 'Bank Transfer', reference: '' });

  const record = () => {
    if (!form.projectId || form.amount <= 0) return;
    const proj = data.projects.find((p) => p.id === form.projectId);
    if (!proj) return;
    const dup = data.payments.some((p) => p.projectId === form.projectId && p.type === form.type && p.amount === form.amount && p.status === 'Paid');
    if (dup) { alert('Duplicate payment detected — this payment already exists.'); return; }
    const pay = {
      id: genId('pay'), code: `PAY-${String(data.payments.length + 1).padStart(3, '0')}`,
      projectId: form.projectId, customerId: proj.customerId, type: form.type, amount: Number(form.amount),
      status: 'Paid', date: new Date().toISOString().slice(0, 10), method: form.method, reference: form.reference,
      party: data.customers.find((c) => c.id === proj.customerId)?.name || '',
    };
    setData((p) => ({ ...p, payments: [...p.payments, pay] }));
    setOpen(false); setForm({ projectId: '', type: 'Advance', amount: 0, method: 'Bank Transfer', reference: '' });
  };

  const columns = [
    { key: 'code', label: 'Code', render: (r) => <span className="font-mono text-xs text-slate-500">{r.code}</span> },
    { key: 'project', label: 'Project', sortValue: (r) => r.code, render: (r) => data.projects.find((p) => p.id === r.projectId)?.code },
    { key: 'party', label: 'Customer', render: (r) => r.party },
    { key: 'type', label: 'Type', render: (r) => <span className="badge-navy">{r.type}</span> },
    { key: 'amount', label: 'Amount', sortValue: (r) => r.amount, render: (r) => fmtINR(r.amount) },
    { key: 'method', label: 'Method', render: (r) => r.method },
    { key: 'date', label: 'Date', sortValue: (r) => r.date, render: (r) => fmtDate(r.date) },
    { key: 'status', label: 'Status', sortValue: (r) => r.status, render: (r) => <StatusBadgeAuto status={r.status} /> },
  ];
  const customerPayments = data.payments.filter((p) => p.type !== 'Supplier');

  return (
    <PageContainer>
      <PageHeader title="Customer Payments" description="Record customer advances, installments, and final payments." actions={<button className="btn-primary" onClick={() => setOpen(true)}><Plus className="w-4 h-4" />Record Payment</button>} />
      <DataTable columns={columns} rows={customerPayments} searchKeys={['code', 'party']} searchPlaceholder="Search payments..." />
      <Modal open={open} onClose={() => setOpen(false)} title="Record Payment" footer={<><button className="btn-outline" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" onClick={record}>Save</button></>}>
        <div className="space-y-3">
          <div><label className="label">Project *</label><select className="input" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}><option value="">Select...</option>{data.projects.map((p) => <option key={p.id} value={p.id}>{p.code} — {data.customers.find((c) => c.id === p.customerId)?.name}</option>)}</select></div>
          <div><label className="label">Type</label><select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option>Advance</option><option>Installment</option><option>Final</option></select></div>
          <div><label className="label">Amount (₹) *</label><input type="number" className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></div>
          <div><label className="label">Method</label><select className="input" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}><option>Bank Transfer</option><option>UPI</option><option>Cheque</option><option>Cash</option></select></div>
          <div><label className="label">Reference</label><input className="input" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} /></div>
        </div>
      </Modal>
    </PageContainer>
  );
}

function OutstandingPage() {
  const { data } = useData();
  const pending = data.payments.filter((p) => p.status === 'Pending' || p.status === 'Overdue');
  return (
    <PageContainer>
      <PageHeader title="Outstanding Balances" description="Pending and overdue payments across all projects." />
      <DataTable
        columns={[
          { key: 'code', label: 'Code', render: (r) => <span className="font-mono text-xs text-slate-500">{r.code}</span> },
          { key: 'party', label: 'Party', render: (r) => r.party },
          { key: 'amount', label: 'Amount', sortValue: (r) => r.amount, render: (r) => fmtINR(r.amount) },
          { key: 'date', label: 'Due Date', sortValue: (r) => r.date, render: (r) => fmtDate(r.date) },
          { key: 'status', label: 'Status', sortValue: (r) => r.status, render: (r) => <StatusBadgeAuto status={r.status} /> },
        ]}
        rows={pending} searchKeys={['code', 'party']} searchPlaceholder="Search..." />
    </PageContainer>
  );
}

function SupplierPaymentsPage() {
  const { data } = useData();
  const supplierPays = data.payments.filter((p) => p.type === 'Supplier');
  return (
    <PageContainer>
      <PageHeader title="Supplier Payments" description="Payments to suppliers and vendors." />
      <DataTable
        columns={[
          { key: 'code', label: 'Code', render: (r) => <span className="font-mono text-xs text-slate-500">{r.code}</span> },
          { key: 'party', label: 'Supplier', render: (r) => r.party },
          { key: 'amount', label: 'Amount', sortValue: (r) => r.amount, render: (r) => fmtINR(r.amount) },
          { key: 'date', label: 'Date', sortValue: (r) => r.date, render: (r) => fmtDate(r.date) },
          { key: 'status', label: 'Status', sortValue: (r) => r.status, render: (r) => <StatusBadgeAuto status={r.status} /> },
        ]}
        rows={supplierPays} searchKeys={['code', 'party']} searchPlaceholder="Search..." />
    </PageContainer>
  );
}

function TechnicianPaymentsPage() {
  const { data } = useData();
  return (
    <PageContainer>
      <PageHeader title="Technician Payments" description="Labour and service payments to technicians." />
      <div className="space-y-2">
        {data.technicians.map((t) => (
          <div key={t.id} className="card p-4 flex items-center justify-between">
            <div><div className="font-medium text-navy-800">{t.name}</div><div className="text-xs text-slate-500">{t.completedJobs} jobs · ★ {t.rating}</div></div>
            <div className="text-right"><div className="text-sm font-semibold text-navy-800">{fmtINR(t.completedJobs * 2500)}</div><div className="text-xs text-slate-400">est. labour</div></div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}

function ExpensesPage() {
  const { data } = useData();
  const expenses = data.payments.filter((p) => p.type === 'Supplier' || p.type === 'Technician');
  return (
    <PageContainer>
      <PageHeader title="Project Expenses" description="All supplier and technician expenses." />
      <DataTable
        columns={[
          { key: 'code', label: 'Code', render: (r) => <span className="font-mono text-xs text-slate-500">{r.code}</span> },
          { key: 'party', label: 'Party', render: (r) => r.party },
          { key: 'amount', label: 'Amount', sortValue: (r) => r.amount, render: (r) => fmtINR(r.amount) },
          { key: 'date', label: 'Date', sortValue: (r) => r.date, render: (r) => fmtDate(r.date) },
          { key: 'status', label: 'Status', sortValue: (r) => r.status, render: (r) => <StatusBadgeAuto status={r.status} /> },
        ]}
        rows={expenses} searchKeys={['code', 'party']} searchPlaceholder="Search expenses..." />
    </PageContainer>
  );
}

function InvoicesPage() {
  const { data } = useData();
  return (
    <PageContainer>
      <PageHeader title="Customer Invoices" description="Generate and download project invoices." actions={<button className="btn-outline"><Download className="w-4 h-4" />Export</button>} />
      <div className="space-y-3">
        {data.projects.map((p) => {
          const c = data.customers.find((c) => c.id === p.customerId);
          return (
            <div key={p.id} className="card p-4 flex items-center justify-between">
              <div><div className="font-medium text-navy-800">{p.code}</div><div className="text-xs text-slate-500">{c?.name} · {fmtDate(p.startDate)}</div></div>
              <div className="flex items-center gap-3">
                <div className="text-right"><div className="text-sm font-semibold text-navy-800">{fmtINR(p.totalCost)}</div><div className="text-xs text-slate-400">Advance: {fmtINR(p.advancePaid)}</div></div>
                <button className="btn-outline text-xs"><Download className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}

function SubsidyPage() {
  return <SubsidyEmbed />;
}

import { SubsidyManagement } from '@/pages/SubsidyManagement';
function SubsidyEmbed() { return <SubsidyManagement />; }

function ProfitLossPage() {
  const { data } = useData();
  const revenue = data.payments.filter((p) => p.status === 'Paid' && p.type !== 'Supplier').reduce((s, p) => s + p.amount, 0);
  const expenses = data.payments.filter((p) => p.type === 'Supplier').reduce((s, p) => s + p.amount, 0);
  const profit = revenue - expenses;

  return (
    <PageContainer>
      <PageHeader title="Profit & Loss" description="Revenue, expenses, and net profit statement." />
      <div className="card p-6 max-w-2xl">
        <div className="space-y-3">
          <div className="flex justify-between text-sm pb-2 border-b border-slate-200"><span className="text-slate-500">Total Revenue</span><span className="font-semibold text-emerald-600">{fmtINR(revenue)}</span></div>
          <div className="flex justify-between text-sm pb-2 border-b border-slate-200"><span className="text-slate-500">Total Expenses</span><span className="font-semibold text-rose-600">{fmtINR(expenses)}</span></div>
          <div className="flex justify-between text-base font-bold pb-2 border-b-2 border-navy-200"><span className="text-navy-900">Net Profit</span><span className="text-navy-900">{fmtINR(profit)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-slate-500">Profit Margin</span><span className="font-semibold text-navy-700">{revenue > 0 ? Math.round((profit / revenue) * 100) : 0}%</span></div>
        </div>
      </div>
    </PageContainer>
  );
}

function ReportsPage() {
  const { data } = useData();
  return (
    <PageContainer>
      <PageHeader title="Financial Reports" description="Project-wise profitability and financial summaries." actions={<button className="btn-outline"><Download className="w-4 h-4" />Export Reports</button>} />
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-slate-600">Project</th>
              <th className="text-left px-4 py-2 font-medium text-slate-600">Customer</th>
              <th className="text-right px-4 py-2 font-medium text-slate-600">Total Cost</th>
              <th className="text-right px-4 py-2 font-medium text-slate-600">Advance</th>
              <th className="text-right px-4 py-2 font-medium text-slate-600">Est. Profit</th>
              <th className="text-left px-4 py-2 font-medium text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.projects.map((p) => {
              const c = data.customers.find((c) => c.id === p.customerId);
              return (
                <tr key={p.id} className="border-b border-slate-100">
                  <td className="px-4 py-2.5 text-navy-800 font-medium">{p.code}</td>
                  <td className="px-4 py-2.5 text-slate-600">{c?.name}</td>
                  <td className="px-4 py-2.5 text-right">{fmtINR(p.totalCost)}</td>
                  <td className="px-4 py-2.5 text-right">{fmtINR(p.advancePaid)}</td>
                  <td className="px-4 py-2.5 text-right text-emerald-600">{fmtINR(Math.round(p.totalCost * 0.18))}</td>
                  <td className="px-4 py-2.5"><StatusBadgeAuto status={p.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}

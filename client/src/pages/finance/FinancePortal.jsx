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
import { getProjectFinancialSummary, getTechnicianPerformance, buildInvoiceFromProject } from '@/lib/financialSummary';

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

  const projectSummaries = useMemo(
    () => data.projects.map((project) => getProjectFinancialSummary({
      project,
      quotation: data.quotations.find((q) => q.id === project.quotationId),
      payments: data.payments,
      purchases: data.purchases || [],
      expenses: data.expenses || [],
      technicianPayments: data.technicianPayments || [],
      installations: data.installations,
    })),
    [data]
  );

  const revenue = projectSummaries.reduce((sum, item) => sum + item.revenue, 0);
  const projectCost = projectSummaries.reduce((sum, item) => sum + item.totalProjectCost, 0);
  const profit = revenue - projectCost;
  const pending = data.payments.filter((p) => p.status === 'Pending' || p.status === 'Overdue').length;
  const overdue = data.payments.filter((p) => p.status === 'Overdue').length;

  return (
    <PageContainer>
      <PageHeader title="Finance Dashboard" description="Revenue, expenses, and profitability across all projects." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total Revenue" value={fmtINR(revenue)} icon={IndianRupee} tone="emerald" onClick={() => onNavigate('customer-payments')} />
        <KpiCard label="Project Cost" value={fmtINR(projectCost)} icon={TrendingDown} tone="rose" onClick={() => onNavigate('expenses')} />
        <KpiCard label="Gross Profit" value={fmtINR(profit)} icon={TrendingUp} tone="navy" onClick={() => onNavigate('profit-loss')} />
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
            {projectSummaries.slice(0, 6).map((summary) => {
              const project = data.projects.find((p) => p.id === summary.projectId);
              const cust = data.customers.find((c) => c.id === project?.customerId);
              return (
                <div key={summary.projectId} className="flex items-center justify-between text-sm">
                  <div><div className="font-medium text-navy-800">{summary.code}</div><div className="text-xs text-slate-400">{cust?.name}</div></div>
                  <div className="text-right"><div className="font-semibold text-emerald-600">{fmtINR(summary.grossProfit)}</div><div className="text-xs text-slate-400">{fmtINR(summary.totalProjectCost)} · {summary.profitMargin.toFixed(1)}%</div></div>
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
  const rows = useMemo(
    () => getTechnicianPerformance({
      technicians: data.technicians,
      installations: data.installations,
      technicianPayments: data.technicianPayments || [],
    }),
    [data]
  );

  return (
    <PageContainer>
      <PageHeader title="Technician Payments" description="Labour hours, completed installations, and pending payments for each technician." />
      <div className="space-y-2">
        {rows.map((t) => (
          <div key={t.technicianId} className="card p-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-medium text-navy-800">{t.name}</div>
              <div className="text-xs text-slate-500">{t.totalHours.toFixed(1)} hours · {t.completedInstallations} completed · {t.pendingAssignments} pending</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-navy-800">{fmtINR(t.paymentsMade || t.labourCost || 0)}</div>
              <div className="text-xs text-slate-400">{t.paymentStatus}</div>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}

function ExpensesPage() {
  const { data, setData } = useData();
  const [form, setForm] = useState({ category: 'Equipment purchases', description: '', amount: 0, projectId: '', date: new Date().toISOString().slice(0, 10) });

  const projectExpenses = (data.expenses || []).filter((item) => item.projectId);
  const businessExpenses = (data.expenses || []).filter((item) => !item.projectId);
  const allExpenses = [...projectExpenses, ...businessExpenses];

  const recordExpense = () => {
    if (!form.description || Number(form.amount) <= 0) return;
    const expense = {
      id: genId('exp'),
      projectId: form.projectId || null,
      category: form.category,
      description: form.description,
      amount: Number(form.amount),
      date: form.date,
      status: 'Recorded',
    };
    setData((prev) => ({ ...prev, expenses: [...(prev.expenses || []), expense] }));
    setForm({ category: 'Equipment purchases', description: '', amount: 0, projectId: '', date: new Date().toISOString().slice(0, 10) });
  };

  return (
    <PageContainer>
      <PageHeader title="Project Expenses" description="Track project-specific and business-wide spending without double counting." />
      <div className="card p-4 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Category</label><select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Equipment purchases</option><option>Installation materials</option><option>Transportation</option><option>Technician payments</option><option>Maintenance</option><option>Office/Operational</option><option>Other expenses</option></select></div>
          <div><label className="label">Project</label><select className="input" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}><option value="">General expense</option>{data.projects.map((p) => <option key={p.id} value={p.id}>{p.code}</option>)}</select></div>
          <div><label className="label">Amount</label><input type="number" className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></div>
          <div><label className="label">Date</label><input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div className="col-span-2"><label className="label">Description</label><input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        </div>
        <div className="mt-3 flex justify-end"><button className="btn-primary" onClick={recordExpense}>Add Expense</button></div>
      </div>

      <DataTable
        columns={[
          { key: 'category', label: 'Category', render: (r) => r.category },
          { key: 'description', label: 'Description', render: (r) => r.description },
          { key: 'project', label: 'Project', render: (r) => data.projects.find((p) => p.id === r.projectId)?.code || 'General' },
          { key: 'amount', label: 'Amount', sortValue: (r) => r.amount, render: (r) => fmtINR(r.amount) },
          { key: 'date', label: 'Date', render: (r) => fmtDate(r.date) },
        ]}
        rows={allExpenses} searchKeys={['description', 'category']} searchPlaceholder="Search expenses..." />
    </PageContainer>
  );
}

function InvoicesPage() {
  const { data, setData } = useData();
  const ensureInvoices = useMemo(() => {
    const existing = data.invoices || [];
    if (existing.length > 0) return existing;
    return data.projects.slice(0, 4).map((project) => {
      const customer = data.customers.find((c) => c.id === project.customerId);
      return buildInvoiceFromProject({
        project,
        customer,
        quotation: data.quotations.find((q) => q.id === project.quotationId),
        payments: data.payments,
      });
    });
  }, [data]);

  const createInvoice = (project) => {
    const customer = data.customers.find((c) => c.id === project.customerId);
    const invoice = buildInvoiceFromProject({
      project,
      customer,
      quotation: data.quotations.find((q) => q.id === project.quotationId),
      payments: data.payments,
    });
    setData((prev) => ({ ...prev, invoices: [invoice, ...(prev.invoices || [])] }));
  };

  return (
    <PageContainer>
      <PageHeader title="Customer Invoices" description="Generate invoices from approved quotations and track outstanding amounts." />
      <div className="space-y-3">
        {ensureInvoices.map((invoice) => (
          <div key={invoice.id} className="card p-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-medium text-navy-800">{invoice.invoiceNumber}</div>
              <div className="text-xs text-slate-500">{invoice.projectCode} · {invoice.customerName}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-navy-800">{fmtINR(invoice.totalAmount)}</div>
              <div className="text-xs text-slate-400">Paid {fmtINR(invoice.amountPaid)} · Due {fmtINR(invoice.outstandingAmount)}</div>
            </div>
            <button className="btn-outline text-xs" onClick={() => createInvoice(data.projects.find((p) => p.id === invoice.projectId))}>Generate</button>
          </div>
        ))}
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
  const projectSummaries = data.projects.map((project) => getProjectFinancialSummary({
    project,
    quotation: data.quotations.find((q) => q.id === project.quotationId),
    payments: data.payments,
    purchases: data.purchases || [],
    expenses: data.expenses || [],
    technicianPayments: data.technicianPayments || [],
    installations: data.installations,
  }));
  const revenue = projectSummaries.reduce((sum, item) => sum + item.revenue, 0);
  const totalCost = projectSummaries.reduce((sum, item) => sum + item.totalProjectCost, 0);
  const netProfit = revenue - totalCost;

  return (
    <PageContainer>
      <PageHeader title="Profit & Loss" description="Project-wise revenue, cost, and profitability from actual records." />
      <div className="card p-6 max-w-2xl">
        <div className="space-y-3">
          <div className="flex justify-between text-sm pb-2 border-b border-slate-200"><span className="text-slate-500">Total Revenue</span><span className="font-semibold text-emerald-600">{fmtINR(revenue)}</span></div>
          <div className="flex justify-between text-sm pb-2 border-b border-slate-200"><span className="text-slate-500">Total Project Cost</span><span className="font-semibold text-rose-600">{fmtINR(totalCost)}</span></div>
          <div className="flex justify-between text-base font-bold pb-2 border-b-2 border-navy-200"><span className="text-navy-900">Gross Profit</span><span className="text-navy-900">{fmtINR(netProfit)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-slate-500">Profit Margin</span><span className="font-semibold text-navy-700">{revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : 0}%</span></div>
        </div>
      </div>
    </PageContainer>
  );
}

function ReportsPage() {
  const { data } = useData();
  const projectSummaries = data.projects.map((project) => getProjectFinancialSummary({
    project,
    quotation: data.quotations.find((q) => q.id === project.quotationId),
    payments: data.payments,
    purchases: data.purchases || [],
    expenses: data.expenses || [],
    technicianPayments: data.technicianPayments || [],
    installations: data.installations,
  }));

  return (
    <PageContainer>
      <PageHeader title="Financial Reports" description="Project-wise profitability and cost breakdown by actual project records." actions={<button className="btn-outline"><Download className="w-4 h-4" />Export Reports</button>} />
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-slate-600">Project</th>
              <th className="text-left px-4 py-2 font-medium text-slate-600">Customer</th>
              <th className="text-right px-4 py-2 font-medium text-slate-600">Revenue</th>
              <th className="text-right px-4 py-2 font-medium text-slate-600">Cost</th>
              <th className="text-right px-4 py-2 font-medium text-slate-600">Gross Profit</th>
              <th className="text-right px-4 py-2 font-medium text-slate-600">Margin</th>
              <th className="text-left px-4 py-2 font-medium text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {projectSummaries.map((summary) => {
              const project = data.projects.find((p) => p.id === summary.projectId);
              const customer = data.customers.find((c) => c.id === project?.customerId);
              return (
                <tr key={summary.projectId} className="border-b border-slate-100">
                  <td className="px-4 py-2.5 text-navy-800 font-medium">{summary.code}</td>
                  <td className="px-4 py-2.5 text-slate-600">{customer?.name ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right">{fmtINR(summary.revenue)}</td>
                  <td className="px-4 py-2.5 text-right">{fmtINR(summary.totalProjectCost)}</td>
                  <td className="px-4 py-2.5 text-right text-emerald-600">{fmtINR(summary.grossProfit)}</td>
                  <td className="px-4 py-2.5 text-right">{summary.profitMargin.toFixed(1)}%</td>
                  <td className="px-4 py-2.5"><StatusBadgeAuto status={project?.status ?? 'Pending'} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}

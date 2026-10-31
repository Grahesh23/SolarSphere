import { useState } from 'react';
import { Plus, Wallet, IndianRupee, TrendingUp, TrendingDown, FileText, Download } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useData } from '@/data/DataContext';
import { PageContainer } from '@/components/layout/MobileSidebar';
import { PageHeader } from '@/components/layout/Header';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadgeAuto, EmptyState } from '@/components/ui/Status';
import { Modal } from '@/components/ui/Modal';
import { fmtINR, fmtDate, genId, fmtINRRecharts } from '@/lib/format';
import { getMonthlyPaymentSummary } from '@/lib/dataSummaries';

export function PaymentsFinance() {
  const { data, setData } = useData();
  const monthlyData = getMonthlyPaymentSummary(data.payments);
  const splitColors = ['#2b4787', '#7e22ce', '#10b981', '#f59e0b'];
  const paymentSplit = Object.entries(data.payments.reduce((totals, payment) => {
    if (payment.status === 'Paid') totals[payment.type] = (totals[payment.type] || 0) + payment.amount;
    return totals;
  }, {})).map(([name, value], index) => ({ name, value, color: splitColors[index % splitColors.length] }));
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ projectId: '', type: 'Advance', amount: 0, method: 'Bank Transfer', reference: '', date: '' });

  const totalIncome = data.payments.filter((p) => p.type !== 'Supplier' && p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
  const totalExpense = data.payments.filter((p) => p.type === 'Supplier' && p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
  const outstanding = data.payments.filter((p) => p.status !== 'Paid').reduce((s, p) => s + p.amount, 0);
  const profit = totalIncome - totalExpense;

  const columns = [
    { key: 'code', label: 'Code', sortValue: (r) => r.code, render: (r) => <span className="font-mono text-xs text-slate-500">{r.code}</span> },
    {
      key: 'party', label: 'Party', sortValue: (r) => r.party, render: (r) => {
        const proj = data.projects.find((p) => p.id === r.projectId);
        return <div><div className="font-medium text-navy-800">{r.party}</div><div className="text-xs text-slate-400">{proj?.code}</div></div>;
      },
    },
    { key: 'type', label: 'Type', sortValue: (r) => r.type, render: (r) => <StatusBadgeAuto status={r.type} /> },
    { key: 'amount', label: 'Amount', sortValue: (r) => r.amount, render: (r) => <span className="font-medium">{fmtINR(r.amount)}</span> },
    { key: 'method', label: 'Method', render: (r) => <span className="text-xs text-slate-500">{r.method}</span> },
    { key: 'date', label: 'Date', sortValue: (r) => r.date, render: (r) => fmtDate(r.date) },
    { key: 'reference', label: 'Reference', render: (r) => r.reference ? <span className="text-xs font-mono text-slate-500">{r.reference}</span> : '—' },
    { key: 'status', label: 'Status', sortValue: (r) => r.status, render: (r) => <StatusBadgeAuto status={r.status} /> },
  ];

  const addPayment = () => {
    if (!form.projectId || !form.amount || !form.date) return;
    const proj = data.projects.find((p) => p.id === form.projectId);
    if (!proj) return;
    const customer = data.customers.find((c) => c.id === proj.customerId);
    const newPayment = {
      id: genId('pay'),
      code: form.type === 'Supplier' ? `SUP-${String(data.payments.length + 1).padStart(3, '0')}` : `PAY-${String(data.payments.length + 1).padStart(3, '0')}`,
      projectId: proj.id,
      customerId: proj.customerId,
      type: form.type,
      amount: form.amount,
      status: 'Paid',
      date: form.date,
      method: form.method,
      reference: form.reference,
      party: form.type === 'Supplier' ? 'Supplier' : customer?.name ?? '',
    };
    setData((p) => ({
      ...p,
      payments: [...p.payments, newPayment],
      projects: p.projects.map((pr) => pr.id === proj.id ? { ...pr, advancePaid: pr.advancePaid + form.amount } : pr),
    }));
    setAddOpen(false);
    setForm({ projectId: '', type: 'Advance', amount: 0, method: 'Bank Transfer', reference: '', date: '' });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Payments & Finance"
        description="Track customer payments, supplier payments, project profitability, and generate financial reports."
        actions={
          <>
            <button className="btn-outline"><Download className="w-4 h-4" />Export Report</button>
            <button className="btn-primary" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" />Record Payment</button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="card p-4"><div className="text-xs text-slate-500 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-emerald-500" />Total Income</div><div className="text-2xl font-display font-bold text-emerald-600 mt-1">{fmtINR(totalIncome)}</div></div>
        <div className="card p-4"><div className="text-xs text-slate-500 flex items-center gap-1.5"><TrendingDown className="w-3.5 h-3.5 text-rose-500" />Total Expenses</div><div className="text-2xl font-display font-bold text-rose-600 mt-1">{fmtINR(totalExpense)}</div></div>
        <div className="card p-4"><div className="text-xs text-slate-500 flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5 text-navy-500" />Net Profit</div><div className="text-2xl font-display font-bold text-navy-800 mt-1">{fmtINR(profit)}</div></div>
        <div className="card p-4"><div className="text-xs text-slate-500 flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5 text-amber-500" />Outstanding</div><div className="text-2xl font-display font-bold text-amber-600 mt-1">{fmtINR(outstanding)}</div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="card p-5 lg:col-span-2">
          <h3 className="section-title mb-3">Income vs Expense (6 months)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData} margin={{ left: -16, right: 8, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={fmtINRRecharts} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="#fb7185" radius={[4, 4, 0, 0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-5">
          <h3 className="section-title mb-3">Payment Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={paymentSplit} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={2}>
                {paymentSplit.map((e) => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={fmtINRRecharts} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Project profitability */}
      <div className="card p-5 mb-5">
        <h3 className="section-title mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-navy-500" />Project-wise Profitability</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-slate-600">Project</th>
                <th className="text-left px-4 py-2 font-medium text-slate-600">Customer</th>
                <th className="text-right px-4 py-2 font-medium text-slate-600">Value</th>
                <th className="text-right px-4 py-2 font-medium text-slate-600">Received</th>
                <th className="text-right px-4 py-2 font-medium text-slate-600">Balance</th>
                <th className="text-right px-4 py-2 font-medium text-slate-600">Subsidy</th>
                <th className="text-left px-4 py-2 font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.projects.map((p) => {
                const cust = data.customers.find((c) => c.id === p.customerId);
                const subsidy = data.subsidies.find((s) => s.projectId === p.id);
                return (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="px-4 py-2.5 font-mono text-xs">{p.code}</td>
                    <td className="px-4 py-2.5 text-navy-700">{cust?.name}</td>
                    <td className="px-4 py-2.5 text-right">{fmtINR(p.totalCost)}</td>
                    <td className="px-4 py-2.5 text-right text-emerald-600 font-medium">{fmtINR(p.advancePaid)}</td>
                    <td className="px-4 py-2.5 text-right text-rose-600 font-medium">{fmtINR(p.totalCost - p.advancePaid)}</td>
                    <td className="px-4 py-2.5 text-right">{subsidy ? fmtINR(subsidy.disbursedAmount) : '—'}</td>
                    <td className="px-4 py-2.5"><StatusBadgeAuto status={p.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <DataTable columns={columns} rows={data.payments} searchKeys={['code', 'party', 'reference']} searchPlaceholder="Search payments..." />

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Record Payment" size="lg"
        footer={<><button className="btn-outline" onClick={() => setAddOpen(false)}>Cancel</button><button className="btn-primary" onClick={addPayment} disabled={!form.projectId || !form.amount || !form.date}>Record</button></>}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Project *</label>
            <select className="input" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
              <option value="">Select project...</option>
              {data.projects.map((p) => { const c = data.customers.find((c) => c.id === p.customerId); return <option key={p.id} value={p.id}>{p.code} — {c?.name}</option>; })}
            </select>
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option>Advance</option><option>Installment</option><option>Final</option><option>Supplier</option><option>Technician</option>
            </select>
          </div>
          <div><label className="label">Amount (INR) *</label><input type="number" className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: +e.target.value })} /></div>
          <div>
            <label className="label">Method</label>
            <select className="input" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
              <option>Bank Transfer</option><option>UPI</option><option>Cheque</option><option>Cash</option>
            </select>
          </div>
          <div><label className="label">Date *</label><input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div className="col-span-2"><label className="label">Reference No.</label><input className="input" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="UTR / Cheque / UPI ref" /></div>
        </div>
      </Modal>
    </PageContainer>
  );
}

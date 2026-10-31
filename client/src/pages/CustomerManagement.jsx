import { useMemo, useState } from 'react';
import { Plus, Phone, Mail, MapPin, Filter, Download, Users } from 'lucide-react';
import { useData } from '@/data/DataContext';
import { PageContainer } from '@/components/layout/MobileSidebar';
import { PageHeader } from '@/components/layout/Header';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadgeAuto, EmptyState } from '@/components/ui/Status';
import { Modal } from '@/components/ui/Modal';
import { Timeline } from '@/components/ui/Timeline';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { fmtINR, fmtDate } from '@/lib/format';
import { useWorkflow } from '@/data/WorkflowContext';

const leadVariants = {
  New: 'slate', Contacted: 'navy', 'Survey Scheduled': 'amber', Quoted: 'grape', Won: 'emerald', Lost: 'rose',
};

export function CustomerManagement() {
  const { data } = useData();
  const { customers, projects, loading, error, request, refresh } = useWorkflow();
  const [selected, setSelected] = useState(null);
  const [filterLead, setFilterLead] = useState('All');
  const [addOpen, setAddOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const selectedCustomer = selected ? customers.find((c) => c.id === selected.id) ?? selected : null;
  const selectedProjects = selectedCustomer ? projects.filter((p) => p.customerId === selectedCustomer.id) : [];
  const selectedPayments = selectedCustomer ? data.payments.filter((p) => p.customerId === selectedCustomer.id) : [];

  const columns = [
    { key: 'code', label: 'Code', sortValue: (r) => r.code, render: (r) => <span className="font-mono text-xs text-slate-500">{r.code}</span> },
    {
      key: 'name', label: 'Customer', sortValue: (r) => r.name, render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-navy-100 text-navy-600 flex items-center justify-center text-sm font-semibold shrink-0">
            {r.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-navy-800 truncate">{r.name}</div>
            <div className="text-xs text-slate-400">{r.city}, {r.state}</div>
          </div>
        </div>
      ),
    },
    { key: 'phone', label: 'Contact', render: (r) => <div className="text-xs"><div>{r.phone}</div><div className="text-slate-400">{r.email}</div></div> },
    { key: 'monthlyBill', label: 'Monthly Bill', sortValue: (r) => r.monthlyBill, render: (r) => <span className="font-medium">{fmtINR(r.monthlyBill)}</span> },
    { key: 'desiredCapacity', label: 'Desired Cap.', sortValue: (r) => r.desiredCapacity, render: (r) => `${r.desiredCapacity} kW` },
    { key: 'enquirySource', label: 'Source', sortValue: (r) => r.enquirySource },
    { key: 'leadStatus', label: 'Lead Status', sortValue: (r) => r.leadStatus, render: (r) => <StatusBadgeAuto status={r.leadStatus} /> },
    { key: 'assignedTo', label: 'Assigned To', render: (r) => <span className="text-slate-600">{r.assignedTo}</span> },
  ];

  const rows = useMemo(
    () => filterLead === 'All' ? customers : customers.filter((c) => c.leadStatus === filterLead),
    [customers, filterLead]
  );

  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '',
    electricityConsumption: 0, monthlyBill: 0, desiredCapacity: 3, enquirySource: 'Website',
  });

  const [actionError, setActionError] = useState('');
  const addCustomer = async () => {
    if (!form.name || !form.phone) return;
    setActionError('');
    try {
      await request('/workflow/enquiries', { method: 'POST', body: JSON.stringify(form) });
      await refresh();
      setAddOpen(false);
      setForm({ name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '', electricityConsumption: 0, monthlyBill: 0, desiredCapacity: 3, enquirySource: 'Website' });
    } catch (createError) {
      setActionError(createError.message || 'Could not save this enquiry.');
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Customer Management"
        description="Manage enquiries, lead lifecycle, contact information and customer interactions."
        actions={
          <>
            <button className="btn-outline"><Download className="w-4 h-4" />Export</button>
            <button className="btn-primary" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" />New Customer</button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-500 mr-1">Lead status:</span>
        {['All', 'New', 'Contacted', 'Survey Scheduled', 'Quoted', 'Won', 'Lost'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterLead(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition ${filterLead === s ? 'bg-navy-800 text-white border-navy-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <div className="card p-3 mb-4 text-sm text-rose-700 bg-rose-50">{error}</div>}
      {actionError && <div className="card p-3 mb-4 text-sm text-rose-700 bg-rose-50">{actionError}</div>}
      {loading ? <div className="card p-8 text-center text-slate-500">Loading enquiries...</div> : <DataTable
        columns={columns}
        rows={rows}
        searchKeys={['name', 'code', 'phone', 'email', 'city']}
        searchPlaceholder="Search customers..."
        onRowClick={setSelected}
        emptyMessage="No customers in this lead stage yet."
      />}

      {/* Customer detail drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-40 flex justify-end animate-fade-in">
          <div className="absolute inset-0 bg-navy-950/40" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-xl bg-white h-full overflow-y-auto shadow-card-lg flex flex-col">
            <div className="p-6 border-b border-slate-200 bg-gradient-to-br from-navy-800 to-navy-950 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-xl font-display font-bold">
                    {selectedCustomer.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold">{selectedCustomer.name}</h2>
                    <div className="text-sm text-navy-200 mt-0.5">{selectedCustomer.code} · Lead: <span className="font-medium text-white">{selectedCustomer.leadStatus}</span></div>
                  </div>
                </div>
                <StatusBadgeAuto status={selectedCustomer.leadStatus} />
              </div>
            </div>

            <div className="p-6 space-y-5 flex-1">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-600"><Phone className="w-4 h-4 text-slate-400" />{selectedCustomer.phone}</div>
                <div className="flex items-center gap-2 text-slate-600"><Mail className="w-4 h-4 text-slate-400" />{selectedCustomer.email}</div>
                <div className="flex items-center gap-2 text-slate-600 col-span-2"><MapPin className="w-4 h-4 text-slate-400" />{selectedCustomer.address}, {selectedCustomer.city}, {selectedCustomer.state} {selectedCustomer.pincode}</div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="card p-3 text-center"><div className="text-xs text-slate-500">Consumption</div><div className="font-semibold text-navy-800">{selectedCustomer.electricityConsumption} kWh</div></div>
                <div className="card p-3 text-center"><div className="text-xs text-slate-500">Monthly Bill</div><div className="font-semibold text-navy-800">{fmtINR(selectedCustomer.monthlyBill)}</div></div>
                <div className="card p-3 text-center"><div className="text-xs text-slate-500">Desired</div><div className="font-semibold text-navy-800">{selectedCustomer.desiredCapacity} kW</div></div>
              </div>

              <div>
                <h4 className="section-title text-sm mb-2">Projects ({selectedProjects.length})</h4>
                {selectedProjects.length === 0 ? (
                  <p className="text-sm text-slate-400">No projects yet.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedProjects.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                        <div>
                          <div className="text-sm font-medium text-navy-800">{p.code}</div>
                          <div className="text-xs text-slate-400">{p.capacity} kW · {p.gridType}</div>
                        </div>
                        <StatusBadgeAuto status={p.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="section-title text-sm mb-2">Payments ({selectedPayments.length})</h4>
                {selectedPayments.length === 0 ? (
                  <p className="text-sm text-slate-400">No payments recorded.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedPayments.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                        <div className="text-sm"><span className="font-medium text-navy-800">{fmtINR(p.amount)}</span><span className="text-slate-400"> · {p.type}</span></div>
                        <StatusBadgeAuto status={p.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="section-title text-sm mb-3">Interaction History</h4>
                <Timeline
                  events={
                    selectedCustomer.interactions.length > 0
                      ? selectedCustomer.interactions.map((i) => ({ id: i.id, date: fmtDate(i.date), title: i.type, description: i.note, tone: 'navy' }))
                      : [{ id: 'none', date: '', title: 'No interactions recorded', tone: 'slate' }]
                  }
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
              <button className="btn-ghost" onClick={() => setSelected(null)}>Close</button>
              <button className="btn-emerald">Log Interaction</button>
            </div>
          </div>
        </div>
      )}

      {/* Add customer modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Register New Customer"
        description="Capture enquiry details. Lead starts as New."
        size="lg"
        footer={<><button className="btn-outline" onClick={() => setAddOpen(false)}>Cancel</button><button className="btn-primary" onClick={addCustomer}>Create Customer</button></>}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Full Name *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Customer name" />
          </div>
          <div><label className="label">Phone *</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 ..." /></div>
          <div><label className="label">Email</label><input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@email.com" /></div>
          <div className="col-span-2"><label className="label">Address</label><input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div><label className="label">City</label><input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
          <div><label className="label">State</label><input className="input" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
          <div><label className="label">Monthly Consumption (kWh)</label><input type="number" className="input" value={form.electricityConsumption} onChange={(e) => setForm({ ...form, electricityConsumption: +e.target.value })} /></div>
          <div><label className="label">Monthly Bill (INR)</label><input type="number" className="input" value={form.monthlyBill} onChange={(e) => setForm({ ...form, monthlyBill: +e.target.value })} /></div>
          <div><label className="label">Desired Capacity (kW)</label><input type="number" className="input" value={form.desiredCapacity} onChange={(e) => setForm({ ...form, desiredCapacity: +e.target.value })} /></div>
          <div><label className="label">Enquiry Source</label><select className="input" value={form.enquirySource} onChange={(e) => setForm({ ...form, enquirySource: e.target.value })}><option>Website</option><option>Referral</option><option>Advertisement</option><option>Exhibition</option><option>Walk-in</option></select></div>
        </div>
      </Modal>
    </PageContainer>
  );
}

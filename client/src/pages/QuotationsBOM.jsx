import { useState } from 'react';
import { Plus, FileText, CheckCircle2, XCircle, Download, ListChecks, Send } from 'lucide-react';
import { useData } from '@/data/DataContext';
import { PageContainer } from '@/components/layout/MobileSidebar';
import { PageHeader } from '@/components/layout/Header';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadgeAuto, AlertBanner, EmptyState } from '@/components/ui/Status';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { fmtINR, fmtDate } from '@/lib/format';
import { useWorkflow } from '@/data/WorkflowContext';
import { useAuth } from '@/data/AuthContext';

export function QuotationsBOM() {
  const { user } = useAuth();
  const { data } = useData();
  const { customers, projects, surveys, quotations, loading, error, request, refresh } = useWorkflow();
  const [selected, setSelected] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState(null);
  const [sendTarget, setSendTarget] = useState(null);
  const [actionError, setActionError] = useState('');

  const activeQuote = selected ? quotations.find((q) => q.id === selected.id) ?? selected : null;
  const activeProject = activeQuote ? projects.find((p) => p.id === activeQuote.projectId) : null;
  const activeCustomer = activeQuote ? customers.find((c) => c.id === activeQuote.customerId) : null;
  const survey = activeProject ? surveys.find((s) => s.id === activeProject.surveyId) : null;

  const columns = [
    { key: 'code', label: 'Code', sortValue: (r) => r.code, render: (r) => <span className="font-mono text-xs text-slate-500">{r.code}</span> },
    {
      key: 'project', label: 'Project / Customer', sortValue: (r) => r.code, render: (r) => {
        const proj = projects.find((p) => p.id === r.projectId);
        const cust = customers.find((c) => c.id === r.customerId);
        return <div><div className="font-medium text-navy-800">{proj?.code}</div><div className="text-xs text-slate-400">{cust?.name}</div></div>;
      },
    },
    { key: 'total', label: 'Total Value', sortValue: (r) => r.total, render: (r) => <span className="font-medium">{fmtINR(r.total)}</span> },
    { key: 'items', label: 'Items', render: (r) => `${r.items.length} components` },
    { key: 'createdAt', label: 'Created', sortValue: (r) => r.createdAt, render: (r) => fmtDate(r.createdAt) },
    { key: 'validUntil', label: 'Valid Until', sortValue: (r) => r.validUntil, render: (r) => fmtDate(r.validUntil) },
    { key: 'bomApproved', label: 'BOM', render: (r) => r.bomApproved ? <span className="badge-emerald">Approved</span> : <span className="badge-amber">Pending</span> },
    { key: 'status', label: 'Status', sortValue: (r) => r.status, render: (r) => <StatusBadgeAuto status={r.status} /> },
  ];

  const approveBOM = async () => {
    if (!approveTarget) return;
    try {
      await request(`/workflow/quotations/${approveTarget.id}`, { method: 'PATCH', body: JSON.stringify({ action: 'approve' }) });
      await refresh();
      setApproveTarget(null);
    } catch (requestError) { setActionError(requestError.message); }
  };

  const sendQuote = async () => {
    if (!sendTarget) return;
    try {
      await request(`/workflow/quotations/${sendTarget.id}`, { method: 'PATCH', body: JSON.stringify({ action: 'send' }) });
      await refresh();
      setSendTarget(null);
    } catch (requestError) { setActionError(requestError.message); }
  };

  const [form, setForm] = useState({ projectId: '' });
  const createQuote = async () => {
    if (!form.projectId) return;
    setActionError('');
    try {
      await request(`/workflow/projects/${form.projectId}/quotations`, { method: 'POST', body: JSON.stringify({}) });
      await refresh();
      setAddOpen(false);
      setForm({ projectId: '' });
    } catch (requestError) { setActionError(requestError.message); }
  };

  const eligibleProjects = projects.filter((p) => {
    const s = surveys.find((s) => s.id === p.surveyId);
    return s?.status === 'Approved' && !p.quotationId;
  });

  return (
    <PageContainer>
      <PageHeader
        title="Quotations & BOM"
        description="Generate quotations from approved configurations, approve Bills of Materials, and send quotes to customers."
        actions={<button className="btn-primary" onClick={() => setAddOpen(true)} disabled={eligibleProjects.length === 0}><Plus className="w-4 h-4" />Generate Quotation</button>}
      />

      {(error || actionError) && <div className="card p-3 mb-4 text-sm text-rose-700 bg-rose-50">{actionError || error}</div>}
      {eligibleProjects.length === 0 && (
        <div className="mb-4">
          <AlertBanner type="info" message="No projects are ready for quotation. A survey must be approved and a configuration must exist before a quotation can be generated." />
        </div>
      )}

      {loading ? <div className="card p-8 text-center text-slate-500">Loading quotations...</div> : <DataTable
        columns={columns}
        rows={quotations}
        searchKeys={['code']}
        searchPlaceholder="Search quotations..."
        onRowClick={setSelected}
      />}

      {/* Quotation detail */}
      {activeQuote && activeProject && activeCustomer && (
        <Modal
          open={!!selected}
          onClose={() => setSelected(null)}
          title={`${activeQuote.code}`}
          description={`${activeProject.code} · ${activeCustomer.name}`}
          size="xl"
          footer={
            <>
              {activeQuote.status === 'Draft' && ['Admin', 'Sales'].includes(user?.role) && <button className="btn-emerald" onClick={() => setSendTarget(activeQuote)}><Send className="w-4 h-4" />Send to Customer</button>}
              {!activeQuote.bomApproved && user?.role === 'Admin' && <button className="btn-primary" onClick={() => setApproveTarget(activeQuote)}><ListChecks className="w-4 h-4" />Approve BOM</button>}
              <button className="btn-outline"><Download className="w-4 h-4" />Export PDF</button>
              <button className="btn-ghost" onClick={() => setSelected(null)}>Close</button>
            </>
          }
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
                <div className="card p-3"><div className="text-xs text-slate-500">Status</div><div className="mt-1"><StatusBadgeAuto status={activeQuote.status} /></div></div>
                <div className="card p-3"><div className="text-xs text-slate-500">BOM</div><div className="mt-1">{activeQuote.bomApproved ? <span className="badge-emerald">Approved</span> : <span className="badge-amber">Pending</span>}</div></div>
                <div className="card p-3"><div className="text-xs text-slate-500">Created</div><div className="text-sm font-medium text-navy-800 mt-1">{fmtDate(activeQuote.createdAt)}</div></div>
                <div className="card p-3"><div className="text-xs text-slate-500">Valid Until</div><div className="text-sm font-medium text-navy-800 mt-1">{fmtDate(activeQuote.validUntil)}</div></div>
              </div>
            </div>

            {survey && survey.status !== 'Approved' && (
              <AlertBanner type="error" message="Survey is not approved — this quotation should not have been generated." />
            )}

            {!activeQuote.bomApproved && (
              <AlertBanner type="warning" message="BOM is pending approval. Inventory cannot be reserved until BOM is approved." />
            )}

            <div>
              <h4 className="section-title text-sm mb-2">Quotation Items</h4>
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-slate-600">Component</th>
                      <th className="text-left px-4 py-2 font-medium text-slate-600">Category</th>
                      <th className="text-right px-4 py-2 font-medium text-slate-600">Qty</th>
                      <th className="text-right px-4 py-2 font-medium text-slate-600">Unit Price</th>
                      <th className="text-right px-4 py-2 font-medium text-slate-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeQuote.items.map((item, index) => (
                            <tr key={item.id || index} className="border-b border-slate-100">
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
            </div>

            {/* BOM availability check */}
            <div>
              <h4 className="section-title text-sm mb-2">BOM Inventory Check</h4>
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-slate-600">Component</th>
                      <th className="text-right px-4 py-2 font-medium text-slate-600">Required</th>
                      <th className="text-left px-4 py-2 font-medium text-slate-600">Inventory Match</th>
                      <th className="text-right px-4 py-2 font-medium text-slate-600">Stock</th>
                      <th className="text-left px-4 py-2 font-medium text-slate-600">Availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeQuote.items.map((item, index) => {
                      const inv = data.inventory.find((i) => i.category === item.category || i.name.toLowerCase().includes(item.component.toLowerCase().split(' ')[0]));
                      const enough = inv ? inv.stock >= item.qty : false;
                      return (
                        <tr key={item.id || index} className="border-b border-slate-100">
                          <td className="px-4 py-2.5 text-navy-800">{item.component}</td>
                          <td className="px-4 py-2.5 text-right">{item.qty}</td>
                          <td className="px-4 py-2.5 text-slate-600">{inv?.name ?? 'No match'}</td>
                          <td className="px-4 py-2.5 text-right">{inv?.stock ?? 0} {inv?.unit}</td>
                          <td className="px-4 py-2.5">{enough ? <span className="badge-emerald">Available</span> : <span className="badge-rose">Short by {item.qty - (inv?.stock ?? 0)}</span>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="w-64 space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{fmtINR(activeQuote.subtotal)}</span></div>
                <div className="flex justify-between text-slate-500"><span>GST (8%)</span><span>{fmtINR(activeQuote.tax)}</span></div>
                <div className="flex justify-between text-base font-semibold text-navy-900 border-t pt-2"><span>Total</span><span>{fmtINR(activeQuote.total)}</span></div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Generate Quotation" description="Only projects with an approved survey and no existing quotation are eligible."
        footer={<><button className="btn-outline" onClick={() => setAddOpen(false)}>Cancel</button><button className="btn-primary" onClick={createQuote}>Generate</button></>}
      >
        <div>
          <label className="label">Project *</label>
          <select className="input" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
            <option value="">Select project...</option>
            {eligibleProjects.map((p) => {
              const c = customers.find((c) => c.id === p.customerId);
              return <option key={p.id} value={p.id}>{p.code} — {c?.name}</option>;
            })}
          </select>
        </div>
      </Modal>

      <ConfirmDialog open={!!approveTarget} title="Approve BOM?" message="Approving the BOM will unlock inventory reservation for this project." confirmLabel="Approve BOM" onConfirm={approveBOM} onCancel={() => setApproveTarget(null)} />
      <ConfirmDialog open={!!sendTarget} title="Send Quotation?" message="The quotation will be marked as sent to the customer." confirmLabel="Send" onConfirm={sendQuote} onCancel={() => setSendTarget(null)} />
    </PageContainer>
  );
}

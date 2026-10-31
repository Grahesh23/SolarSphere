import { useState, useMemo } from 'react';
import { Plus, FolderKanban, ChevronRight, MapPin, Users as UsersIcon, Calendar, CheckCircle2 } from 'lucide-react';
import { useData } from '@/data/DataContext';
import { PageContainer } from '@/components/layout/MobileSidebar';
import { PageHeader } from '@/components/layout/Header';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadgeAuto, EmptyState } from '@/components/ui/Status';
import { Tabs, useTabs } from '@/components/ui/Tabs';
import { fmtINR, fmtDate, genId } from '@/lib/format';
import {
  OverviewTab, SurveyTab, IntelligenceTab, QuotationTab, BOMTab,
  InventoryTab, InstallationTab, PaymentsTab, WarrantyTab,
} from '@/pages/projects/ProjectTabs';

export function ProjectManagement() {
  const { data, setData } = useData();
  const [selected, setSelected] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [tab, setTab] = useTabs('overview');

  const activeProject = selected ? data.projects.find((p) => p.id === selected.id) ?? selected : null;
  const customer = activeProject ? data.customers.find((c) => c.id === activeProject.customerId) : null;

  const columns = [
    { key: 'code', label: 'Project Code', sortValue: (r) => r.code, render: (r) => <span className="font-mono text-xs text-slate-500">{r.code}</span> },
    {
      key: 'customer', label: 'Customer', sortValue: (r) => data.customers.find((c) => c.id === r.customerId)?.name ?? '', render: (r) => {
        const c = data.customers.find((c) => c.id === r.customerId);
        return <div><div className="font-medium text-navy-800">{c?.name ?? '—'}</div><div className="text-xs text-slate-400">{c?.city}</div></div>;
      },
    },
    { key: 'capacity', label: 'Capacity', sortValue: (r) => r.capacity, render: (r) => `${r.capacity} kW` },
    { key: 'gridType', label: 'Grid', sortValue: (r) => r.gridType, render: (r) => <StatusBadgeAuto status={r.gridType} /> },
    { key: 'status', label: 'Status', sortValue: (r) => r.status, render: (r) => <StatusBadgeAuto status={r.status} /> },
    {
      key: 'completion', label: 'Progress', sortValue: (r) => r.completion, render: (r) => (
        <div className="flex items-center gap-2 w-32">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${r.completion}%` }} /></div>
          <span className="text-xs font-medium text-slate-600">{r.completion}%</span>
        </div>
      ),
    },
    { key: 'totalCost', label: 'Value', sortValue: (r) => r.totalCost, render: (r) => <span className="font-medium">{fmtINR(r.totalCost)}</span> },
    { key: 'location', label: 'Location', render: (r) => <span className="text-slate-500 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" />{r.location}</span> },
  ];

  const [form, setForm] = useState({ customerId: '', capacity: 3, gridType: 'On-Grid', location: '', assignedEmployees: '' });

  const createProject = () => {
    if (!form.customerId) return;
    const newProject = {
      id: genId('prj'),
      code: `PRJ-2026-${String(data.projects.length + 1).padStart(3, '0')}`,
      customerId: form.customerId,
      capacity: form.capacity,
      gridType: form.gridType,
      status: 'Enquiry',
      assignedEmployees: form.assignedEmployees ? form.assignedEmployees.split(',').map((s) => s.trim()) : [],
      startDate: new Date().toISOString().slice(0, 10),
      completion: 5,
      warrantyIds: [],
      totalCost: 0,
      advancePaid: 0,
      location: form.location,
    };
    setData((p) => ({ ...p, projects: [newProject, ...p.projects] }));
    setAddOpen(false);
    setForm({ customerId: '', capacity: 3, gridType: 'On-Grid', location: '', assignedEmployees: '' });
  };

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'survey', label: 'Survey' },
    { key: 'intelligence', label: 'Intelligence' },
    { key: 'quotation', label: 'Quotation' },
    { key: 'bom', label: 'BOM' },
    { key: 'inventory', label: 'Inventory' },
    { key: 'installation', label: 'Installation' },
    { key: 'payments', label: 'Payments' },
    { key: 'warranty', label: 'Warranty' },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Project Management"
        description="End-to-end solar project lifecycle — from enquiry through commissioning and warranty."
        actions={<button className="btn-primary" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" />New Project</button>}
      />

      <DataTable
        columns={columns}
        rows={data.projects}
        searchKeys={['code', 'location']}
        searchPlaceholder="Search projects..."
        onRowClick={setSelected}
        emptyMessage="No projects yet. Create one to get started."
      />

      {/* Project workspace */}
      {activeProject && customer && (
        <div className="fixed inset-0 z-40 bg-navy-950/40 animate-fade-in overflow-y-auto" onClick={() => setSelected(null)}>
          <div className="min-h-full flex items-start justify-center py-6 px-3">
            <div className="bg-white rounded-2xl shadow-card-lg w-full max-w-5xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="p-5 bg-gradient-to-br from-navy-800 to-navy-950 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-navy-200 text-sm mb-1">
                      <FolderKanban className="w-4 h-4" />{activeProject.code}
                    </div>
                    <h2 className="text-2xl font-display font-bold">{customer.name}</h2>
                    <div className="text-sm text-navy-200 mt-1 flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{activeProject.location}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Started {fmtDate(activeProject.startDate)}</span>
                      <span>{activeProject.capacity} kW · {activeProject.gridType}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadgeAuto status={activeProject.status} />
                    <div className="mt-3 w-40">
                      <div className="text-xs text-navy-200 mb-1">Completion {activeProject.completion}%</div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-emerald-400 rounded-full" style={{ width: `${activeProject.completion}%` }} /></div>
                    </div>
                  </div>
                </div>
                {activeProject.assignedEmployees.length > 0 && (
                  <div className="flex items-center gap-2 mt-4 text-xs">
                    <UsersIcon className="w-3.5 h-3.5 text-navy-300" />
                    {activeProject.assignedEmployees.map((e) => (
                      <span key={e} className="px-2 py-0.5 rounded-full bg-white/10 text-white">{e}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="px-5">
                <Tabs tabs={tabs} active={tab} onChange={setTab} />
              </div>

              <div className="p-5 max-h-[55vh] overflow-y-auto">
                {tab === 'overview' && <OverviewTab project={activeProject} />}
                {tab === 'survey' && <SurveyTab project={activeProject} />}
                {tab === 'intelligence' && <IntelligenceTab project={activeProject} />}
                {tab === 'quotation' && <QuotationTab project={activeProject} />}
                {tab === 'bom' && <BOMTab project={activeProject} />}
                {tab === 'inventory' && <InventoryTab project={activeProject} />}
                {tab === 'installation' && <InstallationTab project={activeProject} />}
                {tab === 'payments' && <PaymentsTab project={activeProject} />}
                {tab === 'warranty' && <WarrantyTab project={activeProject} />}
              </div>

              <div className="p-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
                <button className="btn-ghost" onClick={() => setSelected(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New project modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-navy-950/40" onClick={() => setAddOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-card-lg border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200"><h3 className="font-semibold text-navy-900">Create New Project</h3></div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Customer *</label>
                <select className="input" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
                  <option value="">Select customer...</option>
                  {data.customers.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.city}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Capacity (kW)</label><input type="number" min={1} max={5} className="input" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: +e.target.value })} /></div>
                <div>
                  <label className="label">Grid Type</label>
                  <select className="input" value={form.gridType} onChange={(e) => setForm({ ...form, gridType: e.target.value })}>
                    <option>On-Grid</option><option>Off-Grid</option><option>Hybrid</option>
                  </select>
                </div>
              </div>
              <div><label className="label">Location</label><input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, State" /></div>
              <div><label className="label">Assigned Employees (comma separated)</label><input className="input" value={form.assignedEmployees} onChange={(e) => setForm({ ...form, assignedEmployees: e.target.value })} placeholder="Employee names" /></div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
              <button className="btn-outline" onClick={() => setAddOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={createProject}>Create Project</button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

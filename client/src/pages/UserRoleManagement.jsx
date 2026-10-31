import { useState } from 'react';
import { Plus, UserCog, Shield, Mail, Phone, CheckCircle2, XCircle, Edit } from 'lucide-react';
import { useData } from '@/data/DataContext';
import { PageContainer } from '@/components/layout/MobileSidebar';
import { PageHeader } from '@/components/layout/Header';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadgeAuto } from '@/components/ui/Status';
import { Modal } from '@/components/ui/Modal';
import { fmtDate, genId } from '@/lib/format';

const ROLE_PERMISSIONS = {
  Admin: ['All Modules', 'Settings', 'User Management'],
  'Sales Manager': ['Customers', 'Projects', 'Quotations', 'Subsidy'],
  Surveyor: ['Surveys', 'Roof Intelligence', 'Installations'],
  Technician: ['Installations', 'Service'],
  Finance: ['Finance', 'Subsidy', 'Reports'],
  'Service Agent': ['Service & Complaints'],
};

export function UserRoleManagement() {
  const { data, setData } = useData();
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'Surveyor' });

  const columns = [
    {
      key: 'name', label: 'User', sortValue: (r) => r.name, render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-navy-100 text-navy-600 flex items-center justify-center text-sm font-semibold shrink-0">
            {r.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div><div className="font-medium text-navy-800">{r.name}</div><div className="text-xs text-slate-400">{r.email}</div></div>
        </div>
      ),
    },
    { key: 'role', label: 'Role', sortValue: (r) => r.role, render: (r) => <StatusBadgeAuto status={r.role} /> },
    { key: 'permissions', label: 'Permissions', render: (r) => <div className="flex flex-wrap gap-1 max-w-xs">{r.permissions.map((p) => <span key={p} className="badge-slate text-[10px]">{p}</span>)}</div> },
    { key: 'status', label: 'Status', sortValue: (r) => r.status, render: (r) => <StatusBadgeAuto status={r.status} /> },
    { key: 'lastActive', label: 'Last Active', render: (r) => <span className="text-xs text-slate-500">{r.lastActive}</span> },
    {
      key: 'actions', label: 'Actions', render: (r) => (
        <button onClick={(e) => { e.stopPropagation(); setEditTarget(r); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-navy-600" title="Edit"><Edit className="w-4 h-4" /></button>
      ),
    },
  ];

  const addUser = () => {
    if (!form.name || !form.email) return;
    const newUser = {
      id: genId('usr'),
      name: form.name,
      email: form.email,
      role: form.role,
      status: 'Active',
      lastActive: 'Never',
      permissions: ROLE_PERMISSIONS[form.role] ?? [],
    };
    setData((p) => ({ ...p, users: [...p.users, newUser] }));
    setAddOpen(false);
    setForm({ name: '', email: '', role: 'Surveyor' });
  };

  const toggleStatus = (id) => {
    setData((p) => ({ ...p, users: p.users.map((u) => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u) }));
    setEditTarget(null);
  };

  return (
    <PageContainer>
      <PageHeader
        title="User & Role Management"
        description="Manage team members, assign roles, and control module-level access permissions."
        actions={<button className="btn-primary" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" />Add User</button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-5">
        {Object.keys(ROLE_PERMISSIONS).map((role) => {
          const count = data.users.filter((u) => u.role === role).length;
          return (
            <div key={role} className="card p-3 text-center">
              <div className="text-xs text-slate-500">{role}</div>
              <div className="text-xl font-display font-bold text-navy-800 mt-0.5">{count}</div>
            </div>
          );
        })}
      </div>

      <div className="card p-5 mb-5">
        <h3 className="section-title mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-navy-500" />Role Permission Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-slate-600">Role</th>
                <th className="text-left px-4 py-2 font-medium text-slate-600">Granted Modules</th>
                <th className="text-right px-4 py-2 font-medium text-slate-600">Users</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(ROLE_PERMISSIONS).map(([role, perms]) => (
                <tr key={role} className="border-b border-slate-100">
                  <td className="px-4 py-2.5 font-medium text-navy-800">{role}</td>
                  <td className="px-4 py-2.5"><div className="flex flex-wrap gap-1">{perms.map((p) => <span key={p} className="badge-navy text-[10px]">{p}</span>)}</div></td>
                  <td className="px-4 py-2.5 text-right font-semibold text-navy-700">{data.users.filter((u) => u.role === role).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DataTable columns={columns} rows={data.users} searchKeys={['name', 'email', 'role']} searchPlaceholder="Search users..." />

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add User"
        footer={<><button className="btn-outline" onClick={() => setAddOpen(false)}>Cancel</button><button className="btn-primary" onClick={addUser} disabled={!form.name || !form.email}>Add User</button></>}
      >
        <div className="space-y-3">
          <div><label className="label">Name *</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">Email *</label><input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {Object.keys(ROLE_PERMISSIONS).map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="text-xs text-slate-400">Permissions auto-assigned from role: {ROLE_PERMISSIONS[form.role].join(', ')}</div>
        </div>
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit User" description={editTarget?.email}
        footer={<><button className="btn-danger" onClick={() => editTarget && toggleStatus(editTarget.id)}>{editTarget?.status === 'Active' ? 'Deactivate' : 'Activate'}</button><button className="btn-ghost" onClick={() => setEditTarget(null)}>Close</button></>}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-3"><div className="text-xs text-slate-500">Name</div><div className="text-sm font-medium text-navy-800 mt-0.5">{editTarget?.name}</div></div>
            <div className="card p-3"><div className="text-xs text-slate-500">Role</div><div className="mt-0.5"><StatusBadgeAuto status={editTarget?.role ?? ''} /></div></div>
            <div className="card p-3"><div className="text-xs text-slate-500">Status</div><div className="mt-0.5"><StatusBadgeAuto status={editTarget?.status ?? ''} /></div></div>
            <div className="card p-3"><div className="text-xs text-slate-500">Last Active</div><div className="text-sm text-navy-700 mt-0.5">{editTarget?.lastActive}</div></div>
          </div>
          <div>
            <label className="label">Permissions</label>
            <div className="flex flex-wrap gap-2">{editTarget?.permissions.map((p) => <span key={p} className="badge-navy">{p}</span>)}</div>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}

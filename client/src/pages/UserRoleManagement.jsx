import { useCallback, useEffect, useMemo, useState } from 'react';
import { Building2, Mail, Phone, Plus, UserCog } from 'lucide-react';
import { PageContainer } from '@/components/layout/MobileSidebar';
import { PageHeader } from '@/components/layout/Header';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadgeAuto } from '@/components/ui/Status';
import { Modal } from '@/components/ui/Modal';
import { AUTH_TOKEN_KEY, API_BASE } from '@/data/AuthContext';
import { fmtDate } from '@/lib/format';

const EMPLOYEE_ROLES = ['Sales', 'Surveyor', 'Warehouse', 'Technician', 'Service', 'Finance'];
const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  role: 'Sales',
  phone: '',
  jobTitle: '',
  department: '',
};

async function adminRequest(path, options = {}) {
  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token || token === 'demo-token') {
    throw new Error('Please sign out and sign in with the administrator account stored in the database.');
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || 'The administrator request failed.');
  }
  return payload.data;
}

export function UserRoleManagement() {
  const [activeTab, setActiveTab] = useState('employees');
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [employeeResult, clientResult] = await Promise.all([
        adminRequest('/admin/employees'),
        adminRequest('/admin/clients'),
      ]);
      setEmployees(employeeResult.employees);
      setClients(clientResult.clients);
    } catch (loadError) {
      setError(loadError.message || 'Could not load employee and client records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const employeeColumns = useMemo(() => [
    {
      key: 'name',
      label: 'Employee',
      sortValue: (employee) => employee.name,
      render: (employee) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-navy-100 text-navy-600 flex items-center justify-center text-sm font-semibold shrink-0">
            {employee.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="font-medium text-navy-800">{employee.name}</div>
            <div className="text-xs text-slate-400">{employee.code}</div>
          </div>
        </div>
      ),
    },
    { key: 'email', label: 'Email', sortValue: (employee) => employee.email },
    { key: 'role', label: 'Role', sortValue: (employee) => employee.role, render: (employee) => <StatusBadgeAuto status={employee.role} /> },
    { key: 'jobTitle', label: 'Job title' },
    { key: 'phone', label: 'Phone' },
    { key: 'isActive', label: 'Account', render: (employee) => <StatusBadgeAuto status={employee.isActive ? 'Active' : 'Inactive'} /> },
    { key: 'joinedAt', label: 'Added', render: (employee) => <span className="text-xs text-slate-500">{fmtDate(employee.joinedAt)}</span> },
  ], []);

  const clientColumns = useMemo(() => [
    {
      key: 'name',
      label: 'Client',
      sortValue: (client) => client.name,
      render: (client) => (
        <div>
          <div className="font-medium text-navy-800">{client.name}</div>
          <div className="text-xs text-slate-400">{client.code || 'Client profile'}</div>
        </div>
      ),
    },
    { key: 'email', label: 'Email', sortValue: (client) => client.email },
    { key: 'phone', label: 'Phone' },
    { key: 'companyName', label: 'Company' },
    { key: 'city', label: 'City' },
    { key: 'leadStatus', label: 'Status', render: (client) => <StatusBadgeAuto status={client.leadStatus || 'New'} /> },
    { key: 'createdAt', label: 'Added', render: (client) => <span className="text-xs text-slate-500">{fmtDate(client.createdAt)}</span> },
  ], []);

  const createEmployee = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const result = await adminRequest('/admin/employees', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setEmployees((current) => [result.employee, ...current]);
      setNotice(`Employee account created for ${result.employee.name}. The initial password is not stored in readable form; share it with the employee securely.`);
      setForm({ ...EMPTY_FORM, password: form.password });
      setAddOpen(false);
    } catch (saveError) {
      setError(saveError.message || 'Could not create employee account.');
    } finally {
      setSaving(false);
    }
  };

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <PageContainer>
      <PageHeader
        title="People Management"
        description="Employee accounts and client profiles are managed separately."
        actions={activeTab === 'employees' && (
          <button className="btn-primary" onClick={() => { setError(''); setNotice(''); setAddOpen(true); }}>
            <Plus className="w-4 h-4" />Add Employee
          </button>
        )}
      />

      <div className="flex gap-2 mb-5 border-b border-slate-200">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'employees' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500'}`}
          onClick={() => { setActiveTab('employees'); setError(''); }}
        >
          <span className="inline-flex items-center gap-2"><UserCog className="w-4 h-4" />Employees ({employees.length})</span>
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'clients' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500'}`}
          onClick={() => { setActiveTab('clients'); setError(''); }}
        >
          <span className="inline-flex items-center gap-2"><Building2 className="w-4 h-4" />Clients ({clients.length})</span>
        </button>
      </div>

      {error && (
        <div className="card p-4 mb-4 border-rose-200 bg-rose-50 flex items-center justify-between gap-3">
          <p className="text-sm text-rose-700">{error}</p>
          <button className="btn-outline" onClick={loadUsers}>Retry</button>
        </div>
      )}
      {notice && <div className="card p-4 mb-4 border-emerald-200 bg-emerald-50 text-sm text-emerald-800">{notice}</div>}

      {loading ? (
        <div className="card p-8 text-center text-sm text-slate-500">Loading records from the server...</div>
      ) : activeTab === 'employees' ? (
        <DataTable
          columns={employeeColumns}
          rows={employees}
          searchKeys={['name', 'email', 'role', 'jobTitle', 'department']}
          searchPlaceholder="Search employees..."
          onRowClick={setSelectedEmployee}
          emptyMessage="No employee profiles yet. Add an employee to create their account."
        />
      ) : (
        <DataTable
          columns={clientColumns}
          rows={clients}
          searchKeys={['name', 'email', 'phone', 'companyName', 'city']}
          searchPlaceholder="Search clients..."
          emptyMessage="No client profiles found."
        />
      )}

      <Modal
        open={addOpen}
        onClose={() => !saving && setAddOpen(false)}
        title="Add Employee"
        description="Create an employee profile and login account. Employee data is stored separately from client records."
        footer={(
          <>
            <button className="btn-outline" onClick={() => setAddOpen(false)} disabled={saving}>Cancel</button>
            <button className="btn-primary" onClick={createEmployee} disabled={saving || !form.name || !form.email || !form.password}>
              {saving ? 'Creating...' : 'Create Employee'}
            </button>
          </>
        )}
      >
        <form id="create-employee-form" onSubmit={createEmployee} className="space-y-3">
          <div><label className="label">Full name *</label><input className="input" value={form.name} onChange={(event) => updateForm('name', event.target.value)} required /></div>
          <div><label className="label">Work email *</label><input type="email" className="input" value={form.email} onChange={(event) => updateForm('email', event.target.value)} required /></div>
          <div><label className="label">Shared default password *</label><input type="password" autoComplete="new-password" minLength={8} className="input" value={form.password} onChange={(event) => updateForm('password', event.target.value)} required /><p className="mt-1 text-xs text-slate-500">This password is reused for each employee you add during this session. At least 8 characters; only a hash is stored by the server.</p></div>
          <div><label className="label">Employee role *</label><select className="input" value={form.role} onChange={(event) => updateForm('role', event.target.value)}>{EMPLOYEE_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}</select></div>
          <div><label className="label">Phone</label><input type="tel" className="input" value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} /></div>
          <div><label className="label">Job title</label><input className="input" value={form.jobTitle} onChange={(event) => updateForm('jobTitle', event.target.value)} placeholder="e.g. Field Technician" /></div>
          <div><label className="label">Department</label><input className="input" value={form.department} onChange={(event) => updateForm('department', event.target.value)} placeholder={form.role} /></div>
        </form>
      </Modal>

      <Modal
        open={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        title="Employee Details"
        description={selectedEmployee?.code}
      >
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2"><UserCog className="w-4 h-4 text-slate-400" />{selectedEmployee?.name} · {selectedEmployee?.role}</div>
          <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" />{selectedEmployee?.email}</div>
          <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" />{selectedEmployee?.phone || 'No phone recorded'}</div>
          <div><span className="text-slate-500">Job title:</span> {selectedEmployee?.jobTitle || '—'}</div>
          <div><span className="text-slate-500">Department:</span> {selectedEmployee?.department || '—'}</div>
          <div><span className="text-slate-500">Account:</span> {selectedEmployee?.isActive ? 'Active' : 'Inactive'}</div>
          <div><span className="text-slate-500">Joined:</span> {selectedEmployee?.joinedAt ? fmtDate(selectedEmployee.joinedAt) : '—'}</div>
        </div>
      </Modal>
    </PageContainer>
  );
}

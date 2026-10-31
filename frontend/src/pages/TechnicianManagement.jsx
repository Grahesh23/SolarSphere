import { useState } from 'react';
import { Plus, HardHat, Star, Phone, Mail, Calendar, CheckCircle2, Clock } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useData } from '@/data/DataContext';
import { PageContainer } from '@/components/layout/MobileSidebar';
import { PageHeader } from '@/components/layout/Header';
import { StatusBadgeAuto, EmptyState } from '@/components/ui/Status';
import { Modal } from '@/components/ui/Modal';
import { fmtNum } from '@/lib/format';

export function TechnicianManagement() {
  const { data, setData } = useData();
  const [selected, setSelected] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', skills: '' });

  const active = selected ? data.technicians.find((t) => t.id === selected.id) ?? selected : null;
  const activeProjects = active ? data.projects.filter((p) => active.assignedProjectIds.includes(p.id)) : [];

  const workloadData = data.technicians.map((t) => ({ name: t.name.split(' ')[0], completed: t.completedJobs, active: t.activeJobs }));

  const addTechnician = () => {
    if (!form.name) return;
    setData((p) => ({
      ...p,
      technicians: [...p.technicians, {
        id: `tech-${Date.now()}`, name: form.name, phone: form.phone, email: form.email,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        availability: 'Available', rating: 0, completedJobs: 0, activeJobs: 0, assignedProjectIds: [],
      }],
    }));
    setAddOpen(false);
    setForm({ name: '', phone: '', email: '', skills: '' });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Technician Management"
        description="Technician directory, skills, availability, scheduling and workload overview."
        actions={<button className="btn-primary" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" />Add Technician</button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="card p-5 lg:col-span-2">
          <h3 className="section-title mb-3 flex items-center gap-2"><HardHat className="w-4 h-4 text-navy-500" />Workload Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={workloadData} margin={{ left: -16, right: 8, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="completed" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} name="Completed" />
              <Bar dataKey="active" stackId="a" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Active" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-5">
          <h3 className="section-title mb-3">Availability</h3>
          <div className="space-y-2">
            {['Available', 'On Job', 'Off Duty'].map((status) => {
              const count = data.technicians.filter((t) => t.availability === status).length;
              return (
                <div key={status} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200">
                  <span className="text-sm text-slate-600">{status}</span>
                  <span className="font-semibold text-navy-800">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.technicians.map((t) => (
          <button key={t.id} onClick={() => setSelected(t)} className="card card-hover p-4 text-left">
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-navy-100 text-navy-600 flex items-center justify-center font-semibold">
                {t.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <StatusBadgeAuto status={t.availability} />
            </div>
            <div className="font-semibold text-navy-800">{t.name}</div>
            <div className="text-xs text-slate-400 mt-0.5">{t.email}</div>
            <div className="flex items-center gap-1 mt-2 text-xs text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{t.rating}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {t.skills.slice(0, 3).map((s) => <span key={s} className="badge-slate text-[10px]">{s}</span>)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
              <span>{t.completedJobs} done</span><span className="text-amber-600">{t.activeJobs} active</span>
            </div>
          </button>
        ))}
      </div>

      {active && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title={active.name} description={active.email} size="lg"
          footer={<button className="btn-ghost" onClick={() => setSelected(null)}>Close</button>}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="card p-3"><div className="text-xs text-slate-500">Availability</div><div className="mt-1"><StatusBadgeAuto status={active.availability} /></div></div>
              <div className="card p-3"><div className="text-xs text-slate-500">Rating</div><div className="text-lg font-bold text-amber-500 mt-0.5 flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" />{active.rating}</div></div>
              <div className="card p-3"><div className="text-xs text-slate-500">Completed Jobs</div><div className="text-lg font-bold text-emerald-600 mt-0.5">{active.completedJobs}</div></div>
              <div className="card p-3"><div className="text-xs text-slate-500">Active Jobs</div><div className="text-lg font-bold text-amber-600 mt-0.5">{active.activeJobs}</div></div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-600"><Phone className="w-4 h-4 text-slate-400" />{active.phone}</div>
              <div className="flex items-center gap-2 text-slate-600"><Mail className="w-4 h-4 text-slate-400" />{active.email}</div>
            </div>
            <div>
              <h4 className="section-title text-sm mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">{active.skills.map((s) => <span key={s} className="badge-navy">{s}</span>)}</div>
            </div>
            <div>
              <h4 className="section-title text-sm mb-2">Assigned Projects ({activeProjects.length})</h4>
              {activeProjects.length === 0 ? <p className="text-sm text-slate-400">No active assignments.</p> : (
                <div className="space-y-2">
                  {activeProjects.map((p) => {
                    const c = data.customers.find((c) => c.id === p.customerId);
                    return (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                        <div><div className="text-sm font-medium text-navy-800">{p.code}</div><div className="text-xs text-slate-400">{c?.name}</div></div>
                        <StatusBadgeAuto status={p.status} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Technician"
        footer={<><button className="btn-outline" onClick={() => setAddOpen(false)}>Cancel</button><button className="btn-primary" onClick={addTechnician}>Add</button></>}
      >
        <div className="space-y-3">
          <div><label className="label">Name *</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><label className="label">Email</label><input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <div><label className="label">Skills (comma separated)</label><input className="input" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Survey, Wiring, Off-Grid" /></div>
        </div>
      </Modal>
    </PageContainer>
  );
}

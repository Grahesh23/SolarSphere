import { useState } from 'react';
import { Settings as SettingsIcon, Building2, Save, RotateCcw, Moon, Sun, Bell, Globe, Shield, Database } from 'lucide-react';
import { useData } from '@/data/DataContext';
import { PageContainer } from '@/components/layout/MobileSidebar';
import { PageHeader } from '@/components/layout/Header';
import { Tabs, useTabs } from '@/components/ui/Tabs';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function SettingsPage() {
  const { resetData } = useData();
  const [tab, setTab] = useTabs('company');
  const [resetOpen, setResetOpen] = useState(false);
  const [company, setCompany] = useState({ name: '', gst: '', email: '', phone: '', address: '' });
  const [prefs, setPrefs] = useState({ currency: 'INR', taxRate: 8, theme: 'light', notifications: true, autoBackup: true });

  return (
    <PageContainer>
      <PageHeader title="Settings" description="Configure company profile, preferences, and application behaviour." />

      <div className="mb-5">
        <Tabs tabs={[
          { key: 'company', label: 'Company', icon: <Building2 className="w-4 h-4" /> },
          { key: 'preferences', label: 'Preferences', icon: <Globe className="w-4 h-4" /> },
          { key: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
          { key: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
          { key: 'data', label: 'Data', icon: <Database className="w-4 h-4" /> },
        ]} active={tab} onChange={setTab} />
      </div>

      {tab === 'company' && (
        <div className="card p-6 max-w-2xl">
          <h3 className="section-title mb-4 flex items-center gap-2"><Building2 className="w-4 h-4 text-navy-500" />Company Profile</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="label">Company Name</label><input className="input" value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} /></div>
            <div><label className="label">GST Number</label><input className="input font-mono" value={company.gst} onChange={(e) => setCompany({ ...company, gst: e.target.value })} /></div>
            <div><label className="label">Contact Email</label><input className="input" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} /></div>
            <div><label className="label">Phone</label><input className="input" value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} /></div>
            <div><label className="label">Address</label><input className="input" value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} /></div>
          </div>
          <div className="flex justify-end mt-5"><button className="btn-primary" onClick={() => alert('Company settings saved.')}><Save className="w-4 h-4" />Save Changes</button></div>
        </div>
      )}

      {tab === 'preferences' && (
        <div className="card p-6 max-w-2xl">
          <h3 className="section-title mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-navy-500" />Application Preferences</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Currency</label>
                <select className="input" value={prefs.currency} onChange={(e) => setPrefs({ ...prefs, currency: e.target.value })}>
                  <option>INR</option><option>USD</option><option>EUR</option>
                </select>
              </div>
              <div>
                <label className="label">Default Tax Rate (%)</label>
                <input type="number" className="input" value={prefs.taxRate} onChange={(e) => setPrefs({ ...prefs, taxRate: +e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Theme</label>
              <div className="flex gap-2">
                <button onClick={() => setPrefs({ ...prefs, theme: 'light' })} className={`flex-1 btn ${prefs.theme === 'light' ? 'btn-primary' : 'btn-outline'}`}><Sun className="w-4 h-4" />Light</button>
                <button onClick={() => setPrefs({ ...prefs, theme: 'dark' })} className={`flex-1 btn ${prefs.theme === 'dark' ? 'btn-primary' : 'btn-outline'}`}><Moon className="w-4 h-4" />Dark (soon)</button>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-5"><button className="btn-primary"><Save className="w-4 h-4" />Save Preferences</button></div>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="card p-6 max-w-2xl">
          <h3 className="section-title mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-navy-500" />Notification Settings</h3>
          <div className="space-y-3">
            {[
              { key: 'lowStock', label: 'Low stock alerts', desc: 'Notify when inventory drops below reorder level' },
              { key: 'overdue', label: 'Overdue payment alerts', desc: 'Notify when a payment becomes overdue' },
              { key: 'survey', label: 'Survey scheduled reminders', desc: 'Notify assigned technicians of upcoming surveys' },
              { key: 'warranty', label: 'Warranty expiring soon', desc: 'Notify 30 days before any warranty expires' },
            ].map((n) => (
              <div key={n.key} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                <div><div className="text-sm font-medium text-navy-800">{n.label}</div><div className="text-xs text-slate-400">{n.desc}</div></div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-10 h-5 bg-slate-200 peer-checked:bg-emerald-500 rounded-full peer transition after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition peer-checked:after:translate-x-5" />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="card p-6 max-w-2xl">
          <h3 className="section-title mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-navy-500" />Security</h3>
          <div className="space-y-3">
            {[
              { label: 'Two-factor authentication', desc: 'Require OTP at login for admin users', on: true },
              { label: 'Session timeout', desc: 'Auto-logout after 30 minutes of inactivity', on: true },
              { label: 'IP allowlist', desc: 'Restrict access to known office IPs', on: false },
              { label: 'Audit log', desc: 'Record all data-modifying actions', on: true },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                <div><div className="text-sm font-medium text-navy-800">{s.label}</div><div className="text-xs text-slate-400">{s.desc}</div></div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={s.on} className="sr-only peer" />
                  <div className="w-10 h-5 bg-slate-200 peer-checked:bg-emerald-500 rounded-full peer transition after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition peer-checked:after:translate-x-5" />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'data' && (
        <div className="card p-6 max-w-2xl">
          <h3 className="section-title mb-4 flex items-center gap-2"><Database className="w-4 h-4 text-navy-500" />Data Management</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200">
              <div><div className="text-sm font-medium text-navy-800">Automatic Backup</div><div className="text-xs text-slate-400">Backup data to local storage daily</div></div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={prefs.autoBackup} onChange={(e) => setPrefs({ ...prefs, autoBackup: e.target.checked })} className="sr-only peer" />
                <div className="w-10 h-5 bg-slate-200 peer-checked:bg-emerald-500 rounded-full peer transition after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition peer-checked:after:translate-x-5" />
              </label>
            </div>
            <div className="p-4 rounded-lg border border-rose-200 bg-rose-50">
              <div className="text-sm font-medium text-rose-700">Clear Local Data</div>
              <div className="text-xs text-rose-600 mt-1">Permanently remove locally stored prototype records from this browser.</div>
              <button className="btn-danger mt-3" onClick={() => setResetOpen(true)}><RotateCcw className="w-4 h-4" />Clear Local Data</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={resetOpen}
        title="Clear Local Data?"
        message="This will permanently remove locally stored prototype records from this browser. This cannot be undone."
        confirmLabel="Clear Data"
        tone="danger"
        onConfirm={() => { resetData(); setResetOpen(false); }}
        onCancel={() => setResetOpen(false)}
      />
    </PageContainer>
  );
}

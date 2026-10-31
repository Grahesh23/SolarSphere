import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode, Scan, Search, Plus, ShieldCheck, Calendar, Wrench, User, Building2,
  AlertTriangle, CheckCircle2, Clock, Download, MessageSquare, Send, Camera,
} from 'lucide-react';
import { useData } from '@/data/DataContext';
import { PageContainer } from '@/components/layout/MobileSidebar';
import { PageHeader } from '@/components/layout/Header';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadgeAuto, AlertBanner, EmptyState } from '@/components/ui/Status';
import { Modal } from '@/components/ui/Modal';
import { Tabs, useTabs } from '@/components/ui/Tabs';
import { fmtDate, genId, daysBetween } from '@/lib/format';

const today = '2026-10-31';

export function QRIntelligence() {
  const { data, setData } = useData();
  const [tab, setTab] = useTabs('register');
  const [selected, setSelected] = useState(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [searchSerial, setSearchSerial] = useState('');
  const [registerForm, setRegisterForm] = useState({ itemId: '', serialNumber: '', projectId: '' });
  const [chatInput, setChatInput] = useState('');
  const [chat, setChat] = useState([
    { role: 'assistant', text: 'Hello! I am the SolarSphere troubleshooting assistant. I can help diagnose issues with your solar equipment using the verified knowledge base. Describe a symptom (e.g. "inverter shows error code 3x") and I will suggest likely causes and checks.' },
  ]);

  const activeEquipment = selected ? data.equipment.find((e) => e.id === selected.id) ?? selected : null;
  const activeItem = activeEquipment ? data.inventory.find((i) => i.id === activeEquipment.itemId) : null;
  const activeProject = activeEquipment?.projectId ? data.projects.find((p) => p.id === activeEquipment.projectId) : null;
  const activeCustomer = activeEquipment?.customerId ? data.customers.find((c) => c.id === activeEquipment.customerId) : null;
  const activeWarranty = activeEquipment ? data.warranties.find((w) => w.equipmentId === activeEquipment.id) : null;

  const matchedBySearch = searchSerial ? data.equipment.find((e) => e.serialNumber.toLowerCase().includes(searchSerial.toLowerCase())) : null;

  const columns = [
    { key: 'serialNumber', label: 'Serial Number', sortValue: (r) => r.serialNumber, render: (r) => <span className="font-mono text-xs text-navy-700">{r.serialNumber}</span> },
    {
      key: 'item', label: 'Product', sortValue: (r) => data.inventory.find((i) => i.id === r.itemId)?.name ?? '', render: (r) => {
        const item = data.inventory.find((i) => i.id === r.itemId);
        return <div><div className="font-medium text-navy-800">{item?.name ?? 'Unknown'}</div><div className="text-xs text-slate-400">{item?.brand}</div></div>;
      },
    },
    { key: 'category', label: 'Category', sortValue: (r) => data.inventory.find((i) => i.id === r.itemId)?.category ?? '', render: (r) => {
      const item = data.inventory.find((i) => i.id === r.itemId);
      return item ? <span className="badge-navy">{item.category}</span> : '—';
    } },
    {
      key: 'project', label: 'Project / Customer', sortValue: (r) => data.projects.find((p) => p.id === r.projectId)?.code ?? '', render: (r) => {
        const proj = data.projects.find((p) => p.id === r.projectId);
        const cust = data.customers.find((c) => c.id === r.customerId);
        return proj ? <div><div className="text-sm text-navy-700">{proj.code}</div><div className="text-xs text-slate-400">{cust?.name}</div></div> : <span className="text-slate-400 text-xs">Unassigned</span>;
      },
    },
    { key: 'status', label: 'Status', sortValue: (r) => r.status, render: (r) => <StatusBadgeAuto status={r.status} /> },
    { key: 'warrantyStatus', label: 'Warranty', sortValue: (r) => r.warrantyStatus, render: (r) => <StatusBadgeAuto status={r.warrantyStatus} /> },
    { key: 'warrantyEnd', label: 'Warranty Until', sortValue: (r) => r.warrantyEnd ?? '', render: (r) => r.warrantyEnd ? fmtDate(r.warrantyEnd) : '—' },
  ];

  const register = () => {
    if (!registerForm.itemId || !registerForm.serialNumber) return;
    const exists = data.equipment.some((e) => e.serialNumber === registerForm.serialNumber);
    if (exists) { alert('Duplicate serial number — each equipment unit must have a unique serial.'); return; }
    const proj = registerForm.projectId ? data.projects.find((p) => p.id === registerForm.projectId) : null;
    const newEq = {
      id: genId('eq'),
      serialNumber: registerForm.serialNumber,
      itemId: registerForm.itemId,
      projectId: proj?.id,
      customerId: proj?.customerId,
      status: proj ? 'Reserved' : 'In Stock',
      warrantyStatus: 'Pending',
      qrToken: `${registerForm.serialNumber}-${proj?.code ?? 'UNAS'}`,
      repairHistory: [],
    };
    setData((p) => ({ ...p, equipment: [...p.equipment, newEq] }));
    setRegisterForm({ itemId: '', serialNumber: '', projectId: '' });
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChat((c) => [...c, { role: 'user', text: userMsg }]);
    setChatInput('');
    setTimeout(() => {
      const reply = generateTroubleshootingReply(userMsg);
      setChat((c) => [...c, { role: 'assistant', text: reply }]);
    }, 700);
  };

  return (
    <PageContainer>
      <PageHeader
        title="QR Intelligence & Warranty"
        description="Equipment identity registry, QR code generation, camera scanning, warranty tracking and AI troubleshooting assistant."
        actions={<button className="btn-grape" onClick={() => setScanOpen(true)}><Camera className="w-4 h-4" />Scan QR</button>}
      />

      <div className="mb-5">
        <Tabs tabs={[{ key: 'register', label: 'Registry' }, { key: 'register-new', label: 'Register Equipment' }, { key: 'troubleshoot', label: 'AI Troubleshooting' }]} active={tab} onChange={setTab} />
      </div>

      {tab === 'register' && (
        <>
          {/* Serial search */}
          <div className="card p-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="input pl-9" placeholder="Search by serial number..." value={searchSerial} onChange={(e) => setSearchSerial(e.target.value)} />
              </div>
              {matchedBySearch && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-slate-600">Match: <button onClick={() => setSelected(matchedBySearch)} className="font-medium text-grape-600 hover:underline">{matchedBySearch.serialNumber}</button></span>
                </div>
              )}
            </div>
          </div>

          <DataTable columns={columns} rows={data.equipment} searchKeys={['serialNumber']} searchPlaceholder="Search equipment..." onRowClick={setSelected} />
        </>
      )}

      {tab === 'register-new' && (
        <div className="card p-6 max-w-2xl">
          <h3 className="section-title mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-grape-500" />Register New Equipment</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Product *</label>
              <select className="input" value={registerForm.itemId} onChange={(e) => setRegisterForm({ ...registerForm, itemId: e.target.value })}>
                <option value="">Select product...</option>
                {data.inventory.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.brand})</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Serial Number *</label>
              <input className="input font-mono" value={registerForm.serialNumber} onChange={(e) => setRegisterForm({ ...registerForm, serialNumber: e.target.value })} placeholder="e.g. WA-INV-002" />
              {data.equipment.some((e) => e.serialNumber === registerForm.serialNumber) && registerForm.serialNumber && (
                <div className="text-xs text-rose-600 mt-1">Serial number already exists — duplicates are not allowed.</div>
              )}
            </div>
            <div className="col-span-2">
              <label className="label">Assign to Project (optional)</label>
              <select className="input" value={registerForm.projectId} onChange={(e) => setRegisterForm({ ...registerForm, projectId: e.target.value })}>
                <option value="">Leave in stock...</option>
                {data.projects.map((p) => { const c = data.customers.find((c) => c.id === p.customerId); return <option key={p.id} value={p.id}>{p.code} — {c?.name}</option>; })}
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-5">
            <button className="btn-grape" onClick={register} disabled={!registerForm.itemId || !registerForm.serialNumber || data.equipment.some((e) => e.serialNumber === registerForm.serialNumber)}>
              <QrCode className="w-4 h-4" />Register & Generate QR
            </button>
          </div>
        </div>
      )}

      {tab === 'troubleshoot' && (
        <div className="card p-5 max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-grape-100 text-grape-600 flex items-center justify-center"><MessageSquare className="w-5 h-5" /></div>
            <div>
              <h3 className="section-title">AI Troubleshooting Assistant</h3>
              <p className="text-xs text-slate-500">Powered by verified knowledge base · not a substitute for certified technician diagnosis</p>
            </div>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto p-1">
            {chat.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${m.role === 'user' ? 'bg-grape-600 text-white' : 'bg-slate-100 text-navy-800'}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <input className="input flex-1" placeholder="Describe a symptom or error code..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendChat()} />
            <button className="btn-grape" onClick={sendChat}><Send className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* Equipment detail with QR */}
      {activeEquipment && activeItem && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title={activeEquipment.serialNumber} description={activeItem.name} size="lg"
          footer={<><button className="btn-outline"><Download className="w-4 h-4" />Print QR Label</button><button className="btn-ghost" onClick={() => setSelected(null)}>Close</button></>}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* QR code */}
            <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-50 border border-slate-200">
              <div className="bg-white p-4 rounded-xl shadow-card">
                <QRCodeSVG value={activeEquipment.qrToken} size={160} level="M" />
              </div>
              <div className="mt-3 text-sm font-mono text-navy-700">{activeEquipment.qrToken}</div>
              <div className="mt-1 text-xs text-slate-400">Scan to verify equipment identity</div>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Status</span>
                <StatusBadgeAuto status={activeEquipment.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Warranty</span>
                <StatusBadgeAuto status={activeEquipment.warrantyStatus} />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Detail icon={<Building2 className="w-4 h-4" />} label="Brand" value={activeItem.brand} />
                <Detail icon={<QrCode className="w-4 h-4" />} label="Category" value={activeItem.category} />
                <Detail icon={<User className="w-4 h-4" />} label="Customer" value={activeCustomer?.name ?? 'Unassigned'} />
                <Detail icon={<Building2 className="w-4 h-4" />} label="Project" value={activeProject?.code ?? 'Unassigned'} />
                <Detail icon={<Calendar className="w-4 h-4" />} label="Delivered" value={activeEquipment.deliveredAt ? fmtDate(activeEquipment.deliveredAt) : '—'} />
                <Detail icon={<ShieldCheck className="w-4 h-4" />} label="Warranty End" value={activeEquipment.warrantyEnd ? fmtDate(activeEquipment.warrantyEnd) : '—'} />
              </div>
            </div>
          </div>

          {activeWarranty && (
            <div className="mt-4 p-4 rounded-lg border border-grape-100 bg-grape-50">
              <div className="flex items-center gap-2 text-grape-700 font-medium text-sm mb-1"><ShieldCheck className="w-4 h-4" />Warranty Terms</div>
              <p className="text-sm text-grape-700">{activeWarranty.terms}</p>
              {activeEquipment.warrantyEnd && (
                <div className={`text-xs mt-2 ${daysBetween(today, activeEquipment.warrantyEnd) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {daysBetween(today, activeEquipment.warrantyEnd) > 0 ? `${daysBetween(today, activeEquipment.warrantyEnd)} days remaining` : 'Warranty expired'}
                </div>
              )}
            </div>
          )}

          {activeEquipment.repairHistory.length > 0 && (
            <div className="mt-4">
              <h4 className="section-title text-sm mb-2 flex items-center gap-2"><Wrench className="w-4 h-4 text-navy-500" />Repair History</h4>
              <div className="space-y-2">
                {activeEquipment.repairHistory.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                    <div><div className="text-sm font-medium text-navy-800">{r.issue}</div><div className="text-xs text-slate-400">{fmtDate(r.date)} · {r.action}</div></div>
                    <div className="text-right"><div className="text-sm font-medium">{r.cost > 0 ? `₹${r.cost}` : '—'}</div>{r.covered ? <span className="badge-emerald">Covered</span> : <span className="badge-amber">Chargeable</span>}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal>
      )}

      <Modal open={scanOpen} onClose={() => setScanOpen(false)} title="QR Code Scanner" description="Camera-based QR scanning is not configured."
        footer={<button className="btn-ghost" onClick={() => setScanOpen(false)}>Close</button>}
      >
        <div className="flex flex-col items-center py-6">
          <Camera className="w-12 h-12 text-slate-300" />
          <p className="text-sm text-slate-500 mt-4">Connect a camera scanner to look up equipment by its QR code.</p>
        </div>
      </Modal>
    </PageContainer>
  );
}

function Detail({ icon, label, value }) {
  return <div className="rounded-lg border border-slate-200 p-2.5"><div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">{icon}{label}</div><div className="text-sm font-medium text-navy-800 truncate">{value}</div></div>;
}

function generateTroubleshootingReply(input) {
  const q = input.toLowerCase();
  if (q.includes('error code 3') || q.includes('inverter fault')) {
    return 'Likely cause: Grid voltage fluctuation triggering inverter protective shutdown. Suggested checks:\n1. Verify grid voltage at inverter terminals (should be 195-255V).\n2. Check AC cable connections for loose contacts.\n3. If fault recurs, log a service ticket — may indicate internal AC board issue (covered under 5-year inverter warranty).';
  }
  if (q.includes('no generation') || q.includes('not producing') || q.includes('zero output')) {
    return 'Possible causes (ordered by likelihood):\n1. DC isolator / MCB switched off — check the DC disconnect.\n2. String fuse blown — check string voltage at inverter.\n3. Panel shading or soiling — inspect for new obstructions.\n4. Inverter in standby — check display for error or status LED.';
  }
  if (q.includes('battery') || q.includes('backup not working')) {
    return 'For off-grid battery issues:\n1. Check battery terminal voltage (should be >11.8V per 12V unit for healthy charge).\n2. Verify charge controller is in charging state during daytime.\n3. Inspect for sulfation if battery is >2 years old.\n4. Tubular battery warranty is typically 3 years — check serial for coverage.';
  }
  if (q.includes('panel') || q.includes('hot spot') || q.includes('crack')) {
    return 'Panel issues:\n1. Hot spots usually indicate cell damage or persistent shading — thermal imaging recommended.\n2. Micro-cracks may develop from improper mounting; check mounting torque.\n3. Panel performance warranty is 25 years linear — claim if degradation exceeds 90% at Year 10.';
  }
  return 'I can help with inverter faults, panel issues, battery problems, and generation shortfalls. Could you share more detail — the component, any error code, and when the issue started?';
}

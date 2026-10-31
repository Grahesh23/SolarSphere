import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

// Variant type removed (TypeScript only)

const styles = {
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  rose: 'bg-rose-100 text-rose-700',
  navy: 'bg-navy-100 text-navy-700',
  slate: 'bg-slate-100 text-slate-600',
  grape: 'bg-grape-100 text-grape-700',
};

const dot = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  navy: 'bg-navy-500',
  slate: 'bg-slate-400',
  grape: 'bg-grape-500',
};

export function StatusBadge({ status, variant = 'slate', icon }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[variant]}`} />
      {icon}{status}
    </span>
  );
}

export function statusVariant(status) {
  const s = status.toLowerCase();
  if (['active', 'approved', 'completed', 'paid', 'accepted', 'won', 'delivered', 'disbursed', 'resolved', 'available'].some((k) => s.includes(k))) return 'emerald';
  if (['pending', 'scheduled', 'sent', 'partial', 'in progress', 'under review', 'applied', 'packing', 'packed'].some((k) => s.includes(k))) return 'amber';
  if (['rejected', 'overdue', 'expired', 'lost', 'failed', 'error', 'returned'].some((k) => s.includes(k))) return 'rose';
  if (['dispatched', 'shipped', 'reserved', 'installed', 'in stock', 'claim'].some((k) => s.includes(k))) return 'navy';
  if (['recommended', 'draft', 'hybrid'].some((k) => s.includes(k))) return 'grape';
  return 'slate';
}

export function StatusBadgeAuto({ status }) {
  return <StatusBadge status={status} variant={statusVariant(status)} />;
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
        <Info className="w-7 h-7 text-slate-400" />
      </div>
      <h3 className="text-sm font-semibold text-navy-800">{title}</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function AlertBanner({ type, message }) {
  const conf = {
    success: { icon: <CheckCircle2 className="w-4 h-4" />, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    warning: { icon: <AlertTriangle className="w-4 h-4" />, cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    error: { icon: <XCircle className="w-4 h-4" />, cls: 'bg-rose-50 text-rose-700 border-rose-200' },
    info: { icon: <Info className="w-4 h-4" />, cls: 'bg-navy-50 text-navy-700 border-navy-200' },
  }[type];
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${conf.cls}`}>
      {conf.icon}{message}
    </div>
  );
}


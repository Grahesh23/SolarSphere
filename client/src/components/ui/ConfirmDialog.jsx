import { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

// ConfirmDialogProps interface removed (TypeScript only)

export function ConfirmDialog({
  open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone = 'default', onConfirm, onCancel,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-navy-950/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-card-lg border border-slate-200 p-6">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tone === 'danger' ? 'bg-rose-100 text-rose-600' : 'bg-navy-100 text-navy-600'}`}>
            {tone === 'danger' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-navy-900">{title}</h3>
            <p className="text-sm text-slate-500 mt-1">{message}</p>
          </div>
          <button onClick={onCancel} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onCancel} className="btn-outline">{cancelLabel}</button>
          <button onClick={onConfirm} className={tone === 'danger' ? 'btn-danger' : 'btn-primary'}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}


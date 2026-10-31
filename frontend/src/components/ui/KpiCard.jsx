import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

// LucideIcon import type removed (TypeScript only)
// KpiCardProps interface removed (TypeScript only)

const toneCls = {
  navy: { bg: 'bg-navy-50', text: 'text-navy-600', ring: 'group-hover:ring-navy-200' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'group-hover:ring-emerald-200' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'group-hover:ring-amber-200' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'group-hover:ring-rose-200' },
  grape: { bg: 'bg-grape-50', text: 'text-grape-600', ring: 'group-hover:ring-grape-200' },
};

export function KpiCard({ label, value, icon: Icon, delta, deltaLabel, tone = 'navy', onClick }) {
  const t = toneCls[tone];
  return (
    <button
      onClick={onClick}
      type="button"
      className="card card-hover group text-left p-5 flex flex-col gap-3 focus:outline-none focus:ring-2 focus:ring-navy-300 w-full"
    >
      <div className="flex items-start justify-between">
        <div className="text-sm font-medium text-slate-500">{label}</div>
        <div className={`w-10 h-10 rounded-xl ${t.bg} ${t.text} flex items-center justify-center ring-1 ring-transparent transition ${t.ring}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-2xl font-display font-semibold text-navy-900">{value}</div>
      {(delta != null || deltaLabel) && (
        <div className="flex items-center gap-1.5 text-xs">
          {delta != null && (
            <span className={`inline-flex items-center gap-0.5 font-medium ${delta >= 0 ? 'stat-up' : 'stat-down'}`}>
              {delta >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {Math.abs(delta)}%
            </span>
          )}
          {deltaLabel && <span className="text-slate-400">{deltaLabel}</span>}
        </div>
      )}
    </button>
  );
}


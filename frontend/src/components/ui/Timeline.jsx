// TimelineEvent interface removed (TypeScript only)

const toneLine = {
  navy: 'bg-navy-400',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  grape: 'bg-grape-500',
  slate: 'bg-slate-300',
};

export function Timeline({ events }) {
  if (events.length === 0) {
    return <p className="text-sm text-slate-400 py-4">No activity recorded yet.</p>;
  }
  return (
    <ol className="relative space-y-4">
      {events.map((ev, i) => (
        <li key={ev.id} className="relative flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-2.5 h-2.5 rounded-full ${toneLine[ev.tone ?? 'slate']} mt-1.5`} />
            {i < events.length - 1 && <div className="w-px flex-1 bg-slate-200" />}
          </div>
          <div className="flex-1 pb-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-navy-800">{ev.title}</span>
              <span className="text-xs text-slate-400 whitespace-nowrap">{ev.date}</span>
            </div>
            {ev.description && <p className="text-sm text-slate-500 mt-0.5">{ev.description}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}


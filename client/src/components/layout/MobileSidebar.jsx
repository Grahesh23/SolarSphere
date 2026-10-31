import { X } from 'lucide-react';
import { NAV_GROUPS, NAV_ITEMS } from '@/config/navigation';
import { cn } from '@/lib/format';

// MobileSidebarProps interface removed (TypeScript only)
// NavKey import type removed (TypeScript only)

export function MobileSidebar({ open, active, onNavigate, onClose }) {
  if (!open) return null;
  return (
    <div className="lg:hidden fixed inset-0 z-50 animate-fade-in">
      <div className="absolute inset-0 bg-navy-950/50" onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-72 bg-navy-950 text-slate-300 flex flex-col">
        <div className="flex items-center justify-between px-4 h-16 border-b border-navy-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <span className="text-white font-display font-bold text-lg">S</span>
            </div>
            <span className="font-display font-bold text-white tracking-tight text-lg">SolarSphere</span>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group}>
              <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-navy-400">{group}</div>
              <div className="space-y-0.5">
                {NAV_ITEMS.filter((n) => n.group === group).map((item) => {
                  const Icon = item.icon;
                  const isActive = active === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => { onNavigate(item.key); onClose(); }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition',
                        isActive ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-navy-800'
                      )}
                    >
                      <Icon className="w-4.5 h-4.5 shrink-0" style={{ width: 18, height: 18 }} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}

export function PageContainer({ children }) {
  return <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">{children}</div>;
}


import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NAV_GROUPS, NAV_ITEMS } from '@/config/navigation';
import { cn } from '@/lib/format';

// SidebarProps interface removed (TypeScript only)
// NavKey import type removed (TypeScript only)

export function Sidebar({ active, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col bg-navy-950 text-slate-300 border-r border-navy-900 transition-all duration-300 shrink-0',
        collapsed ? 'w-[68px]' : 'w-64'
      )}
    >
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-navy-900">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0">
          <span className="text-white font-display font-bold text-lg">S</span>
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-display font-bold text-white tracking-tight text-lg leading-none">SolarSphere</span>
            <span className="text-[10px] text-emerald-400 font-medium tracking-wider uppercase">Solar Operations</span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group}>
            {!collapsed && (
              <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-navy-400">{group}</div>
            )}
            <div className="space-y-0.5">
              {NAV_ITEMS.filter((n) => n.group === group).map((item) => {
                const Icon = item.icon;
                const isActive = active === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => onNavigate(item.key)}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group',
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-300 hover:bg-navy-800 hover:text-white',
                      collapsed && 'justify-center'
                    )}
                  >
                    <Icon className={cn('w-4.5 h-4.5 shrink-0', isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-300')} style={{ width: 18, height: 18 }} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center justify-center gap-2 px-4 py-3 border-t border-navy-900 text-slate-400 hover:text-white hover:bg-navy-900 transition"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span className="text-xs">Collapse</span></>}
      </button>
    </aside>
  );
}


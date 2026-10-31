import { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronRight, Menu, LogOut, X, ChevronLeft } from 'lucide-react';
import { ROLE_CONFIGS } from '@/config/roles';
import { useData } from '@/data/DataContext';
import { useAuth } from '@/data/AuthContext';
import { cn } from '@/lib/format';
import { PageContainer as SharedPageContainer } from '@/components/layout/MobileSidebar';

// PortalLayoutProps interface removed (TypeScript only)
// PageKey import type removed (TypeScript only)

export function PortalLayout({ active, onNavigate, children, notifications: notificationOverride }) {
  const { user, logout } = useAuth();
  const { data } = useData();
  const config = user ? ROLE_CONFIGS[user.role] : null;
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const currentItem = config?.items.find((i) => i.key === active);
  const notifications = notificationOverride ?? data.notifications;
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const onClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, []);

  if (!config || !user) return null;

  const initials = user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const toneCls = {
    info: 'bg-navy-50 text-navy-600', warning: 'bg-amber-50 text-amber-600',
    success: 'bg-emerald-50 text-emerald-600', error: 'bg-rose-50 text-rose-600',
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Desktop sidebar */}
      <aside className={cn('hidden lg:flex flex-col bg-navy-950 text-slate-300 border-r border-navy-900 transition-all duration-300 shrink-0', collapsed ? 'w-[68px]' : 'w-64')}>
        <div className="flex items-center gap-2.5 px-4 h-16 border-b border-navy-900">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0">
            <span className="text-white font-display font-bold text-lg">S</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-display font-bold text-white tracking-tight text-lg leading-none">SolarSphere</span>
              <span className="text-[10px] text-emerald-400 font-medium tracking-wider uppercase">{config.subtitle}</span>
            </div>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {config.groups.map((group) => (
            <div key={group}>
              {!collapsed && <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-navy-400">{group}</div>}
              <div className="space-y-0.5">
                {config.items.filter((n) => n.group === group).map((item) => {
                  const Icon = item.icon;
                  const isActive = active === item.key;
                  return (
                    <button key={item.key} onClick={() => onNavigate(item.key)} title={collapsed ? item.label : undefined}
                      className={cn('w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group',
                        isActive ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:bg-navy-800 hover:text-white',
                        collapsed && 'justify-center')}>
                      <Icon className="w-4.5 h-4.5 shrink-0" style={{ width: 18, height: 18 }} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <button onClick={() => setCollapsed((c) => !c)} className="flex items-center justify-center gap-2 px-4 py-3 border-t border-navy-900 text-slate-400 hover:text-white hover:bg-navy-900 transition">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span className="text-xs">Collapse</span></>}
        </button>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 animate-fade-in">
          <div className="absolute inset-0 bg-navy-950/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-navy-950 text-slate-300 flex flex-col">
            <div className="flex items-center justify-between px-4 h-16 border-b border-navy-900">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <span className="text-white font-display font-bold text-lg">S</span>
                </div>
                <span className="font-display font-bold text-white tracking-tight text-lg">SolarSphere</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-2 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
              {config.groups.map((group) => (
                <div key={group}>
                  <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-navy-400">{group}</div>
                  <div className="space-y-0.5">
                    {config.items.filter((n) => n.group === group).map((item) => {
                      const Icon = item.icon;
                      const isActive = active === item.key;
                      return (
                        <button key={item.key} onClick={() => { onNavigate(item.key); setMobileOpen(false); }}
                          className={cn('w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition',
                            isActive ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-navy-800')}>
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
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 sm:px-6 gap-4 shrink-0">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-navy-700"><Menu className="w-5 h-5" /></button>
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <span className="text-slate-400">{config.title}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="font-medium text-navy-800">{currentItem?.label ?? 'Page'}</span>
          </div>
          <div className="flex-1 max-w-md ml-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="input pl-9 h-9" />
          </div>
          <div className="relative" ref={notifRef}>
            <button onClick={() => setNotifOpen((o) => !o)} className="relative p-2 rounded-lg hover:bg-slate-100 text-navy-700 transition">
              <Bell className="w-5 h-5" />
              {unread > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unread}</span>}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-card-lg border border-slate-200 z-30 animate-fade-in">
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-navy-900 text-sm">Notifications</span>
                  <span className="text-xs text-emerald-600 font-medium">{unread} new</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className={cn('px-4 py-3 border-b border-slate-100 flex gap-3', !n.read && 'bg-navy-50/40')}>
                      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', toneCls[n.type])}><Bell className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-navy-800">{n.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{n.message}</div>
                        <div className="text-xs text-slate-400 mt-1">{n.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="relative" ref={profileRef}>
            <button onClick={() => setProfileOpen((o) => !o)} className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-100 transition">
              <div className="w-8 h-8 rounded-full bg-navy-800 text-white flex items-center justify-center text-sm font-semibold">{initials}</div>
              <div className="hidden md:flex flex-col items-start leading-tight">
                <span className="text-sm font-medium text-navy-800">{user.name}</span>
                <span className="text-xs text-slate-400">{config.title}</span>
              </div>
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-card-lg border border-slate-200 z-30 animate-fade-in py-1">
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="text-sm font-medium text-navy-900">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </div>
                <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50">
                  <LogOut className="w-4 h-4" />Sign out
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export function PageContainer({ children }) {
  return <SharedPageContainer>{children}</SharedPageContainer>;
}

export function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-navy-900 tracking-tight">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

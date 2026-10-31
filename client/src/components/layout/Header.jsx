import { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronRight, Menu, User, LogOut, Settings as SettingsIcon, HelpCircle } from 'lucide-react';
import { NAV_ITEMS } from '@/config/navigation';
import { useData } from '@/data/DataContext';
import { cn } from '@/lib/format';

// HeaderProps interface removed (TypeScript only)
// NavKey import type removed (TypeScript only)

export function Header({ active, onOpenMobile }) {
  const { data } = useData();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const item = NAV_ITEMS.find((n) => n.key === active);
  const unread = data.notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const onClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, []);

  const toneCls = {
    info: 'bg-navy-50 text-navy-600',
    warning: 'bg-amber-50 text-amber-600',
    success: 'bg-emerald-50 text-emerald-600',
    error: 'bg-rose-50 text-rose-600',
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 sm:px-6 gap-4 shrink-0">
      <button onClick={onOpenMobile} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-navy-700">
        <Menu className="w-5 h-5" />
      </button>

      <div className="hidden sm:flex items-center gap-2 text-sm">
        <span className="text-slate-400">SolarSphere</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="font-medium text-navy-800">{item?.label ?? 'Page'}</span>
      </div>

      <div className="flex-1 max-w-md ml-auto relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search customers, projects, equipment..."
          className="input pl-9 h-9"
        />
      </div>

      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setNotifOpen((o) => !o)}
          className="relative p-2 rounded-lg hover:bg-slate-100 text-navy-700 transition"
        >
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>
        {notifOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-card-lg border border-slate-200 z-30 animate-fade-in">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <span className="font-semibold text-navy-900 text-sm">Notifications</span>
              <span className="text-xs text-emerald-600 font-medium">{unread} new</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {data.notifications.map((n) => (
                <div key={n.id} className={cn('px-4 py-3 border-b border-slate-100 flex gap-3', !n.read && 'bg-navy-50/40')}>
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', toneCls[n.type])}>
                    <Bell className="w-4 h-4" />
                  </div>
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
          <div className="w-8 h-8 rounded-full bg-navy-800 text-white flex items-center justify-center text-sm font-semibold">
            AD
          </div>
          <div className="hidden md:flex flex-col items-start leading-tight">
            <span className="text-sm font-medium text-navy-800">Administrator</span>
            <span className="text-xs text-slate-400">Admin</span>
          </div>
        </button>
        {profileOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-card-lg border border-slate-200 z-30 animate-fade-in py-1">
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="text-sm font-medium text-navy-900">Administrator</div>
              <div className="text-xs text-slate-500">admin@solarsphere.io</div>
            </div>
            {[
              { icon: User, label: 'My Profile' },
              { icon: SettingsIcon, label: 'Account Settings' },
              { icon: HelpCircle, label: 'Help & Support' },
            ].map((m) => (
              <button key={m.label} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-navy-700 hover:bg-slate-50">
                <m.icon className="w-4 h-4 text-slate-400" />{m.label}
              </button>
            ))}
            <div className="border-t border-slate-100 mt-1 pt-1">
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50">
                <LogOut className="w-4 h-4" />Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
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


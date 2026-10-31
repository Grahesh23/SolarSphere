import { createContext, useContext, useState, useCallback } from 'react';

// Role type removed (TypeScript only)
// AuthUser interface removed (TypeScript only)

export const DEMO_ACCOUNTS = [
  { id: 'usr-admin', name: 'Administrator', email: 'admin@solarsphere.demo', role: 'Admin' },
  { id: 'usr-sales', name: 'Meera Nair', email: 'sales@solarsphere.demo', role: 'Sales' },
  { id: 'usr-survey', name: 'Arjun Verma', email: 'survey@solarsphere.demo', role: 'Surveyor', technicianId: 'tech-1' },
  { id: 'usr-warehouse', name: 'Farhan Ahmed', email: 'warehouse@solarsphere.demo', role: 'Warehouse' },
  { id: 'usr-technician', name: 'Suresh Kumar', email: 'technician@solarsphere.demo', role: 'Technician', technicianId: 'tech-3' },
  { id: 'usr-service', name: 'Sneha Rao', email: 'service@solarsphere.demo', role: 'Service' },
  { id: 'usr-finance', name: 'Farhan Ahmed', email: 'finance@solarsphere.demo', role: 'Finance' },
  { id: 'usr-customer', name: 'Rajesh Sharma', email: 'customer@solarsphere.demo', role: 'Customer', customerId: 'cus-1' },
];

const AUTH_KEY = 'solarsphere-auth-v1';

function loadUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

// AuthContextValue interface removed (TypeScript only)

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  const login = useCallback((email, password) => {
    const account = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === email.toLowerCase().trim());
    if (!account) return { ok: false, error: 'No account found with that email address.' };
    if (password !== 'solarsphere123') return { ok: false, error: 'Incorrect password. Demo password is solarsphere123.' };
    setUser(account);
    try { window.localStorage.setItem(AUTH_KEY, JSON.stringify(account)); } catch { /* ignore */ }
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try { window.localStorage.removeItem(AUTH_KEY); } catch { /* ignore */ }
  }, []);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function roleRoute(role) {
  switch (role) {
    case 'Admin': return 'admin';
    case 'Sales': return 'sales';
    case 'Surveyor': return 'survey';
    case 'Warehouse': return 'warehouse';
    case 'Technician': return 'technician';
    case 'Service': return 'service';
    case 'Finance': return 'finance';
    case 'Customer': return 'customer';
  }
}


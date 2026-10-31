import { createContext, useContext, useState, useCallback } from 'react';

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
export const AUTH_TOKEN_KEY = 'solarsphere-token-v1';
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function loadUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore malformed cached auth
  }
  return null;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  const persistAuth = useCallback((authUser, token) => {
    setUser(authUser);
    try {
      window.localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
      if (token) window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    } catch {
      // ignore quota issues
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json();
      if (!response.ok) {
        return { ok: false, error: payload.message || 'Login failed.' };
      }

      persistAuth(payload.data.user, payload.data.token);
      return { ok: true };
    } catch {
      const account = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === String(email).toLowerCase().trim());
      if (!account) return { ok: false, error: 'No account found with that email address.' };
      if (String(password) !== 'solarsphere123') {
        return { ok: false, error: 'Incorrect password. Demo password is solarsphere123.' };
      }

      persistAuth(account, 'demo-token');
      return { ok: true };
    }
  }, [persistAuth]);

  const register = useCallback(async ({ name, email, password, phone, companyName }) => {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, companyName }),
      });

      const payload = await response.json();
      if (!response.ok) {
        return { ok: false, error: payload.message || 'Registration failed.' };
      }

      persistAuth(payload.data.user, payload.data.token);
      return { ok: true, message: payload.message };
    } catch {
      return { ok: false, error: 'Unable to reach the server. Please try again.' };
    }
  }, [persistAuth]);

  const logout = useCallback(() => {
    setUser(null);
    try {
      window.localStorage.removeItem(AUTH_KEY);
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
    } catch {
      // ignore quota issues
    }
  }, []);

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
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
    case 'Customer':
    case 'Client': return 'customer';
    default: return '';
  }
}

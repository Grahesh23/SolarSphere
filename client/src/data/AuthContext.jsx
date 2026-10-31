import { createContext, useContext, useState, useCallback } from 'react';

const AUTH_KEY = 'solarsphere-auth-v2';
const LEGACY_AUTH_KEY = 'solarsphere-auth-v1';
export const AUTH_TOKEN_KEY = 'solarsphere-token-v2';
const LEGACY_AUTH_TOKEN_KEY = 'solarsphere-token-v1';
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function loadUser() {
  if (typeof window === 'undefined') return null;
  try {
    window.localStorage.removeItem(LEGACY_AUTH_KEY);
    window.localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
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
      return { ok: false, error: 'Unable to reach the server. Please try again.' };
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

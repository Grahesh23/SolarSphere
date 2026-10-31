import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { API_BASE, AUTH_TOKEN_KEY, useAuth } from '@/data/AuthContext';

const WorkflowContext = createContext(null);
const EMPTY_WORKFLOW = { customers: [], projects: [], surveys: [], quotations: [] };
const STAFF_ROLES = ['Admin', 'Sales', 'Surveyor'];

export function WorkflowProvider({ children }) {
  const { user } = useAuth();
  const [workflow, setWorkflow] = useState(EMPTY_WORKFLOW);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const request = useCallback(async (path, options = {}) => {
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      throw new Error('Sign in with a server-backed account to use the persistent workflow.');
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || 'Workflow request failed.');
    return payload.data;
  }, []);

  const refresh = useCallback(async () => {
    if (!user || !STAFF_ROLES.includes(user.role)) return;
    setLoading(true);
    setError('');
    try {
      setWorkflow(await request('/workflow'));
    } catch (loadError) {
      setError(loadError.message || 'Could not load workflow records.');
    } finally {
      setLoading(false);
    }
  }, [request, user]);

  useEffect(() => {
    if (user && STAFF_ROLES.includes(user.role)) {
      refresh();
    } else {
      setWorkflow(EMPTY_WORKFLOW);
      setError('');
      setLoading(false);
    }
  }, [refresh, user]);

  const value = useMemo(
    () => ({ ...workflow, loading, error, request, refresh }),
    [workflow, loading, error, request, refresh]
  );
  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>;
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) throw new Error('useWorkflow must be used within WorkflowProvider');
  return context;
}

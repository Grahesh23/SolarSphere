import { createContext, useContext, useState, useCallback } from 'react';
import { EMPTY_DATA } from './emptyData';

const STORAGE_KEY = 'solarsphere-data-v2';
const LEGACY_STORAGE_KEY = 'solarsphere-data-v1';

function loadInitial() {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
  }
  return EMPTY_DATA;
}

// DataContextValue interface removed (TypeScript only)

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [data, setDataState] = useState(loadInitial);

  const setData = useCallback((updater) => {
    setDataState((prev) => {
      const next = updater(prev);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore quota
      }
      return next;
    });
  }, []);

  const resetData = useCallback(() => {
    setDataState(EMPTY_DATA);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <DataContext.Provider value={{ data, setData, resetData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

export const fmtINR = (n) => {
  if (n === 0 || n == null) return '₹0';
  if (Math.abs(n) >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
};

export const fmtNum = (n) => n.toLocaleString('en-IN');

export const fmtDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const fmtPct = (n) => `${n}%`;

export const daysBetween = (a, b) => {
  const d1 = new Date(a).getTime();
  const d2 = new Date(b).getTime();
  return Math.round((d2 - d1) / 86400000);
};

export const genId = (prefix) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

export const cn = (...classes) =>
  classes.filter(Boolean).join(' ');

// Recharts tooltip formatters accept ValueType (string | number | array) | undefined
export const fmtINRRecharts = (v) => fmtINR(Number(v) || 0);
export const fmtKwhRecharts = (v) => `${Number(v) || 0} kWh`;
export const fmtUnitsRecharts = (v) => `${Number(v) || 0} units`;


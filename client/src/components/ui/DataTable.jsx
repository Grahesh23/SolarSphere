import { useMemo, useState } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

// Column interface removed (TypeScript only)
// DataTableProps interface removed (TypeScript only)

export function DataTable({
  columns, rows, searchKeys, searchPlaceholder = 'Search...', onRowClick, toolbar, emptyMessage,
}) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const filtered = useMemo(() => {
    let r = rows;
    if (query && searchKeys) {
      const q = query.toLowerCase();
      r = r.filter((row) => searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(q)));
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col?.sortValue) {
        r = [...r].sort((a, b) => {
          const va = col.sortValue(a);
          const vb = col.sortValue(b);
          if (va < vb) return sortDir === 'asc' ? -1 : 1;
          if (va > vb) return sortDir === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }
    return r;
  }, [rows, query, searchKeys, sortKey, sortDir, columns]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-slate-200">
        {searchKeys ? (
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="input pl-9"
            />
          </div>
        ) : <div />}
        {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {columns.map((col) => (
                <th key={col.key} className={`text-left px-4 py-2.5 font-medium text-slate-600 ${col.className ?? ''}`}>
                  {col.sortValue ? (
                    <button onClick={() => toggleSort(col.key)} className="inline-flex items-center gap-1 hover:text-navy-700">
                      {col.label}
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                      ) : <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />}
                    </button>
                  ) : col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-400">
                  {emptyMessage ?? 'No records found'}
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-slate-100 transition ${onRowClick ? 'cursor-pointer hover:bg-navy-50/50' : ''}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 text-navy-800 ${col.className ?? ''}`}>
                      {col.render ? col.render(row) : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2.5 border-t border-slate-200 text-xs text-slate-500">
        {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
      </div>
    </div>
  );
}


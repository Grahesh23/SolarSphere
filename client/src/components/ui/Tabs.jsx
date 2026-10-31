import { useState } from 'react';

// TabsProps interface removed (TypeScript only)

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="border-b border-slate-200 overflow-x-auto">
      <nav className="flex gap-1 min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 -mb-px border-b-2 text-sm font-medium transition whitespace-nowrap ${
              active === tab.key
                ? 'border-navy-700 text-navy-800'
                : 'border-transparent text-slate-500 hover:text-navy-600 hover:border-slate-300'
            }`}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export function useTabs(defaultKey) {
  const [active, setActive] = useState(defaultKey);
  return [active, setActive];
}


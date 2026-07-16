import React from 'react';

export type RFModelLevel = 'identity' | 'closed-form' | 'rule-of-thumb' | 'simulation';

const LEVELS: Record<RFModelLevel, { label: string; classes: string }> = {
  identity: { label: 'Exact identity', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800' },
  'closed-form': { label: 'Closed-form approximation', classes: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800' },
  'rule-of-thumb': { label: 'Rule of thumb', classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800' },
  simulation: { label: 'Requires simulation', classes: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800' },
};

export function RFModelBadge({ level, detail }: { level: RFModelLevel; detail?: string }) {
  const config = LEVELS[level];
  return (
    <span title={detail} className={`mb-4 inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${config.classes}`}>
      {config.label}
    </span>
  );
}

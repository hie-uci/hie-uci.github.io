import React from 'react';

export type RFModelLevel = 'identity' | 'closed-form' | 'rule-of-thumb' | 'simulation';

// Colour follows confidence: exact identities read as the second data series,
// approximations as the link colour, heuristics as the gold warning marker.
const LEVELS: Record<RFModelLevel, { label: string; classes: string }> = {
  identity: { label: 'Exact identity', classes: 'border-trace-2/45 text-trace-2' },
  'closed-form': { label: 'Closed-form', classes: 'border-accent-ink/45 text-accent-ink' },
  'rule-of-thumb': { label: 'Rule of thumb', classes: 'border-marker-ink/55 text-marker-ink' },
  simulation: { label: 'Needs simulation', classes: 'border-line-strong text-ink-2' },
};

export function RFModelBadge({ level, detail }: { level: RFModelLevel; detail?: string }) {
  const config = LEVELS[level];
  return (
    <span
      title={detail}
      className={`inline-flex w-fit items-center rounded-[3px] border px-2 py-1 font-mono text-[10px] uppercase leading-none tracking-[0.12em] [font-stretch:87.5%] ${config.classes}`}
    >
      {config.label}
    </span>
  );
}

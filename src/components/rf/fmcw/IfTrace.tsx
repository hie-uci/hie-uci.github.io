'use client';

import { useId, type CSSProperties } from 'react';
import { hz, joined, seconds } from './format';

const H = 78;
const M = { l: 46, r: 18 };
const MID = 40;
const AMP = 22;

/**
 * The mixer output: a tone at the beat frequency over a fixed time window, so a
 * farther target visibly packs more cycles into the same strip. It scrolls like a live trace.
 */
export default function IfTrace({ width, beatHz, windowS, filtered }: { width: number; beatHz: number; windowS: number; filtered: boolean }) {
  const clip = useId();
  const plotW = Math.max(120, width - M.l - M.r);
  const cycles = beatHz * windowS;
  const roomy = plotW >= 420; // room for the window length on the right
  const period = cycles > 0 ? plotW / cycles : plotW * 4;
  const step = Math.max(1, period / 24);
  const points: string[] = [];
  for (let px = 0; px <= plotW + period + step; px += step) {
    points.push(`${(M.l + px).toFixed(1)},${(MID - AMP * Math.sin((2 * Math.PI * px) / period)).toFixed(1)}`);
  }

  return (
    <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} className="block" role="img" aria-label={`Beat signal at ${joined(hz(beatHz))}, ${cycles.toFixed(1)} cycles in ${joined(seconds(windowS))}`}>
      <defs>
        <clipPath id={clip}>
          <rect x={M.l} y={0} width={plotW} height={H} />
        </clipPath>
      </defs>
      <line x1={M.l} x2={M.l + plotW} y1={MID} y2={MID} stroke="var(--line)" />
      <text x={M.l - 8} y={MID + 3.5} textAnchor="end" className="font-mono" fontSize={10} fill="var(--ink-3)">
        IF
      </text>
      <g clipPath={`url(#${clip})`} opacity={filtered ? 0.28 : 1}>
        {/* Scroll one period at a steady 36 px/s, whatever the beat frequency. */}
        <g className="fmcw-if" style={{ '--period': `${period}px`, animationDuration: `${(period / 36).toFixed(2)}s` } as CSSProperties}>
          <polyline points={points.join(' ')} fill="none" stroke="var(--series-2)" strokeWidth={1.6} strokeLinejoin="round" />
        </g>
      </g>
      <text x={M.l} y={H - 4} className="font-mono" fontSize={10} fill={filtered ? 'var(--alert)' : 'var(--ink-3)'}>
        {filtered ? (roomy ? 'Beat above the IF bandwidth: the IF filter attenuates it' : 'Above the IF bandwidth') : `${cycles.toFixed(1)} cycles of ${joined(hz(beatHz))}`}
      </text>
      {roomy && (
        <text x={M.l + plotW} y={H - 4} textAnchor="end" className="font-mono" fontSize={10} fill="var(--ink-3)">
          {joined(seconds(windowS))} window
        </text>
      )}
    </svg>
  );
}

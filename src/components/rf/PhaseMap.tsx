'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';

const noop = () => () => {};

// Cyclic ramps: a full turn of phase returns to its starting colour.
const DARK = ['#0b1f3a', '#0064a4', '#38bdf8', '#ffd200', '#0b1f3a'];
const LIGHT = ['#00386d', '#0064a4', '#7fc4ec', '#e0b400', '#00386d'];

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function phaseColor(deg: number, ramp: string[]): string {
  const t = (((deg % 360) + 360) % 360) / 360;
  const x = t * (ramp.length - 1);
  const i = Math.min(ramp.length - 2, Math.floor(x));
  const f = x - i;
  const a = hexToRgb(ramp[i]);
  const b = hexToRgb(ramp[i + 1]);
  const c = a.map((v, k) => Math.round(v + (b[k] - v) * f));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

/** Element-by-element steering phase, one cell per element, colours cycling once per 360 degrees. */
export default function PhaseMap({ phasesDeg }: { phasesDeg: number[][] }) {
  const { resolvedTheme } = useTheme();
  // The server cannot know the theme; paint the default until mounted to keep hydration clean.
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const ramp = mounted && resolvedTheme === 'light' ? LIGHT : DARK;
  const ny = phasesDeg.length;
  const nx = phasesDeg[0]?.length ?? 0;

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="kicker flex justify-between text-[10.5px]">
        <span>Element phase</span>
        <span>0–360°</span>
      </figcaption>
      <div
        className="grid aspect-square w-full max-w-[280px] gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${nx}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${Math.max(ny, 1)}, minmax(0, 1fr))`, aspectRatio: `${nx} / ${Math.max(ny, 1)}` }}
        role="img"
        aria-label={`Steering phase for ${nx} by ${ny} elements`}
      >
        {phasesDeg.flatMap((row, n) =>
          row.map((p, m) => (
            <span key={`${n}-${m}`} className="rounded-[2px]" style={{ background: phaseColor(p, ramp) }} title={`Element ${m + 1},${n + 1}: ${p.toFixed(0)}°`} />
          )),
        )}
      </div>
      <div className="flex items-center gap-2 font-mono text-[10px] text-ink-3" aria-hidden="true">
        <span>0°</span>
        <span className="h-1.5 flex-1 rounded-full" style={{ background: `linear-gradient(90deg, ${ramp.join(', ')})` }} />
        <span>360°</span>
      </div>
    </figure>
  );
}

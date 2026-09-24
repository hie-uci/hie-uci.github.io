'use client';

import { useId, type CSSProperties } from 'react';
import { hz, joined, seconds } from './format';

export const CHIRP_H = 244;
const M = { l: 46, r: 18, t: 16, b: 30 };
const GAP_PX = 60; // the delay is magnified to 24–60 px once snapped to the 1-2-5 ladder
// Text halo so labels stay legible where they cross a line.
const HALO = { paintOrder: 'stroke', stroke: 'var(--bg-raised)', strokeWidth: 4, strokeLinejoin: 'round' } as const;

/** Largest value on the 1-2-5 ladder that does not exceed x. */
function ladderFloor(x: number): number {
  if (!(x > 1)) return 1;
  const decade = 10 ** Math.floor(Math.log10(x) + 1e-9);
  const mantissa = (x / decade) * (1 + 1e-9); // absorb float error such as 0.19999999999999998
  return decade * (mantissa >= 5 ? 5 : mantissa >= 2 ? 2 : 1);
}

interface ChirpGeometry {
  /** Width of the main time–frequency plot, px. */
  width: number;
  chirpS: number;
  tauS: number;
}

/** Pixel scale shared by the plot and the magnifier, so the magnifier keeps the ramp slope. */
function geometry({ width, chirpS, tauS }: ChirpGeometry) {
  const plotW = Math.max(120, width - M.l - M.r);
  const plotH = CHIRP_H - M.t - M.b;
  const pxPerS = plotW / (2 * chirpS);
  const tauPx = tauS * pxPerS;
  return {
    plotW,
    plotH,
    x: (t: number) => M.l + t * pxPerS,
    y: (fraction: number) => M.t + plotH * (1 - fraction),
    magnification: tauPx > 0 ? ladderFloor(GAP_PX / tauPx) : 1,
    tauPx,
    slope: plotH / chirpS / pxPerS, // screen pixels up per pixel right along a ramp
  };
}

const times = (n: number) => `×${n.toLocaleString('en-US')}`;

/** f_b as math: italic serif f with a lowered b, then back on the baseline. */
function FB() {
  return (
    <>
      <tspan className="math-var" fontSize="1.2em">
        f
      </tspan>
      <tspan fontSize="0.8em" dy={3}>
        b
      </tspan>
      <tspan dy={-3}>{'\u200a'}</tspan>
    </>
  );
}

/**
 * Transmit and received chirps on a time–frequency plane, two chirp periods wide,
 * with a sweep cursor. Both are drawn to scale, so they usually overlap here.
 */
export function ChirpPlot({ width, chirpS, tauS, label }: ChirpGeometry & { label: string }) {
  const clip = useId();
  const trail = useId();
  const g = geometry({ width, chirpS, tauS });
  const { x, y } = g;
  const lag = Math.min(tauS / chirpS, 1);
  const tx = `M${x(0)} ${y(0)}L${x(chirpS)} ${y(1)}M${x(chirpS)} ${y(0)}L${x(2 * chirpS)} ${y(1)}`;
  const rx = `M${x(0)} ${y(1 - lag)}L${x(tauS)} ${y(1)}M${x(tauS)} ${y(0)}L${x(chirpS + tauS)} ${y(1)}M${x(chirpS + tauS)} ${y(0)}L${x(2 * chirpS)} ${y(1 - lag)}`;
  const flybacks = `M${x(chirpS)} ${y(1)}V${y(0)}M${x(tauS)} ${y(1)}V${y(0)}M${x(chirpS + tauS)} ${y(1)}V${y(0)}`;
  const focus = { x: x(chirpS / 2), y: y(0.5) };
  const roomy = g.plotW >= 380; // narrow plots drop the times; the slider shows Tc
  const timeTicks = [
    { t: 0, text: '0', anchor: 'start' },
    { t: chirpS, text: roomy ? `Tc ${joined(seconds(chirpS))}` : 'Tc', anchor: 'middle' },
    { t: 2 * chirpS, text: roomy ? `2Tc ${joined(seconds(2 * chirpS))}` : '2Tc', anchor: 'end' },
  ] as const;

  return (
    <svg width={width} height={CHIRP_H} viewBox={`0 0 ${width} ${CHIRP_H}`} className="block" role="img" aria-label={label}>
      <defs>
        <clipPath id={clip}>
          <rect x={M.l} y={M.t - 2} width={g.plotW} height={g.plotH + 4} />
        </clipPath>
        <linearGradient id={trail} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="var(--trace)" stopOpacity={0} />
          <stop offset="1" stopColor="var(--trace)" stopOpacity={0.14} />
        </linearGradient>
      </defs>

      <g className="font-mono" fontSize={10} fill="var(--ink-3)">
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line x1={M.l} x2={M.l + g.plotW} y1={y(f)} y2={y(f)} stroke="var(--line)" />
            <text x={M.l - 8} y={y(f) + 3.5} textAnchor="end">
              {f === 0 ? 'f₀' : f === 1 ? '+B' : '+B/2'}
            </text>
          </g>
        ))}
        {timeTicks.map((tick) => (
          <g key={tick.t}>
            <line x1={x(tick.t)} x2={x(tick.t)} y1={M.t} y2={y(0) + 5} stroke="var(--line)" />
            <text x={x(tick.t)} y={CHIRP_H - 10} textAnchor={tick.anchor}>
              {tick.text}
            </text>
          </g>
        ))}
      </g>

      <g clipPath={`url(#${clip})`}>
        <path d={flybacks} stroke="var(--line-strong)" strokeDasharray="3 3" fill="none" />
        <path d={tx} stroke="var(--trace)" strokeWidth={2.25} fill="none" strokeLinecap="round" />
        <path d={rx} stroke="var(--series-2)" strokeWidth={1.5} strokeDasharray="7 5" fill="none" />
        <g className="fmcw-sweep" style={{ '--sweep': `${g.plotW}px` } as CSSProperties}>
          <rect x={M.l - 64} y={M.t} width={64} height={g.plotH} fill={`url(#${trail})`} />
          <line x1={M.l} x2={M.l} y1={M.t} y2={M.t + g.plotH} stroke="var(--trace)" strokeOpacity={0.7} />
        </g>
      </g>

      <g className="font-mono" fontSize={10}>
        <circle cx={focus.x} cy={focus.y} r={9} fill="none" stroke="var(--ink-2)" strokeWidth={1} />
        <line x1={focus.x + 7} y1={focus.y - 7} x2={focus.x + 20} y2={focus.y - 20} stroke="var(--ink-2)" strokeWidth={1} />
        <text x={focus.x + 24} y={focus.y - 22} fill="var(--ink-2)" {...HALO}>
          zoom {times(g.magnification)}
        </text>
      </g>
    </svg>
  );
}

function Dimension({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const vertical = x1 === x2;
  const tick = (px: number, py: number) => (vertical ? <line x1={px - 4} x2={px + 4} y1={py} y2={py} /> : <line x1={px} x2={px} y1={py - 4} y2={py + 4} />);
  return (
    <g stroke="var(--ink)" strokeWidth={1}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      {tick(x1, y1)}
      {tick(x2, y2)}
    </g>
  );
}

/**
 * The same two ramps magnified at mid-chirp. The delay τ and the beat frequency f_b
 * become the two legs of a small triangle between the parallel ramps.
 */
export function ChirpLoupe({ width, chirpS, tauS, beatHz, size }: ChirpGeometry & { beatHz: number; size: number }) {
  const clip = useId();
  const g = geometry({ width, chirpS, tauS });
  const gap = g.tauPx * g.magnification;
  const k = g.slope;
  const cx = size / 2;
  const cy = CHIRP_H / 2;
  const ramp = (shift: number) => `M${-20} ${cy - k * (-20 - cx - shift)}L${size + 20} ${cy - k * (size + 20 - cx - shift)}`;
  const a = { x: cx - gap / 2, y: cy + (k * gap) / 2 }; // on the TX ramp
  const b = { x: a.x + gap, y: a.y }; // RX at the same frequency, τ later
  const c = { x: a.x, y: a.y + k * gap }; // RX at the same time, f_b lower

  return (
    <svg
      width={size}
      height={CHIRP_H}
      viewBox={`0 0 ${size} ${CHIRP_H}`}
      className="block"
      role="img"
      aria-label={`Magnified ${g.magnification} times: delay ${joined(seconds(tauS))}, beat frequency ${joined(hz(beatHz))}`}
    >
      <defs>
        <clipPath id={clip}>
          <rect x={0} y={30} width={size} height={CHIRP_H - 76} />
        </clipPath>
      </defs>
      <text x={14} y={19} className="font-mono" fontSize={10} fill="var(--ink-3)">
        {times(g.magnification)} at mid-chirp
      </text>
      <g clipPath={`url(#${clip})`}>
        <path d={ramp(0)} stroke="var(--trace)" strokeWidth={2.25} fill="none" />
        <path d={ramp(gap)} stroke="var(--series-2)" strokeWidth={1.5} strokeDasharray="7 5" fill="none" />
        <Dimension x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
        <Dimension x1={a.x} y1={a.y} x2={c.x} y2={c.y} />
        <g className="font-mono" fontSize={10.5} fill="var(--ink)" {...HALO}>
          <text x={b.x + 8} y={b.y + 4} fontSize={13} className="math-var">
            τ
          </text>
          <text x={a.x - gap / 2 - 10} y={(a.y + c.y) / 2 + 4} textAnchor="end" fontSize={13}>
            <FB />
          </text>
        </g>
      </g>
      <g className="font-mono" fontSize={10.5}>
        <text x={14} y={CHIRP_H - 28} fill="var(--ink-2)">
          <tspan className="math-var" fontSize={12.5}>τ</tspan> = 2R/c = {joined(seconds(tauS))}
        </text>
        <text x={14} y={CHIRP_H - 10} fill="var(--series-2)">
          <FB /> = S·<tspan className="math-var" fontSize={12.5}>τ</tspan> = {joined(hz(beatHz))}
        </text>
      </g>
    </svg>
  );
}

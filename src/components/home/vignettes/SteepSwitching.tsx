'use client';

import { Label, SIGNAL, Vignette } from './frame';

// Drain current against gate voltage on a log scale. A conventional MOSFET cannot switch faster
// than kT/q · ln 10 ≈ 60 mV per decade at 300 K; a tunnelling FET can. Curves are
// log10 I = log10 I_off + D (1 − e^(−(V − V0) / (SS·D))): slope 1/SS at turn-on, D decades to the
// on-state. SS = 60 mV/dec and 30 mV/dec are illustrative choices, not device data.
const PLOT = { x: 34, y: 16, w: 192, h: 128 };
const V_MAX = 0.6;
const DECADES = 8;
const SWEEP_S = 4;

interface Device { v0: number; ss: number; decades: number }
const MOSFET: Device = { v0: 0.05, ss: 0.06, decades: 8 };
const TFET: Device = { v0: 0.12, ss: 0.03, decades: 6 };

/** Decades above the off-current floor at gate voltage v. */
function logI(d: Device, v: number): number {
  if (v <= d.v0) return 0;
  return d.decades * (1 - Math.exp(-(v - d.v0) / (d.ss * d.decades)));
}

const xOf = (v: number) => PLOT.x + (v / V_MAX) * PLOT.w;
const yOf = (dec: number) => PLOT.y + PLOT.h - (dec / DECADES) * PLOT.h;

function curve(d: Device): string {
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const v = (i / 60) * V_MAX;
    pts.push(`${xOf(v).toFixed(1)},${yOf(logI(d, v)).toFixed(1)}`);
  }
  return pts.join(' ');
}

const MOSFET_CURVE = curve(MOSFET);
const TFET_CURVE = curve(TFET);

function Drawing({ t }: { t: number }) {
  const c = (t % (2 * SWEEP_S)) / SWEEP_S;
  const v = (c < 1 ? c : 2 - c) * V_MAX;
  return (
    <>
      <path d={`M${PLOT.x} ${PLOT.y} V${PLOT.y + PLOT.h} H${PLOT.x + PLOT.w}`} opacity={0.5} />
      <Label x={PLOT.x - 4} y={PLOT.y + 4} anchor="end">I</Label>
      <Label x={PLOT.x + PLOT.w} y={PLOT.y + PLOT.h + 14} anchor="end">gate voltage</Label>
      <polyline points={MOSFET_CURVE} strokeDasharray="5 4" opacity={0.8} />
      <polyline points={TFET_CURVE} className={SIGNAL} stroke="currentColor" />
      <path d={`M${xOf(v).toFixed(1)} ${PLOT.y} V${PLOT.y + PLOT.h}`} strokeWidth={1} opacity={0.3} />
      <circle cx={xOf(v)} cy={yOf(logI(MOSFET, v))} r={2.5} fill="currentColor" stroke="none" />
      <circle cx={xOf(v)} cy={yOf(logI(TFET, v))} r={2.8} className={SIGNAL} fill="currentColor" stroke="none" />
      <Label x={xOf(0.36)} y={yOf(2.4)}>MOSFET, 60 mV/dec</Label>
      <g className={SIGNAL}>
        <Label x={xOf(0.035)} y={yOf(5.2)}>2D tunnelling FET</Label>
      </g>
    </>
  );
}

export default function SteepSwitching() {
  return (
    <Vignette title="Switching below 60 mV per decade" chip="Illustration, 2D tunnelling FET" still={2.2}>
      {(t) => <Drawing t={t} />}
    </Vignette>
  );
}

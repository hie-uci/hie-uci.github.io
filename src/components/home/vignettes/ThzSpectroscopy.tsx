'use client';

import { Label, SIGNAL, Vignette } from './frame';

// Transmission through humid air, swept from 0.50 to 0.80 THz. The two dips sit at real water
// vapour lines, 556.9 GHz and 752.0 GHz; their depths and widths (Lorentzian, 5 GHz half width)
// are illustrative.
const F_LO = 500;
const F_HI = 800;
const LINES = [
  { f: 556.9, depth: 0.78, label: '557 GHz' },
  { f: 752.0, depth: 0.62, label: '752 GHz' },
];
const HWHM = 5;
const SWEEP_S = 5;
const HOLD_S = 1.6;
const PLOT = { x: 22, y: 64, w: 196, h: 70 };

const transmission = (f: number) =>
  LINES.reduce((tr, l) => tr * (1 - l.depth / (1 + ((f - l.f) / HWHM) ** 2)), 1);

function Drawing({ t }: { t: number }) {
  const c = t % (SWEEP_S + HOLD_S);
  const fNow = F_LO + Math.min(1, c / SWEEP_S) * (F_HI - F_LO);
  const xOf = (f: number) => PLOT.x + ((f - F_LO) / (F_HI - F_LO)) * PLOT.w;
  const yOf = (tr: number) => PLOT.y + (1 - tr) * PLOT.h;
  const pts: string[] = [];
  for (let f = F_LO; f <= fNow; f += 1) pts.push(`${xOf(f).toFixed(1)},${yOf(transmission(f)).toFixed(1)}`);
  return (
    <>
      {/* source, a cell of humid air, detector */}
      <rect x={20} y={14} width={22} height={14} rx={2} />
      <rect x={84} y={10} width={72} height={22} rx={10} opacity={0.7} />
      <Label x={120} y={24} anchor="middle">H₂O vapour</Label>
      <rect x={198} y={14} width={22} height={14} rx={2} />
      <path d="M42 21 H84 M156 21 H198" className={SIGNAL} stroke="currentColor" strokeDasharray="4 3" />
      {/* swept transmission */}
      <path d={`M${PLOT.x} ${PLOT.y} V${PLOT.y + PLOT.h} H${PLOT.x + PLOT.w}`} opacity={0.5} />
      <polyline points={pts.join(' ')} className={SIGNAL} stroke="currentColor" />
      {LINES.filter((l) => l.f <= fNow).map((l) => (
        <Label key={l.f} x={xOf(l.f)} y={PLOT.y + PLOT.h + 13} anchor="middle">{l.label}</Label>
      ))}
      <Label x={PLOT.x} y={PLOT.y + PLOT.h + 28}>0.5 THz</Label>
      <Label x={PLOT.x + PLOT.w} y={PLOT.y + PLOT.h + 28} anchor="end">0.8 THz</Label>
    </>
  );
}

export default function ThzSpectroscopy() {
  return (
    <Vignette title="Water lines in the THz band" chip="Illustration, sub-THz and THz sources" still={SWEEP_S + 0.5}>
      {(t) => <Drawing t={t} />}
    </Vignette>
  );
}

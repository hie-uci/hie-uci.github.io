'use client';

import { Label, SIGNAL, Vignette } from './frame';

// A spectrum-analyser view of the VCO's output as the tuning voltage sweeps up and down. The tuning
// curve f = 3.1 + 1.56 V^0.8 GHz and the skirt −20 log10(1 + Δf / 4 MHz) dB are illustrative
// shapes over the chip's 3.1–4.7 GHz range, not measured data.
const F_LO = 3.0;
const F_HI = 4.8;
const PERIOD_S = 6;
const SCREEN = { x: 20, y: 18, w: 200, h: 100 };
const FLOOR_DB = -60;

const freqAt = (v: number) => 3.1 + 1.56 * v ** 0.8;
/** Tuning voltage, 0 to 1 and back over one period. */
const vtune = (t: number) => {
  const c = (t % PERIOD_S) / PERIOD_S;
  return c < 0.5 ? c * 2 : 2 - c * 2;
};

/** Spectrum level in dB at frequency f for a carrier at fc, over a slightly uneven noise floor. */
function level(f: number, fc: number, i: number): number {
  const skirt = -20 * Math.log10(1 + Math.abs(f - fc) / 0.004);
  const floor = FLOOR_DB + 3 * Math.sin(i * 12.9898) * Math.sin(i * 4.1414);
  return Math.max(skirt, floor);
}

function Drawing({ t }: { t: number }) {
  const v = vtune(t);
  const fc = freqAt(v);
  const xOf = (f: number) => SCREEN.x + ((f - F_LO) / (F_HI - F_LO)) * SCREEN.w;
  const yOf = (db: number) => SCREEN.y + 8 + (db / FLOOR_DB) * (SCREEN.h - 12);
  const pts: string[] = [];
  for (let i = 0; i <= 100; i++) {
    const f = F_LO + (i / 100) * (F_HI - F_LO);
    pts.push(`${xOf(f).toFixed(1)},${yOf(level(f, fc, i)).toFixed(1)}`);
  }
  pts.push(`${xOf(fc).toFixed(1)},${yOf(0).toFixed(1)}`);
  pts.sort((a, b) => parseFloat(a) - parseFloat(b));
  const peakX = xOf(fc);
  return (
    <>
      <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} rx={3} />
      <g opacity={0.25} strokeWidth={1}>
        {Array.from({ length: 9 }, (_, k) => (
          <path key={k} d={`M${SCREEN.x + (k + 1) * 20} ${SCREEN.y} V${SCREEN.y + SCREEN.h}`} />
        ))}
      </g>
      <polyline points={pts.join(' ')} className={SIGNAL} stroke="currentColor" />
      <path d={`M${peakX - 4} ${SCREEN.y - 6} L${peakX + 4} ${SCREEN.y - 6} L${peakX} ${SCREEN.y - 1} Z`} className={SIGNAL} fill="currentColor" stroke="none" />
      <Label x={SCREEN.x + SCREEN.w - 6} y={SCREEN.y + 14} anchor="end">{fc.toFixed(2)} GHz</Label>
      <Label x={xOf(3.1)} y={132} anchor="middle">3.1</Label>
      <Label x={xOf(4.7)} y={132} anchor="middle">4.7 GHz</Label>
      {/* the tuning voltage that moves the carrier */}
      <Label x={20} y={158}>Vtune</Label>
      <path d="M60 155 H200" opacity={0.6} />
      <circle cx={60 + v * 140} cy={155} r={4.5} className={SIGNAL} fill="currentColor" stroke="none" />
    </>
  );
}

export default function VcoSpectrum() {
  return (
    <Vignette title="Tuning a wideband VCO" chip="Illustration, 3.1–4.7 GHz class-D VCO" still={1.4}>
      {(t) => <Drawing t={t} />}
    </Vignette>
  );
}

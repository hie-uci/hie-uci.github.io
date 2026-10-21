'use client';

import { Label, SIGNAL, Vignette } from './frame';

// Chest displacement x(t) = A_b sin(2π f_b t) + A_h sin(2π f_h t). The radar reads it as phase,
// φ = 4π x / λ (λ ≈ 5.4 mm at 56 GHz, mid-band of the 49–63 GHz chip), and recovers x = λ φ / 4π.
// Example values: 15 breaths and 72 beats a minute, 4 mm and 0.25 mm of chest motion.
const BREATH_HZ = 0.25;
const HEART_HZ = 1.2;
const BREATH_MM = 4;
const HEART_MM = 0.25;
const WINDOW_S = 6;

const breath = (t: number) => BREATH_MM * Math.sin(2 * Math.PI * BREATH_HZ * t);
const heart = (t: number) => HEART_MM * Math.sin(2 * Math.PI * HEART_HZ * t);

/** Polyline points for the last WINDOW_S seconds of f, newest at the right edge. */
function trace(f: (t: number) => number, t: number, y0: number, pxPerMm: number): string {
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const tau = t - WINDOW_S + (i / 60) * WINDOW_S;
    pts.push(`${(20 + i * (208 / 60)).toFixed(1)},${(y0 - f(tau) * pxPerMm).toFixed(1)}`);
  }
  return pts.join(' ');
}

/** An arc of radius r around (cx, cy), ±half degrees about the +x axis. */
function arc(cx: number, cy: number, r: number, half: number): string {
  const a = (half * Math.PI) / 180;
  const x = (cx + r * Math.cos(a)).toFixed(1);
  return `M${x} ${(cy - r * Math.sin(a)).toFixed(1)} A${r} ${r} 0 0 1 ${x} ${(cy + r * Math.sin(a)).toFixed(1)}`;
}

function Drawing({ t }: { t: number }) {
  const bulge = 1.6 * (breath(t) / BREATH_MM);
  return (
    <>
      {/* radar chip */}
      <rect x={14} y={42} width={16} height={16} rx={2} />
      <path d="M18 42v-3M22 42v-3M26 42v-3M18 58v3M22 58v3M26 58v3" strokeWidth={1} />
      {/* outgoing wavefronts */}
      {[0, 1, 2].map((k) => {
        const phase = (t / 1.6 + k / 3) % 1;
        return <path key={k} d={arc(30, 50, 10 + phase * 135, 22)} opacity={0.85 * (1 - phase)} />;
      })}
      {/* seated person facing the radar; the chest moves with x(t) */}
      <circle cx={192} cy={26} r={9} />
      <path d={`M186 40 Q${(170 - bulge).toFixed(1)} 60 178 90 L206 90 Q208 62 199 40 Z`} />
      <path d="M212 46 V96 M172 96 H216 M178 96 V108 M210 96 V108" opacity={0.6} />
      {/* recovered displacement: breathing, and the heartbeat ten times enlarged */}
      <Label x={20} y={112}>breathing</Label>
      <polyline points={trace(breath, t, 126, 2.2)} className={SIGNAL} stroke="currentColor" />
      <Label x={20} y={146}>heartbeat ×10</Label>
      <polyline points={trace(heart, t, 160, 22)} className={SIGNAL} stroke="currentColor" />
    </>
  );
}

export default function VitalSigns() {
  return (
    <Vignette title="Contact-free vital signs" chip="Illustration, 49–63 GHz FMCW radar" still={2}>
      {(t) => <Drawing t={t} />}
    </Vignette>
  );
}

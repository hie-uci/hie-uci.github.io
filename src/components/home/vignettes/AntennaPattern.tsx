'use client';

import { elementPattern } from '@/lib/arrayPattern';
import { Label, SIGNAL, Vignette } from './frame';

// The chip turns on a rotary stage while a fixed horn reads its gain; the polar plot is traced as
// the angle sweeps. Pattern from the RF Toolbox element model, field cos^q θ with q = 1.5 (power
// cos³θ, about 75° half-power beamwidth), shown in dB down to −30 dB. A model, not the measurement.
const Q = 1.5;
const FLOOR_DB = -30;
const SWEEP_S = 5;
const HOLD_S = 1.4;
const CX = 150;
const CY = 140;
const R = 76;

const radiusAt = (thetaDeg: number) => {
  const field = elementPattern(Q, (thetaDeg * Math.PI) / 180);
  const db = field > 0 ? Math.max(FLOOR_DB, 20 * Math.log10(field)) : FLOOR_DB;
  return R * (1 - db / FLOOR_DB);
};

const point = (thetaDeg: number, r: number) => {
  const a = (thetaDeg * Math.PI) / 180;
  return { x: CX + r * Math.sin(a), y: CY - r * Math.cos(a) };
};

/** The front half-plane grid: rings at 0, −10 and −20 dB and spokes every 30°. */
function PolarGrid() {
  return (
    <g opacity={0.35} strokeWidth={1}>
      {[1, 2 / 3, 1 / 3].map((f) => (
        <path key={f} d={`M${CX - R * f} ${CY} A${R * f} ${R * f} 0 0 1 ${CX + R * f} ${CY}`} />
      ))}
      {[-90, -60, -30, 0, 30, 60, 90].map((d) => {
        const p = point(d, R);
        return <path key={d} d={`M${CX} ${CY} L${p.x.toFixed(1)} ${p.y.toFixed(1)}`} />;
      })}
    </g>
  );
}

function Drawing({ t }: { t: number }) {
  const c = t % (SWEEP_S + HOLD_S);
  const theta = -90 + Math.min(1, c / SWEEP_S) * 180;
  const pts: string[] = [];
  for (let d = -90; d <= theta; d += 2) {
    const p = point(d, radiusAt(d));
    pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
  }
  const now = point(theta, radiusAt(theta));
  return (
    <>
      <PolarGrid />
      <Label x={CX} y={CY - R - 5} anchor="middle">0 dB</Label>
      <Label x={CX + 4} y={CY - (R * 2) / 3 + 10}>−10</Label>
      <polyline points={pts.join(' ')} className={SIGNAL} stroke="currentColor" />
      <path d={`M${CX} ${CY} L${now.x.toFixed(1)} ${now.y.toFixed(1)}`} className={SIGNAL} stroke="currentColor" opacity={0.5} />
      <circle cx={now.x} cy={now.y} r={2.5} className={SIGNAL} fill="currentColor" stroke="none" />
      {/* the horn above, the chip on its turntable below, turned by θ */}
      <path d="M26 16 H46 L40 34 H32 Z" />
      <path d="M36 36 V82" strokeDasharray="3 4" opacity={0.6} />
      <circle cx={36} cy={108} r={20} opacity={0.6} />
      <g transform={`rotate(${theta.toFixed(1)} 36 108)`}>
        <rect x={29} y={101} width={14} height={14} rx={2} />
        <path d="M36 101 V92" />
      </g>
      <Label x={36} y={146} anchor="middle">θ {Math.round(theta)}°</Label>
    </>
  );
}

export default function AntennaPattern() {
  return (
    <Vignette title="Antenna pattern on a turntable" chip="Illustration, 60 GHz radar transceiver" still={SWEEP_S + 0.5}>
      {(t) => <Drawing t={t} />}
    </Vignette>
  );
}

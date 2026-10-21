'use client';

import { Label, SIGNAL, Vignette } from './frame';

// A point-to-point link: a narrow beam between two antennas, and the receiver's 16-QAM
// constellation filling in symbol by symbol. Symbols are ideal points plus Gaussian noise
// (σ = 2.4 px on an 18 px grid) from a fixed pseudo-random sequence; illustrative, not measured.
const STEP = 18;
const C = { x: 120, y: 124 };
const SYMBOL_S = 0.09;
const KEEP = 56;
const LEVELS = [-1.5, -0.5, 0.5, 1.5];

/** Deterministic uniform in (0, 1) for an integer seed. */
function rand(seed: number): number {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s) || 0.5;
}

/** Received symbol k: an ideal 16-QAM point with Box–Muller Gaussian noise. */
function symbol(k: number) {
  const ix = Math.floor(rand(k) * 4);
  const iy = Math.floor(rand(k + 0.5) * 4);
  const r = Math.sqrt(-2 * Math.log(rand(k + 0.25)));
  const a = 2 * Math.PI * rand(k + 0.75);
  return {
    x: C.x + LEVELS[ix] * STEP + 2.4 * r * Math.cos(a),
    y: C.y + LEVELS[iy] * STEP + 2.4 * r * Math.sin(a),
  };
}

function Drawing({ t }: { t: number }) {
  const latest = Math.floor(t / SYMBOL_S);
  const dots = Array.from({ length: KEEP }, (_, i) => latest - i).filter((k) => k >= 0);
  return (
    <>
      {/* antennas on masts and the beam between them */}
      <path d="M24 74 V44 M18 74 H30 M216 74 V44 M210 74 H222" opacity={0.7} />
      <path d="M24 44 Q34 36 24 28 M216 44 Q206 36 216 28" />
      <path d="M32 36 Q120 27 208 36 Q120 45 32 36 Z" opacity={0.35} />
      {[0, 1, 2, 3].map((k) => {
        const x = 40 + ((t * 0.9 + k / 4) % 1) * 156;
        return <path key={k} d={`M${x.toFixed(1)} 36 h10`} className={SIGNAL} stroke="currentColor" strokeWidth={2.5} />;
      })}
      {/* receiver constellation */}
      <g opacity={0.3} strokeWidth={1}>
        <path d={`M${C.x - 44} ${C.y} H${C.x + 44} M${C.x} ${C.y - 44} V${C.y + 44}`} />
      </g>
      {LEVELS.flatMap((lx) => LEVELS.map((ly) => (
        <path key={`${lx},${ly}`} d={`M${C.x + lx * STEP - 3} ${C.y + ly * STEP} h6 M${C.x + lx * STEP} ${C.y + ly * STEP - 3} v6`} strokeWidth={1} opacity={0.45} />
      )))}
      <g className={SIGNAL} fill="currentColor" stroke="none">
        {dots.map((k) => {
          const p = symbol(k);
          return <circle key={k} cx={p.x} cy={p.y} r={1.8} opacity={1 - (latest - k) / KEEP} />;
        })}
      </g>
      <Label x={C.x - 44} y={C.y - 48}>16-QAM</Label>
    </>
  );
}

export default function SubThzLink() {
  return (
    <Vignette title="A wireless link above 100 GHz" chip="Illustration, 110–143 GHz power amplifier" still={6}>
      {(t) => <Drawing t={t} />}
    </Vignette>
  );
}

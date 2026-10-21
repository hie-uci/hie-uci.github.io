'use client';

import { Label, SIGNAL, Vignette } from './frame';

// A truck crosses a simply supported span; a radar under mid-span reads the deck's sag. The deck
// follows the elastic curve for a point load at a, y(x) ∝ b x (L² − b² − x²) for x ≤ a (b = L − a,
// mirrored beyond a), and the trace is mid-span deflection against load position, the influence
// line a (3L² − 4a²) / L³ normalised to 1 at a = L/2. Sag is exaggerated to be visible.
const L0 = 20;
const SPAN = 200;
const DECK_Y = 64;
const SAG_PX = 7;
const CROSS_S = 4.5;
const CYCLE_S = CROSS_S + 1.5;

/** Elastic curve of a simply supported beam, unit load at a, normalised so mid-span load gives 1 at mid-span. */
function deflection(x: number, a: number): number {
  const L = 1;
  const [xx, aa] = x <= a ? [x, a] : [L - x, L - a];
  const b = L - aa;
  // b x (L² − b² − x²) is 1/8 for a = x = L/2, so × 8 puts a mid-span load's mid-span sag at 1.
  return 8 * b * xx * (L * L - b * b - xx * xx);
}

/** Mid-span deflection for a load at a: the influence line, 1 at a = 1/2. */
const midSag = (a: number) => {
  const s = Math.min(a, 1 - a);
  return s * (3 - 4 * s * s);
};

function Drawing({ t }: { t: number }) {
  const c = t % CYCLE_S;
  const a = Math.min(1, c / CROSS_S);
  const onSpan = c < CROSS_S;
  const deck: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const x = i / 40;
    const y = DECK_Y + (onSpan ? SAG_PX * deflection(x, a) : 0);
    deck.push(`${(L0 + x * SPAN).toFixed(1)},${y.toFixed(1)}`);
  }
  const truckX = L0 + a * SPAN;
  const truckY = DECK_Y + (onSpan ? SAG_PX * deflection(a, a) : 0);
  const trace: string[] = [];
  for (let i = 0; i <= Math.round(a * 50); i++) {
    const q = i / 50;
    trace.push(`${(L0 + q * SPAN).toFixed(1)},${(128 + 26 * midSag(q)).toFixed(1)}`);
  }
  return (
    <>
      <polyline points={deck.join(' ')} strokeWidth={2.5} />
      <path d={`M${L0} ${DECK_Y + 3} l-7 12 h14 Z M${L0 + SPAN} ${DECK_Y + 3} l-7 12 h14 Z`} opacity={0.7} />
      {onSpan && (
        <g transform={`translate(${truckX.toFixed(1)} ${truckY.toFixed(1)})`}>
          <rect x={-12} y={-12} width={20} height={9} rx={1.5} />
          <rect x={8} y={-9} width={6} height={6} rx={1} />
          <circle cx={-7} cy={-1.5} r={2} />
          <circle cx={9} cy={-1.5} r={2} />
        </g>
      )}
      {/* radar under mid-span */}
      <rect x={113} y={100} width={14} height={10} rx={2} className={SIGNAL} stroke="currentColor" />
      <path d={`M120 100 V${DECK_Y + 4}`} className={SIGNAL} stroke="currentColor" strokeDasharray="3 4" opacity={0.8} />
      {/* mid-span sag against the truck's position */}
      <path d={`M${L0} 128 H${L0 + SPAN}`} opacity={0.35} strokeWidth={1} />
      <polyline points={trace.join(' ')} className={SIGNAL} stroke="currentColor" />
      <Label x={L0} y={168}>sag at mid-span, exaggerated</Label>
    </>
  );
}

export default function BridgeMonitoring() {
  return (
    <Vignette title="Watching a bridge flex" chip="Illustration, mm-wave FMCW radar" still={CROSS_S / 2}>
      {(t) => <Drawing t={t} />}
    </Vignette>
  );
}

// Log-frequency geometry for the spectrum ruler (homepage hero, footer).
// Pure functions so the placement of every die can be unit tested.

export const RULER_MIN_GHZ = 0.1;
export const RULER_MAX_GHZ = 1000;

/** Fraction 0..1 along a log axis between fMin and fMax. Values outside clamp to the ends. */
export function logPosition(fGHz: number, fMin = RULER_MIN_GHZ, fMax = RULER_MAX_GHZ): number {
  if (!(fGHz > 0) || !(fMin > 0) || !(fMax > fMin)) {
    throw new Error(`logPosition needs 0 < fMin < fMax and f > 0 (got f=${fGHz}, fMin=${fMin}, fMax=${fMax})`);
  }
  const t = Math.log10(fGHz / fMin) / Math.log10(fMax / fMin);
  return Math.min(1, Math.max(0, t));
}

/** CSS percentage with fixed precision, so server and client render identical strings. */
export function pct(fraction: number): string {
  return `${(fraction * 100).toFixed(3)}%`;
}

/** Geometric centre of a band: the natural marker position on a log axis. */
export function bandCenter([lo, hi]: [number, number]): number {
  return Math.sqrt(lo * hi);
}

export interface Tick {
  fGHz: number;
  position: number;
  major: boolean;
  label?: string;
}

/** Decade ticks (1, 10, 100 ...) labelled, with unlabelled 2..9 minor ticks between them. */
export function decadeTicks(fMin = RULER_MIN_GHZ, fMax = RULER_MAX_GHZ): Tick[] {
  const ticks: Tick[] = [];
  const startExp = Math.floor(Math.log10(fMin));
  const endExp = Math.ceil(Math.log10(fMax));
  for (let e = startExp; e <= endExp; e++) {
    const decade = 10 ** e;
    for (let k = 1; k < 10; k++) {
      const f = k * decade;
      if (f < fMin * (1 - 1e-9) || f > fMax * (1 + 1e-9)) continue;
      const major = k === 1;
      ticks.push({ fGHz: f, position: logPosition(f, fMin, fMax), major, label: major ? formatFrequency(f) : undefined });
    }
  }
  return ticks;
}

/** Human frequency label from GHz: 100 MHz, 1 GHz, 920 GHz, 1 THz. */
export function formatFrequency(fGHz: number): string {
  const trim = (v: number) => String(Number(v.toPrecision(3)));
  if (fGHz >= 1000) return `${trim(fGHz / 1000)} THz`;
  if (fGHz < 1) return `${trim(fGHz * 1000)} MHz`;
  return `${trim(fGHz)} GHz`;
}

/** IEEE radar letter bands shown under the ruler (GHz). */
export const IEEE_BANDS: { name: string; range: [number, number] }[] = [
  { name: 'L', range: [1, 2] },
  { name: 'S', range: [2, 4] },
  { name: 'C', range: [4, 8] },
  { name: 'X', range: [8, 12] },
  { name: 'Ku', range: [12, 18] },
  { name: 'K', range: [18, 27] },
  { name: 'Ka', range: [27, 40] },
  { name: 'V', range: [40, 75] },
  { name: 'W', range: [75, 110] },
  { name: 'D', range: [110, 170] },
  { name: 'THz', range: [300, 1000] },
];

/**
 * Assign each band a lane so overlapping bands stack instead of colliding.
 * Greedy first-fit in ascending order of start position; gap is in axis fraction.
 */
export function assignLanes(spans: { start: number; end: number }[], gap = 0.004): number[] {
  const laneEnds: number[] = [];
  const lanes = new Array<number>(spans.length);
  const order = spans.map((s, i) => ({ ...s, i })).sort((a, b) => a.start - b.start);
  for (const span of order) {
    let lane = laneEnds.findIndex((end) => span.start > end + gap);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(span.end);
    } else {
      laneEnds[lane] = span.end;
    }
    lanes[span.i] = lane;
  }
  return lanes;
}

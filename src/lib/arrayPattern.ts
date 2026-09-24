// Planar phased-array pattern math for the Phased Array Beam Lab.
//
// Elements sit on a rectangular grid in the xy-plane, spacing in wavelengths.
// Weights are separable (w_mn = wx_m * wy_n), so the array factor factors into
// two line arrays and costs O(Nx + Ny) per direction. The element pattern is
// either isotropic (full sphere) or cos^q(theta) over a ground plane (upper
// hemisphere only). Everything is narrowband and ignores mutual coupling.

export type Taper = 'uniform' | 'cosine' | 'hamming';

export interface ArrayConfig {
  nx: number;
  ny: number;
  /** Element spacing in wavelengths, both axes. */
  spacing: number;
  /** Steering direction, degrees. theta from broadside (z), phi from x. */
  theta0Deg: number;
  phi0Deg: number;
  taper: Taper;
  /** 0 = isotropic element; q > 0 = cos^q(theta) element over a ground plane. */
  elementQ: number;
}

const DEG = Math.PI / 180;

export function validateConfig(cfg: ArrayConfig): void {
  const ints = [cfg.nx, cfg.ny];
  if (ints.some((n) => !Number.isInteger(n) || n < 1 || n > 64)) {
    throw new Error(`Element counts must be integers from 1 to 64 (got ${cfg.nx} x ${cfg.ny})`);
  }
  if (!(cfg.spacing > 0 && cfg.spacing <= 4)) throw new Error(`Spacing must be in (0, 4] wavelengths (got ${cfg.spacing})`);
  if (!(cfg.theta0Deg >= 0 && cfg.theta0Deg <= 90)) throw new Error(`Steer theta must be within 0..90 degrees (got ${cfg.theta0Deg})`);
  if (!(cfg.elementQ >= 0)) throw new Error(`Element exponent q must be >= 0 (got ${cfg.elementQ})`);
}

/** Amplitude taper for n elements, symmetric, peak 1. */
export function taperWeights(n: number, taper: Taper): number[] {
  if (n === 1 || taper === 'uniform') return new Array(n).fill(1);
  return Array.from({ length: n }, (_, i) => {
    const x = (i - (n - 1) / 2) / (n / 2); // -1..1 across the aperture
    if (taper === 'cosine') return Math.cos((Math.PI / 2) * x);
    // Hamming: 0.54 + 0.46 cos(pi x) on the aperture
    return 0.54 + 0.46 * Math.cos(Math.PI * x);
  });
}

/** Direction cosines for a spherical direction. */
function uv(theta: number, phi: number): [number, number] {
  const s = Math.sin(theta);
  return [s * Math.cos(phi), s * Math.sin(phi)];
}

/** |AF| of one weighted line array at relative direction cosine du (u - u0), normalized to 1 on the scan. */
function lineFactor(weights: number[], spacing: number, du: number): number {
  const k = 2 * Math.PI * spacing * du;
  const centre = (weights.length - 1) / 2;
  let re = 0;
  let im = 0;
  let sum = 0;
  for (let m = 0; m < weights.length; m++) {
    const a = k * (m - centre);
    re += weights[m] * Math.cos(a);
    im += weights[m] * Math.sin(a);
    sum += weights[m];
  }
  return Math.hypot(re, im) / sum;
}

export function elementPattern(q: number, theta: number): number {
  if (q === 0) return 1;
  const c = Math.cos(theta);
  return c > 0 ? c ** q : 0;
}

/** Precomputed evaluator for one configuration: field magnitude (not power), 0..1 at the scan peak. */
export function makeField(cfg: ArrayConfig) {
  validateConfig(cfg);
  const wx = taperWeights(cfg.nx, cfg.taper);
  const wy = taperWeights(cfg.ny, cfg.taper);
  const [u0, v0] = uv(cfg.theta0Deg * DEG, cfg.phi0Deg * DEG);
  return (theta: number, phi: number) => {
    const [u, v] = uv(theta, phi);
    return lineFactor(wx, cfg.spacing, u - u0) * lineFactor(wy, cfg.spacing, v - v0) * elementPattern(cfg.elementQ, theta);
  };
}

export interface PatternGrid {
  nTheta: number;
  nPhi: number;
  /** theta samples, radians, 0..thetaMax inclusive */
  theta: Float64Array;
  /** phi samples, radians, 0..2pi inclusive (closed seam) */
  phi: Float64Array;
  /** Normalized power (peak 1), row-major [iTheta * nPhi + iPhi]. */
  power: Float64Array;
}

/** Sample the normalized power pattern on a theta-phi grid (upper hemisphere when the element needs a ground plane). */
export function samplePattern(cfg: ArrayConfig, nTheta = 91, nPhi = 181): PatternGrid {
  const field = makeField(cfg);
  const thetaMax = cfg.elementQ > 0 ? Math.PI / 2 : Math.PI;
  const theta = Float64Array.from({ length: nTheta }, (_, i) => (thetaMax * i) / (nTheta - 1));
  const phi = Float64Array.from({ length: nPhi }, (_, j) => (2 * Math.PI * j) / (nPhi - 1));
  const power = new Float64Array(nTheta * nPhi);
  let peak = 0;
  for (let i = 0; i < nTheta; i++) {
    for (let j = 0; j < nPhi; j++) {
      const f = field(theta[i], phi[j]);
      const p = f * f;
      power[i * nPhi + j] = p;
      if (p > peak) peak = p;
    }
  }
  if (peak > 0) for (let n = 0; n < power.length; n++) power[n] /= peak;
  return { nTheta, nPhi, theta, phi, power };
}

/** Peak directivity in dBi by midpoint integration over the full sphere. */
export function directivityDbi(cfg: ArrayConfig, nTheta = 360, nPhi = 720): number {
  const field = makeField(cfg);
  const dT = Math.PI / nTheta;
  const dP = (2 * Math.PI) / nPhi;
  let integral = 0;
  let peak = 0;
  for (let i = 0; i < nTheta; i++) {
    const t = (i + 0.5) * dT;
    const st = Math.sin(t);
    for (let j = 0; j < nPhi; j++) {
      const f = field(t, (j + 0.5) * dP);
      const p = f * f;
      integral += p * st;
      if (p > peak) peak = p;
    }
  }
  integral *= dT * dP;
  // The sampled peak can miss the true maximum by a hair; the analytic scan value is 1 x element(theta0).
  const scanPeak = field(cfg.theta0Deg * DEG, cfg.phi0Deg * DEG) ** 2;
  return 10 * Math.log10((4 * Math.PI * Math.max(peak, scanPeak)) / integral);
}

export interface Cut {
  /** Signed angle in degrees, -90..90; positive toward phi, negative toward phi + 180. */
  angleDeg: Float64Array;
  /** Normalized power in dB, floored. */
  db: Float64Array;
}

/** Principal cut through broadside in the plane of phi (both half-planes), normalized to its own peak. */
export function patternCut(cfg: ArrayConfig, phiDeg: number, samples = 721, floorDb = -60): Cut {
  const field = makeField(cfg);
  const angleDeg = new Float64Array(samples);
  const raw = new Float64Array(samples);
  let peak = 0;
  for (let i = 0; i < samples; i++) {
    const a = -90 + (180 * i) / (samples - 1);
    angleDeg[i] = a;
    const phi = (a >= 0 ? phiDeg : phiDeg + 180) * DEG;
    const f = field(Math.abs(a) * DEG, phi);
    raw[i] = f * f;
    if (raw[i] > peak) peak = raw[i];
  }
  const db = raw.map((p) => Math.max(floorDb, 10 * Math.log10(Math.max(p / (peak || 1), 1e-30))));
  return { angleDeg, db };
}

export interface CutMetrics {
  peakDeg: number;
  /** Half-power beamwidth in degrees, null when the -3 dB points leave the cut. */
  hpbwDeg: number | null;
  /** Highest sidelobe outside the main lobe, dB; null for a single-lobe cut. */
  sidelobeDb: number | null;
}

/** Peak, HPBW and highest sidelobe of a cut. The main lobe ends at the first nulls (local minima) either side. */
export function cutMetrics(cut: Cut): CutMetrics {
  const { angleDeg, db } = cut;
  let ip = 0;
  for (let i = 1; i < db.length; i++) if (db[i] > db[ip]) ip = i;

  let lo = ip;
  while (lo > 0 && db[lo - 1] >= -3.0103) lo--;
  let hi = ip;
  while (hi < db.length - 1 && db[hi + 1] >= -3.0103) hi++;
  const hpbw = lo > 0 && hi < db.length - 1 ? interpHalfPower(angleDeg, db, hi, hi + 1) - interpHalfPower(angleDeg, db, lo - 1, lo) : null;

  let nl = ip;
  while (nl > 0 && db[nl - 1] <= db[nl]) nl--;
  let nr = ip;
  while (nr < db.length - 1 && db[nr + 1] <= db[nr]) nr++;
  let sidelobe = -Infinity;
  for (let i = 0; i < db.length; i++) {
    if (i >= nl && i <= nr) continue;
    const isPeak = (i === 0 || db[i] >= db[i - 1]) && (i === db.length - 1 || db[i] >= db[i + 1]);
    if (isPeak && db[i] > sidelobe) sidelobe = db[i];
  }
  return { peakDeg: angleDeg[ip], hpbwDeg: hpbw, sidelobeDb: Number.isFinite(sidelobe) ? sidelobe : null };
}

function interpHalfPower(angle: Float64Array, db: Float64Array, i: number, j: number): number {
  const target = -3.0103;
  const t = (target - db[i]) / (db[j] - db[i] || 1e-12);
  return angle[i] + t * (angle[j] - angle[i]);
}

/**
 * Largest element spacing, in wavelengths, that keeps every grating lobe out of visible
 * space for this steer. The lattice puts a lobe at (u0 + p/d, v0 + q/d) for integers p, q;
 * a lobe is visible once it reaches the unit circle u^2 + v^2 = 1, and the eight nearest
 * lobes are always the first to arrive. An axis with one element has no lobes along it.
 * For a line array steered in its own plane this reduces to the textbook 1 / (1 + |sin theta0|).
 */
export function maxGratingFreeSpacing(cfg: Pick<ArrayConfig, 'nx' | 'ny' | 'theta0Deg' | 'phi0Deg'>): number {
  const [u0, v0] = uv(cfg.theta0Deg * DEG, cfg.phi0Deg * DEG);
  const ps = cfg.nx > 1 ? [-1, 0, 1] : [0];
  const qs = cfg.ny > 1 ? [-1, 0, 1] : [0];
  let reciprocal = 0; // largest 1/d at which one of the lobes touches the unit circle
  for (const p of ps) {
    for (const q of qs) {
      if (p === 0 && q === 0) continue;
      // Larger root s of |(u0, v0) + s (p, q)| = 1.
      const a = p * p + q * q;
      const b = p * u0 + q * v0;
      const c = u0 * u0 + v0 * v0 - 1;
      reciprocal = Math.max(reciprocal, (-b + Math.sqrt(b * b - a * c)) / a);
    }
  }
  return reciprocal > 0 ? 1 / reciprocal : Number.POSITIVE_INFINITY;
}

/** True when at least one grating lobe sits in visible space (on the unit circle counts). */
export function hasGratingLobe(cfg: ArrayConfig): boolean {
  return cfg.spacing >= maxGratingFreeSpacing(cfg);
}

/** Direction-cosine offset of the first null of a weighted line array; Infinity for one element. */
function firstNullOffset(weights: number[], spacing: number): number {
  if (weights.length === 1) return Number.POSITIVE_INFINITY;
  const half = 1 / (2 * spacing); // |AF| repeats every 1/spacing
  const step = 1 / (spacing * weights.length * 400);
  let prev = lineFactor(weights, spacing, 0);
  let cur = lineFactor(weights, spacing, step);
  for (let du = 2 * step; du <= half; du += step) {
    const next = lineFactor(weights, spacing, du);
    if (cur <= prev && cur < next) return du - step;
    prev = cur;
    cur = next;
  }
  return half;
}

/** Hill-climb a power function from (u, v), halving the step when no neighbour is higher. */
function polish(power: (u: number, v: number) => number, start: [number, number], step: number, allowed: (u: number, v: number) => boolean) {
  let [u, v] = start;
  let best = power(u, v);
  let h = step;
  for (let iter = 0; iter < 400 && h > 1e-7; iter++) {
    let moved = false;
    for (const [du, dv] of [[h, 0], [-h, 0], [0, h], [0, -h], [h, h], [h, -h], [-h, h], [-h, -h]]) {
      if (!allowed(u + du, v + dv)) continue;
      const p = power(u + du, v + dv);
      if (p > best) {
        best = p;
        u += du;
        v += dv;
        moved = true;
        break;
      }
    }
    if (!moved) h /= 2;
  }
  return best;
}

/**
 * Highest sidelobe of the whole pattern relative to the beam peak, in dB. It is searched on
 * a (u, v) grid over visible space and then polished locally, so it is not tied to any one
 * cut. The main beam and every grating lobe are excluded as rectangles out to the first nulls
 * of the two line factors; grating lobes are reported by hasGratingLobe instead.
 *
 * Returns null when nothing but the main beam and grating lobes is visible (a 1 x 1 array).
 */
export function peakSidelobeDb(cfg: ArrayConfig, samples = 241): number | null {
  validateConfig(cfg);
  const wx = taperWeights(cfg.nx, cfg.taper);
  const wy = taperWeights(cfg.ny, cfg.taper);
  const [u0, v0] = uv(cfg.theta0Deg * DEG, cfg.phi0Deg * DEG);
  const nullU = firstNullOffset(wx, cfg.spacing);
  const nullV = firstNullOffset(wy, cfg.spacing);
  const period = 1 / cfg.spacing;
  const reach = Math.ceil(2 * cfg.spacing) + 1; // lattice lobes that can touch the unit disk
  const outsideLobes = (u: number, v: number) => {
    for (let p = -reach; p <= reach; p++) {
      if (Math.abs(u - (u0 + p * period)) >= nullU) continue;
      for (let q = -reach; q <= reach; q++) {
        if (Math.abs(v - (v0 + q * period)) < nullV) return false;
      }
    }
    return true;
  };
  const element = (u: number, v: number) => (cfg.elementQ === 0 ? 1 : Math.sqrt(Math.max(0, 1 - u * u - v * v)) ** cfg.elementQ);
  const power = (u: number, v: number) => {
    if (u * u + v * v > 1) return 0;
    const f = lineFactor(wx, cfg.spacing, u - u0) * lineFactor(wy, cfg.spacing, v - v0) * element(u, v);
    return f * f;
  };

  // Line factors separate, so the grid costs O(samples * N) trig calls.
  const axis = Array.from({ length: samples }, (_, i) => -1 + (2 * i) / (samples - 1));
  const fx = axis.map((u) => lineFactor(wx, cfg.spacing, u - u0));
  const fy = axis.map((v) => lineFactor(wy, cfg.spacing, v - v0));
  let peak = 0;
  let peakAt: [number, number] = [u0, v0];
  let side = 0;
  let sideAt: [number, number] | null = null;
  for (let i = 0; i < samples; i++) {
    for (let j = 0; j < samples; j++) {
      const u = axis[i];
      const v = axis[j];
      if (u * u + v * v > 1) continue;
      const f = fx[i] * fy[j] * element(u, v);
      const p = f * f;
      if (p > peak) {
        peak = p;
        peakAt = [u, v];
      }
      if (p > side && outsideLobes(u, v)) {
        side = p;
        sideAt = [u, v];
      }
    }
  }
  if (!sideAt || side === 0) return null;
  const step = 2 / (samples - 1);
  const visible = (u: number, v: number) => u * u + v * v <= 1;
  peak = Math.max(polish(power, peakAt, step, visible), polish(power, [u0, v0], step, visible));
  side = polish(power, sideAt, step, (u, v) => visible(u, v) && outsideLobes(u, v));
  return 10 * Math.log10(side / peak);
}

/** Progressive phase per element in degrees (0..360), rows of ny, columns of nx. */
export function elementPhasesDeg(cfg: ArrayConfig): number[][] {
  const [u0, v0] = uv(cfg.theta0Deg * DEG, cfg.phi0Deg * DEG);
  return Array.from({ length: cfg.ny }, (_, n) =>
    Array.from({ length: cfg.nx }, (_, m) => {
      const p = -360 * cfg.spacing * (m * u0 + n * v0);
      return ((p % 360) + 360) % 360;
    }),
  );
}

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

/** Largest spacing (wavelengths) with no grating lobe in visible space when scanned to thetaDeg. */
export function maxGratingFreeSpacing(thetaDeg: number): number {
  return 1 / (1 + Math.abs(Math.sin(thetaDeg * DEG)));
}

export function hasGratingLobe(spacing: number, thetaDeg: number): boolean {
  return spacing >= maxGratingFreeSpacing(thetaDeg);
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

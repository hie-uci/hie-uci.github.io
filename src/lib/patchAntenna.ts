// Rectangular microstrip patch in its dominant TM010 mode, first-order models from
// Balanis, Antenna Theory, 4th ed., ch. 14:
//   dimensions        transmission-line model, eqs. 14-1, 14-2, 14-6, 14-7
//   edge resistance   slot conductance G1 (14-10), mutual conductance G12 (14-18a),
//                     Rin = 1 / (2 (G1 + G12)) (14-17)
//   pattern           two radiating slots, cavity model (14-43)
//   directivity       4 pi U_max / P_rad of that pattern over an infinite ground plane (14-56)
// Thin substrate, no surface waves, conductor or dielectric loss; feed and finite ground ignored.

const C_MM_GHZ = 299.792458; // c in mm·GHz
const ETA_TERM = 120 * Math.PI ** 2; // 120 pi^2, from G = I / (120 pi^2)

export interface PatchInput {
  er: number;
  heightMm: number;
  frequencyGHz: number;
}

export interface PatchDesign {
  widthMm: number;
  lengthMm: number;
  /** Fringing extension ΔL at each radiating edge, mm. */
  fringeExtensionMm: number;
  /** L + 2ΔL, the length the resonant fields see and the slot separation of the two-slot model, mm. */
  effectiveLengthMm: number;
  effectivePermittivity: number;
  /** Conductance of one radiating slot, S. */
  slotConductanceS: number;
  /** Mutual conductance between the two slots, S. */
  mutualConductanceS: number;
  /** Resonant input resistance at the radiating edge, ohms. */
  edgeResistanceOhm: number;
  /** Directivity of the two-slot pattern, dBi. */
  directivityDbi: number;
}

/** Composite Simpson rule with n (even) intervals. */
function simpson(f: (x: number) => number, a: number, b: number, n: number): number {
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  for (let i = 1; i < n; i++) sum += (i % 2 ? 4 : 2) * f(a + i * h);
  return (sum * h) / 3;
}

/** Bessel J0 from its integral representation, J0(x) = (1/pi) ∫0^pi cos(x sin t) dt. */
export function besselJ0(x: number): number {
  return simpson((t) => Math.cos(x * Math.sin(t)), 0, Math.PI, 96) / Math.PI;
}

const sinc = (x: number) => (Math.abs(x) < 1e-12 ? 1 : Math.sin(x) / x);

/** [sin((k0 W / 2) cos t) / cos t]^2, the slot factor of eqs. 14-10 and 14-18a. */
function slotFactorSquared(t: number, k0W: number): number {
  const c = Math.cos(t);
  const half = k0W / 2;
  if (Math.abs(c) < 1e-12) return half * half;
  const v = Math.sin(half * c) / c;
  return v * v;
}

/**
 * Two-slot far-field magnitude (Balanis eq. 14-43 with its array factor), scaled so a vanishingly
 * thin patch gives 1 at broadside. The height factor sinc((k0 h / 2) cos theta) stays within a
 * fraction of a percent of 1 for thin substrates.
 *
 * Args:
 *   uL: Direction cosine along the resonant length L.
 *   uW: Direction cosine along the width W; uL^2 + uW^2 <= 1 (upper hemisphere).
 *   k0: Free-space wavenumber, rad/mm.
 *   patch: Width, height and effective length in mm.
 */
export function twoSlotField(uL: number, uW: number, k0: number, patch: { widthMm: number; heightMm: number; effectiveLengthMm: number }): number {
  const normal = Math.sqrt(Math.max(0, 1 - uL * uL - uW * uW));
  const obliquity = Math.sqrt(Math.max(0, 1 - uW * uW)); // sin of the angle from the slot axis (along W)
  return Math.abs(
    obliquity
      * sinc((k0 * patch.heightMm * normal) / 2)
      * sinc((k0 * patch.widthMm * uW) / 2)
      * Math.cos((k0 * patch.effectiveLengthMm * uL) / 2),
  );
}

/**
 * First-order rectangular patch synthesis for a target resonance.
 *
 * Throws:
 *   RangeError: when an input is not a positive finite number or er < 1.
 */
export function designRectangularPatch({ er, heightMm, frequencyGHz }: PatchInput): PatchDesign {
  for (const [name, v] of [['Dielectric constant', er], ['Substrate height', heightMm], ['Frequency', frequencyGHz]] as const) {
    if (!(Number.isFinite(v) && v > 0)) throw new RangeError(`${name} must be a positive number, got ${v}.`);
  }
  if (er < 1) throw new RangeError(`Dielectric constant must be at least 1, got ${er}.`);

  const lambda0 = C_MM_GHZ / frequencyGHz;
  const k0 = (2 * Math.PI) / lambda0;
  const h = heightMm;
  const W = (lambda0 / 2) * Math.sqrt(2 / (er + 1)); // 14-6
  const eeff = (er + 1) / 2 + ((er - 1) / 2) / Math.sqrt(1 + (12 * h) / W); // 14-1
  const dL = (0.412 * h * (eeff + 0.3) * (W / h + 0.264)) / ((eeff - 0.258) * (W / h + 0.8)); // 14-2
  const L = lambda0 / (2 * Math.sqrt(eeff)) - 2 * dL; // 14-7
  const Le = L + 2 * dL;

  const k0W = k0 * W;
  const I1 = simpson((t) => slotFactorSquared(t, k0W) * Math.sin(t) ** 3, 0, Math.PI, 400);
  const G1 = I1 / ETA_TERM;
  const G12 = simpson((t) => slotFactorSquared(t, k0W) * besselJ0(k0 * L * Math.sin(t)) * Math.sin(t) ** 3, 0, Math.PI, 400) / ETA_TERM;

  // Directivity: integrate the same two-slot pattern the 3D view draws over the upper hemisphere.
  const patch = { widthMm: W, heightMm: h, effectiveLengthMm: Le };
  const radiated = simpson(
    (theta) => Math.sin(theta) * simpson((phi) => twoSlotField(Math.sin(theta) * Math.cos(phi), Math.sin(theta) * Math.sin(phi), k0, patch) ** 2, 0, 2 * Math.PI, 180),
    0,
    Math.PI / 2,
    120,
  );
  const broadside = twoSlotField(0, 0, k0, patch) ** 2; // the TM010 pattern peaks at broadside
  const directivity = (4 * Math.PI * broadside) / radiated;

  return {
    widthMm: W,
    lengthMm: L,
    fringeExtensionMm: dL,
    effectiveLengthMm: Le,
    effectivePermittivity: eeff,
    slotConductanceS: G1,
    mutualConductanceS: G12,
    edgeResistanceOhm: 1 / (2 * (G1 + G12)),
    directivityDbi: 10 * Math.log10(directivity),
  };
}

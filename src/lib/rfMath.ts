export interface MicrostripInput {
  er: number;
  heightMm: number;
  widthMm: number;
  thicknessMm?: number;
  frequencyGHz: number;
}

export interface MicrostripResult {
  staticZ0: number;
  staticEffectivePermittivity: number;
  z0: number;
  effectivePermittivity: number;
  normalizedWidth: number;
  normalizedFrequency: number;
  warnings: string[];
}

export interface StriplineInput {
  er: number;
  groundSpacingMm: number;
  widthMm: number;
  thicknessMm?: number;
}

export interface StriplineResult {
  z0: number;
  effectivePermittivity: number;
  normalizedWidth: number;
  normalizedThickness: number;
  warnings: string[];
}

function assertPositiveFinite(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive finite value.`);
  }
}

export function capacitiveReactanceOhms(frequencyGHz: number, capacitancePf: number): number {
  assertPositiveFinite(frequencyGHz, 'Frequency');
  assertPositiveFinite(capacitancePf, 'Capacitance');
  return 1 / (2 * Math.PI * frequencyGHz * 1e9 * capacitancePf * 1e-12);
}

export function parallelCapacitanceFromSusceptance(susceptanceSiemens: number, frequencyHz: number): number {
  if (!Number.isFinite(susceptanceSiemens)) {
    throw new Error('Susceptance must be finite.');
  }
  assertPositiveFinite(frequencyHz, 'Frequency');
  return susceptanceSiemens / (2 * Math.PI * frequencyHz);
}

function hammerstadA(u: number): number {
  return 1
    + Math.log((u ** 4 + (u / 52) ** 2) / (u ** 4 + 0.432)) / 49
    + Math.log(1 + (u / 18.1) ** 3) / 18.7;
}

function hammerstadB(er: number): number {
  return 0.564 * ((er - 0.9) / (er + 3)) ** 0.053;
}

function hammerstadEffectivePermittivity(u: number, er: number): number {
  return (er + 1) / 2
    + (er - 1) / 2 * (1 + 10 / u) ** (-hammerstadA(u) * hammerstadB(er));
}

function microstripAirImpedance(u: number): number {
  const freeSpaceImpedance = 376.730313668;
  const fu = 6 + (2 * Math.PI - 6) * Math.exp(-((30.666 / u) ** 0.7528));
  return freeSpaceImpedance / (2 * Math.PI)
    * Math.log(fu / u + Math.sqrt(1 + (2 / u) ** 2));
}

function thicknessCorrectedWidths(u: number, thicknessRatio: number, er: number): { uAir: number; uDielectric: number } {
  if (thicknessRatio === 0) {
    return { uAir: u, uDielectric: u };
  }

  const coth = 1 / Math.tanh(Math.sqrt(6.517 * u));
  const deltaUAir = thicknessRatio / Math.PI
    * Math.log(1 + 4 * Math.E / (thicknessRatio * coth * coth));
  const sech = 1 / Math.cosh(Math.sqrt(er - 1));
  const deltaUDielectric = 0.5 * deltaUAir * (1 + sech);

  return { uAir: u + deltaUAir, uDielectric: u + deltaUDielectric };
}

function kirschningJansenEffectivePermittivity(
  u: number,
  normalizedFrequency: number,
  er: number,
  staticEffectivePermittivity: number,
): number {
  if (normalizedFrequency === 0) return staticEffectivePermittivity;

  const p1 = 0.27488
    + (0.6315 + 0.525 / (1 + 0.0157 * normalizedFrequency) ** 20) * u
    - 0.065683 * Math.exp(-8.7513 * u);
  const p2 = 0.33622 * (1 - Math.exp(-0.03442 * er));
  const p3 = 0.0363 * Math.exp(-4.6 * u)
    * (1 - Math.exp(-((normalizedFrequency / 38.7) ** 4.97)));
  const p4 = 1 + 2.751 * (1 - Math.exp(-((er / 15.916) ** 8)));
  const pf = p1 * p2 * ((0.1844 + p3 * p4) * normalizedFrequency) ** 1.5763;

  return er - (er - staticEffectivePermittivity) / (1 + pf);
}

function kirschningJansenImpedance(
  u: number,
  normalizedFrequency: number,
  er: number,
  staticEffectivePermittivity: number,
  effectivePermittivity: number,
  staticZ0: number,
): number {
  if (normalizedFrequency === 0) return staticZ0;

  const r1 = Math.min(0.03891 * er ** 1.4, 20);
  const r2 = Math.min(0.267 * u ** 7, 20);
  const r3 = 4.766 * Math.exp(-3.228 * u ** 0.641);
  const r4 = 0.016 + (0.0514 * er) ** 4.524;
  const r5 = (normalizedFrequency / 28.843) ** 12;
  const r6 = Math.min(22.2 * u ** 1.92, 20);
  const r7 = 1.206 - 0.3144 * Math.exp(-r1) * (1 - Math.exp(-r2));
  const r8 = 1 + 1.275 * (
    1 - Math.exp(-0.004625 * r3 * er ** 1.674 * (normalizedFrequency / 18.365) ** 2.745)
  );
  const erMinusOnePower = (er - 1) ** 6;
  const r9 = 5.086 * r4 * r5 / (0.3838 + 0.386 * r4)
    * Math.exp(-r6) / (1 + 1.2992 * r5)
    * erMinusOnePower / (1 + 10 * erMinusOnePower);
  const r10 = 0.00044 * er ** 2.136 + 0.0184;
  const normalized19 = (normalizedFrequency / 19.47) ** 6;
  const r11 = normalized19 / (1 + 0.0962 * normalized19);
  const r12 = 1 / (1 + 0.00245 * u ** 2);
  const r13 = 0.9408 * effectivePermittivity ** r8 - 0.9603;
  const r14 = (0.9408 - r9) * staticEffectivePermittivity ** r8 - 0.9603;
  const r15 = 0.707 * r10 * (normalizedFrequency / 12.3) ** 1.097;
  const r16 = 1 + 0.0503 * er ** 2 * r11 * (1 - Math.exp(-((u / 15) ** 6)));
  const r17 = r7 * (
    1 - 1.1241 * r12 / r16 * Math.exp(-0.026 * normalizedFrequency ** 1.15656 - r15)
  );

  return staticZ0 * (r13 / r14) ** r17;
}

export function calculateMicrostrip(input: MicrostripInput): MicrostripResult {
  const { er, heightMm, widthMm, frequencyGHz } = input;
  const thicknessMm = input.thicknessMm ?? 0;
  assertPositiveFinite(er, 'Relative permittivity');
  assertPositiveFinite(heightMm, 'Substrate height');
  assertPositiveFinite(widthMm, 'Trace width');
  assertPositiveFinite(frequencyGHz, 'Frequency');
  if (er < 1) throw new Error('Relative permittivity must be at least 1.');
  if (!Number.isFinite(thicknessMm) || thicknessMm < 0) {
    throw new Error('Trace thickness must be finite and non-negative.');
  }
  if (thicknessMm >= heightMm || thicknessMm >= widthMm / 2) {
    throw new Error('Trace thickness must be smaller than the substrate height and half the trace width.');
  }

  const u = widthMm / heightMm;
  const thicknessRatio = thicknessMm / heightMm;
  const corrected = thicknessCorrectedWidths(u, thicknessRatio, er);
  const dielectricStatic = hammerstadEffectivePermittivity(corrected.uDielectric, er);
  const staticEffectivePermittivity = dielectricStatic
    * (microstripAirImpedance(corrected.uAir) / microstripAirImpedance(corrected.uDielectric)) ** 2;
  const staticZ0 = microstripAirImpedance(corrected.uDielectric) / Math.sqrt(dielectricStatic);
  const normalizedFrequency = frequencyGHz * heightMm;
  const effectivePermittivity = kirschningJansenEffectivePermittivity(
    corrected.uDielectric,
    normalizedFrequency,
    er,
    staticEffectivePermittivity,
  );
  const z0 = kirschningJansenImpedance(
    corrected.uDielectric,
    normalizedFrequency,
    er,
    staticEffectivePermittivity,
    effectivePermittivity,
    staticZ0,
  );

  const wavelengthMm = 299.792458 / frequencyGHz;
  const heightOverWavelength = heightMm / wavelengthMm;
  const warnings: string[] = [];
  if (u < 0.1 || u > 10 || er > 18 || heightOverWavelength > 0.1) {
    warnings.push('Characteristic-impedance dispersion is outside the published Kirschning–Jansen range (0.1≤W/h≤10, 1≤εr≤18, h/λ0≤0.1).');
  }
  if (thicknessRatio > 0.1) {
    warnings.push('The closed-form finite-thickness correction is not recommended for t/h > 0.1.');
  }

  return {
    staticZ0,
    staticEffectivePermittivity,
    z0,
    effectivePermittivity,
    normalizedWidth: u,
    normalizedFrequency,
    warnings,
  };
}

export function calculateSymmetricStripline(input: StriplineInput): StriplineResult {
  const { er, groundSpacingMm, widthMm } = input;
  const thicknessMm = input.thicknessMm ?? 0;
  assertPositiveFinite(er, 'Relative permittivity');
  assertPositiveFinite(groundSpacingMm, 'Ground-plane spacing');
  assertPositiveFinite(widthMm, 'Trace width');
  if (er < 1) throw new Error('Relative permittivity must be at least 1.');
  if (!Number.isFinite(thicknessMm) || thicknessMm < 0 || thicknessMm >= groundSpacingMm) {
    throw new Error('Trace thickness must be finite, non-negative, and smaller than the ground-plane spacing.');
  }

  const normalizedWidth = widthMm / groundSpacingMm;
  const normalizedThickness = thicknessMm / groundSpacingMm;
  const effectiveWidth = normalizedWidth < 0.35
    ? normalizedWidth - (0.35 - normalizedWidth) ** 2 / (1 + 12 * normalizedThickness)
    : normalizedWidth;
  const fringing = normalizedThickness === 0
    ? 2 * Math.log(2) / Math.PI
    : 2 / Math.PI * Math.log(1 / (1 - normalizedThickness) + 1)
      - normalizedThickness / Math.PI * Math.log(1 / (1 - normalizedThickness) ** 2 - 1);
  const denominator = effectiveWidth + fringing;
  if (denominator <= 0) {
    throw new Error('Geometry is outside the valid range of the symmetric-stripline model.');
  }

  const z0 = 30 * Math.PI / Math.sqrt(er) * (1 - normalizedThickness) / denominator;
  const warnings: string[] = [];
  if (normalizedWidth / (1 - normalizedThickness) <= 0.05 || normalizedThickness >= 0.025) {
    warnings.push('Geometry is outside the published better-than-1% range: W/(b−t)>0.05 and t/b<0.025.');
  }

  return {
    z0,
    effectivePermittivity: er,
    normalizedWidth,
    normalizedThickness,
    warnings,
  };
}

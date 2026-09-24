// Closed-form RF calculators behind the toolbox's smaller tools. Each function names its
// model; the tests hold reference values from independent checks (see rfCalculators.test.ts).

const C0 = 299_792_458; // m/s
const MU0 = 4e-7 * Math.PI; // H/m, the pre-2019 exact value; differs from CODATA by 1e-10
const K_BOLTZMANN = 1.380649e-23; // J/K, exact since 2019

function assertFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be a finite number, got ${value}.`);
}

function assertPositive(value: number, name: string): void {
  if (!(Number.isFinite(value) && value > 0)) throw new RangeError(`${name} must be a positive number, got ${value}.`);
}

/* ─────────────────────────────── mismatch ─────────────────────────────── */

export type VswrInput = { kind: 'vswr'; value: number } | { kind: 'returnLoss'; value: number } | { kind: 'gamma'; value: number };

export interface VswrMetrics {
  vswr: number;
  returnLossDb: number;
  gamma: number;
  /** Single-interface mismatch loss -10 log10(1 - |Γ|^2), dB. */
  mismatchLossDb: number;
  reflectedPercent: number;
  transmittedPercent: number;
}

/** Lossless single-interface identities from any one of VSWR, return loss or |Γ|. */
export function vswrMetrics(input: VswrInput): VswrMetrics {
  assertFinite(input.value, 'Input');
  let gamma: number;
  if (input.kind === 'vswr') {
    if (input.value < 1) throw new RangeError(`VSWR must be at least 1, got ${input.value}.`);
    gamma = (input.value - 1) / (input.value + 1);
  } else if (input.kind === 'returnLoss') {
    if (input.value < 0) throw new RangeError(`Return loss must be non-negative, got ${input.value}.`);
    gamma = 10 ** (-input.value / 20);
  } else {
    if (input.value < 0 || input.value > 1) throw new RangeError(`|Γ| must be within 0..1, got ${input.value}.`);
    gamma = input.value;
  }
  const reflected = gamma * gamma;
  return {
    vswr: gamma === 1 ? Number.POSITIVE_INFINITY : (1 + gamma) / (1 - gamma),
    returnLossDb: gamma === 0 ? Number.POSITIVE_INFINITY : -20 * Math.log10(gamma),
    gamma,
    mismatchLossDb: -10 * Math.log10(1 - reflected),
    reflectedPercent: 100 * reflected,
    transmittedPercent: 100 * (1 - reflected),
  };
}

/* ─────────────────────────────── power and noise ─────────────────────────────── */

export type PowerUnit = 'dBm' | 'mW' | 'W';

/** The same power in dBm, dBW, mW and W. */
export function powerLevels(value: number, unit: PowerUnit): { dBm: number; dBW: number; mW: number; W: number } {
  assertFinite(value, 'Power');
  if (unit !== 'dBm') assertPositive(value, 'Power');
  const dBm = unit === 'dBm' ? value : 10 * Math.log10(unit === 'mW' ? value : value * 1000);
  const mW = 10 ** (dBm / 10);
  return { dBm, dBW: dBm - 30, mW, W: mW / 1000 };
}

/** Johnson–Nyquist available noise of a matched resistor: kTB and the density kT. */
export function thermalNoise(temperatureK: number, bandwidthHz: number): { powerDbm: number; densityDbmPerHz: number } {
  assertPositive(temperatureK, 'Temperature');
  assertPositive(bandwidthHz, 'Bandwidth');
  const densityDbmPerHz = 10 * Math.log10(K_BOLTZMANN * temperatureK * 1000);
  return { densityDbmPerHz, powerDbm: densityDbmPerHz + 10 * Math.log10(bandwidthHz) };
}

/**
 * Receiver noise floor, sensitivity and two-tone SFDR with the 290 K convention (kT0 = -174 dBm/Hz).
 * SFDR = (2/3)(IIP3 - N) is the range at which third-order products just reach the noise floor N
 * integrated over the receiver bandwidth.
 */
export function receiverBudget(input: { bandwidthHz: number; noiseFigureDb: number; iip3Dbm: number; requiredSnrDb: number; implementationLossDb: number }) {
  assertPositive(input.bandwidthHz, 'Bandwidth');
  for (const [k, v] of Object.entries(input)) assertFinite(v, k);
  const noiseFloorDbm = -174 + 10 * Math.log10(input.bandwidthHz) + input.noiseFigureDb;
  return {
    noiseFloorDbm,
    sensitivityDbm: noiseFloorDbm + input.requiredSnrDb + input.implementationLossDb,
    sfdrDb: (2 / 3) * (input.iip3Dbm - noiseFloorDbm),
  };
}

/**
 * For a memoryless cubic y = a1 x + a3 x^3, IIP3 sits -10 log10(1 - 10^(-1/20)) = 9.64 dB above the
 * input 1 dB compression point. At the output the gap is 1 dB wider, because OP1dB lies 1 dB under
 * the linear extrapolation that defines OIP3.
 */
export const IP3_ABOVE_IP1DB_DB = -10 * Math.log10(1 - 10 ** (-1 / 20));
export const IP3_ABOVE_OP1DB_DB = IP3_ABOVE_IP1DB_DB + 1;

/** Spot phase-jitter density sqrt(S_phi) = sqrt(2 L(f)) turned into time, s/√Hz (IEEE Std 1139). */
export function spotJitterDensity(phaseNoiseDbcPerHz: number, carrierHz: number): number {
  assertFinite(phaseNoiseDbcPerHz, 'Phase noise');
  assertPositive(carrierHz, 'Carrier frequency');
  return Math.sqrt(2 * 10 ** (phaseNoiseDbcPerHz / 10)) / (2 * Math.PI * carrierHz);
}

/* ─────────────────────────────── conductors and vias ─────────────────────────────── */

/**
 * Skin depth and surface resistance of a good conductor: delta = sqrt(2 rho / (omega mu)),
 * Rs = rho / delta. Against the exact propagation constant sqrt(j omega mu (sigma + j omega eps0))
 * the error is below 1e-7 for metals up to 100 GHz.
 */
export function skinDepth(resistivityOhmM: number, frequencyHz: number, muR = 1): { depthM: number; surfaceResistanceOhm: number } {
  assertPositive(resistivityOhmM, 'Resistivity');
  assertPositive(frequencyHz, 'Frequency');
  assertPositive(muR, 'Relative permeability');
  const depthM = Math.sqrt((2 * resistivityOhmM) / (2 * Math.PI * frequencyHz * MU0 * muR));
  return { depthM, surfaceResistanceOhm: resistivityOhmM / depthM };
}

export interface ViaInput {
  drillMm: number;
  padMm: number;
  antipadMm: number;
  /** Board (via) height, mm. */
  heightMm: number;
  er: number;
}

export interface ViaParasitics {
  /** Via-hole-to-ground inductance, Goldfarb & Pucel (IEEE MGWL, 1991), H. */
  inductanceH: number;
  /** Pad-to-plane capacitance, Johnson & Graham empirical rule, F. */
  capacitanceF: number;
  /** sqrt(L/C): an impedance scale for the pair, not a line impedance, ohms. */
  impedanceScaleOhm: number;
  /** 1 / (2 pi sqrt(LC)): where the two lumped estimates resonate, Hz. */
  lcCornerHz: number;
  /** h / lambda0 limit of the inductance model's validity, 0.03 (Goldfarb & Pucel). */
  heightOverWavelengthLimit: number;
}

/**
 * Via-hole inductance (Goldfarb & Pucel): L = (mu0 / 2 pi) [h ln((h + sqrt(r^2 + h^2)) / r)
 * + 1.5 (r - sqrt(r^2 + h^2))], valid for h < 0.03 lambda0, and the empirical pad capacitance
 * C = 1.41 er T D1 / (D2 - D1) pF with inch dimensions (Johnson & Graham, High-Speed Digital
 * Design, 1993). Both are lumped estimates; a via is distributed, so check it with 3D EM.
 */
export function viaParasitics({ drillMm, padMm, antipadMm, heightMm, er }: ViaInput): ViaParasitics {
  for (const [name, v] of [['Drill diameter', drillMm], ['Pad diameter', padMm], ['Antipad diameter', antipadMm], ['Via height', heightMm], ['Dielectric constant', er]] as const) {
    assertPositive(v, name);
  }
  if (!(padMm > drillMm && antipadMm > padMm)) throw new RangeError('The drill must be smaller than the pad, and the pad smaller than the antipad.');
  if (er < 1) throw new RangeError(`Dielectric constant must be at least 1, got ${er}.`);
  const h = heightMm * 1e-3;
  const r = (drillMm / 2) * 1e-3;
  const root = Math.hypot(r, h);
  const inductanceH = (MU0 / (2 * Math.PI)) * (h * Math.log((h + root) / r) + 1.5 * (r - root));
  const inch = 25.4;
  const capacitanceF = ((1.41 * er * (heightMm / inch) * (padMm / inch)) / ((antipadMm - padMm) / inch)) * 1e-12;
  return {
    inductanceH,
    capacitanceF,
    impedanceScaleOhm: Math.sqrt(inductanceH / capacitanceF),
    lcCornerHz: 1 / (2 * Math.PI * Math.sqrt(inductanceH * capacitanceF)),
    heightOverWavelengthLimit: 0.03,
  };
}

/* ─────────────────────────────── propagation and radar ─────────────────────────────── */

/** Free-space path loss between isotropic antennas, 20 log10(4 pi d f / c), dB. */
export function freeSpacePathLossDb(distanceM: number, frequencyHz: number): number {
  assertPositive(distanceM, 'Distance');
  assertPositive(frequencyHz, 'Frequency');
  return 20 * Math.log10((4 * Math.PI * distanceM * frequencyHz) / C0);
}

/**
 * Monostatic radar range at which the echo falls to the minimum detectable signal:
 * R^4 = Pt Gt Gr lambda^2 sigma / ((4 pi)^3 Pmin L).
 */
export function radarMaxRangeM(input: { txPowerDbm: number; txGainDbi: number; rxGainDbi: number; frequencyHz: number; rcsM2: number; minSignalDbm: number; lossDb: number }): number {
  const { txPowerDbm, txGainDbi, rxGainDbi, frequencyHz, rcsM2, minSignalDbm, lossDb } = input;
  for (const [k, v] of Object.entries(input)) assertFinite(v, k);
  assertPositive(frequencyHz, 'Frequency');
  assertPositive(rcsM2, 'Radar cross section');
  if (lossDb < 0) throw new RangeError(`Loss must be non-negative, got ${lossDb}.`);
  const lambda = C0 / frequencyHz;
  const budgetDb = txPowerDbm + txGainDbi + rxGainDbi + 20 * Math.log10(lambda) + 10 * Math.log10(rcsM2) - 30 * Math.log10(4 * Math.PI) - minSignalDbm - lossDb;
  return 10 ** (budgetDb / 40);
}

/** Monostatic Doppler shift 2 v / lambda for radial velocity v (positive approaching), Hz. */
export function dopplerShiftHz(frequencyHz: number, radialVelocityMs: number): number {
  assertPositive(frequencyHz, 'Frequency');
  assertFinite(radialVelocityMs, 'Radial velocity');
  return (2 * radialVelocityMs * frequencyHz) / C0;
}

/* ─────────────────────────────── matching and loops ─────────────────────────────── */

export interface LMatchSolution {
  /** 'shunt-at-load': source - series X - (shunt B || load). 'shunt-at-source': source - (shunt B || (series X + load)). */
  topology: 'shunt-at-load' | 'shunt-at-source';
  /** Series reactance, ohms. */
  seriesX: number;
  /** Shunt susceptance, siemens. */
  shuntB: number;
}

/**
 * Lossless L-networks that conjugately match a complex source Zs = Rs + jXs to a load Zl = Rl + jXl,
 * so the source sees Zs*. Pozar, Microwave Engineering, sec. 5.1, generalised from a real Z0 to a
 * complex source; every returned solution is exact.
 */
export function lMatchSolutions(rs: number, xs: number, rl: number, xl: number): LMatchSolution[] {
  assertPositive(rs, 'Source resistance');
  assertPositive(rl, 'Load resistance');
  assertFinite(xs, 'Source reactance');
  assertFinite(xl, 'Load reactance');
  const solutions: LMatchSolution[] = [];
  const loadMag2 = rl * rl + xl * xl;
  const sourceMag2 = rs * rs + xs * xs;
  if (loadMag2 / rl >= rs) {
    const under = (rl / rs) * loadMag2 - rl * rl;
    if (under >= 0) {
      for (const sign of [1, -1]) {
        const shuntB = (xl + sign * Math.sqrt(under)) / loadMag2;
        solutions.push({ topology: 'shunt-at-load', shuntB, seriesX: (shuntB * loadMag2 - xl) / (rl / rs) - xs });
      }
    }
  }
  if (sourceMag2 / rs >= rl) {
    const under = (rl / rs) * sourceMag2 - rl * rl;
    if (under >= 0) {
      for (const sign of [1, -1]) {
        const seriesX = -xl + sign * Math.sqrt(under);
        solutions.push({ topology: 'shunt-at-source', seriesX, shuntB: (xs + (seriesX + xl) / (rl / rs)) / sourceMag2 });
      }
    }
  }
  return solutions;
}

/**
 * Second-order passive loop filter (C1 parallel with R2 + C2) for a type-II charge-pump PLL,
 * placing the phase-margin peak at the crossover (Banerjee, PLL Performance, Simulation and Design):
 * T1 = (sec phi - tan phi) / wc, T2 = 1 / (wc^2 T1), C1 + C2 = Icp Kvco / (N wc^2) sqrt(T2 / T1).
 * With the filter the loop is third order.
 */
export function passiveLoopFilter2(input: { crossoverHz: number; phaseMarginDeg: number; kvcoHzPerV: number; chargePumpA: number; divider: number }) {
  const { crossoverHz, phaseMarginDeg, kvcoHzPerV, chargePumpA, divider } = input;
  for (const [name, v] of [['Crossover', crossoverHz], ['VCO gain', kvcoHzPerV], ['Charge-pump current', chargePumpA], ['Divider', divider]] as const) assertPositive(v, name);
  if (!(phaseMarginDeg > 0 && phaseMarginDeg < 90)) throw new RangeError(`Phase margin must be between 0 and 90 degrees, got ${phaseMarginDeg}.`);
  const wc = 2 * Math.PI * crossoverHz;
  const phi = (phaseMarginDeg * Math.PI) / 180;
  const t1 = (1 / Math.cos(phi) - Math.tan(phi)) / wc;
  const t2 = (1 / Math.cos(phi) + Math.tan(phi)) / wc;
  const total = ((chargePumpA * kvcoHzPerV) / (divider * wc * wc)) * Math.sqrt(t2 / t1);
  const c1 = (total * t1) / t2;
  const c2 = total - c1;
  return { c1F: c1, c2F: c2, r2Ohm: t2 / c2, t1S: t1, t2S: t2 };
}

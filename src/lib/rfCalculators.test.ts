import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  IP3_ABOVE_IP1DB_DB,
  IP3_ABOVE_OP1DB_DB,
  dopplerShiftHz,
  freeSpacePathLossDb,
  lMatchSolutions,
  passiveLoopFilter2,
  powerLevels,
  radarMaxRangeM,
  receiverBudget,
  skinDepth,
  spotJitterDensity,
  thermalNoise,
  viaParasitics,
  vswrMetrics,
} from './rfCalculators';

// Reference values come from independent checks (numpy/scipy): an exact conductor propagation
// constant, a time-domain simulation of a cubic amplifier, a root solve of the radar power
// equation, and rebuilt PLL and L-network transfer functions.

const close = (got: number, want: number, tol: number, what: string) => assert.ok(Math.abs(got - want) <= tol, `${what}: got ${got}, want ${want}`);

test('VSWR, return loss and |Γ| convert through the same identities', () => {
  const m = vswrMetrics({ kind: 'vswr', value: 2 });
  close(m.gamma, 1 / 3, 1e-12, 'gamma');
  close(m.returnLossDb, 9.542425, 1e-6, 'RL');
  close(m.mismatchLossDb, 0.511525, 1e-6, 'ML');
  close(m.reflectedPercent, 11.1111, 1e-4, 'reflected');
  const back = vswrMetrics({ kind: 'returnLoss', value: m.returnLossDb });
  close(back.vswr, 2, 1e-9, 'round trip');
  assert.equal(vswrMetrics({ kind: 'vswr', value: 1 }).returnLossDb, Number.POSITIVE_INFINITY);
  assert.equal(vswrMetrics({ kind: 'gamma', value: 1 }).vswr, Number.POSITIVE_INFINITY);
  assert.throws(() => vswrMetrics({ kind: 'vswr', value: 0.9 }), RangeError);
  assert.throws(() => vswrMetrics({ kind: 'gamma', value: 1.2 }), RangeError);
});

test('power units and kTB', () => {
  close(powerLevels(30, 'dBm').W, 1, 1e-12, '30 dBm');
  close(powerLevels(1, 'mW').dBm, 0, 1e-12, '1 mW');
  close(powerLevels(2, 'W').dBW, 10 * Math.log10(2), 1e-12, '2 W');
  assert.throws(() => powerLevels(-1, 'W'), RangeError);
  const n = thermalNoise(290, 1e9);
  close(n.densityDbmPerHz, -173.975, 1e-3, 'kT0');
  close(n.powerDbm, -83.975, 1e-3, 'kT0B at 1 GHz');
});

test('receiver floor, sensitivity and SFDR', () => {
  const r = receiverBudget({ bandwidthHz: 20e6, noiseFigureDb: 3.5, iip3Dbm: -5, requiredSnrDb: 10, implementationLossDb: 2 });
  close(r.noiseFloorDbm, -174 + 10 * Math.log10(20e6) + 3.5, 1e-12, 'floor');
  close(r.sensitivityDbm, r.noiseFloorDbm + 12, 1e-12, 'sensitivity');
  close(r.sfdrDb, (2 / 3) * (-5 - r.noiseFloorDbm), 1e-12, 'SFDR');
});

test('the IP3 offsets match a simulated cubic amplifier', () => {
  // Two-tone and single-tone FFT measurement of y = 10x - 2x^3: IIP3 - IP1dB = 9.6357 dB, OIP3 - OP1dB = 10.6357 dB.
  close(IP3_ABOVE_IP1DB_DB, 9.6357, 1e-3, 'input referred');
  close(IP3_ABOVE_OP1DB_DB, 10.6357, 1e-3, 'output referred');
});

test('spot jitter density follows sqrt(2 L(f)) / (2 pi fc)', () => {
  close(spotJitterDensity(-100, 10e9) * 1e15, 0.225079, 1e-6, 'fs/rtHz');
});

test('skin depth and surface resistance of copper at 2.45 GHz', () => {
  // Exact 1/Re(gamma) for sigma = 1/1.68e-8 S/m: 1.317928139 um; Re(Zs) = 0.012747281 ohm.
  const s = skinDepth(1.68e-8, 2.45e9);
  close(s.depthM * 1e6, 1.317928139, 1e-8, 'delta');
  close(s.surfaceResistanceOhm, 0.012747281, 1e-9, 'Rs');
  close(skinDepth(1.68e-8, 2.45e9, 4).depthM, s.depthM / 2, 1e-15, 'mu_r scaling');
});

test('via inductance is the Goldfarb–Pucel via-hole model, not the +1 rule of thumb', () => {
  const v = viaParasitics({ drillMm: 0.2, padMm: 0.4, antipadMm: 0.6, heightMm: 1.6, er: 4.4 });
  close(v.inductanceH * 1e9, 0.658411, 1e-6, 'L (nH)'); // Goldfarb & Pucel, as given in the Qucs technical papers
  assert.ok(v.inductanceH * 1e9 < 1.0, '5.08 h [ln(4h/d) + 1] would give 1.43 nH here');
  close(v.capacitanceF * 1e12, 1.41 * 4.4 * (1.6 / 25.4) * 2, 1e-9, 'C (pF)');
  close(v.lcCornerHz, 1 / (2 * Math.PI * Math.sqrt(v.inductanceH * v.capacitanceF)), 1e-3, 'LC corner');
  assert.throws(() => viaParasitics({ drillMm: 0.4, padMm: 0.4, antipadMm: 0.6, heightMm: 1.6, er: 4.4 }), RangeError);
});

test('free-space path loss, radar range and Doppler', () => {
  close(freeSpacePathLossDb(100, 60e9), 108.0107, 1e-3, 'FSPL');
  const R = radarMaxRangeM({ txPowerDbm: 10, txGainDbi: 15, rxGainDbi: 15, frequencyHz: 60e9, rcsM2: 10, minSignalDbm: -90, lossDb: 3 });
  close(R, 28.17912, 1e-4, 'Rmax');
  close(dopplerShiftHz(60e9, 30), 12008.3, 0.05, 'fd');
});

// Minimal complex arithmetic for checking networks.
type C = [number, number];
const add = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]];
const mul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const inv = (a: C): C => { const d = a[0] * a[0] + a[1] * a[1]; return [a[0] / d, -a[1] / d]; };
const abs = (a: C) => Math.hypot(a[0], a[1]);

test('every L-network solution presents the conjugate of the source', () => {
  // Pozar Example 5.1: 200 - j100 ohm to 100 ohm gives B = 2.90 / -6.90 mS and X = 122.4 / -122.4 ohm.
  const pozar = lMatchSolutions(100, 0, 200, -100).filter((s) => s.topology === 'shunt-at-load');
  close(pozar[0].shuntB * 1e3, 2.899, 1e-3, 'B1');
  close(pozar[0].seriesX, 122.47, 0.01, 'X1');
  close(pozar[1].shuntB * 1e3, -6.899, 1e-3, 'B2');
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let n = 0; n < 500; n++) {
    const [rs, xs, rl, xl] = [1 + 299 * rand(), -300 + 600 * rand(), 1 + 299 * rand(), -300 + 600 * rand()];
    const solutions = lMatchSolutions(rs, xs, rl, xl);
    assert.ok(solutions.length > 0, 'an L-network always exists for positive resistances');
    for (const s of solutions) {
      const zl: C = [rl, xl];
      const zin = s.topology === 'shunt-at-load'
        ? add([0, s.seriesX], inv(add([0, s.shuntB], inv(zl))))
        : inv(add([0, s.shuntB], inv(add([0, s.seriesX], zl))));
      const target: C = [rs, -xs];
      const err = abs(add(zin, [-target[0], -target[1]])) / abs(target);
      assert.ok(err < 1e-9, `mismatch ${err}`);
    }
  }
});

test('the loop filter puts a unity-gain crossover with the requested phase margin where asked', () => {
  const f = passiveLoopFilter2({ crossoverHz: 100e3, phaseMarginDeg: 45, kvcoHzPerV: 50e6, chargePumpA: 5e-3, divider: 100 });
  close(f.c1F, 2.623038e-9, 1e-14, 'C1');
  close(f.c2F, 1.266515e-8, 1e-13, 'C2');
  close(f.r2Ohm, 303.379, 1e-3, 'R2');
  // Rebuild G(s) = (Icp / 2pi)(2 pi Kvco) Z(s) / (N s), Z = C1 || (R2 + 1/sC2), at the crossover.
  const s: C = [0, 2 * Math.PI * 100e3];
  const z = inv(add(mul(s, [f.c1F, 0]), inv(add([f.r2Ohm, 0], inv(mul(s, [f.c2F, 0]))))));
  const g = mul(mul([(5e-3 * 50e6) / 100, 0], z), inv(s));
  close(abs(g), 1, 1e-9, '|G| at fc');
  close(180 + (Math.atan2(g[1], g[0]) * 180) / Math.PI, 45, 1e-9, 'phase margin');
});

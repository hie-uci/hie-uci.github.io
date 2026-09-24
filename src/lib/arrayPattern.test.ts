import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  cutMetrics,
  directivityDbi,
  elementPhasesDeg,
  hasGratingLobe,
  makeField,
  maxGratingFreeSpacing,
  patternCut,
  peakSidelobeDb,
  samplePattern,
  taperWeights,
  validateConfig,
  type ArrayConfig,
} from './arrayPattern';

const base: ArrayConfig = { nx: 8, ny: 1, spacing: 0.5, theta0Deg: 0, phi0Deg: 0, taper: 'uniform', elementQ: 0 };

test('a uniform half-wave ULA of N isotropic elements has directivity exactly N', () => {
  // Textbook identity: at d = lambda/2 the element contributions are orthogonal over the sphere.
  const d = directivityDbi(base);
  assert.ok(Math.abs(d - 10 * Math.log10(8)) < 0.05, `got ${d.toFixed(3)} dBi`);
});

test('the uniform 8-element array has its first sidelobe near -12.8 dB', () => {
  const m = cutMetrics(patternCut(base, 0));
  assert.ok(m.sidelobeDb !== null && Math.abs(m.sidelobeDb + 12.8) < 0.3, `got ${m.sidelobeDb}`);
});

test('tapers trade beamwidth for lower sidelobes', () => {
  const uniform = cutMetrics(patternCut(base, 0));
  const cosine = cutMetrics(patternCut({ ...base, taper: 'cosine' }, 0));
  const hamming = cutMetrics(patternCut({ ...base, taper: 'hamming' }, 0));
  assert.ok(cosine.sidelobeDb! < -20, `cosine SLL ${cosine.sidelobeDb}`);
  assert.ok(hamming.sidelobeDb! < -30, `hamming SLL ${hamming.sidelobeDb}`);
  assert.ok(cosine.hpbwDeg! > uniform.hpbwDeg!, 'cosine taper widens the beam');
});

test('the broadside HPBW matches the 0.886 lambda / (N d) estimate', () => {
  const m = cutMetrics(patternCut(base, 0));
  const estimate = (0.886 / (8 * 0.5)) * (180 / Math.PI);
  assert.ok(Math.abs(m.hpbwDeg! - estimate) < 0.6, `got ${m.hpbwDeg} vs ${estimate}`);
});

test('steering moves the beam peak to the requested angle', () => {
  const cfg: ArrayConfig = { ...base, nx: 16, theta0Deg: 30 };
  const m = cutMetrics(patternCut(cfg, 0));
  assert.ok(Math.abs(m.peakDeg - 30) <= 0.5, `peak at ${m.peakDeg}`);
});

test('a planar array steered off-axis peaks in the requested phi half-plane', () => {
  const cfg: ArrayConfig = { ...base, nx: 8, ny: 8, theta0Deg: 25, phi0Deg: 30, elementQ: 1 };
  const m = cutMetrics(patternCut(cfg, 30));
  assert.ok(m.peakDeg > 20 && m.peakDeg < 26, `peak at ${m.peakDeg}`);
});

test('a line array steered in its plane keeps the textbook limit 1 / (1 + |sin theta0|)', () => {
  const line = (spacing: number, theta0Deg: number): ArrayConfig => ({ ...base, spacing, theta0Deg });
  assert.equal(maxGratingFreeSpacing(line(0.5, 0)), 1);
  assert.ok(Math.abs(maxGratingFreeSpacing(line(0.5, 30)) - 1 / 1.5) < 1e-12);
  // 0.5 lambda is exactly the endfire limit: at the boundary the lobe just enters visible space.
  assert.equal(hasGratingLobe(line(0.5, 90)), true);
  assert.equal(hasGratingLobe(line(0.49, 90)), false);
  assert.equal(hasGratingLobe(line(0.5, 60)), false);
  assert.equal(hasGratingLobe(line(0.8, 30)), true);
  // and the pattern really has a second full-height lobe in that case
  const cut = patternCut({ ...base, nx: 16, spacing: 1.0, theta0Deg: 30 }, 0);
  const strong = Array.from(cut.db).filter((v, i, a) => v > -1 && (i === 0 || v >= a[i - 1]) && (i === a.length - 1 || v >= a[i + 1]));
  assert.ok(strong.length >= 2, 'expected a grating lobe as tall as the main beam');
});

test('a planar array steered off the grid axes tolerates wider spacing than the worst case', () => {
  // Reference: brute-force search of lattice lobes (u0 + p/d, v0 + q/d) against the unit circle.
  const planar: ArrayConfig = { ...base, nx: 4, ny: 4, theta0Deg: 25, phi0Deg: 30, elementQ: 1 };
  assert.ok(Math.abs(maxGratingFreeSpacing(planar) - 0.74437) < 1e-5);
  assert.equal(hasGratingLobe({ ...planar, spacing: 0.72 }), false); // 1 / (1 + sin 25°) = 0.703 would say yes
  assert.equal(hasGratingLobe({ ...planar, spacing: 0.75 }), true);
  // A lobe then really exists: evaluate the field at the (p, q) = (-1, 0) lattice point.
  const d = 0.75;
  const u0 = Math.sin(25 * Math.PI / 180) * Math.cos(30 * Math.PI / 180);
  const v0 = Math.sin(25 * Math.PI / 180) * Math.sin(30 * Math.PI / 180);
  const u = u0 - 1 / d;
  const field = makeField({ ...planar, spacing: d, elementQ: 0 });
  assert.ok(field(Math.asin(Math.hypot(u, v0)), Math.atan2(v0, u)) > 0.99);
  // An axis with a single element has no grating lobes along it.
  assert.equal(maxGratingFreeSpacing({ ...planar, nx: 1, ny: 1 }), Number.POSITIVE_INFINITY);
});

test('the peak sidelobe is searched over the whole pattern, not one cut', () => {
  // References: brute-force (u, v) search polished with Nelder-Mead (numpy/scipy), independent of this code.
  const steered: ArrayConfig = { ...base, nx: 8, ny: 8, theta0Deg: 25, phi0Deg: 30, elementQ: 1 };
  const close = (got: number | null, want: number) => assert.ok(got !== null && Math.abs(got - want) < 0.02, `got ${got} want ${want}`);
  close(peakSidelobeDb(base), -12.7973);
  close(peakSidelobeDb(steered), -12.1589);
  close(peakSidelobeDb({ ...steered, taper: 'hamming' }), -41.5288);
  close(peakSidelobeDb({ ...steered, nx: 16, ny: 16, spacing: 0.6, theta0Deg: 40, phi0Deg: 60, taper: 'cosine' }), -22.0703);
  // The phi = 30 degree cut of the same steered array misses the grid-axis sidelobes by about 11 dB.
  const cut = cutMetrics(patternCut(steered, 30)).sidelobeDb!;
  assert.ok(cut < peakSidelobeDb(steered)! - 10, `cut ${cut}`);
  assert.equal(peakSidelobeDb({ ...base, nx: 1, ny: 1 }), null);
});

test('element phases step by -360 d sin(theta0) along the scan axis', () => {
  const phases = elementPhasesDeg({ ...base, theta0Deg: 30 });
  const step = (phases[0][1] - phases[0][0] + 360) % 360;
  const expected = (((-360 * 0.5 * Math.sin(Math.PI / 6)) % 360) + 360) % 360;
  assert.ok(Math.abs(step - expected) < 1e-9);
  const broadside = elementPhasesDeg({ ...base, nx: 4, ny: 4 });
  assert.ok(broadside.flat().every((p) => p === 0));
});

test('tapers are symmetric with a unit peak', () => {
  for (const t of ['cosine', 'hamming'] as const) {
    const w = taperWeights(9, t);
    assert.equal(w.length, 9);
    assert.ok(Math.abs(w[4] - 1) < 1e-12);
    for (let i = 0; i < 9; i++) assert.ok(Math.abs(w[i] - w[8 - i]) < 1e-12);
  }
});

test('ground-plane elements radiate only into the upper hemisphere', () => {
  const field = makeField({ ...base, elementQ: 1 });
  assert.equal(field(Math.PI * 0.75, 0), 0);
  const grid = samplePattern({ ...base, elementQ: 1 }, 31, 61);
  assert.ok(Math.abs(grid.theta[grid.nTheta - 1] - Math.PI / 2) < 1e-12);
  assert.ok(Math.max(...grid.power) <= 1 + 1e-12);
});

test('invalid configurations fail loudly', () => {
  assert.throws(() => validateConfig({ ...base, nx: 0 }));
  assert.throws(() => validateConfig({ ...base, nx: 2.5 }));
  assert.throws(() => validateConfig({ ...base, spacing: 0 }));
  assert.throws(() => validateConfig({ ...base, theta0Deg: 95 }));
});

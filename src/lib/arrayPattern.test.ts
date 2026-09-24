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

test('grating lobes appear once spacing reaches 1 / (1 + |sin theta0|)', () => {
  assert.equal(maxGratingFreeSpacing(0), 1);
  assert.ok(Math.abs(maxGratingFreeSpacing(30) - 1 / 1.5) < 1e-12);
  // 0.5 lambda is exactly the endfire limit: at the boundary the lobe just enters visible space.
  assert.equal(hasGratingLobe(0.5, 90), true);
  assert.equal(hasGratingLobe(0.49, 90), false);
  assert.equal(hasGratingLobe(0.5, 60), false);
  assert.equal(hasGratingLobe(0.8, 30), true);
  // and the pattern really has a second full-height lobe in that case
  const cut = patternCut({ ...base, nx: 16, spacing: 1.0, theta0Deg: 30 }, 0);
  const strong = Array.from(cut.db).filter((v, i, a) => v > -1 && (i === 0 || v >= a[i - 1]) && (i === a.length - 1 || v >= a[i + 1]));
  assert.ok(strong.length >= 2, 'expected a grating lobe as tall as the main beam');
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

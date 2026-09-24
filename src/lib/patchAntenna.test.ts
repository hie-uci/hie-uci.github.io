import { test } from 'node:test';
import assert from 'node:assert/strict';
import { besselJ0, designRectangularPatch, twoSlotField } from './patchAntenna';

// Balanis, Antenna Theory, 4th ed., Example 14.1: er = 2.2, h = 0.1588 cm, fr = 10 GHz.
const example = designRectangularPatch({ er: 2.2, heightMm: 1.588, frequencyGHz: 10 });

test('the transmission-line synthesis reproduces Balanis Example 14.1', () => {
  // Book values: W = 1.186 cm, eps_reff = 1.972, dL = 0.081 cm, L = 0.906 cm.
  assert.ok(Math.abs(example.widthMm - 11.86) < 0.02, `W ${example.widthMm}`);
  assert.ok(Math.abs(example.effectivePermittivity - 1.972) < 0.001, `eeff ${example.effectivePermittivity}`);
  assert.ok(Math.abs(example.fringeExtensionMm - 0.81) < 0.005, `dL ${example.fringeExtensionMm}`);
  assert.ok(Math.abs(example.lengthMm - 9.06) < 0.01, `L ${example.lengthMm}`);
});

test('slot and mutual conductance give the cavity-model edge resistance', () => {
  // References from an independent scipy quad evaluation of eqs. 14-10 and 14-18a:
  // G1 = 1.5724 mS, G12 = 0.6168 mS, Rin = 1 / (2 (G1 + G12)) = 228.4 ohm.
  assert.ok(Math.abs(example.slotConductanceS * 1e3 - 1.5724) < 5e-4);
  assert.ok(Math.abs(example.mutualConductanceS * 1e3 - 0.6168) < 5e-4);
  assert.ok(Math.abs(example.edgeResistanceOhm - 228.4) < 0.2);
  // Dropping G12 or using the wide-slot asymptote W / (120 lambda0) would miss by 30 % or more.
  const asymptote = 1 / (2 * (11.85 / (120 * 29.9792458)));
  assert.ok(Math.abs(asymptote - example.edgeResistanceOhm) / example.edgeResistanceOhm > 0.3);
});

test('directivity comes from integrating the two-slot pattern', () => {
  // Reference: Balanis eq. 14-56 by scipy dblquad, thin-substrate form: 7.35 dBi here, 6.09 dBi for FR-4 at 2.45 GHz.
  assert.ok(Math.abs(example.directivityDbi - 7.35) < 0.05, `D ${example.directivityDbi}`);
  const fr4 = designRectangularPatch({ er: 4.4, heightMm: 1.6, frequencyGHz: 2.45 });
  assert.ok(Math.abs(fr4.directivityDbi - 6.09) < 0.05, `D ${fr4.directivityDbi}`);
});

test('the two-slot pattern peaks at broadside and vanishes along the slot axis', () => {
  const k0 = (2 * Math.PI) / (299.792458 / 10);
  const patch = { widthMm: example.widthMm, heightMm: 1.588, effectiveLengthMm: example.effectiveLengthMm };
  const broadside = twoSlotField(0, 0, k0, patch);
  assert.ok(broadside > 0.99 && broadside <= 1);
  assert.ok(twoSlotField(0.5, 0, k0, patch) < broadside); // E-plane falls off with the array factor
  assert.equal(twoSlotField(0, 1, k0, patch), 0); // grazing along W: the slot current's own axis
});

test('Bessel J0 matches tabulated values', () => {
  assert.ok(Math.abs(besselJ0(0) - 1) < 1e-12);
  assert.ok(Math.abs(besselJ0(1) - 0.7651976866) < 1e-9);
  assert.ok(Math.abs(besselJ0(2.404825557695773)) < 1e-9); // first zero
  assert.ok(Math.abs(besselJ0(5) + 0.1775967713) < 1e-9);
});

test('invalid inputs fail loudly', () => {
  assert.throws(() => designRectangularPatch({ er: 0.5, heightMm: 1.6, frequencyGHz: 2.45 }), RangeError);
  assert.throws(() => designRectangularPatch({ er: 4.4, heightMm: 0, frequencyGHz: 2.45 }), RangeError);
  assert.throws(() => designRectangularPatch({ er: 4.4, heightMm: 1.6, frequencyGHz: Number.NaN }), RangeError);
});

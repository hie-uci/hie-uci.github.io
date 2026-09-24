import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  calculateMicrostrip,
  calculateSymmetricStripline,
  capacitiveReactanceOhms,
  parallelCapacitanceFromSusceptance,
} from './rfMath';

const closeTo = (actual: number, expected: number, tolerance = 1e-9) => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  );
};

describe('component formulas', () => {
  it('computes the 1 GHz, 1 pF capacitive reactance without a metric-prefix error', () => {
    closeTo(capacitiveReactanceOhms(1, 1), 159.15494309189532, 1e-12);
  });

  it('converts real susceptance to parallel capacitance', () => {
    closeTo(parallelCapacitanceFromSusceptance(2 * Math.PI * 1e9 * 1e-12, 1e9), 1e-12, 1e-24);
  });
});

describe('symmetric stripline', () => {
  it('matches the continuous finite-thickness closed-form model for the default geometry', () => {
    const result = calculateSymmetricStripline({
      er: 4.4,
      groundSpacingMm: 3.2,
      widthMm: 1.5,
      thicknessMm: 0.035,
    });

    closeTo(result.z0, 47.95026627448662, 1e-10);
    assert.deepEqual(result.warnings, []);
  });

  it('is continuous across the effective-width correction boundary', () => {
    const below = calculateSymmetricStripline({ er: 4.4, groundSpacingMm: 1, widthMm: 0.349999, thicknessMm: 0 });
    const above = calculateSymmetricStripline({ er: 4.4, groundSpacingMm: 1, widthMm: 0.350001, thicknessMm: 0 });

    assert.ok(Math.abs(below.z0 - above.z0) < 0.001);
  });
});

describe('microstrip', () => {
  it('uses the full Hammerstad–Jensen and Kirschning–Jansen implementation', () => {
    const result = calculateMicrostrip({
      er: 4.4,
      heightMm: 1.6,
      widthMm: 3,
      thicknessMm: 0.035,
      frequencyGHz: 2.45,
    });

    closeTo(result.staticZ0, 50.16596085560405, 1e-9);
    closeTo(result.staticEffectivePermittivity, 3.3008045853483248, 1e-9);
    closeTo(result.z0, 50.19238609245351, 1e-9);
    closeTo(result.effectivePermittivity, 3.3535551631744687, 1e-9);
    assert.deepEqual(result.warnings, []);
  });

  it('reports when the impedance-dispersion model is used outside its validity range', () => {
    const result = calculateMicrostrip({ er: 20, heightMm: 1, widthMm: 20, frequencyGHz: 100 });
    assert.ok(result.warnings.length > 0);
  });
});

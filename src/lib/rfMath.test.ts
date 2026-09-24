import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  calculateCoplanarWaveguide,
  calculateMicrostrip,
  calculateSymmetricStripline,
  capacitiveReactanceOhms,
  ellipticModulusRatio,
  parallelCapacitanceFromSusceptance,
  waveguideTE10,
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

describe('rectangular waveguide TE10', () => {
  it('matches the WR-90 cutoff and the 10 GHz guide wavelength', () => {
    const r = waveguideTE10(22.86, 10);
    closeTo(r.cutoffGHz, 6.557, 1e-3);
    assert.equal(r.propagating, true);
    // lambda0 = 29.979 mm, lambda_g = lambda0 / sqrt(1 - (6.557/10)^2) = 39.70 mm
    closeTo(r.guideWavelengthMm!, 39.70, 0.01);
    assert.equal(r.attenuationDbPerMm, 0);
  });

  it('reports evanescent decay below cutoff instead of a wavelength', () => {
    const r = waveguideTE10(22.86, 5);
    assert.equal(r.propagating, false);
    assert.equal(r.guideWavelengthMm, null);
    // alpha = (2 pi / 59.96 mm) * sqrt((6.557/5)^2 - 1) = 0.0889 Np/mm = 0.772 dB/mm
    closeTo(r.attenuationDbPerMm, 0.772, 0.002);
  });

  it('rejects non-physical input', () => {
    assert.throws(() => waveguideTE10(0, 10));
    assert.throws(() => waveguideTE10(22.86, -1));
  });
});

describe('coplanar waveguide', () => {
  it('computes the elliptic-integral ratio K(k)/K(k\') exactly', () => {
    // Reference values from scipy.special.ellipk.
    assert.ok(Math.abs(ellipticModulusRatio(0.3) - 0.6119434276528761) < 1e-12);
    assert.ok(Math.abs(ellipticModulusRatio(Math.SQRT1_2) - 1) < 1e-12);
    assert.ok(Math.abs(ellipticModulusRatio(0.9) - 1.3782945519565315) < 1e-12);
  });

  it('follows the Simons finite-substrate conformal map', () => {
    // Simons values computed independently with scipy; a 2D finite-difference Laplace solve of the
    // same cross-sections gives 48.51 ohm / 2.579 and 52.55 ohm / 5.204 (within 1 %).
    const fr4 = calculateCoplanarWaveguide({ widthMm: 2.0, gapMm: 0.2, heightMm: 1.6, er: 4.4 });
    assert.ok(Math.abs(fr4.z0 - 48.9105) < 1e-3, `Z0 ${fr4.z0}`);
    assert.ok(Math.abs(fr4.effectivePermittivity - 2.56194) < 1e-5);
    const rogers = calculateCoplanarWaveguide({ widthMm: 0.5, gapMm: 0.25, heightMm: 0.635, er: 10.2 });
    assert.ok(Math.abs(rogers.z0 - 52.9858) < 1e-3, `Z0 ${rogers.z0}`);
    assert.ok(Math.abs(rogers.effectivePermittivity - 5.17776) < 1e-5);
  });

  it('gives eps_eff = (er + 1) / 2 on a very thick substrate and does not overflow on a very thin one', () => {
    const thick = calculateCoplanarWaveguide({ widthMm: 2.0, gapMm: 0.2, heightMm: 1e4, er: 4.4 });
    assert.ok(Math.abs(thick.effectivePermittivity - 2.7) < 1e-6);
    const thin = calculateCoplanarWaveguide({ widthMm: 10, gapMm: 1, heightMm: 0.005, er: 4.4 });
    assert.ok(Number.isFinite(thin.z0) && thin.effectivePermittivity > 1 && thin.effectivePermittivity < 2.7);
    assert.throws(() => calculateCoplanarWaveguide({ widthMm: 2.0, gapMm: 0, heightMm: 1.6, er: 4.4 }));
  });
});

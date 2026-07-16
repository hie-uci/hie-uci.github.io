import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { cDB, cMag, computeTDR, getTdrValidationError, parseTouchstone, spectralNorm, sToMixedMode, sToZ } from './sParameterEngine';

const closeTo = (actual: number, expected: number, tolerance = 1e-9) => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`
  );
};

describe('parseTouchstone', () => {
  it('parses two-port RI data in Touchstone order', () => {
    const parsed = parseTouchstone(`
! S11 S21 S12 S22
# GHz S RI R 50
1.0 0.5 0.0 2.0 0.0 0.1 0.0 0.25 0.0
2.0 0.4 0.1 1.0 -0.2 0.1 0.0 0.2 0.0
`, 2);

    assert.equal(parsed.points.length, 2);
    assert.equal(parsed.isPassive, false);
    assert.ok(parsed.maxPassivitySingularValue > 1);
    closeTo(parsed.points[0].frequency, 1e9);
    closeTo(parsed.points[0].z0, 50);

    closeTo(parsed.points[0].matrix[0][0].real, 0.5);
    closeTo(parsed.points[0].matrix[1][0].real, 2);
    closeTo(parsed.points[0].matrix[0][1].real, 0.1);
    closeTo(parsed.points[0].matrix[1][1].real, 0.25);
    assert.ok(parsed.points[0].Z);
    assert.ok(parsed.points[0].Y);
    assert.ok(parsed.points[0].vswr);
    assert.equal(typeof parsed.points[0].groupDelay, 'number');
  });

  it('converts magnitude/angle and dB/angle values into complex values', () => {
    const maParsed = parseTouchstone('# MHz S MA R 75\n100 0.5 90', 1);
    closeTo(maParsed.points[0].frequency, 100e6);
    closeTo(maParsed.points[0].z0, 75);
    closeTo(maParsed.points[0].matrix[0][0].real, 0, 1e-12);
    closeTo(maParsed.points[0].matrix[0][0].imag, 0.5, 1e-12);

    const dbParsed = parseTouchstone('# GHz S DB R 50\n1 -6 0', 1);
    closeTo(cDB(dbParsed.points[0].matrix[0][0]), -6);
  });

  it('checks multiport passivity with spectral norm instead of per-entry magnitude only', () => {
    const parsed = parseTouchstone(`
# GHz S RI R 50
1.0 0.8 0.0 0.8 0.0 0.8 0.0 0.8 0.0
`, 2);

    assert.equal(parsed.isPassive, false);
    closeTo(spectralNorm(parsed.points[0].matrix), 1.6, 1e-9);
    closeTo(parsed.maxPassivitySingularValue, 1.6, 1e-9);
  });

  it('parses Touchstone 2.0 network data and applies per-port references', () => {
    const parsed = parseTouchstone(`
[Version] 2.0
# GHz S RI R 50
[Number of Ports] 2
[Reference] 50 50
[Network Data]
1.0 0 0 0 0 0 0 0 0
`, 2);

    assert.equal(parsed.points.length, 1);
    assert.deepEqual(parsed.points[0].portZ0, [50, 50]);
    closeTo(parsed.points[0].Z![0][0].real, 50);
    closeTo(parsed.points[0].Z![1][1].real, 50);
    assert.deepEqual(parsed.errors, []);
  });

  it('supports 12_21 two-port ordering and unequal references', () => {
    const parsed = parseTouchstone(`
[Version] 2.0
# GHz S RI R 50 75
[Number of Ports] 2
[Two-Port Data Order] 12_21
[Network Data]
1 0.1 0 0.12 0 0.21 0 0.2 0
[End]
`, 2);

    assert.deepEqual(parsed.points[0].portZ0, [50, 75]);
    closeTo(parsed.points[0].matrix[0][1].real, 0.12);
    closeTo(parsed.points[0].matrix[1][0].real, 0.21);
  });

  it('parses only the network section and ignores v2 noise records', () => {
    const parsed = parseTouchstone(`
[Version] 2.0
# GHz S RI R 50
[Number of Ports] 2
[Network Data]
1 0 0 0.5 0 0 0 0 0
[Noise Data]
1 1.1 0.2 45 0.5
2 1.2 0.3 50 0.6
[End]
`, 2);
    assert.equal(parsed.points.length, 1);
  });

  it('stops before a Touchstone v1 noise block when frequency decreases', () => {
    const parsed = parseTouchstone(`
# GHz S RI R 50
1 0 0 0.5 0 0 0 0 0
2 0 0 0.5 0 0 0 0 0
1 1.1 0.2 45 0.5
2 1.2 0.3 50 0.6
`, 2);
    assert.equal(parsed.points.length, 2);
    assert.ok(parsed.warnings?.some(warning => warning.includes('noise-data')));
  });

  it('rejects unsupported parameter and compressed matrix formats', () => {
    const nonS = parseTouchstone('# GHz Y RI R 50\n1 0 0', 1);
    assert.equal(nonS.points.length, 0);
    assert.ok(nonS.errors?.some(error => error.includes('S-parameters only')));

    const lower = parseTouchstone(`
[Version] 2.0
# GHz S RI R 50
[Number of Ports] 2
[Matrix Format] Lower
[Network Data]
1 0 0 0 0 0 0
`, 2);
    assert.equal(lower.points.length, 0);
    assert.ok(lower.errors?.some(error => error.includes('only FULL')));
  });

  it('rejects malformed numeric records instead of fabricating zero values', () => {
    const parsed = parseTouchstone('# GHz S RI R 50\n1 not-a-number 0', 1);
    assert.equal(parsed.points.length, 0);
    assert.ok(parsed.errors?.some(error => error.includes('non-numeric')));
  });

  it('rejects mixed-mode ordered files until their port mapping is explicitly converted', () => {
    const parsed = parseTouchstone(`
[Version] 2.0
# GHz S RI R 50
[Number of Ports] 2
[Mixed-Mode Order] D1,2 C1,2
[Network Data]
1 0 0 0 0 0 0 0 0
`, 2);
    assert.equal(parsed.points.length, 0);
    assert.ok(parsed.errors?.some(error => error.includes('Mixed-mode ordered')));
  });

  it('uses row-major Touchstone ordering for networks with three or more ports', () => {
    const parsed = parseTouchstone('# GHz S RI R 50\n1 11 0 12 0 13 0 21 0 22 0 23 0 31 0 32 0 33 0', 3);
    closeTo(parsed.points[0].matrix[2][0].real, 31);
    closeTo(parsed.points[0].matrix[0][2].real, 13);
  });

  it('unwraps phase before differentiating group delay on a monotonic grid', () => {
    const parsed = parseTouchstone(`
# GHz S MA R 50
1.0 0 0 1 0 0 0 0 0
1.1 0 0 1 -36 0 0 0 0
1.2 0 0 1 -72 0 0 0 0
`, 2);
    parsed.points.forEach(point => closeTo(point.groupDelay!, 1e-9, 1e-15));
  });
});

describe('reference conversion and TDR validation', () => {
  it('converts a zero S matrix to the unequal real port references', () => {
    const zero = [
      [{ real: 0, imag: 0 }, { real: 0, imag: 0 }],
      [{ real: 0, imag: 0 }, { real: 0, imag: 0 }],
    ];
    const z = sToZ(zero, [50, 75]);
    assert.ok(z);
    closeTo(z[0][0].real, 50);
    closeTo(z[1][1].real, 75);
  });

  it('disables TDR for nonuniform frequency data', () => {
    const parsed = parseTouchstone(`
# GHz S RI R 50
1.0 0.1 0
1.1 0.1 0
1.25 0.1 0
`, 1);
    assert.match(getTdrValidationError(parsed.points) ?? '', /uniformly spaced/);
    assert.deepEqual(computeTDR(parsed.points), []);
  });
});

describe('sToMixedMode', () => {
  it('returns null for non-four-port data', () => {
    assert.equal(sToMixedMode([[{ real: 0, imag: 0 }]]), null);
  });

  it('converts a four-port identity matrix without changing magnitude scale', () => {
    const s = [
      [{ real: 1, imag: 0 }, { real: 0, imag: 0 }, { real: 0, imag: 0 }, { real: 0, imag: 0 }],
      [{ real: 0, imag: 0 }, { real: 1, imag: 0 }, { real: 0, imag: 0 }, { real: 0, imag: 0 }],
      [{ real: 0, imag: 0 }, { real: 0, imag: 0 }, { real: 1, imag: 0 }, { real: 0, imag: 0 }],
      [{ real: 0, imag: 0 }, { real: 0, imag: 0 }, { real: 0, imag: 0 }, { real: 1, imag: 0 }],
    ];

    const mixed = sToMixedMode(s);

    assert.ok(mixed);
    closeTo(cMag(mixed[0][0]), 1);
    closeTo(cMag(mixed[1][1]), 1);
    closeTo(cMag(mixed[2][2]), 1);
    closeTo(cMag(mixed[3][3]), 1);
  });

  it('supports alternate physical pair maps', () => {
    const s = new Array(4).fill(null).map(() => new Array(4).fill(null).map(() => ({ real: 0, imag: 0 })));
    s[0][2] = { real: 1, imag: 0 };
    s[2][0] = { real: 1, imag: 0 };
    const defaultPairs = sToMixedMode(s, '12-34')!;
    const alternatePairs = sToMixedMode(s, '13-24')!;
    assert.notDeepEqual(defaultPairs, alternatePairs);
  });
});

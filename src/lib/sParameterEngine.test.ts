import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { cDB, cMag, parseTouchstone, sToMixedMode } from './sParameterEngine';

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
});

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { C0, beatFrequency, chirpDerived, rangeProfileDb, roundTripDelay, windowResponse } from './fmcw';

const closeTo = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} to be within ${tolerance} of ${expected}`);
const db = (amplitude: number) => 20 * Math.log10(amplitude);

describe('chirpDerived', () => {
  it('gives slope, resolution, IF-limited range and bin count for a 4 GHz, 20 us chirp', () => {
    const d = chirpDerived({ bandwidthHz: 4e9, chirpS: 20e-6, ifBandwidthHz: 10e6 });
    closeTo(d.slopeHzPerS, 2e14, 1);
    closeTo(d.rangeResolutionM, C0 / 8e9);
    closeTo(d.maxRangeM, (10e6 * C0) / 4e14);
    closeTo(d.bins, 200, 1e-9);
  });

  it('rejects non-positive parameters with the name of the bad one', () => {
    assert.throws(() => chirpDerived({ bandwidthHz: 4e9, chirpS: 0, ifBandwidthHz: 10e6 }), /chirp time/);
  });
});

describe('beat frequency', () => {
  it('is the slope times the round-trip delay', () => {
    closeTo(roundTripDelay(5), 10 / C0, 1e-20);
    closeTo(beatFrequency(5, 2e14), (2e14 * 10) / C0, 1e-6);
  });
});

describe('windowResponse', () => {
  it('has a rectangular first null at one bin and a -13.26 dB first sidelobe', () => {
    closeTo(windowResponse(0, 'rect'), 1);
    closeTo(windowResponse(1, 'rect'), 0, 1e-15);
    closeTo(db(windowResponse(1.4303, 'rect')), -13.26, 0.01);
  });

  it('trades a two-bin main lobe for sidelobes below -31 dB with Hann', () => {
    closeTo(windowResponse(0, 'hann'), 1);
    closeTo(windowResponse(1, 'hann'), 0.5);
    closeTo(windowResponse(2, 'hann'), 0, 1e-15);
    let worst = -Infinity;
    for (let u = 2.05; u <= 6; u += 0.01) worst = Math.max(worst, db(windowResponse(u, 'hann')));
    assert.ok(worst < -31 && worst > -32, `worst Hann sidelobe was ${worst} dB`);
  });
});

describe('rangeProfileDb', () => {
  const cell = C0 / 8e9;

  it('peaks at 0 dB on the target and hits the floor one cell away with a rectangular window', () => {
    const [peak, beside] = rangeProfileDb([5, 5 + cell], [5], cell, 'rect');
    closeTo(peak, 0);
    assert.equal(beside, -80);
  });

  it('resolves two targets one cell apart with rect but merges them with Hann', () => {
    const at = [5, 5 + cell / 2];
    const [rectPeak, rectMid] = rangeProfileDb(at, [5, 5 + cell], cell, 'rect');
    const [hannPeak, hannMid] = rangeProfileDb(at, [5, 5 + cell], cell, 'hann');
    closeTo(rectMid, 10 * Math.log10(2 * (2 / Math.PI) ** 2), 1e-9); // the -0.91 dB saddle
    assert.ok(rectMid < rectPeak, 'rectangular window shows a dip between the targets');
    assert.ok(hannMid > hannPeak, 'Hann window shows a single merged peak');
  });
});

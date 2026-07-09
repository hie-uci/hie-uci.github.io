import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { calculateCascade, type CascadeBlock } from './cascadeMath';

const closeTo = (actual: number, expected: number, tolerance = 1e-6) => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`
  );
};

describe('calculateCascade', () => {
  it('computes gain, noise figure, and intercept point for cascaded RF blocks', () => {
    const blocks: CascadeBlock[] = [
      { id: '1', name: 'LNA', gain: 10, nf: 2, oip3: 30 },
      { id: '2', name: 'Filter', gain: -3, nf: 4, oip3: 40 },
    ];

    const result = calculateCascade(blocks);

    closeTo(result.cascadedGain, 7);
    closeTo(result.cascadedNF, 2.3957019314293317);
    closeTo(result.cascadedIIP3, 19.78761598085745);
    closeTo(result.cascadedOIP3, 26.78761598085745);
  });

  it('creates swept results when a block uses S-parameter gain', () => {
    const blocks: CascadeBlock[] = [
      {
        id: '1',
        name: 'Measured amplifier',
        gain: 0,
        nf: 2,
        oip3: 30,
        sParamData: {
          isPassive: false,
          maxPassivitySingularValue: 2,
          points: [
            {
              frequency: 1e9,
              z0: 50,
              matrix: [
                [{ real: 0, imag: 0 }, { real: 0, imag: 0 }],
                [{ real: 2, imag: 0 }, { real: 0, imag: 0 }],
              ],
            },
            {
              frequency: 2e9,
              z0: 50,
              matrix: [
                [{ real: 0, imag: 0 }, { real: 0, imag: 0 }],
                [{ real: 1, imag: 0 }, { real: 0, imag: 0 }],
              ],
            },
          ],
        },
      },
    ];

    const result = calculateCascade(blocks);

    assert.equal(result.sweptResults?.length, 2);
    closeTo(result.summaryFrequency ?? Number.NaN, 2e9);
    closeTo(result.cascadedGain, 0);
    closeTo(result.sweptResults?.[0].cascadedGain ?? Number.NaN, 6.020599913279624);
    closeTo(result.sweptResults?.[1].cascadedGain ?? Number.NaN, 0);
  });

  it('keeps one-port S-parameter files from overriding cascade gain', () => {
    const blocks: CascadeBlock[] = [
      {
        id: '1',
        name: 'Reflection-only fixture',
        gain: -3,
        nf: 3,
        oip3: 100,
        sParamData: {
          isPassive: true,
          maxPassivitySingularValue: 0.5,
          points: [
            {
              frequency: 1e9,
              z0: 50,
              matrix: [[{ real: 0.5, imag: 0 }]],
            },
          ],
        },
      },
    ];

    const result = calculateCascade(blocks);

    closeTo(result.cascadedGain, -3);
    assert.equal(result.sweptResults, undefined);
  });
});

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

  it('cascades connected two-ports with interstage reflection instead of summing S21 dB', () => {
    const point = {
      frequency: 1e9,
      z0: 50,
      matrix: [
        [{ real: 0.5, imag: 0 }, { real: 0, imag: 0 }],
        [{ real: 1, imag: 0 }, { real: 0.5, imag: 0 }],
      ],
    };
    const blocks: CascadeBlock[] = [1, 2].map(id => ({
      id: String(id), name: `network ${id}`, gain: 0, nf: 0, oip3: Infinity,
      sParamData: { points: [point], isPassive: false, maxPassivitySingularValue: 1.5 },
    }));
    const result = calculateCascade(blocks);
    closeTo(result.cascadedGain, 20 * Math.log10(1 / (1 - 0.5 * 0.5)));
  });

  it('uses only the common S-parameter frequency intersection', () => {
    const makeBlock = (id: string, frequencies: number[]): CascadeBlock => ({
      id, name: id, gain: 0, nf: 0, oip3: Infinity,
      sParamData: {
        isPassive: true, maxPassivitySingularValue: 1,
        points: frequencies.map(frequency => ({
          frequency, z0: 50,
          matrix: [[{ real: 0, imag: 0 }, { real: 0, imag: 0 }], [{ real: 1, imag: 0 }, { real: 0, imag: 0 }]],
        })),
      },
    });
    const result = calculateCascade([makeBlock('a', [1e9, 2e9]), makeBlock('b', [1.5e9, 2.5e9])]);
    assert.deepEqual(result.sweptResults?.map(point => point.frequency), [1.5e9, 2e9]);
  });

  it('refuses to clamp disjoint files to their endpoints', () => {
    const makeBlock = (id: string, start: number, end: number): CascadeBlock => ({
      id, name: id, gain: 0, nf: 0, oip3: Infinity,
      sParamData: {
        isPassive: true, maxPassivitySingularValue: 1,
        points: [start, end].map(frequency => ({
          frequency, z0: 50,
          matrix: [[{ real: 0, imag: 0 }, { real: 0, imag: 0 }], [{ real: 1, imag: 0 }, { real: 0, imag: 0 }]],
        })),
      },
    });
    const result = calculateCascade([makeBlock('a', 1e9, 2e9), makeBlock('b', 3e9, 4e9)]);
    assert.equal(result.sweptResults, undefined);
    assert.ok(Number.isNaN(result.cascadedGain));
    assert.ok(result.warnings.some(warning => warning.includes('no common frequency overlap')));
  });
});

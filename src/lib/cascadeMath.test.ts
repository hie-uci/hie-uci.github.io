import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { calculateCascade, levelPlan, stageLineup, type CascadeBlock } from './cascadeMath';

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

describe('stageLineup', () => {
  const receiver: CascadeBlock[] = [
    { id: '1', name: 'LNA', gain: 15, nf: 1.5, oip3: 20 },
    { id: '2', name: 'Filter', gain: -2, nf: 2, oip3: 100 },
    { id: '3', name: 'Mixer', gain: -6, nf: 6, oip3: 15 },
  ];

  it('splits the Friis noise and IP3 budgets by stage', () => {
    const lineup = stageLineup(receiver);
    assert.ok(lineup);
    assert.deepEqual(lineup.map(stage => stage.cumulativeGainDB), [15, 13, 7]);
    // Reference values computed independently at 30 significant digits.
    closeTo(lineup[0].noiseShare, 0.710731228437268, 1e-12);
    closeTo(lineup[1].noiseShare, 0.0318653347651249, 1e-12);
    closeTo(lineup[2].noiseShare, 0.257403436797607, 1e-12);
    closeTo(lineup[0].cumulativeNFdB, 1.5);
    closeTo(lineup[0].cumulativeIIP3dBm, 5);
    closeTo(lineup[2].cumulativeNFdB, 1.9877828754538, 1e-10);
    closeTo(lineup[2].cumulativeIIP3dBm, 3.23565135738151, 1e-10);
    closeTo(lineup[2].linearityShare, 0.333860574013643, 1e-12);
  });

  it('ends on the same NF and IIP3 as calculateCascade', () => {
    const lineup = stageLineup(receiver);
    const result = calculateCascade(receiver);
    assert.ok(lineup);
    closeTo(lineup[2].cumulativeNFdB, result.cascadedNF, 1e-9);
    closeTo(lineup[2].cumulativeIIP3dBm, result.cascadedIIP3, 1e-9);
    closeTo(lineup.reduce((sum, stage) => sum + stage.noiseShare, 0), 1, 1e-12);
    closeTo(lineup.reduce((sum, stage) => sum + stage.linearityShare, 0), 1, 1e-12);
  });

  it('gives zero shares instead of dividing by zero for a noiseless chain', () => {
    const lineup = stageLineup([{ id: '1', name: 'Ideal', gain: 10, nf: 0, oip3: 30 }]);
    assert.ok(lineup);
    assert.equal(lineup[0].noiseShare, 0);
    closeTo(lineup[0].cumulativeNFdB, 0);
  });

  it('returns null when a two-port stage has no data at the frequency', () => {
    const measured: CascadeBlock = {
      id: '1',
      name: 'Measured',
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
        ],
      },
    };
    assert.equal(stageLineup([measured]), null);
    assert.equal(stageLineup([measured], 5e9), null);
    closeTo(stageLineup([measured], 1e9)?.[0].gainDB ?? Number.NaN, 6.020599913279624);
  });
});

describe('levelPlan', () => {
  const lineup = stageLineup([
    { id: '1', name: 'LNA', gain: 15, nf: 1.5, oip3: 20 },
    { id: '2', name: 'Filter', gain: -2, nf: 2, oip3: 100 },
    { id: '3', name: 'Mixer', gain: -6, nf: 6, oip3: 15 },
  ])!;

  it('places signal and noise at every interface', () => {
    const plan = levelPlan(lineup, -60, 100e6);
    assert.equal(plan.nodes.length, 4);
    assert.deepEqual(plan.nodes.map(node => node.signalDbm), [-60, -45, -47, -53]);
    closeTo(plan.nodes[0].noiseDbm, -94);
    closeTo(plan.nodes[1].noiseDbm, -94 + 1.5 + 15);
    assert.equal(plan.nodes[0].oip3Dbm, undefined);
    assert.equal(plan.nodes[3].oip3Dbm, 15);
  });

  it('derives output SNR, SFDR and the tightest stage', () => {
    const plan = levelPlan(lineup, -60, 100e6);
    closeTo(plan.snrOutDB, -60 + 94 - 1.9877828754538, 1e-9);
    closeTo(plan.sfdrDB, (2 / 3) * (3.23565135738151 + 94 - 1.9877828754538), 1e-9);
    assert.equal(plan.tightestStage, 0);
    closeTo(plan.tightestHeadroomDB, 65);
  });

  it('moves the tightest stage as the drive level changes the margins', () => {
    const plan = levelPlan(stageLineup([
      { id: '1', name: 'LNA', gain: 20, nf: 1, oip3: 30 },
      { id: '2', name: 'Mixer', gain: 0, nf: 8, oip3: 10 },
    ])!, -30, 1e6);
    assert.equal(plan.tightestStage, 1);
    closeTo(plan.tightestHeadroomDB, 20);
  });
});


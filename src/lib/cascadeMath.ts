import {
  Complex,
  ParseResult,
  SParamMatrix,
  cAdd,
  cDiv,
  cMag,
  cMul,
  cSub,
  mMul,
  sToZ,
} from './sParameterEngine';

export interface CascadeBlock {
  id: string;
  name: string;
  gain: number; // dB; used for blocks without a two-port file
  nf: number; // dB; constant matched-stage assumption
  oip3: number; // dBm; constant matched-stage assumption
  sParamData?: ParseResult;
  sParamFileName?: string;
}

export interface SweptCascadeResult {
  frequency: number;
  cascadedGain: number;
  cascadedNF: number;
  cascadedIIP3: number;
  cascadedOIP3: number;
}

export interface CascadeResult {
  cascadedGain: number;
  cascadedNF: number;
  cascadedIIP3: number;
  cascadedOIP3: number;
  summaryFrequency?: number;
  sweptResults?: SweptCascadeResult[];
  warnings: string[];
}

interface StageNetwork {
  abcd: Complex[][];
  inputReference: number;
  outputReference: number;
  matchedGainDB: number;
}

const real = (value: number): Complex => ({ real: value, imag: 0 });

function isTwoPortBlock(block: CascadeBlock): boolean {
  return Boolean(block.sParamData?.points.length && block.sParamData.points[0].matrix.length === 2);
}

function interpolatePoint(points: SParamMatrix[], frequency: number): SParamMatrix | null {
  if (!points.length || frequency < points[0].frequency || frequency > points[points.length - 1].frequency) return null;
  const exact = points.find(point => point.frequency === frequency);
  if (exact) return exact;

  for (let index = 0; index < points.length - 1; index++) {
    const low = points[index];
    const high = points[index + 1];
    if (frequency <= low.frequency || frequency >= high.frequency) continue;
    const fraction = (frequency - low.frequency) / (high.frequency - low.frequency);
    const matrix = low.matrix.map((row, r) => row.map((value, c) => ({
      real: value.real + fraction * (high.matrix[r][c].real - value.real),
      imag: value.imag + fraction * (high.matrix[r][c].imag - value.imag),
    })));
    return {
      frequency,
      matrix,
      z0: low.z0,
      portZ0: low.portZ0 ? [...low.portZ0] : undefined,
    };
  }
  return null;
}

function zToAbcd(z: Complex[][]): Complex[][] | null {
  const z21 = z[1][0];
  if (cMag(z21) < 1e-15) return null;
  const determinant = cSub(cMul(z[0][0], z[1][1]), cMul(z[0][1], z21));
  return [
    [cDiv(z[0][0], z21), cDiv(determinant, z21)],
    [cDiv(real(1), z21), cDiv(z[1][1], z21)],
  ];
}

function scalarMatchedStage(gainDB: number, reference = 50): StageNetwork {
  const waveGain = 10 ** (gainDB / 20);
  const factor = 1 / (2 * Math.max(waveGain, 1e-300));
  return {
    abcd: [
      [real(factor), real(reference * factor)],
      [real(factor / reference), real(factor)],
    ],
    inputReference: reference,
    outputReference: reference,
    matchedGainDB: gainDB,
  };
}

function networkAtFrequency(block: CascadeBlock, frequency?: number): StageNetwork | null {
  if (!isTwoPortBlock(block)) return scalarMatchedStage(block.gain);
  if (frequency === undefined) return null;

  const point = interpolatePoint(block.sParamData!.points, frequency);
  if (!point) return null;
  const references = point.portZ0 ?? [point.z0, point.z0];
  const z = sToZ(point.matrix, references);
  const abcd = z ? zToAbcd(z) : null;
  if (!abcd) return null;
  return {
    abcd,
    inputReference: references[0],
    outputReference: references[1],
    matchedGainDB: 20 * Math.log10(cMag(point.matrix[1][0]) + 1e-300),
  };
}

function abcdToForwardGain(abcd: Complex[][], inputReference: number, outputReference: number): number {
  // Generalized real-reference conversion for the connected two-port chain.
  const denominator = cAdd(
    cAdd(cMul(abcd[0][0], real(outputReference)), abcd[0][1]),
    cAdd(cMul(abcd[1][0], real(inputReference * outputReference)), cMul(abcd[1][1], real(inputReference))),
  );
  const numerator = real(2 * Math.sqrt(inputReference * outputReference));
  return cMag(cDiv(numerator, denominator));
}

function getCascadeFrequencies(blocks: CascadeBlock[]): { frequencies: number[]; hasTwoPortData: boolean; hasOverlap: boolean } {
  const twoPortBlocks = blocks.filter(isTwoPortBlock);
  if (!twoPortBlocks.length) return { frequencies: [], hasTwoPortData: false, hasOverlap: true };

  const overlapStart = Math.max(...twoPortBlocks.map(block => block.sParamData!.points[0].frequency));
  const overlapEnd = Math.min(...twoPortBlocks.map(block => block.sParamData!.points.at(-1)!.frequency));
  if (overlapStart > overlapEnd) return { frequencies: [], hasTwoPortData: true, hasOverlap: false };

  const frequencies = new Set<number>([overlapStart, overlapEnd]);
  twoPortBlocks.forEach(block => block.sParamData!.points.forEach(point => {
    if (point.frequency >= overlapStart && point.frequency <= overlapEnd) frequencies.add(point.frequency);
  }));
  return { frequencies: Array.from(frequencies).sort((a, b) => a - b), hasTwoPortData: true, hasOverlap: true };
}

function unavailableResult(): Omit<CascadeResult, 'summaryFrequency' | 'sweptResults' | 'warnings'> {
  return {
    cascadedGain: Number.NaN,
    cascadedNF: Number.NaN,
    cascadedIIP3: Number.NaN,
    cascadedOIP3: Number.NaN,
  };
}

function computeCascadeAtFrequency(blocks: CascadeBlock[], frequency?: number): Omit<CascadeResult, 'summaryFrequency' | 'sweptResults' | 'warnings'> {
  if (!blocks.length) return unavailableResult();

  let chainAbcd: Complex[][] | null = null;
  let inputReference = 50;
  let outputReference = 50;
  let currentLinNF = 0;
  let currentLinIIP3Inv = 0;
  let accumulatedMatchedGain = 1;

  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index];
    const stage = networkAtFrequency(block, frequency);
    if (!stage) return unavailableResult();
    if (chainAbcd === null) {
      chainAbcd = stage.abcd;
      inputReference = stage.inputReference;
    } else {
      chainAbcd = mMul(chainAbcd, stage.abcd);
    }
    outputReference = stage.outputReference;

    const linGain = 10 ** (stage.matchedGainDB / 10);
    const linNF = 10 ** (block.nf / 10);
    const linIIP3 = Number.isFinite(block.oip3)
      ? 10 ** ((block.oip3 - stage.matchedGainDB) / 10)
      : Number.POSITIVE_INFINITY;
    if (index === 0) {
      currentLinNF = linNF;
      currentLinIIP3Inv = 1 / linIIP3;
    } else {
      currentLinNF += (linNF - 1) / accumulatedMatchedGain;
      currentLinIIP3Inv += accumulatedMatchedGain / linIIP3;
    }
    accumulatedMatchedGain *= linGain;
  }

  const forwardGain = chainAbcd ? abcdToForwardGain(chainAbcd, inputReference, outputReference) : 0;
  const cascadedGain = 20 * Math.log10(forwardGain + 1e-300);
  const cascadedNF = 10 * Math.log10(currentLinNF);
  const cascadedIIP3 = currentLinIIP3Inv > 0 ? 10 * Math.log10(1 / currentLinIIP3Inv) : Number.POSITIVE_INFINITY;
  return {
    cascadedGain,
    cascadedNF,
    cascadedIIP3,
    cascadedOIP3: cascadedIIP3 + cascadedGain,
  };
}

export function calculateCascade(blocks: CascadeBlock[], options: { summaryFrequency?: number } = {}): CascadeResult {
  const warnings: string[] = [];
  if (!blocks.length) return { ...unavailableResult(), warnings: ['Add at least one block to calculate a cascade.'] };

  const grid = getCascadeFrequencies(blocks);
  if (!grid.hasOverlap) {
    return {
      ...unavailableResult(),
      warnings: ['The uploaded two-port files have no common frequency overlap; no endpoint clamping or extrapolation was performed.'],
    };
  }

  let summaryFrequency = options.summaryFrequency;
  if (grid.hasTwoPortData) {
    if (summaryFrequency === undefined) summaryFrequency = grid.frequencies[Math.floor(grid.frequencies.length / 2)];
    const minimum = grid.frequencies[0];
    const maximum = grid.frequencies.at(-1)!;
    if (summaryFrequency < minimum || summaryFrequency > maximum) {
      warnings.push(`Requested summary frequency is outside the common ${minimum / 1e9}–${maximum / 1e9} GHz overlap; no extrapolation was performed.`);
    }
  }

  const summary = computeCascadeAtFrequency(blocks, summaryFrequency);
  const sweptResults = grid.hasTwoPortData
    ? grid.frequencies.map(frequency => ({ frequency, ...computeCascadeAtFrequency(blocks, frequency) }))
    : undefined;

  if (grid.hasTwoPortData) {
    warnings.push('Cascaded gain uses connected two-port ABCD matrices and includes interstage mismatch. NF and IP3 still use Friis/intercept formulas with each stage treated as matched, constant-NF/OIP3, and driven in its linear region; rigorous mismatch-aware noise analysis requires noise parameters and source/load terminations.');
  }

  return { ...summary, summaryFrequency, sweptResults, warnings };
}

export interface LineupStage {
  id: string;
  name: string;
  /** Matched stage gain in dB (|S21| when a two-port file drives the stage). */
  gainDB: number;
  /** Matched cumulative gain at this stage's output, dB. */
  cumulativeGainDB: number;
  /** Cascaded noise figure from the chain input through this stage, dB. */
  cumulativeNFdB: number;
  /** Input-referred IIP3 from the chain input through this stage, dBm. */
  cumulativeIIP3dBm: number;
  /** This stage's own output-referred OIP3, dBm. */
  oip3: number;
  /** Fraction of the chain's excess noise factor (F − 1) that this stage adds. */
  noiseShare: number;
  /** Fraction of the chain's input-referred 1/IIP3 that this stage adds. */
  linearityShare: number;
}

/**
 * Per-stage Friis lineup under the same matched-stage model as calculateCascade.
 *
 * Args:
 *   blocks: The chain from input to output.
 *   frequency: Summary frequency in Hz; required when a block carries a two-port file.
 *
 * Returns:
 *   One entry per stage, or null when a stage has no network at that frequency.
 */
export function stageLineup(blocks: CascadeBlock[], frequency?: number): LineupStage[] | null {
  const terms: { block: CascadeBlock; gainDB: number; noise: number; ip3: number }[] = [];
  let gainAhead = 1; // linear matched gain between the chain input and this stage
  for (const block of blocks) {
    const stage = networkAtFrequency(block, frequency);
    if (!stage) return null;
    const linIIP3 = Number.isFinite(block.oip3)
      ? 10 ** ((block.oip3 - stage.matchedGainDB) / 10)
      : Number.POSITIVE_INFINITY;
    terms.push({
      block,
      gainDB: stage.matchedGainDB,
      noise: (10 ** (block.nf / 10) - 1) / gainAhead,
      ip3: gainAhead / linIIP3,
    });
    gainAhead *= 10 ** (stage.matchedGainDB / 10);
  }

  const noiseTotal = terms.reduce((sum, term) => sum + term.noise, 0);
  const ip3Total = terms.reduce((sum, term) => sum + term.ip3, 0);
  let gainDB = 0;
  let noise = 0;
  let ip3 = 0;
  return terms.map(term => {
    gainDB += term.gainDB;
    noise += term.noise;
    ip3 += term.ip3;
    return {
      id: term.block.id,
      name: term.block.name,
      gainDB: term.gainDB,
      cumulativeGainDB: gainDB,
      cumulativeNFdB: 10 * Math.log10(1 + noise),
      cumulativeIIP3dBm: ip3 > 0 ? -10 * Math.log10(ip3) : Number.POSITIVE_INFINITY,
      oip3: term.block.oip3,
      noiseShare: noiseTotal > 0 ? term.noise / noiseTotal : 0,
      linearityShare: ip3Total > 0 ? term.ip3 / ip3Total : 0,
    };
  });
}

/** Thermal noise density at 290 K, the same −174 dBm/Hz convention as the SFDR calculator. */
export const KT0_DBM_PER_HZ = -174;

export interface LevelNode {
  /** Signal level at this interface, dBm. */
  signalDbm: number;
  /** Output-referred noise floor at this interface over the bandwidth, dBm. */
  noiseDbm: number;
  /** OIP3 of the stage that drives this interface; undefined at the chain input. */
  oip3Dbm?: number;
}

export interface LevelPlan {
  /** The chain input followed by one interface per stage output. */
  nodes: LevelNode[];
  snrOutDB: number;
  /** Two-tone spurious-free dynamic range, (2/3)(IIP3 − input-referred noise floor). */
  sfdrDB: number;
  /** Index into the stages of the one with the least OIP3 headroom, −1 when there are none. */
  tightestStage: number;
  tightestHeadroomDB: number;
}

/**
 * Signal, noise-floor and OIP3 levels at every interface of a lineup.
 *
 * Args:
 *   stages: Output of stageLineup.
 *   inputDbm: Signal power at the chain input, dBm.
 *   bandwidthHz: Noise bandwidth, Hz.
 */
export function levelPlan(stages: LineupStage[], inputDbm: number, bandwidthHz: number): LevelPlan {
  const kTB = KT0_DBM_PER_HZ + 10 * Math.log10(bandwidthHz);
  const nodes: LevelNode[] = [{ signalDbm: inputDbm, noiseDbm: kTB }];
  let tightestStage = -1;
  let tightestHeadroomDB = Number.POSITIVE_INFINITY;
  stages.forEach((stage, index) => {
    const signalDbm = inputDbm + stage.cumulativeGainDB;
    nodes.push({ signalDbm, noiseDbm: kTB + stage.cumulativeNFdB + stage.cumulativeGainDB, oip3Dbm: stage.oip3 });
    const headroom = stage.oip3 - signalDbm;
    if (headroom < tightestHeadroomDB) {
      tightestHeadroomDB = headroom;
      tightestStage = index;
    }
  });
  const last = stages.at(-1);
  const nfDB = last?.cumulativeNFdB ?? 0;
  const iip3 = last?.cumulativeIIP3dBm ?? Number.POSITIVE_INFINITY;
  return {
    nodes,
    snrOutDB: inputDbm - kTB - nfDB,
    sfdrDB: (2 / 3) * (iip3 - (kTB + nfDB)),
    tightestStage,
    tightestHeadroomDB,
  };
}

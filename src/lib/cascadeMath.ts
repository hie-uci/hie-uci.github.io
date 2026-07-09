import { ParseResult, cMag, SParamMatrix } from './sParameterEngine';

export interface CascadeBlock {
  id: string;
  name: string;
  gain: number; // dB
  nf: number; // dB
  oip3: number; // dBm
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
  cascadedGain: number; // dB
  cascadedNF: number; // dB
  cascadedIIP3: number; // dBm
  cascadedOIP3: number; // dBm
  summaryFrequency?: number;
  sweptResults?: SweptCascadeResult[];
}

function getGainAtFreq(block: CascadeBlock, targetFreq: number): number {
  if (!block.sParamData || block.sParamData.points.length === 0) {
    return block.gain;
  }
  
  const points = block.sParamData.points;
  const numPorts = points[0].matrix.length;
  if (numPorts < 2) {
    return block.gain;
  }

  const getMag = (pt: SParamMatrix) => cMag(pt.matrix[1][0]); // S21, port 1 -> port 2
  
  if (targetFreq <= points[0].frequency) {
    return 20 * Math.log10(getMag(points[0]) + 1e-15);
  }
  if (targetFreq >= points[points.length - 1].frequency) {
    const last = points[points.length - 1];
    return 20 * Math.log10(getMag(last) + 1e-15);
  }

  // Linear interpolation
  for (let i = 0; i < points.length - 1; i++) {
    if (targetFreq >= points[i].frequency && targetFreq <= points[i + 1].frequency) {
      const f1 = points[i].frequency;
      const f2 = points[i + 1].frequency;
      const g1 = 20 * Math.log10(getMag(points[i]) + 1e-15);
      const g2 = 20 * Math.log10(getMag(points[i+1]) + 1e-15);
      
      const fraction = (targetFreq - f1) / (f2 - f1);
      return g1 + fraction * (g2 - g1);
    }
  }
  
  return block.gain;
}

function getCascadeFrequencies(blocks: CascadeBlock[]): number[] {
  const frequencies = new Set<number>();
  blocks.forEach(b => {
    if (b.sParamData && b.sParamData.points.length > 0 && b.sParamData.points[0].matrix.length >= 2) {
      b.sParamData.points.forEach(p => frequencies.add(p.frequency));
    }
  });
  return Array.from(frequencies).sort((a, b) => a - b);
}

function computeCascadeAtFrequency(blocks: CascadeBlock[], frequency?: number): Omit<CascadeResult, 'summaryFrequency' | 'sweptResults'> {
  if (blocks.length === 0) {
    return { cascadedGain: 0, cascadedNF: 0, cascadedIIP3: 0, cascadedOIP3: 0 };
  }

  let totalGainDB = 0;
  let currentLinNF = 0;
  let currentLinIIP3Inv = 0; // 1 / IIP3_linear

  let accumulatedLinearGain = 1;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const gainDB = frequency === undefined ? block.gain : getGainAtFreq(block, frequency);
    
    // Convert to linear values
    const linGain = Math.pow(10, gainDB / 10);
    const linNF = Math.pow(10, block.nf / 10);
    
    // block OIP3 -> block IIP3
    const linIIP3 = Number.isFinite(block.oip3)
      ? Math.pow(10, (block.oip3 - gainDB) / 10)
      : Number.POSITIVE_INFINITY;

    if (i === 0) {
      currentLinNF = linNF;
      currentLinIIP3Inv = 1 / linIIP3;
    } else {
      currentLinNF += (linNF - 1) / accumulatedLinearGain;
      currentLinIIP3Inv += accumulatedLinearGain / linIIP3;
    }

    accumulatedLinearGain *= linGain;
    totalGainDB += gainDB;
  }

  const cascadedNFDB = 10 * Math.log10(currentLinNF);
  const cascadedIIP3DBm = currentLinIIP3Inv > 0
    ? 10 * Math.log10(1 / currentLinIIP3Inv)
    : Number.POSITIVE_INFINITY;
  const cascadedOIP3DBm = cascadedIIP3DBm + totalGainDB;

  return {
    cascadedGain: totalGainDB,
    cascadedNF: cascadedNFDB,
    cascadedIIP3: cascadedIIP3DBm,
    cascadedOIP3: cascadedOIP3DBm,
  };
}

export function calculateCascade(blocks: CascadeBlock[], options: { summaryFrequency?: number } = {}): CascadeResult {
  const sortedFreqs = getCascadeFrequencies(blocks);
  const summaryFrequency = options.summaryFrequency ?? sortedFreqs[Math.floor(sortedFreqs.length / 2)];
  const summary = computeCascadeAtFrequency(blocks, summaryFrequency);
  let sweptResults: SweptCascadeResult[] | undefined = undefined;

  if (sortedFreqs.length > 0) {
    sweptResults = sortedFreqs.map(f => {
      const result = computeCascadeAtFrequency(blocks, f);
      return {
        frequency: f,
        cascadedGain: result.cascadedGain,
        cascadedNF: result.cascadedNF,
        cascadedIIP3: result.cascadedIIP3,
        cascadedOIP3: result.cascadedOIP3,
      };
    });
  }

  return {
    ...summary,
    summaryFrequency,
    sweptResults,
  };
}

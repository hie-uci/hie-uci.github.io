export interface Complex {
  real: number;
  imag: number;
}

export const cAdd = (a: Complex, b: Complex): Complex => ({ real: a.real + b.real, imag: a.imag + b.imag });
export const cSub = (a: Complex, b: Complex): Complex => ({ real: a.real - b.real, imag: a.imag - b.imag });
export const cMul = (a: Complex, b: Complex): Complex => ({
  real: a.real * b.real - a.imag * b.imag,
  imag: a.real * b.imag + a.imag * b.real
});
export const cConj = (a: Complex): Complex => ({ real: a.real, imag: -a.imag });
export const cDiv = (a: Complex, b: Complex): Complex => {
  const den = b.real * b.real + b.imag * b.imag;
  if (den === 0) return { real: 0, imag: 0 };
  return {
    real: (a.real * b.real + a.imag * b.imag) / den,
    imag: (a.imag * b.real - a.real * b.imag) / den
  };
};

export const cMag = (a: Complex): number => Math.sqrt(a.real * a.real + a.imag * a.imag);
export const cPhase = (a: Complex): number => Math.atan2(a.imag, a.real);
export const cDB = (a: Complex): number => 20 * Math.log10(cMag(a) + 1e-15);

const cScaleReal = (a: Complex, scalar: number): Complex => ({ real: a.real * scalar, imag: a.imag * scalar });

function complexVectorNorm(v: Complex[]): number {
  return Math.sqrt(v.reduce((sum, value) => sum + value.real * value.real + value.imag * value.imag, 0));
}

function multiplyByGramMatrix(S: Complex[][], v: Complex[]): Complex[] {
  const n = S.length;
  const sv: Complex[] = [];
  for (let i = 0; i < n; i++) {
    let sum = { real: 0, imag: 0 };
    for (let j = 0; j < n; j++) {
      sum = cAdd(sum, cMul(S[i][j], v[j]));
    }
    sv.push(sum);
  }

  const result: Complex[] = [];
  for (let j = 0; j < n; j++) {
    let sum = { real: 0, imag: 0 };
    for (let i = 0; i < n; i++) {
      sum = cAdd(sum, cMul(cConj(S[i][j]), sv[i]));
    }
    result.push(sum);
  }
  return result;
}

export function spectralNorm(S: Complex[][]): number {
  const n = S.length;
  if (n === 0) return 0;

  let v = new Array(n).fill(null).map(() => ({ real: 1 / Math.sqrt(n), imag: 0 }));
  for (let iter = 0; iter < 80; iter++) {
    const next = multiplyByGramMatrix(S, v);
    const norm = complexVectorNorm(next);
    if (norm < 1e-15) return 0;
    v = next.map(value => cScaleReal(value, 1 / norm));
  }

  const hv = multiplyByGramMatrix(S, v);
  let rayleigh = { real: 0, imag: 0 };
  for (let i = 0; i < n; i++) {
    rayleigh = cAdd(rayleigh, cMul(cConj(v[i]), hv[i]));
  }
  return Math.sqrt(Math.max(rayleigh.real, 0));
}

// Matrix operations
export const mIdentity = (n: number): Complex[][] => {
  const I: Complex[][] = [];
  for (let i = 0; i < n; i++) {
    I.push(new Array(n).fill({ real: 0, imag: 0 }));
    I[i][i] = { real: 1, imag: 0 };
  }
  return I;
};

export const mAdd = (A: Complex[][], B: Complex[][]): Complex[][] => 
  A.map((row, i) => row.map((val, j) => cAdd(val, B[i][j])));

export const mSub = (A: Complex[][], B: Complex[][]): Complex[][] => 
  A.map((row, i) => row.map((val, j) => cSub(val, B[i][j])));

export const mMul = (A: Complex[][], B: Complex[][]): Complex[][] => {
  const n = A.length;
  const C: Complex[][] = mIdentity(n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sum = { real: 0, imag: 0 };
      for (let k = 0; k < n; k++) {
        sum = cAdd(sum, cMul(A[i][k], B[k][j]));
      }
      C[i][j] = sum;
    }
  }
  return C;
};

export const mScale = (A: Complex[][], scalar: Complex): Complex[][] =>
  A.map(row => row.map(val => cMul(val, scalar)));

// Matrix inverse via Gaussian elimination with partial pivoting
export const mInverse = (A: Complex[][]): Complex[][] | null => {
  const n = A.length;
  const M: Complex[][] = [];
  for (let i = 0; i < n; i++) {
    M.push([...A[i], ...mIdentity(n)[i]]);
  }

  for (let i = 0; i < n; i++) {
    let pivot = i;
    let maxMag = cMag(M[i][i]);
    for (let j = i + 1; j < n; j++) {
      const mag = cMag(M[j][i]);
      if (mag > maxMag) {
        maxMag = mag;
        pivot = j;
      }
    }
    if (maxMag < 1e-15) return null; // Singular matrix

    if (pivot !== i) {
      const temp = M[i];
      M[i] = M[pivot];
      M[pivot] = temp;
    }

    const div = M[i][i];
    for (let j = 0; j < 2 * n; j++) {
      M[i][j] = cDiv(M[i][j], div);
    }

    for (let j = 0; j < n; j++) {
      if (j !== i) {
        const factor = M[j][i];
        for (let k = 0; k < 2 * n; k++) {
          M[j][k] = cSub(M[j][k], cMul(factor, M[i][k]));
        }
      }
    }
  }

  const inv: Complex[][] = [];
  for (let i = 0; i < n; i++) {
    inv.push(M[i].slice(n, 2 * n));
  }
  return inv;
};

function normalizePortReferences(z0: number | number[], n: number): number[] | null {
  const values = Array.isArray(z0) ? z0 : new Array(n).fill(z0);
  if (values.length !== n || values.some(value => !Number.isFinite(value) || value <= 0)) return null;
  return values;
}

function scaleMatrixSides(A: Complex[][], left: number[], right: number[]): Complex[][] {
  return A.map((row, i) => row.map((value, j) => cScaleReal(value, left[i] * right[j])));
}

export const sToZ = (S: Complex[][], z0: number | number[]): Complex[][] | null => {
  const n = S.length;
  const references = normalizePortReferences(z0, n);
  if (!references) return null;
  const I = mIdentity(n);
  const I_minus_S = mSub(I, S);
  const I_plus_S = mAdd(I, S);
  
  const inv = mInverse(I_minus_S);
  if (!inv) return null;

  const normalizedZ = mMul(I_plus_S, inv);
  const roots = references.map(Math.sqrt);
  return scaleMatrixSides(normalizedZ, roots, roots);
};

export const sToY = (S: Complex[][], z0: number | number[]): Complex[][] | null => {
  const n = S.length;
  const references = normalizePortReferences(z0, n);
  if (!references) return null;
  const I = mIdentity(n);
  const I_minus_S = mSub(I, S);
  const I_plus_S = mAdd(I, S);
  
  const inv = mInverse(I_plus_S);
  if (!inv) return null;

  const normalizedY = mMul(I_minus_S, inv);
  const inverseRoots = references.map(value => 1 / Math.sqrt(value));
  return scaleMatrixSides(normalizedY, inverseRoots, inverseRoots);
};

export type MixedModePairing = '12-34' | '13-24' | '14-23';

const MIXED_MODE_PAIRS: Record<MixedModePairing, [[number, number], [number, number]]> = {
  '12-34': [[0, 1], [2, 3]],
  '13-24': [[0, 2], [1, 3]],
  '14-23': [[0, 3], [1, 2]],
};

// Converts four real-reference single-ended ports into two differential/common pairs.
export const sToMixedMode = (S: Complex[][], pairing: MixedModePairing = '12-34'): Complex[][] | null => {
  if (S.length !== 4) return null;
  const [pair1, pair2] = MIXED_MODE_PAIRS[pairing];
  const row = (positive: number, negative: number, common: boolean) => {
    const values = [0, 0, 0, 0];
    values[positive] = 1;
    values[negative] = common ? 1 : -1;
    return values;
  };
  const M_vals = [
    row(pair1[0], pair1[1], false),
    row(pair2[0], pair2[1], false),
    row(pair1[0], pair1[1], true),
    row(pair2[0], pair2[1], true),
  ];
  const s2 = 1.0 / Math.sqrt(2);
  
  const M: Complex[][] = [];
  const M_inv: Complex[][] = []; // for orthogonal matrix, M_inv = M_transpose
  
  for (let i=0; i<4; i++) {
    M.push([]);
    M_inv.push([]);
    for (let j=0; j<4; j++) {
      M[i].push({ real: M_vals[i][j] * s2, imag: 0 });
      M_inv[i].push({ real: M_vals[j][i] * s2, imag: 0 }); // Transpose
    }
  }

  // S_mm = M * S * M_inv
  const MS = mMul(M, S);
  return mMul(MS, M_inv);
};

export interface SParamMatrix {
  frequency: number; // Hz
  matrix: Complex[][]; // NxN
  z0: number;
  portZ0?: number[];
  vswr?: number[];
  Y?: Complex[][];
  Z?: Complex[][];
  ESR?: number[];
  Rp?: number[];
  K?: number;
  deltaMagnitude?: number;
  unconditionallyStable?: boolean;
  groupDelay?: number; // in seconds
  passivitySingularValue?: number;
}

export interface ParseResult {
  points: SParamMatrix[];
  isPassive: boolean;
  maxPassivitySingularValue: number;
  warnings?: string[];
  errors?: string[];
}

export function parseTouchstone(content: string, numPorts: number): ParseResult {
  const lines = content.split('\n');
  let optionLine = '';
  const dataTokens: string[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];
  let isTouchstone2 = false;
  let inNetworkData = false;
  let inNoiseData = false;
  let collectingReferences = false;
  let matrixFormat = 'FULL';
  let twoPortDataOrder: '21_12' | '12_21' = '21_12';
  let sawTwoPortDataOrder = false;
  let declaredFrequencyCount: number | null = null;
  const keywordReferences: number[] = [];

  const addWarning = (message: string) => {
    if (!warnings.includes(message)) {
      warnings.push(message);
    }
  };
  const addError = (message: string) => {
    if (!errors.includes(message)) errors.push(message);
  };

  for (const line of lines) {
    let raw = line.trim();
    if (!raw) continue;
    const commentIdx = raw.indexOf('!');
    if (commentIdx !== -1) {
      raw = raw.substring(0, commentIdx).trim();
    }
    if (!raw) continue;

    if (raw.startsWith('#')) {
      optionLine = raw;
      continue;
    }

    if (raw.startsWith('[')) {
      collectingReferences = false;
      const match = raw.match(/^\[([^\]]+)\]\s*(.*)$/);
      if (!match) continue;
      const keyword = match[1].trim().toUpperCase();
      const value = match[2].trim();
      if (keyword === 'VERSION') {
        isTouchstone2 = true;
      } else if (keyword === 'NUMBER OF PORTS') {
        const declaredPorts = /^\d+$/.test(value) ? parseInt(value) : null;
        if (declaredPorts !== null && declaredPorts !== numPorts) {
          addError(`File declares ${declaredPorts} ports, but the filename extension selected ${numPorts} ports.`);
        }
      } else if (keyword === 'REFERENCE') {
        keywordReferences.push(...value.split(/\s+/).map(Number).filter(Number.isFinite));
        collectingReferences = keywordReferences.length < numPorts;
      } else if (keyword === 'MATRIX FORMAT') {
        matrixFormat = value.toUpperCase() || 'FULL';
      } else if (keyword === 'TWO-PORT DATA ORDER') {
        sawTwoPortDataOrder = true;
        const normalized = value.toUpperCase();
        if (normalized === '12_21' || normalized === '21_12') twoPortDataOrder = normalized;
        else addError(`Unsupported [Two-Port Data Order] value: ${value || '(empty)'}.`);
      } else if (keyword === 'NUMBER OF FREQUENCIES') {
        declaredFrequencyCount = /^\d+$/.test(value) ? parseInt(value) : null;
        if (declaredFrequencyCount === null) addError('Invalid [Number of Frequencies] value.');
      } else if (keyword === 'MIXED-MODE ORDER') {
        addError('Mixed-mode ordered Touchstone data is not accepted as single-ended network data; convert [Mixed-Mode Order] explicitly before upload.');
      } else if (keyword === 'NETWORK DATA') {
        isTouchstone2 = true;
        inNetworkData = true;
        inNoiseData = false;
      } else if (keyword === 'NOISE DATA') {
        inNetworkData = false;
        inNoiseData = true;
      } else if (keyword === 'END') {
        inNetworkData = false;
        inNoiseData = false;
      }
      continue;
    }

    const tokens = raw.split(/\s+/);
    if (collectingReferences && !inNetworkData) {
      keywordReferences.push(...tokens.map(Number).filter(Number.isFinite));
      collectingReferences = keywordReferences.length < numPorts;
    } else if (!inNoiseData && (!isTouchstone2 || inNetworkData)) {
      dataTokens.push(...tokens);
    }
  }

  let freqMultiplier = 1e9; // default GHz
  let format = 'MA';
  let parameterType = 'S';
  const optionReferences: number[] = [];

  if (optionLine) {
    const opts = optionLine.substring(1).trim().toUpperCase().split(/\s+/);
    for (let i = 0; i < opts.length; i++) {
      const opt = opts[i];
      if (opt === 'HZ') freqMultiplier = 1;
      else if (opt === 'KHZ') freqMultiplier = 1e3;
      else if (opt === 'MHZ') freqMultiplier = 1e6;
      else if (opt === 'GHZ') freqMultiplier = 1e9;
      else if (opt === 'DB') format = 'DB';
      else if (opt === 'MA') format = 'MA';
      else if (opt === 'RI') format = 'RI';
      else if (['S', 'Y', 'Z', 'H', 'G'].includes(opt)) parameterType = opt;
      else if (opt === 'R') {
        for (let j = i + 1; j < opts.length; j++) {
          const reference = Number(opts[j]);
          if (!Number.isFinite(reference)) break;
          optionReferences.push(reference);
        }
        break;
      }
    }
  }

  if (parameterType !== 'S') addError(`Unsupported Touchstone parameter type ${parameterType}; this tool accepts S-parameters only.`);
  if (matrixFormat !== 'FULL') addError(`Unsupported [Matrix Format] ${matrixFormat}; only FULL matrices are accepted.`);
  if (isTouchstone2 && numPorts === 2 && !sawTwoPortDataOrder) {
    addWarning('The v2 file omits required [Two-Port Data Order]; legacy 21_12 ordering was assumed.');
  }

  const rawReferences = keywordReferences.length ? keywordReferences : optionReferences;
  const portZ0 = rawReferences.length === 0
    ? new Array(numPorts).fill(50)
    : rawReferences.length === 1
      ? new Array(numPorts).fill(rawReferences[0])
      : rawReferences.slice(0, numPorts);
  if (portZ0.length !== numPorts || portZ0.some(value => !Number.isFinite(value) || value <= 0)) {
    addError(`Expected one or ${numPorts} positive real reference impedances, received ${rawReferences.length}.`);
  }

  if (errors.length) {
    return { points: [], isPassive: true, maxPassivitySingularValue: 0, warnings, errors };
  }

  const z0 = portZ0[0];

  const points: SParamMatrix[] = [];
  const tokensPerPoint = 1 + 2 * numPorts * numPorts;
  
  let i = 0;
  let isPassive = true;
  let maxPassivitySingularValue = 0;

  while (i + tokensPerPoint <= dataTokens.length) {
    const numericRecord = dataTokens.slice(i, i + tokensPerPoint).map(Number);
    if (numericRecord.some(value => !Number.isFinite(value))) {
      addError('Network data contains a non-numeric or non-finite value; no zero substitution was performed.');
      break;
    }
    const fVal = parseFloat(dataTokens[i]);
    if (isNaN(fVal)) break; // Malformed data

    const f = fVal * freqMultiplier;
    if (!Number.isFinite(f) || f < 0) {
      addError('Frequency values must be finite and non-negative.');
      break;
    }
    if (points.length && f <= points[points.length - 1].frequency) {
      if (!isTouchstone2 && numPorts === 2) {
        addWarning('Stopped at a non-increasing frequency record; it may be a Touchstone v1 noise-data block.');
      } else {
        addError('Network-data frequencies must be strictly increasing.');
      }
      break;
    }

    const matrix: Complex[][] = [];
    for (let r = 0; r < numPorts; r++) {
      matrix.push(new Array(numPorts).fill({real: 0, imag: 0}));
    }

    let t = i + 1;
    if (numPorts === 2) {
      matrix[0][0] = createComplex(dataTokens[t], dataTokens[t+1], format);
      const second = createComplex(dataTokens[t+2], dataTokens[t+3], format);
      const third = createComplex(dataTokens[t+4], dataTokens[t+5], format);
      matrix[twoPortDataOrder === '21_12' ? 1 : 0][twoPortDataOrder === '21_12' ? 0 : 1] = second;
      matrix[twoPortDataOrder === '21_12' ? 0 : 1][twoPortDataOrder === '21_12' ? 1 : 0] = third;
      matrix[1][1] = createComplex(dataTokens[t+6], dataTokens[t+7], format);
    } else {
      // Touchstone full matrices with three or more ports are serialized row-by-row.
      for (let r = 0; r < numPorts; r++) {
        for (let c = 0; c < numPorts; c++) {
          matrix[r][c] = createComplex(dataTokens[t], dataTokens[t+1], format);
          t += 2;
        }
      }
    }
    
    const passivitySingularValue = spectralNorm(matrix);
    maxPassivitySingularValue = Math.max(maxPassivitySingularValue, passivitySingularValue);
    if (passivitySingularValue > 1.011579) {
      isPassive = false;
    }

    points.push({ frequency: f, matrix, z0, portZ0: [...portZ0], passivitySingularValue });
    i += tokensPerPoint;
  }

  if (i < dataTokens.length && !warnings.some(warning => warning.includes('noise-data'))) {
    addWarning(`Ignored ${dataTokens.length - i} trailing token(s) that do not form a complete network-data record.`);
  }
  if (declaredFrequencyCount !== null && points.length !== declaredFrequencyCount) {
    addError(`File declares ${declaredFrequencyCount} network frequencies but ${points.length} complete records were parsed.`);
  }

  // Post-process metrics (Y, Z, VSWR, ESR, Rp, K, Group Delay)
  for (let k = 0; k < points.length; k++) {
    const S = points[k].matrix;
    
    const vswr: number[] = [];
    for (let p = 0; p < numPorts; p++) {
      const mag = cMag(S[p][p]);
      vswr.push(mag < 1 ? (1 + mag) / (1 - mag) : Number.POSITIVE_INFINITY);
    }
    points[k].vswr = vswr;

    const references = points[k].portZ0 ?? z0;
    const Y = sToY(S, references);
    const Z = sToZ(S, references);
    points[k].Y = Y || undefined;
    points[k].Z = Z || undefined;

    const esr: number[] = [];
    const rp: number[] = [];
    if (Z && Y) {
      for (let p = 0; p < numPorts; p++) {
        esr.push(Z[p][p].real);
        rp.push(Y[p][p].real === 0 ? Number.POSITIVE_INFINITY : 1 / Y[p][p].real);
      }
    }
    points[k].ESR = esr.length ? esr : undefined;
    points[k].Rp = rp.length ? rp : undefined;

    if (numPorts === 2) {
      const s11 = S[0][0], s21 = S[1][0], s12 = S[0][1], s22 = S[1][1];
      const delta = cSub(cMul(s11, s22), cMul(s12, s21));
      const magS11_2 = Math.pow(cMag(s11), 2);
      const magS22_2 = Math.pow(cMag(s22), 2);
      const magDelta_2 = Math.pow(cMag(delta), 2);
      const den = 2 * cMag(cMul(s12, s21));
      points[k].K = (1 - magS11_2 - magS22_2 + magDelta_2) / (den + 1e-15);
      points[k].deltaMagnitude = cMag(delta);
      points[k].unconditionallyStable = points[k].K! > 1 && points[k].deltaMagnitude! < 1;
    }
  }

  if (numPorts === 2 && points.length > 1) {
    const unwrapped = points.map(point => cPhase(point.matrix[1][0]));
    for (let k = 1; k < unwrapped.length; k++) {
      let delta = unwrapped[k] - unwrapped[k - 1];
      while (delta > Math.PI) { unwrapped[k] -= 2 * Math.PI; delta -= 2 * Math.PI; }
      while (delta < -Math.PI) { unwrapped[k] += 2 * Math.PI; delta += 2 * Math.PI; }
    }
    for (let k = 0; k < points.length; k++) {
      const low = k === 0 ? 0 : k - 1;
      const high = k === points.length - 1 ? points.length - 1 : k + 1;
      const df = points[high].frequency - points[low].frequency;
      points[k].groupDelay = -(unwrapped[high] - unwrapped[low]) / (2 * Math.PI * df);
    }
  }

  return { points, isPassive, maxPassivitySingularValue, warnings, errors };
}

function createComplex(v1: string, v2: string, format: string): Complex {
  const n1 = parseFloat(v1);
  const n2 = parseFloat(v2);
  if (isNaN(n1) || isNaN(n2)) return { real: 0, imag: 0 };
  
  if (format === 'DB') {
    const mag = Math.pow(10, n1 / 20);
    const rad = n2 * Math.PI / 180;
    return { real: mag * Math.cos(rad), imag: mag * Math.sin(rad) };
  } else if (format === 'MA') {
    const rad = n2 * Math.PI / 180;
    return { real: n1 * Math.cos(rad), imag: n1 * Math.sin(rad) };
  } else {
    // RI
    return { real: n1, imag: n2 };
  }
}

export interface TDRPoint {
  time: number;
  timeNs: number;
  timePs: number;
  impulse: number;
  step: number;
  impedance: number;
}

export function getTdrValidationError(points: SParamMatrix[]): string | null {
  if (points.length < 2) return 'TDR requires at least two frequency points.';
  const df = points[1].frequency - points[0].frequency;
  if (!Number.isFinite(df) || df <= 0) return 'TDR requires strictly increasing frequencies.';
  for (let i = 2; i < points.length; i++) {
    const currentDf = points[i].frequency - points[i - 1].frequency;
    if (Math.abs(currentDf - df) > Math.max(Math.abs(df) * 1e-6, 1e-6)) {
      return 'TDR requires uniformly spaced frequency samples; resample the network data before transforming.';
    }
  }
  const startBin = points[0].frequency / df;
  if (Math.abs(startBin - Math.round(startBin)) > 1e-6) {
    return 'TDR requires the first measured frequency to align with the uniform Δf grid used for DC extrapolation.';
  }
  return null;
}

function fft(arr: Complex[], invert: boolean): Complex[] {
  const n = arr.length;
  if (n === 1) return [arr[0]];

  const even = fft(arr.filter((_, i) => i % 2 === 0), invert);
  const odd = fft(arr.filter((_, i) => i % 2 !== 0), invert);

  const res = new Array(n);
  const angleSign = invert ? 1 : -1;
  for (let k = 0; k < n / 2; k++) {
    const angle = (2 * Math.PI * k) / n * angleSign;
    const w = { real: Math.cos(angle), imag: Math.sin(angle) };
    const t = cMul(w, odd[k]);
    res[k] = cAdd(even[k], t);
    res[k + n / 2] = cSub(even[k], t);
  }
  return res;
}

export function computeTDR(points: SParamMatrix[], portIndex: number = 0): TDRPoint[] {
  if (getTdrValidationError(points)) return [];
  if (portIndex < 0 || portIndex >= points[0].matrix.length) return [];

  const df = points[1].frequency - points[0].frequency;

  const f0 = points[0].frequency;
  const s11Points: Complex[] = [];
  
  // Without a DC measurement, use a constant-real, zero-imaginary extrapolation to DC.
  let dcVal = { real: points[0].matrix[portIndex][portIndex].real, imag: 0 };
  
  const startIdx = Math.round(f0 / df);
  if (startIdx === 0) {
    dcVal = points[0].matrix[portIndex][portIndex]; 
    s11Points.push(dcVal);
    for (let i = 1; i < points.length; i++) s11Points.push(points[i].matrix[portIndex][portIndex]);
  } else {
    s11Points.push(dcVal); 
    for (let i = 1; i < startIdx; i++) {
       const frac = i / startIdx;
       s11Points.push({
         real: dcVal.real + frac * (points[0].matrix[portIndex][portIndex].real - dcVal.real),
         imag: frac * points[0].matrix[portIndex][portIndex].imag
       });
    }
    for (let i = 0; i < points.length; i++) s11Points.push(points[i].matrix[portIndex][portIndex]);
  }

  const M = s11Points.length;
  let N = 1;
  while (N < M * 2) N *= 2; 

  const X = new Array(N).fill({ real: 0, imag: 0 });
  
  for (let i = 0; i < M; i++) {
    // One-sided raised-cosine low-pass taper: unity at DC and zero at the highest sample.
    const window = M === 1 ? 1 : 0.5 * (1 + Math.cos(Math.PI * i / (M - 1)));
    X[i] = {
      real: s11Points[i].real * window,
      imag: s11Points[i].imag * window
    };
  }

  for (let i = 1; i < M; i++) {
    if (N - i > 0) {
      X[N - i] = { real: X[i].real, imag: -X[i].imag };
    }
  }

  const res = fft(X, true);
  const x = res.map(c => ({ real: c.real / N, imag: c.imag / N }));

  const dt = 1 / (N * df);
  const tdr: TDRPoint[] = [];

  const z0 = points[0].z0 || 50;
  
  let stepSum = 0;

  for (let i = 0; i < N / 2; i++) {
    const time = i * dt;
    const impulse = x[i].real;
    
    stepSum += impulse; 
    let rho = stepSum;
    
    if (rho > 0.999) rho = 0.999;
    if (rho < -0.999) rho = -0.999;

    const impedance = z0 * (1 + rho) / (1 - rho);

    tdr.push({
      time,
      timeNs: time * 1e9,
      timePs: time * 1e12,
      impulse,
      step: rho,
      impedance
    });
  }

  return tdr;
}

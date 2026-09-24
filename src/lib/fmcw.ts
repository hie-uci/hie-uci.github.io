/** Speed of light in vacuum, m/s. */
export const C0 = 299_792_458;

export interface ChirpParams {
  bandwidthHz: number;
  chirpS: number;
  ifBandwidthHz: number;
}

export interface ChirpDerived {
  slopeHzPerS: number;
  /** c / 2B: one FFT bin of the beat spectrum. */
  rangeResolutionM: number;
  /** Range whose beat frequency equals the IF bandwidth. */
  maxRangeM: number;
  /** Resolution cells between zero range and the IF limit. */
  bins: number;
}

export type RangeWindow = 'rect' | 'hann';

/**
 * Ideal linear-chirp figures for a stationary target.
 *
 * Throws:
 *   RangeError: when a parameter is not a positive finite number.
 */
export function chirpDerived({ bandwidthHz, chirpS, ifBandwidthHz }: ChirpParams): ChirpDerived {
  for (const [name, value] of [['bandwidth', bandwidthHz], ['chirp time', chirpS], ['IF bandwidth', ifBandwidthHz]] as const) {
    if (!(Number.isFinite(value) && value > 0)) throw new RangeError(`FMCW ${name} must be a positive number, got ${value}.`);
  }
  const slopeHzPerS = bandwidthHz / chirpS;
  return {
    slopeHzPerS,
    rangeResolutionM: C0 / (2 * bandwidthHz),
    maxRangeM: (ifBandwidthHz * C0) / (2 * slopeHzPerS),
    bins: ifBandwidthHz * chirpS,
  };
}

/** Round-trip delay 2R/c, seconds. */
export const roundTripDelay = (rangeM: number) => (2 * rangeM) / C0;

/** Beat frequency S·τ, Hz. */
export const beatFrequency = (rangeM: number, slopeHzPerS: number) => slopeHzPerS * roundTripDelay(rangeM);

const sinc = (x: number) => (Math.abs(x) < 1e-12 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x));

/**
 * Amplitude response of a windowed tone, normalised to 1 at the tone.
 *
 * Args:
 *   u: Offset from the tone in FFT bins (one bin = 1/Tc = one range cell).
 *   window: Rectangular or Hann.
 */
export function windowResponse(u: number, window: RangeWindow): number {
  if (window === 'rect') return Math.abs(sinc(u));
  // Hann = 0.5 − 0.5 cos: its transform is a sinc plus two half-weight sincs one bin either side.
  return Math.abs(sinc(u) + 0.5 * (sinc(u - 1) + sinc(u + 1)));
}

/**
 * Range profile in dB for equal-strength targets summed in power (random relative phase).
 * 0 dB is the peak of a single target.
 *
 * Args:
 *   rangesM: Ranges at which to evaluate the profile.
 *   targetsM: Target ranges.
 *   rangeResolutionM: c / 2B.
 *   window: Range-FFT window.
 *   floorDb: Lowest value returned, dB.
 */
export function rangeProfileDb(rangesM: number[], targetsM: number[], rangeResolutionM: number, window: RangeWindow, floorDb = -80): number[] {
  return rangesM.map((r) => {
    const power = targetsM.reduce((sum, t) => sum + windowResponse((r - t) / rangeResolutionM, window) ** 2, 0);
    return Math.max(floorDb, 10 * Math.log10(power));
  });
}

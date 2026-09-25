/** Folder of the individual die photos. */
export const HERO_DIE_DIR = '/images/chips/individual/';

/** A chip die scattered behind the Home hero, positioned in percent of the hero box. */
export interface HeroDie {
  file: string;
  /** Width in px. */
  width: number;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  opacity: number;
  blurPx: number;
  rotateDeg: number;
}

/** The 13 dies of the hero mosaic. The static fallback and the 3D field both read this list. */
export const HERO_DIES: HeroDie[] = [
  // Top-left cluster
  { file: 'sheet1-01-pmcw-radar.png', width: 240, top: 6, left: 3, opacity: 0.16, blurPx: 0.5, rotateDeg: -8 },
  { file: 'sheet1-05-3.1-4.7-ghz-class-d-vco.png', width: 160, top: 22, left: 12, opacity: 0.12, blurPx: 1, rotateDeg: 5 },
  // Top-right cluster
  { file: 'sheet1-06-174-232-ghz-sige-vco.png', width: 200, top: 4, right: 6, opacity: 0.15, blurPx: 0.5, rotateDeg: 12 },
  { file: 'sheet2-01-23-27-and-69-81-ghz-mimo-fmcw-radar.png', width: 170, top: 18, right: 18, opacity: 0.11, blurPx: 1, rotateDeg: -4 },
  // Middle-left
  { file: 'sheet1-03-110-143-ghz-pa-in-65nm-cmos.png', width: 190, top: 42, left: 2, opacity: 0.14, blurPx: 0.5, rotateDeg: 3 },
  { file: 'sheet3-02-90-ghz-efficient-oscillator.png', width: 140, top: 55, left: 14, opacity: 0.1, blurPx: 1.5, rotateDeg: -10 },
  // Middle-right
  { file: 'sheet1-02-low-noise-76-82-ghz-vco.png', width: 210, top: 38, right: 3, opacity: 0.16, blurPx: 0.5, rotateDeg: -5 },
  { file: 'sheet2-4-channel-tia-for-mems-pnt.png', width: 150, top: 52, right: 16, opacity: 0.11, blurPx: 1, rotateDeg: 7 },
  // Bottom-left
  { file: 'sheet2-0.48-thz-frequency-doubler.png', width: 180, bottom: 18, left: 6, opacity: 0.13, blurPx: 1, rotateDeg: 9 },
  // Bottom-right cluster
  { file: 'sheet2-0.32-thz-sige-transmitter.png', width: 260, bottom: 8, right: 5, opacity: 0.18, blurPx: 0.3, rotateDeg: 6 },
  { file: 'sheet1-04-49-63-ghz-fmcw-radar.png', width: 150, bottom: 25, right: 22, opacity: 0.1, blurPx: 1.5, rotateDeg: -12 },
  // Centre-bottom accent
  { file: 'sheet2-02-monostatic-50-60-ghz-fmcw-radar.png', width: 170, bottom: 12, left: 38, opacity: 0.09, blurPx: 1.5, rotateDeg: 3 },
  { file: 'sheet2-0.92-thz-sige-quadrupler.png', width: 130, bottom: 30, left: 28, opacity: 0.08, blurPx: 2, rotateDeg: -6 },
];

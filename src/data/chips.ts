// Fabricated dies. The chip gallery, the homepage showcase and the spectrum
// ruler all read from this list.

export type ChipCategory =
  | 'Radar Systems'
  | 'Power Generation & PA'
  | 'VCOs & Oscillators'
  | 'Sub-THz & THz Sources'
  | 'Analog & Special Circuits';

export interface Chip {
  id: number;
  slug: string;
  name: string;
  /** Compact label for thumbnails and the ruler. */
  shortName: string;
  technology: string;
  /** Frequency exactly as the lab states it. */
  frequency: string;
  category: ChipCategory;
  /** Full-resolution die photo, used by the lightbox. */
  image: string;
  /** Web-sized derivatives (see scripts/make-chip-derivatives.py). */
  web: string;
  thumb: string;
  width: number;
  height: number;
  /**
   * Operating bands in GHz, only where the stated frequency gives numbers.
   * A point frequency is written as [f, f]. Chips described only as
   * "mm-Wave" or "Broadband" have none and stay off the spectrum ruler.
   */
  bandsGHz?: [number, number][];
}

const img = (file: string) => `/images/chips/individual/${file}`;
const web = (slug: string) => `/images/chips/web/${slug}-1200.webp`;
const thumb = (slug: string) => `/images/chips/web/${slug}-480.webp`;

function chip(c: Omit<Chip, 'web' | 'thumb'>): Chip {
  return { ...c, web: web(c.slug), thumb: thumb(c.slug) };
}

export const chips: Chip[] = [
  // Radar systems
  chip({ id: 1, slug: 'pmcw-radar', name: 'Doppler-Assisted PMCW Radar', shortName: 'PMCW Radar', technology: '65nm CMOS', frequency: 'mm-Wave', category: 'Radar Systems', image: img('sheet1-01-pmcw-radar.png'), width: 838, height: 544 }),
  chip({ id: 2, slug: 'fmcw-radar-49-63', name: '49–63 GHz FMCW Radar', shortName: '49–63 GHz FMCW Radar', technology: '22nm CMOS', frequency: '49–63 GHz', category: 'Radar Systems', image: img('sheet1-04-49-63-ghz-fmcw-radar.png'), width: 835, height: 445, bandsGHz: [[49, 63]] }),
  chip({ id: 3, slug: 'mimo-fmcw-radar', name: '23–27 & 69–81 GHz MIMO FMCW Radar', shortName: '23–27 / 69–81 GHz MIMO FMCW', technology: '65nm CMOS', frequency: '23–27, 69–81 GHz', category: 'Radar Systems', image: img('DB_MIMO.png'), width: 760, height: 564, bandsGHz: [[23, 27], [69, 81]] }),
  chip({ id: 4, slug: 'fmcw-radar-50-60', name: 'Monostatic 50–60 GHz FMCW Radar', shortName: '50–60 GHz FMCW Radar', technology: '65nm CMOS', frequency: '50–60 GHz', category: 'Radar Systems', image: img('sheet2-02-monostatic-50-60-ghz-fmcw-radar.png'), width: 834, height: 472, bandsGHz: [[50, 60]] }),

  // High-power and amplifiers
  chip({ id: 5, slug: 'pa-110-143', name: '110–143 GHz PA (19 dBm Psat)', shortName: '110–143 GHz PA', technology: '65nm CMOS', frequency: '110–143 GHz', category: 'Power Generation & PA', image: img('sheet1-03-110-143-ghz-pa-in-65nm-cmos.png'), width: 838, height: 513, bandsGHz: [[110, 143]] }),

  // Oscillators and VCOs
  chip({ id: 6, slug: 'vco-76-82', name: 'Low-Noise 76–82 GHz VCO', shortName: '76–82 GHz VCO', technology: '65nm CMOS', frequency: '76–82 GHz', category: 'VCOs & Oscillators', image: img('sheet1-02-low-noise-76-82-ghz-vco.png'), width: 640, height: 567, bandsGHz: [[76, 82]] }),
  chip({ id: 7, slug: 'vco-class-d', name: '3.1–4.7 GHz Class-D VCO', shortName: '3.1–4.7 GHz Class-D VCO', technology: '65nm CMOS', frequency: '3.1–4.7 GHz', category: 'VCOs & Oscillators', image: img('sheet1-05-3.1-4.7-ghz-class-d-vco.png'), width: 838, height: 425, bandsGHz: [[3.1, 4.7]] }),
  chip({ id: 8, slug: 'vco-174-232', name: '174–232 GHz SiGe VCO', shortName: '174–232 GHz SiGe VCO', technology: 'SiGe BiCMOS', frequency: '174–232 GHz', category: 'VCOs & Oscillators', image: img('sheet1-06-174-232-ghz-sige-vco.png'), width: 772, height: 556, bandsGHz: [[174, 232]] }),
  chip({ id: 9, slug: 'osc-90', name: '90 GHz Efficient Oscillator', shortName: '90 GHz Oscillator', technology: 'CMOS', frequency: '90 GHz', category: 'VCOs & Oscillators', image: img('sheet3-02-90-ghz-efficient-oscillator.png'), width: 710, height: 624, bandsGHz: [[90, 90]] }),

  // Sub-THz and THz sources
  chip({ id: 10, slug: 'tx-320', name: '0.32 THz SiGe Transmitter', shortName: '0.32 THz SiGe Tx', technology: 'SiGe BiCMOS', frequency: '0.32 THz', category: 'Sub-THz & THz Sources', image: img('sheet2-0.32-thz-sige-transmitter.png'), width: 743, height: 546, bandsGHz: [[320, 320]] }),
  chip({ id: 11, slug: 'doubler-480', name: '0.48 THz Frequency Doubler', shortName: '0.48 THz Doubler', technology: 'SiGe BiCMOS', frequency: '0.48 THz', category: 'Sub-THz & THz Sources', image: img('sheet2-0.48-thz-frequency-doubler.png'), width: 721, height: 554, bandsGHz: [[480, 480]] }),
  chip({ id: 12, slug: 'quadrupler-920', name: '0.92 THz SiGe Quadrupler', shortName: '0.92 THz Quadrupler', technology: 'SiGe BiCMOS', frequency: '0.92 THz', category: 'Sub-THz & THz Sources', image: img('sheet2-0.92-thz-sige-quadrupler.png'), width: 741, height: 574, bandsGHz: [[920, 920]] }),

  // Analog and specialized
  chip({ id: 13, slug: 'tia-mems-pnt', name: '4-Channel TIA for MEMS PNT', shortName: '4-Ch TIA for MEMS PNT', technology: 'CMOS', frequency: 'Broadband', category: 'Analog & Special Circuits', image: img('sheet2-4-channel-tia-for-mems-pnt.png'), width: 745, height: 568 }),
  chip({ id: 14, slug: 'negative-l', name: '0.1–6 GHz Negative L Circuit', shortName: '0.1–6 GHz Negative-L', technology: 'CMOS', frequency: '0.1–6 GHz', category: 'Analog & Special Circuits', image: img('sheet3-01-0.1-6-ghz-negative-l-circuit.png'), width: 563, height: 601, bandsGHz: [[0.1, 6]] }),
];

export const chipCategories: ChipCategory[] = [
  'Radar Systems',
  'Power Generation & PA',
  'VCOs & Oscillators',
  'Sub-THz & THz Sources',
  'Analog & Special Circuits',
];

/** Chips with a numeric band, in ascending frequency: the spectrum ruler's content. */
export const rulerChips: Chip[] = chips
  .filter((c) => c.bandsGHz && c.bandsGHz.length > 0)
  .sort((a, b) => a.bandsGHz![0][0] - b.bandsGHz![0][0]);

/** Lowest and highest stated operating frequency across all dies, in GHz. */
export const siliconSpanGHz: [number, number] = [
  Math.min(...rulerChips.flatMap((c) => c.bandsGHz!.map((b) => b[0]))),
  Math.max(...rulerChips.flatMap((c) => c.bandsGHz!.map((b) => b[1]))),
];

import figureSizes from '@/data/researchFigureSizes.json';

const SIZES: Record<string, number[]> = figureSizes;
const VISUALS = '/images/research/visuals/';
const stem = (src: string) => src.split('/').pop()?.replace(/\.[^.]+$/, '') ?? src;

/** Lead visuals are already WebP; other figures have a web copy from scripts/make-image-derivatives.py. */
export const isLeadVisual = (src: string) => src.startsWith(VISUALS);

/** Path of the inline copy of a research figure; the lightbox links the original. */
export function figureWebSrc(src: string): string {
  return isLeadVisual(src) ? src : `/images/research/web/${stem(src)}.webp`;
}

/** Pixel size of the inline copy, or a 16:9 box when the manifest has no entry. */
export function figureSize(src: string): [number, number] {
  const size = SIZES[isLeadVisual(src) ? `visuals/${stem(src)}` : stem(src)];
  return size?.length === 2 ? [size[0], size[1]] : [1600, 900];
}

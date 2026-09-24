'use client';

import { useMediaQuery } from './useMediaQuery';

export type MotionMode = 'full' | 'reduced';

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** Motion mode from the visitor's OS setting. The server render assumes full motion. */
export function useMotionMode(): MotionMode {
  return useMediaQuery(REDUCED_MOTION_QUERY) ? 'reduced' : 'full';
}

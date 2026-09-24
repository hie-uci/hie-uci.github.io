'use client';

import { useSyncExternalStore } from 'react';
import { MOTION_STORAGE_KEY, type MotionMode } from './motionPreference';

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readMode(): MotionMode {
  return document.documentElement.getAttribute('data-motion') === 'reduced' ? 'reduced' : 'full';
}

/** Current motion mode. Server render assumes full motion; the boot script corrects it before paint. */
export function useMotionMode(): MotionMode {
  return useSyncExternalStore(subscribe, readMode, () => 'full');
}

/** Persist the visitor's choice and notify every subscriber. */
export function setMotionMode(mode: MotionMode) {
  document.documentElement.setAttribute('data-motion', mode);
  try {
    localStorage.setItem(MOTION_STORAGE_KEY, mode);
  } catch {
    // Storage is unavailable (private window, blocked site data). The choice
    // still applies for this page view through the attribute set above.
  }
  listeners.forEach((listener) => listener());
}

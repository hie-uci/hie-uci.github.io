'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { useInView } from 'framer-motion';
import { useMotionMode } from '@/lib/useMotionMode';

/*
 * Shared frame for the Home page's application vignettes: small line drawings of what the lab's
 * chips are used for, set in the margins beside a section heading on wide screens. Each drawing
 * is a function of time t (seconds) on a 240 × 170 canvas, captioned with the chip it stands for
 * and marked as an illustration.
 */

/** Class for the signal colour: amber on light backgrounds, UCI Gold on dark. */
export const SIGNAL = 'text-amber-500 dark:text-uci-gold';

const noSubscribe = () => () => {};

/** False in the server render and during hydration, true afterwards. */
function useHydrated(): boolean {
  return useSyncExternalStore(noSubscribe, () => true, () => false);
}

/** Seconds since the clock started, advanced while `running` at about 30 updates a second. */
function useClock(running: boolean, start: number): number {
  const [t, setT] = useState(start);
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    let pending = 0;
    const tick = (now: number) => {
      pending += now - last;
      last = now;
      if (pending >= 33) {
        const step = pending / 1000;
        setT((v) => v + step);
        pending = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);
  return t;
}

interface VignetteProps {
  title: string;
  chip: string;
  /** Time shown when motion is reduced: a representative still. */
  still: number;
  children: (t: number) => ReactNode;
}

/** A captioned drawing that animates only while on screen and holds still under reduced motion. */
export function Vignette({ title, chip, still, children }: VignetteProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.2 });
  const motion = useMotionMode();
  const t = useClock(inView && motion === 'full', still);
  // Drawn on the client only: the server and the browser can disagree in the last digits of
  // Math.sin and friends, and the drawings are decoration that need not be in the static HTML.
  const hydrated = useHydrated();
  return (
    <figure ref={ref} className="w-[240px] text-eng-blue/80 dark:text-sky-300/80">
      <svg viewBox="0 0 240 170" className="w-full h-auto overflow-visible" aria-hidden="true">
        {hydrated && (
          <g fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            {children(t)}
          </g>
        )}
      </svg>
      <figcaption className="mt-2 text-center">
        <span className="block text-sm font-semibold text-eng-blue dark:text-slate-100">{title}</span>
        <span className="block text-xs text-slate-500 dark:text-slate-400">{chip}</span>
      </figcaption>
    </figure>
  );
}

/** Small text inside a drawing. */
export function Label({ x, y, children, anchor = 'start' }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <text x={x} y={y} fontSize={9.5} textAnchor={anchor} fill="currentColor" stroke="none" opacity={0.85}>
      {children}
    </text>
  );
}

/**
 * A section heading with a vignette in each margin; the drawings show from xl up. The heading
 * keeps to the 704 px between them, so a long title wraps instead of running into a drawing,
 * and the block is at least as tall as a drawing with its caption (214 px) plus some air.
 */
export function Flanked({ left, right, children }: { left: ReactNode; right: ReactNode; children: ReactNode }) {
  return (
    <div className="relative xl:px-[256px] xl:pt-6 xl:min-h-[230px]">
      {children}
      <div className="hidden xl:block absolute left-0 top-0">{left}</div>
      <div className="hidden xl:block absolute right-0 top-0">{right}</div>
    </div>
  );
}

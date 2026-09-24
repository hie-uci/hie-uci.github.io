'use client';

import { setMotionMode, useMotionMode } from '@/lib/useMotionMode';

/** Motion as a choice: defaults to the OS reduced-motion setting, then remembers the visitor's pick. */
export default function MotionToggle({ className = '' }: { className?: string }) {
  const mode = useMotionMode();
  const on = mode === 'full';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setMotionMode(on ? 'reduced' : 'full')}
      className={`inline-flex h-8 items-center gap-2 rounded-full border border-line-strong px-3 font-mono text-[11px] tracking-[0.06em] text-ink-2 transition-colors hover:border-ink-3 hover:text-ink [font-stretch:87.5%] ${className}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full transition-colors ${on ? 'bg-trace' : 'bg-ink-3'}`}
      />
      Motion {on ? 'on' : 'off'}
    </button>
  );
}

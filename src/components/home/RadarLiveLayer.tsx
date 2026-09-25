'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { useMotionMode } from '@/lib/useMotionMode';

const RadarScene = dynamic(() => import('./RadarScene'), { ssr: false });

interface RadarLiveLayerProps {
  /** The card is hovered or holds focus. */
  active: boolean;
}

/**
 * Keeps the radar card's photo as its cover and fades the live 3D scene in over it while the card is
 * active. The scene and three.js load on first use; touch screens get a button instead of hover.
 */
export default function RadarLiveLayer({ active }: RadarLiveLayerProps) {
  const motion = useMotionMode();
  const canHover = useMediaQuery('(hover: hover)');
  const [pinned, setPinned] = useState(false);
  const [mounted, setMounted] = useState(false);
  const on = active || pinned;
  if (on && !mounted) setMounted(true);
  if (motion === 'reduced') return null;

  return (
    <>
      <div className={`absolute inset-0 z-20 transition-opacity duration-500 ${on ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
        {mounted && <RadarScene playing={on} />}
      </div>
      {canHover ? (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute bottom-3 left-3 z-30 rounded-full border border-cyan-200/40 bg-slate-950/70 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100 transition-opacity duration-300 ${on ? 'opacity-0' : 'opacity-100'}`}
        >
          Hover · live 3D
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setPinned((p) => !p)}
          aria-pressed={pinned}
          className="absolute left-3 top-3 z-30 rounded-full border border-cyan-200/40 bg-slate-950/75 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100"
        >
          {pinned ? 'Photo' : 'Live 3D'}
        </button>
      )}
    </>
  );
}

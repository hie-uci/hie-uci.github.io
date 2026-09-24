'use client';

import Image from 'next/image';

type ResearchVisualVariant = 'radar' | 'thz' | 'siggen' | 'ai' | 'device';

interface ResearchVisualProps {
  variant: ResearchVisualVariant;
  className?: string;
}

interface VisualAsset {
  src: string;
  alt: string;
  objectPosition?: string;
  imageClassName?: string;
}

const visualAssets: Record<ResearchVisualVariant, VisualAsset> = {
  radar: {
    src: '/images/research/visuals/research-radar-target-interaction-v3.webp',
    alt: 'HIE millimeter-wave radar transmitting toward static and moving targets and receiving their coherent reflected signals',
  },
  thz: {
    src: '/images/research/visuals/research-thz-harmonic-power.webp',
    alt: 'Scientific visualization of nonlinear 0.92 THz power generation using the actual HIE Lab SiGe quadrupler die',
  },
  siggen: {
    src: '/images/research/visuals/research-signal-generation-concept-v2.webp',
    alt: 'Scientific visualization of coupled resonant paths producing a tunable low-phase-noise millimeter-wave carrier',
  },
  ai: {
    src: '/images/research/visuals/research-ai-falcon.webp',
    alt: 'Scientific visualization of graph-neural-network reasoning producing a layout-aware analog RF circuit',
  },
  device: {
    src: '/images/research/device-3.png',
    alt: 'Original HIE Lab visualization of a dual-gate Janus PtSSe tunneling transistor',
    imageClassName: 'brightness-[0.88] contrast-[1.06] saturate-[1.08] hue-rotate-[4deg]',
  },
};

export default function ResearchVisual({ variant, className = '' }: ResearchVisualProps) {
  const asset = visualAssets[variant];

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-slate-950 ${className}`}
      role="img"
      aria-label={asset.alt}
    >
      <Image
        src={asset.src}
        alt=""
        fill
        sizes="(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw"
        className={`object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035] ${asset.imageClassName ?? ''}`}
        style={{ objectPosition: asset.objectPosition }}
      />

      {variant === 'radar' && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 font-mono text-[10px] font-bold tracking-[0.12em] sm:text-xs">
          <span className="absolute left-[18%] top-[18%] -translate-x-1/2 rounded border border-cyan-200/70 bg-slate-950/85 px-2 py-0.5 text-cyan-100 shadow-[0_2px_10px_rgba(2,6,23,0.45)]">
            RX
          </span>
          <span className="absolute left-[34%] top-[18%] -translate-x-1/2 rounded border border-amber-200/70 bg-slate-950/85 px-2 py-0.5 text-amber-100 shadow-[0_2px_10px_rgba(2,6,23,0.45)]">
            TX
          </span>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-slate-950/10" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,transparent_35%,rgba(2,6,23,0.18)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  );
}

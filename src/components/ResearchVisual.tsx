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
  imageClassName?: string;
  fitClassName?: string;
  objectPosition?: string;
  accentClassName: string;
}

const visualAssets: Record<ResearchVisualVariant, VisualAsset> = {
  radar: {
    src: '/images/research/radar-5.png',
    alt: 'Application map for multi-band millimeter-wave radar sensing',
    imageClassName: 'p-4',
    accentClassName: 'from-sky-500/20 via-uci-blue/10 to-uci-gold/15',
  },
  thz: {
    src: '/images/research/thz-3.jpg',
    alt: 'Terahertz power generation roadmap and nonlinear design concept',
    imageClassName: 'p-3',
    accentClassName: 'from-uci-gold/20 via-sky-500/10 to-eecs-teal/15',
  },
  siggen: {
    src: '/images/research/siggen-10.png',
    alt: 'Differential and common-mode signal paths for millimeter-wave oscillation',
    imageClassName: 'p-4',
    accentClassName: 'from-eecs-teal/20 via-uci-blue/10 to-uci-gold/15',
  },
  ai: {
    src: '/images/research/ai-combined-figs.jpg',
    alt: 'Layout-aware AI pipeline and circuit layout synthesis figures',
    fitClassName: 'object-cover',
    objectPosition: '50% 35%',
    accentClassName: 'from-uci-blue/20 via-eecs-teal/10 to-uci-gold/15',
  },
  device: {
    src: '/images/research/device-3.png',
    alt: 'Janus two-dimensional material tunneling FET structure',
    imageClassName: 'p-4',
    accentClassName: 'from-eecs-teal/20 via-uci-gold/10 to-sky-500/15',
  },
};

export default function ResearchVisual({ variant, className = '' }: ResearchVisualProps) {
  const asset = visualAssets[variant];

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-900 ${className}`}
      role="img"
      aria-label={asset.alt}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${asset.accentClassName}`} />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.055)_1px,transparent_1px)] bg-[size:32px_32px] opacity-70 dark:bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)]" />

      <div className="absolute inset-4 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-white">
        <Image
          src={asset.src}
          alt=""
          fill
          sizes="(min-width: 1024px) 42vw, (min-width: 768px) 50vw, 100vw"
          className={`${asset.fitClassName ?? 'object-contain'} transition-transform duration-700 group-hover:scale-[1.025] ${asset.imageClassName ?? ''}`}
          style={{ objectPosition: asset.objectPosition }}
        />
      </div>

      <div className="pointer-events-none absolute inset-x-4 bottom-4 h-16 rounded-b-xl bg-gradient-to-t from-slate-950/10 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
    </div>
  );
}

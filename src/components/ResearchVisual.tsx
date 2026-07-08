'use client';

import Image from 'next/image';
import { useId } from 'react';
import { motion } from 'framer-motion';

type ResearchVisualVariant = 'radar' | 'thz' | 'siggen' | 'ai' | 'device';

interface ResearchVisualProps {
  variant: ResearchVisualVariant;
  className?: string;
}

interface VisualAsset {
  src: string;
  alt: string;
  objectPosition: string;
  imageClassName?: string;
}

const visualAssets: Record<ResearchVisualVariant, VisualAsset> = {
  radar: {
    src: '/images/research/radar_angular_resolution.png',
    alt: 'Measured angular resolution curves for multi-band millimeter-wave radar',
    objectPosition: '50% 48%',
    imageClassName: 'scale-[1.04]',
  },
  thz: {
    src: '/images/research/thz-5.png',
    alt: 'Sub-THz power generation chip stack and measured frequency response',
    objectPosition: '50% 50%',
    imageClassName: 'scale-[1.08]',
  },
  siggen: {
    src: '/images/research/siggen-10.png',
    alt: 'Differential and common-mode signal paths in a millimeter-wave oscillator',
    objectPosition: '50% 48%',
    imageClassName: 'scale-[1.08]',
  },
  ai: {
    src: '/images/research/ai-combined-figs.jpg',
    alt: 'Layout-aware analog and RF design pipeline with circuit layout constraints',
    objectPosition: '50% 52%',
    imageClassName: 'scale-[1.06]',
  },
  device: {
    src: '/images/research/device-3.png',
    alt: 'Janus two-dimensional material tunneling FET structure',
    objectPosition: '50% 50%',
    imageClassName: 'scale-[1.08]',
  },
};

const pulseTransition = {
  duration: 3,
  repeat: Infinity,
  ease: 'easeInOut' as const,
};

function useSvgIds(prefix: string) {
  const id = useId().replace(/:/g, '');
  return {
    gradient: `${prefix}-gradient-${id}`,
    glow: `${prefix}-glow-${id}`,
    mask: `${prefix}-mask-${id}`,
  };
}

function CommonInstrumentLayer() {
  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(125,211,252,0.14)_1px,transparent_1px),linear-gradient(rgba(125,211,252,0.12)_1px,transparent_1px)] bg-[size:28px_28px] opacity-45" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_22%,rgba(125,211,252,0.20),transparent_34%),radial-gradient(circle_at_78%_32%,rgba(255,210,0,0.16),transparent_28%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#061326]/20 via-[#061326]/46 to-[#07111f]/82" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#00386d]/40 via-transparent to-[#07111f]/55" />
    </>
  );
}

function RadarOverlay() {
  const ids = useSvgIds('radar');

  return (
    <svg viewBox="0 0 120 82" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={ids.gradient} x1="0" x2="1">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.95" />
          <stop offset="68%" stopColor="#ffd200" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id={ids.glow} cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#ffd200" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="120" height="82" fill={`url(#${ids.glow})`} opacity="0.34" />
      <g transform="translate(62 44)">
        {[14, 24, 35].map((r, index) => (
          <motion.circle
            key={r}
            r={r}
            fill="none"
            stroke={`url(#${ids.gradient})`}
            strokeWidth="0.7"
            strokeDasharray="3 4"
            animate={{ scale: [0.96, 1.06, 0.96], opacity: [0.16, 0.54, 0.16] }}
            transition={{ ...pulseTransition, delay: index * 0.24 }}
          />
        ))}
        <motion.path
          d="M0 0 L35 -18"
          stroke="#ffd200"
          strokeWidth="1.25"
          strokeLinecap="round"
          animate={{ rotate: [-28, 34, -28] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '0px 0px' }}
        />
      </g>
      {[
        [46, 37, 0.2],
        [70, 43, 0.8],
        [83, 30, 1.3],
      ].map(([cx, cy, delay]) => (
        <motion.g key={`${cx}-${cy}`} animate={{ opacity: [0.25, 1, 0.25] }} transition={{ ...pulseTransition, delay }}>
          <circle cx={cx} cy={cy} r="2" fill="#ffd200" />
          <circle cx={cx} cy={cy} r="6" fill="none" stroke="#ffd200" strokeOpacity="0.55" strokeWidth="0.75" />
        </motion.g>
      ))}
      <path d="M12 64 C32 54 45 59 60 44 C72 31 87 35 108 22" fill="none" stroke="#7dd3fc" strokeOpacity="0.38" strokeWidth="1" />
    </svg>
  );
}

function THzOverlay() {
  const ids = useSvgIds('thz');

  return (
    <svg viewBox="0 0 120 82" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={ids.gradient} x1="0" x2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="46%" stopColor="#ffd200" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      <g opacity="0.34">
        {Array.from({ length: 7 }).map((_, index) => (
          <line key={index} x1={18 + index * 13} y1="8" x2={8 + index * 13} y2="76" stroke="#ffffff" strokeWidth="0.6" />
        ))}
      </g>
      <motion.path
        d="M7 52 C16 27 28 28 38 52 S60 74 71 50 S93 26 114 48"
        fill="none"
        stroke={`url(#${ids.gradient})`}
        strokeWidth="2"
        strokeLinecap="round"
        animate={{ pathLength: [0.35, 1, 0.35], opacity: [0.45, 0.95, 0.45] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.path
        d="M9 60 C23 43 35 43 49 60 S78 76 109 43"
        fill="none"
        stroke="#7dd3fc"
        strokeWidth="0.9"
        strokeDasharray="4 5"
        strokeLinecap="round"
        animate={{ opacity: [0.18, 0.62, 0.18] }}
        transition={{ ...pulseTransition, delay: 0.45 }}
      />
      <motion.g animate={{ y: [0, -3, 0] }} transition={pulseTransition}>
        <rect x="48" y="27" width="25" height="24" rx="5" fill="#061326" fillOpacity="0.58" stroke="#7dd3fc" strokeOpacity="0.55" />
        <path d="M53 35h15M53 42h15M60.5 30v25" stroke="#ffd200" strokeWidth="1.1" strokeLinecap="round" />
      </motion.g>
      {[30, 58, 92].map((cx, index) => (
        <motion.circle
          key={cx}
          cx={cx}
          cy={index === 1 ? 26 : 34}
          r="2.2"
          fill="#ffd200"
          animate={{ scale: [0.8, 1.6, 0.8], opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.35 }}
        />
      ))}
    </svg>
  );
}

function SignalOverlay() {
  const ids = useSvgIds('siggen');

  return (
    <svg viewBox="0 0 120 82" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={ids.gradient} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="52%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ffd200" />
        </linearGradient>
      </defs>
      <g stroke="#ffffff" strokeOpacity="0.14" strokeWidth="0.6">
        <path d="M12 18h96M12 35h96M12 52h96M12 69h96" />
        <path d="M25 9v66M50 9v66M75 9v66M100 9v66" />
      </g>
      <motion.path
        d="M6 44 C15 16 25 16 34 44 S53 72 62 44 S82 16 92 44 S108 68 116 38"
        fill="none"
        stroke={`url(#${ids.gradient})`}
        strokeWidth="2.2"
        strokeLinecap="round"
        animate={{ pathOffset: [0, 1] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'linear' }}
      />
      <motion.path
        d="M15 61 C31 56 40 63 55 55 C69 48 82 56 105 38"
        fill="none"
        stroke="#ffd200"
        strokeWidth="0.9"
        strokeDasharray="3 4"
        strokeLinecap="round"
        animate={{ opacity: [0.24, 0.7, 0.24] }}
        transition={pulseTransition}
      />
      <motion.circle
        cx="64"
        cy="41"
        r="18"
        fill="none"
        stroke="#7dd3fc"
        strokeWidth="0.8"
        strokeDasharray="3 4"
        animate={{ rotate: [0, 360], opacity: [0.16, 0.55, 0.16] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '64px 41px' }}
      />
    </svg>
  );
}

function AIOverlay() {
  const ids = useSvgIds('ai');
  const nodes = [
    [23, 22],
    [46, 19],
    [63, 38],
    [88, 24],
    [96, 59],
    [58, 62],
    [34, 56],
  ];

  return (
    <svg viewBox="0 0 120 82" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={ids.gradient} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="58%" stopColor="#528188" />
          <stop offset="100%" stopColor="#ffd200" />
        </linearGradient>
      </defs>
      <path d="M10 19h24v-8h24v14h18v-8h34M9 65h20v-14h25v9h25v-18h32" fill="none" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1.2" />
      {[
        [0, 1],
        [1, 2],
        [2, 3],
        [2, 5],
        [4, 5],
        [5, 6],
        [0, 6],
        [3, 4],
      ].map(([a, b], index) => {
        const [x1, y1] = nodes[a];
        const [x2, y2] = nodes[b];
        return (
          <motion.line
            key={`${a}-${b}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={`url(#${ids.gradient})`}
            strokeWidth="1.1"
            animate={{ opacity: [0.18, 0.85, 0.18] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.16 }}
          />
        );
      })}
      {nodes.map(([cx, cy], index) => (
        <motion.g key={`${cx}-${cy}`} animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.13 }} style={{ transformOrigin: `${cx}px ${cy}px` }}>
          <circle cx={cx} cy={cy} r="4.1" fill="#061326" fillOpacity="0.9" stroke="#7dd3fc" strokeWidth="1.1" />
          <circle cx={cx} cy={cy} r="1.5" fill="#ffd200" />
        </motion.g>
      ))}
      <motion.rect
        x="43"
        y="32"
        width="35"
        height="22"
        rx="5"
        fill="#061326"
        fillOpacity="0.55"
        stroke="#ffffff"
        strokeOpacity="0.25"
        animate={{ opacity: [0.55, 0.88, 0.55] }}
        transition={pulseTransition}
      />
    </svg>
  );
}

function DeviceOverlay() {
  const ids = useSvgIds('device');

  return (
    <svg viewBox="0 0 120 82" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={ids.gradient} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffd200" />
          <stop offset="52%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#528188" />
        </linearGradient>
      </defs>
      <motion.path
        d="M15 54 L43 39 L72 54 L43 68 Z"
        fill="#ffd200"
        fillOpacity="0.12"
        stroke="#ffd200"
        strokeOpacity="0.56"
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.path
        d="M47 30 L78 14 L107 30 L78 46 Z"
        fill="#7dd3fc"
        fillOpacity="0.12"
        stroke="#7dd3fc"
        strokeOpacity="0.5"
        animate={{ y: [0, 2, 0] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      {[18, 33, 48, 63, 78, 93].map((cx, index) => (
        <motion.circle
          key={cx}
          cx={cx}
          cy={index % 2 ? 56 : 46}
          r="1.5"
          fill={index % 2 ? '#7dd3fc' : '#ffd200'}
          animate={{ opacity: [0.25, 0.95, 0.25] }}
          transition={{ duration: 2.6, repeat: Infinity, delay: index * 0.14 }}
        />
      ))}
      <g transform="translate(80 48)">
        <motion.ellipse
          rx="24"
          ry="9"
          fill="none"
          stroke={`url(#${ids.gradient})`}
          strokeWidth="0.9"
          strokeDasharray="4 3"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '0px 0px' }}
        />
        <motion.ellipse
          rx="9"
          ry="24"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.34"
          strokeWidth="0.8"
          strokeDasharray="3 4"
          animate={{ rotate: [360, 0] }}
          transition={{ duration: 8.5, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '0px 0px' }}
        />
        <circle r="3.6" fill="#ffd200" fillOpacity="0.85" />
      </g>
    </svg>
  );
}

const overlayMap: Record<ResearchVisualVariant, () => React.JSX.Element> = {
  radar: RadarOverlay,
  thz: THzOverlay,
  siggen: SignalOverlay,
  ai: AIOverlay,
  device: DeviceOverlay,
};

export default function ResearchVisual({ variant, className = '' }: ResearchVisualProps) {
  const asset = visualAssets[variant];
  const Overlay = overlayMap[variant];

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`} role="img" aria-label={asset.alt}>
      <div className="absolute inset-0 bg-[#061326]" />
      <Image
        src={asset.src}
        alt=""
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        className={`object-cover opacity-70 saturate-[0.85] contrast-[1.08] brightness-[0.72] ${asset.imageClassName ?? ''}`}
        style={{ objectPosition: asset.objectPosition }}
      />
      <CommonInstrumentLayer />
      <Overlay />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/55 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#07111f] via-[#07111f]/72 to-transparent" />
    </div>
  );
}

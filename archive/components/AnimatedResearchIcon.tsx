'use client';

import { motion } from 'framer-motion';

type IconVariant = 'radar' | 'thz' | 'siggen' | 'ai' | 'device';

interface AnimatedResearchIconProps {
  variant: IconVariant;
  className?: string;
}

function RadarIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      {/* Rotating dashed rings */}
      <motion.circle
        cx="24" cy="24" r="18"
        stroke="currentColor" strokeWidth="1" strokeDasharray="4 4"
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        style={{ originX: '24px', originY: '24px', transformBox: 'fill-box' }}
      />
      <motion.circle
        cx="24" cy="24" r="12"
        stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3"
        animate={{ rotate: -360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        style={{ originX: '24px', originY: '24px', transformBox: 'fill-box' }}
      />
      {/* Center dot */}
      <circle cx="24" cy="24" r="3" fill="currentColor" opacity="0.8" />
      {/* Pulsing outer ring */}
      <motion.circle
        cx="24" cy="24" r="22"
        stroke="currentColor" strokeWidth="0.75" fill="none"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Crosshairs */}
      <line x1="24" y1="2" x2="24" y2="8" stroke="currentColor" strokeWidth="1.5" />
      <line x1="24" y1="40" x2="24" y2="46" stroke="currentColor" strokeWidth="1.5" />
      <line x1="2" y1="24" x2="8" y2="24" stroke="currentColor" strokeWidth="1.5" />
      <line x1="40" y1="24" x2="46" y2="24" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function THzIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      {/* Pulsing wave amplitude */}
      <motion.path
        d="M4 36 L12 12 L20 36 L28 12 L36 36 L44 16"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        animate={{ pathLength: [0.35, 1, 0.35], opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Baseline */}
      <line x1="4" y1="24" x2="44" y2="24" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
      {/* Amplitude markers */}
      <motion.circle
        cx="12" cy="12" r="2" fill="currentColor"
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
      />
      <motion.circle
        cx="28" cy="12" r="2" fill="currentColor"
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.9 }}
      />
    </svg>
  );
}

function SigGenIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      {/* Oscillating sine wave */}
      <motion.path
        d="M4 24 Q10 8 16 24 Q22 40 28 24 Q34 8 40 24 Q43 32 46 24"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        animate={{ pathOffset: [0, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
      {/* Center ring */}
      <motion.circle
        cx="24" cy="24" r="6"
        stroke="currentColor" strokeWidth="1.5" fill="none"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <circle cx="24" cy="24" r="2" fill="currentColor" opacity="0.6" />
      {/* Outer dashed circle */}
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.2" />
    </svg>
  );
}

function AIIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      {/* Grid nodes */}
      <rect x="6" y="6" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="32" y="6" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="6" y="32" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="32" y="32" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      {/* Animated connection lines */}
      <motion.line
        x1="16" y1="11" x2="32" y2="11"
        stroke="currentColor" strokeWidth="1.5"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0 }}
      />
      <motion.line
        x1="16" y1="37" x2="32" y2="37"
        stroke="currentColor" strokeWidth="1.5"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      />
      <motion.line
        x1="11" y1="16" x2="11" y2="32"
        stroke="currentColor" strokeWidth="1.5"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
      />
      <motion.line
        x1="37" y1="16" x2="37" y2="32"
        stroke="currentColor" strokeWidth="1.5"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
      />
      {/* Center pulsing node */}
      <motion.circle
        cx="24" cy="24" r="4"
        fill="currentColor"
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  );
}

function DeviceIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      {/* Center nucleus */}
      <circle cx="24" cy="24" r="4" fill="currentColor" opacity="0.6" />
      <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="1.5" />
      {/* Rotating electron orbit 1 */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        style={{ originX: '24px', originY: '24px', transformBox: 'fill-box' }}
      >
        <ellipse cx="24" cy="24" rx="20" ry="10" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 2" opacity="0.35" />
        <circle cx="44" cy="24" r="2.5" fill="currentColor" opacity="0.7" />
      </motion.g>
      {/* Rotating electron orbit 2 */}
      <motion.g
        animate={{ rotate: -360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        style={{ originX: '24px', originY: '24px', transformBox: 'fill-box' }}
      >
        <ellipse cx="24" cy="24" rx="10" ry="20" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 2" opacity="0.35" />
        <circle cx="24" cy="4" r="2.5" fill="currentColor" opacity="0.7" />
      </motion.g>
    </svg>
  );
}

const iconMap: Record<IconVariant, () => React.JSX.Element> = {
  radar: RadarIcon,
  thz: THzIcon,
  siggen: SigGenIcon,
  ai: AIIcon,
  device: DeviceIcon,
};

export default function AnimatedResearchIcon({ variant, className = '' }: AnimatedResearchIconProps) {
  const Icon = iconMap[variant];
  return (
    <div className={`text-uci-blue ${className}`}>
      <Icon />
    </div>
  );
}

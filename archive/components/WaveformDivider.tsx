'use client';

interface WaveformDividerProps {
  className?: string;
  flip?: boolean;
  color?: 'blue' | 'gold' | 'teal';
}

const gradients = {
  blue: ['#0064a4', '#528188'],
  gold: ['#0064a4', '#ffd200'],
  teal: ['#528188', '#0064a4'],
};

export default function WaveformDivider({ className = '', flip = false, color = 'blue' }: WaveformDividerProps) {
  const [c1, c2] = gradients[color];
  const id = `waveform-grad-${color}-${flip ? 'f' : 'n'}`;

  return (
    <div className={`w-full overflow-hidden leading-[0] ${flip ? 'rotate-180' : ''} ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className="w-full h-[30px] sm:h-[40px] lg:h-[60px]"
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={c1} stopOpacity="0" />
            <stop offset="30%" stopColor={c1} stopOpacity="0.4" />
            <stop offset="50%" stopColor={c2} stopOpacity="0.5" />
            <stop offset="70%" stopColor={c1} stopOpacity="0.4" />
            <stop offset="100%" stopColor={c2} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`M0,30
            Q120,10 240,30
            Q360,50 480,30
            Q600,10 720,30
            Q840,50 960,30
            Q1080,10 1200,30
            Q1320,50 1440,30`}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth="2"
        />
        <path
          d={`M0,35
            Q120,20 240,35
            Q360,50 480,35
            Q600,20 720,35
            Q840,50 960,35
            Q1080,20 1200,35
            Q1320,50 1440,35`}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth="1"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}

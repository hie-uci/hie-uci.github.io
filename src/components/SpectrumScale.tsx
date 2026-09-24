import { decadeTicks, logPosition, pct } from '@/lib/spectrum';

interface SpectrumScaleProps {
  /** Band to highlight, in GHz. */
  span?: [number, number];
  className?: string;
}

const ticks = decadeTicks();

/** Static log-frequency scale: a hairline, decade ticks and an optional highlighted span. */
export default function SpectrumScale({ span, className = '' }: SpectrumScaleProps) {
  const from = span ? logPosition(span[0]) : 0;
  const to = span ? logPosition(span[1]) : 0;

  return (
    <div className={`relative h-10 ${className}`} aria-hidden="true">
      <div className="absolute inset-x-0 top-3 h-px bg-line-strong" />
      {span && (
        <div
          className="absolute top-[11px] h-[3px] rounded-full bg-trace"
          style={{ left: pct(from), width: pct(to - from) }}
        />
      )}
      {ticks.map((tick) => (
        <div
          key={tick.fGHz}
          className={`absolute top-3 w-px ${tick.major ? 'h-2.5 bg-ink-3' : 'h-1.5 bg-line-strong'}`}
          style={{ left: pct(tick.position) }}
        />
      ))}
      {ticks
        .filter((tick) => tick.major)
        .map((tick) => (
          <span
            key={`l-${tick.fGHz}`}
            className="kicker absolute top-6 whitespace-nowrap text-[10px] tracking-[0.08em] normal-case"
            style={{
              left: pct(tick.position),
              transform: tick.position === 0 ? 'none' : tick.position === 1 ? 'translateX(-100%)' : 'translateX(-50%)',
            }}
          >
            {tick.label}
          </span>
        ))}
    </div>
  );
}

import type { Cut } from '@/lib/arrayPattern';

const W = 600;
const H = 180;
const FLOOR = -40;

interface PatternCutPlotProps {
  cut: Cut;
  peakDeg: number;
  title: string;
}

const x = (deg: number) => ((deg + 90) / 180) * W;
const y = (db: number) => (Math.min(0, Math.max(FLOOR, db)) / FLOOR) * H;

/** Normalized pattern cut in dB versus angle, with the -3 dB line and the beam peak marked. */
export default function PatternCutPlot({ cut, peakDeg, title }: PatternCutPlotProps) {
  let d = '';
  for (let i = 0; i < cut.angleDeg.length; i += 2) {
    d += `${i === 0 ? 'M' : 'L'}${x(cut.angleDeg[i]).toFixed(1)},${y(cut.db[i]).toFixed(1)}`;
  }

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="kicker flex justify-between text-[10.5px]">
        <span>{title}</span>
        <span>dB vs θ</span>
      </figcaption>
      <div className="grid grid-cols-[34px_1fr] gap-2">
        <div className="flex h-[150px] flex-col justify-between text-right font-mono text-[10px] text-ink-3 sm:h-[180px]" aria-hidden="true">
          <span>0</span>
          <span>−10</span>
          <span>−20</span>
          <span>−30</span>
          <span>−40</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-[150px] w-full overflow-visible sm:h-[180px]" role="img" aria-label={`${title}. Beam peak at ${peakDeg.toFixed(1)} degrees.`}>
          <g stroke="var(--line)" strokeWidth="1" vectorEffect="non-scaling-stroke">
            {[-10, -20, -30].map((db) => (
              <line key={db} x1="0" x2={W} y1={y(db)} y2={y(db)} vectorEffect="non-scaling-stroke" />
            ))}
            {[-45, 0, 45].map((deg) => (
              <line key={deg} y1="0" y2={H} x1={x(deg)} x2={x(deg)} vectorEffect="non-scaling-stroke" />
            ))}
          </g>
          <line x1="0" x2={W} y1={y(-3)} y2={y(-3)} stroke="var(--ink-3)" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
          <line x1={x(peakDeg)} x2={x(peakDeg)} y1="0" y2={H} stroke="var(--marker)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
          <path d={d} fill="none" stroke="var(--trace)" strokeWidth="1.6" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
        <span />
        <div className="flex justify-between font-mono text-[10px] text-ink-3" aria-hidden="true">
          <span>−90°</span>
          <span>−45°</span>
          <span>0°</span>
          <span>45°</span>
          <span>90°</span>
        </div>
      </div>
    </figure>
  );
}

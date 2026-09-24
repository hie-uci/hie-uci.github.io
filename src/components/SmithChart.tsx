'use client';

import { useId } from 'react';

export interface SmithChartProps {
  points?: { r: number; x: number; label?: string; color?: string }[];
  paths?: { start: { r: number; x: number }; end: { r: number; x: number }; color?: string }[];
  gammaTrajectories?: { points: { real: number; imag: number }[]; color?: string; name?: string }[];
}

const R_VALUES = [0, 0.2, 0.5, 1, 2, 5];
const X_VALUES = [0.2, 0.5, 1, 2, 5, -0.2, -0.5, -1, -2, -5];
const GRID = { stroke: 'var(--line-strong)', strokeWidth: 0.005, fill: 'none' } as const;

/** Reflection coefficient of a normalized impedance r + jx, with y flipped for SVG. */
function gammaOf(r: number, x: number) {
  const den = (r + 1) * (r + 1) + x * x;
  return { x: (r * r + x * x - 1) / den, y: -(2 * x) / den };
}

/** "Z_S*" renders as Z with a subscript S and the conjugate star. */
function PointLabel({ text, x, y }: { text: string; x: number; y: number }) {
  const match = /^([A-Za-z]+)_([A-Za-z0-9]+)(\*?)$/.exec(text);
  return (
    <text x={x} y={y} fontSize={0.075} fill="var(--ink)" className="font-mono">
      {match ? (
        <>
          {match[1]}
          <tspan fontSize={0.055} dy={0.022}>
            {match[2]}
            {match[3]}
          </tspan>
        </>
      ) : (
        text
      )}
    </text>
  );
}

/** Static Smith chart: impedance grid, straight match paths, Γ trajectories and labelled points. */
export function SmithChart({ points = [], paths = [], gammaTrajectories = [] }: SmithChartProps) {
  const clip = useId();
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <svg viewBox="-1.05 -1.05 2.1 2.1" className="h-full w-full" role="img" aria-label="Smith chart">
        <defs>
          <clipPath id={clip}>
            <circle cx="0" cy="0" r="1" />
          </clipPath>
        </defs>

        <circle cx="0" cy="0" r="1" fill="var(--bg-raised)" stroke="var(--ink-3)" strokeWidth="0.01" />
        <g clipPath={`url(#${clip})`}>
          {R_VALUES.map((r) => (
            <circle key={`r-${r}`} cx={r / (1 + r)} cy={0} r={1 / (1 + r)} {...GRID} />
          ))}
          {X_VALUES.map((x) => (
            <circle key={`x-${x}`} cx={1} cy={-1 / x} r={Math.abs(1 / x)} {...GRID} />
          ))}
          <line x1="-1" y1="0" x2="1" y2="0" {...GRID} />
        </g>

        <g className="font-mono" fontSize={0.045} fill="var(--ink-3)">
          {R_VALUES.filter((r) => r > 0).map((r) => (
            <text key={r} x={(r - 1) / (r + 1) + 0.012} y={-0.02}>
              {r}
            </text>
          ))}
        </g>

        {paths.map((path, idx) => {
          const a = gammaOf(path.start.r, path.start.x);
          const b = gammaOf(path.end.r, path.end.x);
          return <line key={`path-${idx}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={path.color ?? 'var(--trace)'} strokeWidth="0.015" strokeDasharray="0.04 0.04" />;
        })}

        {gammaTrajectories.map((traj, idx) => {
          if (traj.points.length < 2) return null;
          const d = `M ${traj.points[0].real} ${-traj.points[0].imag} ` + traj.points.slice(1).map((p) => `L ${p.real} ${-p.imag}`).join(' ');
          return <path key={`traj-${idx}`} d={d} fill="none" stroke={traj.color ?? 'var(--series-4)'} strokeWidth="0.008" />;
        })}

        {points.map((pt, idx) => {
          const g = gammaOf(pt.r, pt.x);
          return (
            <g key={`pt-${idx}`}>
              <circle cx={g.x} cy={g.y} r="0.03" fill={pt.color ?? 'var(--series-4)'} stroke="var(--bg-raised)" strokeWidth="0.01" />
              {pt.label && <PointLabel text={pt.label} x={g.x + 0.05} y={g.y - 0.05} />}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

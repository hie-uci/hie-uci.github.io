'use client';

export interface SmithChartProps {
  points?: { r: number; x: number; label?: string; color?: string }[];
  paths?: { start: { r: number; x: number }; end: { r: number; x: number }; color?: string }[];
  gammaTrajectories?: { points: { real: number; imag: number }[]; color?: string; name?: string }[];
}

export function SmithChart({ points = [], paths = [], gammaTrajectories = [] }: SmithChartProps) {
  // SVG coordinates: Center is (0,0), radius is 1.
  // Real axis: Left is -1 (short), Right is +1 (open).
  // Gamma = (Z/Z0 - 1) / (Z/Z0 + 1)
  
  const getGamma = (r: number, x: number) => {
    // r, x are already normalized if we pass them as such, or we normalize here if they are absolute.
    // Let's assume r, x are NORMALIZED (i.e. Z/Z0)
    const den = (r + 1) * (r + 1) + x * x;
    const gRe = (r * r + x * x - 1) / den;
    const gIm = (2 * x) / den;
    return { x: gRe, y: -gIm }; // Invert Y for SVG (top is negative Y)
  };

  const drawRCircle = (r: number) => {
    const cx = r / (1 + r);
    const radius = 1 / (1 + r);
    return <circle key={`r-${r}`} cx={cx} cy={0} r={radius} fill="none" stroke="currentColor" strokeWidth="0.005" className="text-slate-300 dark:text-slate-700" />;
  };

  const drawXArc = (x: number) => {
    if (x === 0) return <line key="x-0" x1="-1" y1="0" x2="1" y2="0" stroke="currentColor" strokeWidth="0.005" className="text-slate-300 dark:text-slate-700" />;
    
    const cx = 1;
    const cy = -1 / x; // SVG inverted Y
    const radius = Math.abs(1 / x);
    
    // Draw only the part inside the unit circle (Gamma <= 1)
    // The intersection of (X-1)^2 + (Y-cy)^2 = R^2 with X^2 + Y^2 <= 1
    // A simpler way in SVG is to use clipPath or just draw the circle and let SVG clip it to a circle with radius 1.
    return (
      <circle key={`x-${x}`} cx={cx} cy={cy} r={radius} fill="none" stroke="currentColor" strokeWidth="0.005" className="text-slate-300 dark:text-slate-700" />
    );
  };

  const rValues = [0, 0.2, 0.5, 1, 2, 5];
  const xValues = [0.2, 0.5, 1, 2, 5, -0.2, -0.5, -1, -2, -5];

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      <svg viewBox="-1.05 -1.05 2.1 2.1" className="w-full h-full drop-shadow-sm">
        <defs>
          <clipPath id="smith-clip">
            <circle cx="0" cy="0" r="1" />
          </clipPath>
        </defs>

        {/* Outer boundary */}
        <circle cx="0" cy="0" r="1" fill="transparent" stroke="currentColor" strokeWidth="0.01" className="text-slate-400 dark:text-slate-500" />
        
        <g clipPath="url(#smith-clip)">
          {/* Constant Resistance Circles */}
          {rValues.map(drawRCircle)}
          
          {/* Constant Reactance Arcs */}
          {xValues.map(drawXArc)}
          
          {/* Real Axis */}
          {drawXArc(0)}
        </g>

        {/* Draw Paths */}
        {paths.map((path, idx) => {
          const startG = getGamma(path.start.r, path.start.x);
          const endG = getGamma(path.end.r, path.end.x);
          return (
            <line 
              key={`path-${idx}`}
              x1={startG.x} y1={startG.y} x2={endG.x} y2={endG.y}
              stroke={path.color || "#0064a4"} strokeWidth="0.015"
              strokeDasharray="0.04, 0.04"
            />
          );
        })}

        {/* Draw Gamma Trajectories */}
        {gammaTrajectories.map((traj, idx) => {
          if (traj.points.length < 2) return null;
          const d = `M ${traj.points[0].real} ${-traj.points[0].imag} ` + 
                    traj.points.slice(1).map(p => `L ${p.real} ${-p.imag}`).join(' ');
          return (
            <path
              key={`traj-${idx}`}
              d={d}
              fill="none"
              stroke={traj.color || "#e03b24"}
              strokeWidth="0.008"
              className="drop-shadow-sm"
            />
          );
        })}

        {/* Draw Points */}
        {points.map((pt, idx) => {
          const g = getGamma(pt.r, pt.x);
          return (
            <g key={`pt-${idx}`}>
              <circle cx={g.x} cy={g.y} r="0.03" fill={pt.color || "#e03b24"} />
              {pt.label && (
                <text x={g.x + 0.05} y={g.y - 0.05} fontSize="0.08" fill="currentColor" className="text-slate-700 dark:text-slate-300 font-sans font-semibold">
                  {pt.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

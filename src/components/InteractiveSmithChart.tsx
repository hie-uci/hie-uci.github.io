'use client';

import React, { useRef, useState, useCallback, useMemo } from 'react';

// --- Math Helpers ---
const zToGamma = (r: number, x: number) => {
  const den = (r + 1) * (r + 1) + x * x;
  const gRe = (r * r + x * x - 1) / den;
  const gIm = (2 * x) / den;
  return { x: gRe, y: -gIm }; // Invert Y for SVG
};

const gammaToZ = (gx: number, gy: number) => {
  const gIm = -gy; // Un-invert Y
  const den = (1 - gx) * (1 - gx) + gIm * gIm;
  if (den < 1e-6) return { r: 9999, x: 0 };
  const r = (1 - gx * gx - gIm * gIm) / den;
  const x = (2 * gIm) / den;
  return { r, x };
};

const zToY = (r: number, x: number) => {
  const den = r * r + x * x;
  if (den < 1e-6) return { g: 9999, b: 0 };
  return { g: r / den, b: -x / den };
};

export function InteractiveSmithChart({
  initialLoad = { r: 1, x: 0 },
  freqGHz = 2.45,
  z0 = 50
}: {
  initialLoad?: { r: number, x: number },
  freqGHz?: number,
  z0?: number
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  const [operations, setOperations] = useState<{ type: 'series' | 'shunt', value: number }[]>([]);
  const [activeDrag, setActiveDrag] = useState<{ index: number, type: 'series' | 'shunt' } | null>(null);

  // --- Calculations ---
  const omega = 2 * Math.PI * freqGHz * 1e9;
  
  const points = useMemo(() => {
    const pts = [{ r: initialLoad.r, x: initialLoad.x }];
    operations.forEach(op => {
      const lastPt = pts[pts.length - 1];
      if (op.type === 'series') {
        const unnormX = lastPt.x * z0 + op.value;
        pts.push({ r: lastPt.r, x: unnormX / z0 });
      } else {
        const y = zToY(lastPt.r, lastPt.x);
        const unnormY = { g: y.g / z0, b: y.b / z0 };
        unnormY.b += op.value;
        const newYNorm = { g: unnormY.g * z0, b: unnormY.b * z0 };
        
        const den = newYNorm.g * newYNorm.g + newYNorm.b * newYNorm.b;
        if (den < 1e-6) {
          pts.push({ r: 9999, x: 0 });
        } else {
          pts.push({ r: newYNorm.g / den, x: -newYNorm.b / den });
        }
      }
    });
    return pts;
  }, [initialLoad, operations, z0]);

  // --- Drag Handling ---
  const getMouseGamma = (e: React.PointerEvent | PointerEvent) => {
    if (!svgRef.current) return { gx: 0, gy: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;
    const gx = -1.05 + relX * 2.1;
    const gy = -1.05 + relY * 2.1;
    const mag = Math.sqrt(gx * gx + gy * gy);
    if (mag > 1) {
      return { gx: gx / mag, gy: gy / mag };
    }
    return { gx, gy };
  };

  const onPointerDown = (e: React.PointerEvent, index: number, type: 'series' | 'shunt') => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    setActiveDrag({ index, type });
  };

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!activeDrag) return;
    
    const { gx, gy } = getMouseGamma(e);
    const targetZ = gammaToZ(gx, gy);
    const startZ = points[activeDrag.index];
    
    setOperations(prev => {
      const next = [...prev];
      if (activeDrag.type === 'series') {
        const deltaXNorm = targetZ.x - startZ.x;
        next[activeDrag.index].value = deltaXNorm * z0;
      } else {
        const startY = zToY(startZ.r, startZ.x);
        const targetY = zToY(targetZ.r, targetZ.x);
        const deltaBNorm = targetY.b - startY.b;
        next[activeDrag.index].value = deltaBNorm / z0;
      }
      return next;
    });
  }, [activeDrag, points, z0]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (activeDrag) {
      (e.target as Element).releasePointerCapture(e.pointerId);
      setActiveDrag(null);
    }
  }, [activeDrag]);

  // --- Rendering Helpers ---
  const drawRCircle = (r: number) => {
    const cx = r / (1 + r);
    const radius = 1 / (1 + r);
    return <circle key={`r-${r}`} cx={cx} cy={0} r={radius} fill="none" stroke="currentColor" strokeWidth="0.005" className="text-slate-300 dark:text-slate-700" />;
  };

  const drawXArc = (x: number) => {
    if (x === 0) return <line key="x-0" x1="-1" y1="0" x2="1" y2="0" stroke="currentColor" strokeWidth="0.005" className="text-slate-300 dark:text-slate-700" />;
    const cx = 1;
    const cy = -1 / x;
    const radius = Math.abs(1 / x);
    return <circle key={`x-${x}`} cx={cx} cy={cy} r={radius} fill="none" stroke="currentColor" strokeWidth="0.005" className="text-slate-300 dark:text-slate-700" />;
  };

  const drawGCircle = (g: number) => {
    const cx = -g / (1 + g);
    const radius = 1 / (1 + g);
    return <circle key={`g-${g}`} cx={cx} cy={0} r={radius} fill="none" stroke="currentColor" strokeWidth="0.005" className="text-slate-200 dark:text-slate-800" strokeDasharray="0.02, 0.02" />;
  };

  const rValues = [0, 0.2, 0.5, 1, 2, 5];
  const xValues = [0.2, 0.5, 1, 2, 5, -0.2, -0.5, -1, -2, -5];

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="relative w-full aspect-square max-w-lg mx-auto bg-white/70 dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-gray-700 backdrop-blur-md">
        <svg 
          ref={svgRef}
          viewBox="-1.05 -1.05 2.1 2.1" 
          className="w-full h-full cursor-crosshair touch-none"
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <defs>
            <clipPath id="smith-clip">
              <circle cx="0" cy="0" r="1" />
            </clipPath>
          </defs>

          <circle cx="0" cy="0" r="1" fill="transparent" stroke="currentColor" strokeWidth="0.01" className="text-slate-400 dark:text-slate-500" />
          
          <g clipPath="url(#smith-clip)">
            {rValues.map(drawRCircle)}
            {xValues.map(drawXArc)}
            {drawXArc(0)}
            
            {activeDrag?.type === 'shunt' && rValues.map(drawGCircle)}

            {operations.map((op, i) => {
              const startZ = points[i];
              const endZ = points[i+1];
              
              const startG = zToGamma(startZ.r, startZ.x);
              const endG = zToGamma(endZ.r, endZ.x);

              if (op.type === 'series') {
                const r = startZ.r;
                const cx = r / (1 + r);
                const radius = 1 / (1 + r);
                const sweep = endZ.x > startZ.x ? 0 : 1; 
                
                return (
                  <path 
                    key={`path-${i}`}
                    d={`M ${startG.x} ${startG.y} A ${radius} ${radius} 0 0 ${sweep} ${endG.x} ${endG.y}`}
                    fill="none"
                    stroke="#0064a4"
                    strokeWidth="0.015"
                  />
                );
              } else {
                const yStart = zToY(startZ.r, startZ.x);
                const g = yStart.g;
                const cx = -g / (1 + g);
                const radius = 1 / (1 + g);
                
                const yEnd = zToY(endZ.r, endZ.x);
                const sweep = yEnd.b > yStart.b ? 1 : 0; 
                
                return (
                  <path 
                    key={`path-${i}`}
                    d={`M ${startG.x} ${startG.y} A ${radius} ${radius} 0 0 ${sweep} ${endG.x} ${endG.y}`}
                    fill="none"
                    stroke="#e03b24"
                    strokeWidth="0.015"
                  />
                );
              }
            })}
          </g>

          {points.map((pt, i) => {
            const g = zToGamma(pt.r, pt.x);
            const isLast = i === points.length - 1;
            const isFirst = i === 0;
            
            return (
              <g key={`node-${i}`}>
                <circle 
                  cx={g.x} cy={g.y} 
                  r={isLast ? "0.04" : "0.03"} 
                  fill={isFirst ? "#64748b" : (isLast ? "#e03b24" : "#f5a90f")} 
                  className={activeDrag ? "pointer-events-none" : ""}
                />
                
                {i > 0 && (
                  <circle 
                    cx={g.x} cy={g.y} 
                    r="0.15" 
                    fill="transparent" 
                    className="cursor-grab active:cursor-grabbing hover:fill-slate-500/20"
                    onPointerDown={(e) => onPointerDown(e, i - 1, operations[i-1].type)}
                  />
                )}
                
                <text x={g.x + 0.05} y={g.y - 0.05} fontSize="0.08" fill="currentColor" className="text-slate-800 dark:text-slate-200 font-bold pointer-events-none drop-shadow-md">
                  {isFirst ? "Z_L" : (isLast ? `P${i}` : "")}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="w-full lg:w-80 flex flex-col gap-4">
        <div className="bg-white/70 dark:bg-slate-900/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700 backdrop-blur-md flex-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Matching Operations</h3>
            {operations.length > 0 && (
              <button 
                onClick={() => setOperations([])}
                className="text-xs font-semibold text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="flex gap-2 mb-4">
            <button 
              onClick={() => setOperations([...operations, { type: 'series', value: 0 }])}
              className="flex-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors border border-blue-200 dark:border-blue-800"
            >
              + Series
            </button>
            <button 
              onClick={() => setOperations([...operations, { type: 'shunt', value: 0 }])}
              className="flex-1 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors border border-red-200 dark:border-red-800"
            >
              + Shunt
            </button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {operations.map((op, i) => {
              let compStr = "";
              if (op.type === 'series') {
                const x = op.value;
                if (x > 0) {
                  const L = x / omega;
                  compStr = `L = ${(L * 1e9).toFixed(2)} nH`;
                } else if (x < 0) {
                  const C = -1 / (omega * x);
                  compStr = `C = ${(C * 1e12).toFixed(2)} pF`;
                } else {
                  compStr = "0 Ω";
                }
              } else {
                const b = op.value;
                if (b > 0) {
                  const C = b / omega;
                  compStr = `C = ${(C * 1e12).toFixed(2)} pF`;
                } else if (b < 0) {
                  const L = -1 / (omega * b);
                  compStr = `L = ${(L * 1e9).toFixed(2)} nH`;
                } else {
                  compStr = "0 S";
                }
              }

              return (
                <div key={i} className={`p-3 rounded-lg border flex justify-between items-center transition-all ${activeDrag?.index === i ? 'border-uci-blue bg-blue-50 dark:bg-blue-900/20 scale-[1.02]' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-950'}`}>
                  <div>
                    <div className={`text-xs font-bold uppercase ${op.type === 'series' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>{op.type}</div>
                    <div className="text-sm font-mono font-medium text-slate-900 dark:text-slate-100">{compStr}</div>
                  </div>
                  <button 
                    onClick={() => setOperations(operations.filter((_, idx) => idx !== i))}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    ×
                  </button>
                </div>
              );
            })}
            
            {operations.length === 0 && (
              <div className="text-sm text-slate-400 text-center py-6 px-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                Add an operation and drag the node on the Smith Chart.
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-slate-900/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700 backdrop-blur-md">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2">Target Impedance (Z_in)</div>
          <div className="text-xl font-mono font-semibold text-slate-900 dark:text-slate-100">
            {((points[points.length-1].r) * z0).toFixed(1)} {points[points.length-1].x >= 0 ? '+' : '-'} j{Math.abs(points[points.length-1].x * z0).toFixed(1)} Ω
          </div>
        </div>
      </div>
    </div>
  );
}
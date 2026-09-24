'use client';

import React from 'react';

interface PolarPlotProps {
  data: { angleDegrees: number; value: number }[]; // value is linear (0 to 1) or dB (-40 to 0)
  isDb?: boolean;
  minDb?: number;
}

export function PolarPlot({ data, isDb = false, minDb = -40 }: PolarPlotProps) {
  if (!data || data.length === 0) return null;

  // viewBox is -100 to 100 in both X and Y
  const radius = 90;
  
  const getCoordinates = (angleDeg: number, value: number) => {
    // Normalize value to 0-1 for plotting
    let r = 0;
    if (isDb) {
      // Map minDb..0 to 0..1
      const clamped = Math.max(value, minDb);
      r = (clamped - minDb) / (0 - minDb);
    } else {
      r = Math.max(0, Math.min(value, 1));
    }
    
    // Convert angle to SVG coords. 
    // Standard polar: 0 deg is right (+X), 90 deg is up (-Y in SVG).
    // In antennas, broadside (0 deg) is often Up (-Y). Let's assume 0 is UP.
    // X = r * sin(theta), Y = -r * cos(theta)
    const rad = angleDeg * Math.PI / 180.0;
    const x = r * radius * Math.sin(rad);
    const y = -r * radius * Math.cos(rad);
    
    return { x, y };
  };

  // Generate SVG path for the data
  let pathD = '';
  data.forEach((pt, i) => {
    const { x, y } = getCoordinates(pt.angleDegrees, pt.value);
    if (i === 0) {
      pathD += `M ${x} ${y} `;
    } else {
      pathD += `L ${x} ${y} `;
    }
  });
  if (pathD) pathD += 'Z'; // Close path

  // Draw grid circles
  const gridCircles = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      <svg viewBox="-100 -100 200 200" className="w-full h-full drop-shadow-sm">
        {/* Background / Grid */}
        {gridCircles.map(r => (
          <circle 
            key={`grid-${r}`} 
            cx="0" cy="0" 
            r={r * radius} 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="0.5" 
            className="text-slate-200 dark:text-slate-700" 
            strokeDasharray={r < 1 ? "2,2" : "none"} 
          />
        ))}

        {/* Grid lines (Angles) */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(angle => {
          const { x, y } = getCoordinates(angle, isDb ? 0 : 1);
          return (
            <line 
              key={`line-${angle}`}
              x1="0" y1="0" x2={x} y2={y}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-slate-200 dark:text-slate-700"
            />
          );
        })}

        {/* Labels */}
        <text x="0" y={-radius - 5} fontSize="6" textAnchor="middle" fill="currentColor" className="text-slate-500">0°</text>
        <text x={radius + 5} y="2" fontSize="6" textAnchor="start" fill="currentColor" className="text-slate-500">90°</text>
        <text x="0" y={radius + 8} fontSize="6" textAnchor="middle" fill="currentColor" className="text-slate-500">180°</text>
        <text x={-radius - 5} y="2" fontSize="6" textAnchor="end" fill="currentColor" className="text-slate-500">-90°</text>

        {/* Data Path */}
        <path 
          d={pathD} 
          fill="rgba(0, 100, 164, 0.2)" 
          stroke="#0064a4" 
          strokeWidth="1.5" 
          strokeLinejoin="round" 
        />
        
        {/* Center dot */}
        <circle cx="0" cy="0" r="1.5" fill="#e03b24" />
      </svg>
    </div>
  );
}
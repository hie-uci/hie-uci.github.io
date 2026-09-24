// ARCHIVED 2026-09-24. Frozen copy of the pre-redesign phased-array calculator that
// lived in src/components/AdvancedCalculators.tsx. Superseded by the 3D Phased Array Lab
// (src/components/rf/PhasedArrayLab.tsx). Not built, linted or type-checked; imports
// are recorded as they were and may no longer resolve.
'use client';

import React, { useState } from 'react';
import { PolarPlot } from './PolarPlot';

/* =========================================================================
   Phased Array & Array Factor Analysis
   ========================================================================= */

export function PhasedArrayCalculator() {
  const [numElements, setNumElements] = useState<string>('8');
  const [spacing, setSpacing] = useState<string>('0.5'); // Lambda
  const [scanAngle, setScanAngle] = useState<string>('0'); // Degrees

  const calcPattern = () => {
    const n = Number(numElements);
    const d = parseFloat(spacing);
    const scan = parseFloat(scanAngle);
    if (!Number.isInteger(n) || isNaN(d) || isNaN(scan) || n <= 0 || d <= 0 || scan < -90 || scan > 90) return [];

    const k = 2.0 * Math.PI;
    const beta = -k * d * Math.sin(scan * Math.PI / 180.0);

    let maxAF = 0;
    const rawVals = [];

    // Calculate over 360 degrees
    for (let i = 0; i <= 360; i++) {
        const thetaDeg = -180.0 + 360.0 * (i / 360.0);
        const thetaRad = thetaDeg * Math.PI / 180.0;
        // The Swift code maps theta 0 to broadside. 
        // sin(theta) means 0 deg is broadside, 90 is endfire.
        const psi = k * d * Math.sin(thetaRad) + beta;

        let afReal = 0;
        let afImag = 0;
        for (let elem = 0; elem < n; elem++) {
            const phase = elem * psi;
            afReal += Math.cos(phase);
            afImag += Math.sin(phase);
        }
        const afMag = Math.sqrt(afReal * afReal + afImag * afImag);
        rawVals.push({ angle: thetaDeg, mag: afMag });
        if (afMag > maxAF) maxAF = afMag;
    }

    const norm = Math.max(maxAF, 1e-30);
    return rawVals.map(pt => {
        const db = 20 * Math.log10(Math.max(pt.mag / norm, 1e-5));
        return {
            angleDegrees: pt.angle,
            value: db
        };
    });
  };

  const patternData = calcPattern();

  // Basic HPBW and Max Spacing calculation
  const cosTheta = Math.cos(parseFloat(scanAngle) * Math.PI / 180.0);
  const nd = Number(numElements) * parseFloat(spacing);
  const hpbw = (0.886 / (nd * Math.max(Math.abs(cosTheta), 1e-10))) * 180.0 / Math.PI;
  const maxD = 1.0 / (1.0 + Math.abs(Math.sin(parseFloat(scanAngle) * Math.PI / 180.0)));

  return (
    <div>
      
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Number of Elements (N)</label>
              <input type="number" step="1" min="1" value={numElements} onChange={(e) => setNumElements(e.target.value)} className="field-input" />
            </div>
            <div>
              <label className="field-label">Element Spacing (λ)</label>
              <input type="number" step="0.05" min="0.1" value={spacing} onChange={(e) => setSpacing(e.target.value)} className="field-input" />
            </div>
            <div className="col-span-2">
              <label className="field-label">Scan Angle (Degrees from Broadside)</label>
              <input type="number" step="1" value={scanAngle} onChange={(e) => setScanAngle(e.target.value)} className="field-input" />
            </div>
          </div>

          <div className="readout-panel space-y-3 mt-4">
            <h5 className="kicker mb-3">Array Metrics</h5>
            {patternData.length > 0 ? (
              <>
                <div className="flex justify-between items-center"><span className="text-ink-2">Approx. HPBW</span> <span className="font-mono font-medium">{Math.min(hpbw, 180).toFixed(1)}°</span></div>
                <div className="flex justify-between items-center"><span className="text-ink-2">Max Spacing (Grating Lobe Free)</span> <span className="font-mono font-medium">{maxD.toFixed(3)} λ</span></div>
                <div className="flex justify-between items-center"><span className="text-ink-2">Grating Lobes Present?</span> <span className={`font-mono font-bold ${parseFloat(spacing) >= maxD ? 'text-red-500' : 'text-green-500'}`}>{parseFloat(spacing) >= maxD ? 'Yes' : 'No'}</span></div>
                <p className="text-xs leading-relaxed text-ink-3">Closed-form HPBW/grating-lobe estimates for a uniform, narrowband linear array of equal isotropic elements. The plot is normalized array factor—not the realized antenna radiation pattern—and excludes element pattern, mutual coupling, scan loss, feed errors, edge effects, and polarization.</p>
              </>
            ) : (
              <div className="text-sm text-ink-3">Invalid input values</div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-[4px] border border-line bg-bg-raised p-4 min-h-[300px]">
          <h5 className="kicker mb-4 w-full text-left">Normalized Array Factor (dB)</h5>
          {patternData.length > 0 ? (
            <PolarPlot data={patternData} isDb={true} minDb={-40} />
          ) : (
            <div className="text-sm text-ink-3">Waiting for valid inputs to plot.</div>
          )}
        </div>
      </div>
    </div>
  );
}

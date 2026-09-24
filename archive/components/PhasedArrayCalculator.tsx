// ARCHIVED 2026-09-24. Frozen copy of the 2D uniform-linear-array calculator that lived in
// src/components/AdvancedCalculators.tsx, replaced by the 3D Phased Array Beam Lab
// (src/components/rf/PhasedArrayLab.tsx). Not built, linted or type-checked; imports are
// recorded as they were and may no longer resolve.
'use client';

import React, { useState } from 'react';
import { PolarPlot } from './PolarPlot';
import { RFModelBadge } from './RFModelBadge';

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
    <div className="bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-8">
      <h4 className="text-lg font-bold text-eng-blue dark:text-blue-300 mb-6">Phased Array & Array Factor Analysis (ULA)</h4>
      <RFModelBadge level="closed-form" detail="Uniform isotropic narrowband array factor, not realized radiation pattern." />
      
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Number of Elements (N)</label>
              <input type="number" step="1" min="1" value={numElements} onChange={(e) => setNumElements(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Element Spacing (λ)</label>
              <input type="number" step="0.05" min="0.1" value={spacing} onChange={(e) => setSpacing(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Scan Angle (Degrees from Broadside)</label>
              <input type="number" step="1" value={scanAngle} onChange={(e) => setScanAngle(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3 mt-4">
            <h5 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2">Array Metrics</h5>
            {patternData.length > 0 ? (
              <>
                <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Approx. HPBW</span> <span className="font-mono font-medium">{Math.min(hpbw, 180).toFixed(1)}°</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Max Spacing (Grating Lobe Free)</span> <span className="font-mono font-medium">{maxD.toFixed(3)} λ</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Grating Lobes Present?</span> <span className={`font-mono font-bold ${parseFloat(spacing) >= maxD ? 'text-red-500' : 'text-green-500'}`}>{parseFloat(spacing) >= maxD ? 'Yes' : 'No'}</span></div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Closed-form HPBW/grating-lobe estimates for a uniform, narrowband linear array of equal isotropic elements. The plot is normalized array factor—not the realized antenna radiation pattern—and excludes element pattern, mutual coupling, scan loss, feed errors, edge effects, and polarization.</p>
              </>
            ) : (
              <div className="text-sm text-gray-400">Invalid input values</div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4 min-h-[300px]">
          <h5 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-4 w-full text-left">Normalized Array Factor (dB)</h5>
          {patternData.length > 0 ? (
            <PolarPlot data={patternData} isDb={true} minDb={-40} />
          ) : (
            <div className="text-sm text-gray-400">Waiting for valid inputs to plot.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ARCHIVED 2026-09-24. Frozen copy of the form-only FMCW calculator that lived in
// src/components/Calculators.tsx, replaced by the animated FMCW chirp scope
// (src/components/rf/fmcw/FmcwScope.tsx), which keeps the same three results.
// Not built, linted or type-checked; imports are recorded as they were.
'use client';

import React, { useState } from 'react';
import { RFModelBadge } from './RFModelBadge';

/* =========================================================================
   FMCW Radar Calculator
   ========================================================================= */

export function FMCWRadarCalculator() {
  const [bw, setBw] = useState<string>('4'); // GHz
  const [tc, setTc] = useState<string>('20'); // us
  const [ifBw, setIfBw] = useState<string>('10'); // MHz

  const calcFMCW = () => {
    const B_GHz = parseFloat(bw);
    const Tc_us = parseFloat(tc);
    const ifBw_MHz = parseFloat(ifBw);

    if (isNaN(B_GHz) || isNaN(Tc_us) || isNaN(ifBw_MHz) || B_GHz <= 0 || Tc_us <= 0 || ifBw_MHz <= 0) return null;

    const B_Hz = B_GHz * 1e9;
    const Tc_s = Tc_us * 1e-6;
    const ifBw_Hz = ifBw_MHz * 1e6;
    const c = 299792458; // m/s

    const rangeRes = c / (2 * B_Hz); // meters
    const chirpSlope = B_Hz / Tc_s; // Hz/s
    const maxRange = (ifBw_Hz * c) / (2 * chirpSlope);

    return {
      rangeRes: rangeRes * 100,
      chirpSlopeMHzPerUs: chirpSlope / 1e12,
      maxRange,
    }; // cm, MHz/us, m
  };

  const results = calcFMCW();

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-8">
      <h4 className="text-lg font-bold text-eng-blue dark:text-blue-300 mb-6">FMCW Radar Parameters</h4>
      <RFModelBadge level="closed-form" detail="Ideal linear chirp and stationary-target beat-frequency limit." />
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Bandwidth (GHz)</label>
            <input type="number" step="0.1" value={bw} onChange={(e) => setBw(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Chirp Time Tc (μs)</label>
            <input type="number" step="1" value={tc} onChange={(e) => setTc(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">IF / ADC Bandwidth (MHz)</label>
            <input type="number" step="0.1" value={ifBw} onChange={(e) => setIfBw(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
          <h5 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2">Results</h5>
          {results ? (
            <>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Range Resolution</span> <span className="font-mono font-medium text-uci-blue dark:text-blue-400 text-lg">{results.rangeRes.toFixed(2)} cm</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Chirp Slope</span> <span className="font-mono font-medium">{results.chirpSlopeMHzPerUs.toFixed(2)} MHz/μs</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">IF-Limited Max Range</span> <span className="font-mono font-medium">{results.maxRange.toFixed(2)} m</span></div>
            </>
          ) : (
            <div className="text-sm text-gray-400">Invalid input values</div>
          )}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            First-order, stationary-target result. Max range uses the beat-frequency limit Rmax=fIF,max·c/(2S), S=B/Tc; Doppler-range coupling, sampling/Nyquist margin, analog filters, chirp settling, and waveform timing are excluded.
          </div>
        </div>
      </div>
    </div>
  );
}

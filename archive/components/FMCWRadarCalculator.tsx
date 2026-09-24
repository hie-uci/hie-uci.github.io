// ARCHIVED 2026-09-24. Frozen copy of the pre-redesign FMCW calculator from
// src/components/Calculators.tsx. Superseded by the animated FMCW chirp scope
// (src/components/rf/fmcw/FmcwScope.tsx), which keeps the same three results.
// Not built, linted or type-checked.
'use client';

import { useState } from 'react';

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
    <div>
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div>
            <label className="field-label">Bandwidth (GHz)</label>
            <input type="number" step="0.1" value={bw} onChange={(e) => setBw(e.target.value)} className="field-input" />
          </div>
          <div>
            <label className="field-label">Chirp Time Tc (μs)</label>
            <input type="number" step="1" value={tc} onChange={(e) => setTc(e.target.value)} className="field-input" />
          </div>
          <div>
            <label className="field-label">IF / ADC Bandwidth (MHz)</label>
            <input type="number" step="0.1" value={ifBw} onChange={(e) => setIfBw(e.target.value)} className="field-input" />
          </div>
        </div>
        <div className="readout-panel space-y-3">
          <h5 className="kicker mb-3">Results</h5>
          {results ? (
            <>
              <div className="flex justify-between items-center"><span className="text-ink-2">Range Resolution</span> <span className="readout text-lg text-accent-ink">{results.rangeRes.toFixed(2)} cm</span></div>
              <div className="flex justify-between items-center"><span className="text-ink-2">Chirp Slope</span> <span className="readout">{results.chirpSlopeMHzPerUs.toFixed(2)} MHz/μs</span></div>
              <div className="flex justify-between items-center"><span className="text-ink-2">IF-Limited Max Range</span> <span className="readout">{results.maxRange.toFixed(2)} m</span></div>
            </>
          ) : (
            <div className="text-sm text-ink-3">Invalid input values</div>
          )}
          <div className="text-xs leading-relaxed text-ink-3">
            First-order, stationary-target result. Max range uses the beat-frequency limit Rmax=fIF,max·c/(2S), S=B/Tc; Doppler-range coupling, sampling/Nyquist margin, analog filters, chirp settling, and waveform timing are excluded.
          </div>
        </div>
      </div>
    </div>
  );
}

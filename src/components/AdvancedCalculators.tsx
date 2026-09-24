'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { SmithChart } from './SmithChart';
import { RFModelBadge } from './RFModelBadge';
import PhasedArrayLab from './rf/PhasedArrayLab';
import { designRectangularPatch } from '@/lib/patchAntenna';

// three.js loads with the first 3D stage that mounts, never with the page.
const PatchStage = dynamic(() => import('./rf/three/PatchStage'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse bg-surface-2/40" aria-hidden="true" />,
});

/* =========================================================================
   Impedance Matching Synthesizer (L-Match)
   ========================================================================= */

interface LMatchSolution {
  type: string;
  series: string;
  shunt: string;
  shuntPos: 'Load Side' | 'Source Side';
  seriesX: number;
  shuntB: number;
}

function formatSeriesReactance(reactance: number, omega: number): string {
  if (Math.abs(reactance) < 1e-12) return '0 Ω (wire)';
  return reactance > 0
    ? `L = ${(reactance / omega * 1e9).toFixed(2)} nH`
    : `C = ${(-1 / (omega * reactance) * 1e12).toFixed(2)} pF`;
}

function formatShuntSusceptance(susceptance: number, omega: number): string {
  if (Math.abs(susceptance) < 1e-15) return '0 S (open)';
  return susceptance > 0
    ? `C = ${(susceptance / omega * 1e12).toFixed(2)} pF`
    : `L = ${(-1 / (omega * susceptance) * 1e9).toFixed(2)} nH`;
}

export function ImpedanceMatchingCalculator() {
  const [rs, setRs] = useState<string>('10');
  const [xs, setXs] = useState<string>('-15');
  const [rl, setRl] = useState<string>('50');
  const [xl, setXl] = useState<string>('0');
  const [freq, setFreq] = useState<string>('2.45');

  const calcLMatch = (): LMatchSolution[] => {
    const Rs = parseFloat(rs);
    const Xs = parseFloat(xs);
    const Rl = parseFloat(rl);
    const Xl = parseFloat(xl);
    const fGHz = parseFloat(freq);

    if (isNaN(Rs) || isNaN(Xs) || isNaN(Rl) || isNaN(Xl) || isNaN(fGHz) || Rs <= 0 || Rl <= 0 || fGHz <= 0) return [];

    const omega = 2.0 * Math.PI * (fGHz * 1e9);
    const solutions: LMatchSolution[] = [];

    const RpL = (Rl * Rl + Xl * Xl) / Rl;
    const RpS = (Rs * Rs + Xs * Xs) / Rs;

    // Topology A: Shunt at Load, Series at Source
    // Valid if RpL >= Rs
    if (RpL >= Rs) {
      const underRoot = (Rl / Rs) * (Rl * Rl + Xl * Xl) - Rl * Rl;
      if (underRoot >= 0) {
        const root = Math.sqrt(underRoot);
        const den = Rl * Rl + Xl * Xl;
        
        // Sol A1 (+ root)
        const B1 = (Xl + root) / den;
        const X1 = (B1 * den - Xl) / (Rl / Rs) - Xs;
        
        // Output components
        const compSeries1 = formatSeriesReactance(X1, omega);
        const compShunt1 = formatShuntSusceptance(B1, omega);
        solutions.push({ type: 'Sol A1 (Shunt at Load)', series: compSeries1, shunt: compShunt1, shuntPos: 'Load Side', seriesX: X1, shuntB: B1 });

        // Sol A2 (- root)
        const B2 = (Xl - root) / den;
        const X2 = (B2 * den - Xl) / (Rl / Rs) - Xs;
        
        const compSeries2 = formatSeriesReactance(X2, omega);
        const compShunt2 = formatShuntSusceptance(B2, omega);
        solutions.push({ type: 'Sol A2 (Shunt at Load)', series: compSeries2, shunt: compShunt2, shuntPos: 'Load Side', seriesX: X2, shuntB: B2 });
      }
    }

    // Topology B: Shunt at Source, Series at Load
    // Valid if RpS >= Rl
    if (RpS >= Rl) {
      const underRoot = (Rl / Rs) * (Rs * Rs + Xs * Xs) - Rl * Rl;
      if (underRoot >= 0) {
        const root = Math.sqrt(underRoot);
        const den = Rs * Rs + Xs * Xs;
        
        // Sol B1 (+ root)
        const X1 = -Xl + root;
        const B1 = (Xs + (X1 + Xl) / (Rl / Rs)) / den;
        
        const compSeries1 = formatSeriesReactance(X1, omega);
        const compShunt1 = formatShuntSusceptance(B1, omega);
        solutions.push({ type: 'Sol B1 (Shunt at Source)', series: compSeries1, shunt: compShunt1, shuntPos: 'Source Side', seriesX: X1, shuntB: B1 });

        // Sol B2 (- root)
        const X2 = -Xl - root;
        const B2 = (Xs + (X2 + Xl) / (Rl / Rs)) / den;
        
        const compSeries2 = formatSeriesReactance(X2, omega);
        const compShunt2 = formatShuntSusceptance(B2, omega);
        solutions.push({ type: 'Sol B2 (Shunt at Source)', series: compSeries2, shunt: compShunt2, shuntPos: 'Source Side', seriesX: X2, shuntB: B2 });
      }
    }

    return solutions;
  };

  const solutions = calcLMatch();

  // Normalize for Smith Chart
  const z0 = 50;
  const sourceR = parseFloat(rs) / z0;
  const sourceX = parseFloat(xs) / z0;
  // Matching targets Z_S conjugate
  const targetR = sourceR;
  const targetX = -sourceX; 
  
  const loadR = parseFloat(rl) / z0;
  const loadX = parseFloat(xl) / z0;

  const validPoints = !isNaN(sourceR) && !isNaN(sourceX) && !isNaN(loadR) && !isNaN(loadX);

  // Compute intermediate point for the FIRST solution for trajectory
  let midR = loadR;
  let midX = loadX;
  
  if (validPoints && solutions.length > 0) {
    const sol = solutions[0];
    
    if (sol.shuntPos === 'Load Side') {
      // Shunt is at load
      const den = Math.pow(parseFloat(rl), 2) + Math.pow(parseFloat(xl), 2);
      const gLoad = parseFloat(rl) / den;
      let bLoad = -parseFloat(xl) / den;
      
      bLoad += sol.shuntB; // add susceptance
      
      const denY = gLoad * gLoad + bLoad * bLoad;
      midR = (gLoad / denY) / z0;
      midX = (-bLoad / denY) / z0;
    } else {
      // Series is at load
      const zReal = parseFloat(rl);
      let zImag = parseFloat(xl);
      
      zImag += sol.seriesX; // add reactance
      
      midR = zReal / z0;
      midX = zImag / z0;
    }
  }

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-8">
      <h4 className="text-lg font-bold text-eng-blue dark:text-blue-300 mb-6">L-Network Impedance Matching Synthesizer</h4>
      <RFModelBadge level="identity" detail="Ideal lossless single-frequency lumped-network synthesis." />
      
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Source Resistance (Ω)</label>
              <input type="number" step="any" value={rs} onChange={(e) => setRs(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Source Reactance (Ω)</label>
              <input type="number" step="any" value={xs} onChange={(e) => setXs(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Load Resistance (Ω)</label>
              <input type="number" step="any" value={rl} onChange={(e) => setRl(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Load Reactance (Ω)</label>
              <input type="number" step="any" value={xl} onChange={(e) => setXl(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Frequency (GHz)</label>
              <input type="number" step="0.1" value={freq} onChange={(e) => setFreq(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-4">
            <h5 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2">Synthesized Networks</h5>
            {solutions.length > 0 ? (
              solutions.map((sol, i) => (
                <div key={i} className="p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="text-xs font-bold text-uci-blue uppercase tracking-wide mb-2">{sol.type} Solution</div>
                  <div className="flex justify-between items-center text-sm mb-1"><span className="text-gray-600 dark:text-gray-400">Series Component</span> <span className="font-mono font-medium">{sol.series}</span></div>
                  <div className="flex justify-between items-center text-sm"><span className="text-gray-600 dark:text-gray-400">Shunt Component ({sol.shuntPos})</span> <span className="font-mono font-medium text-eecs-teal">{sol.shunt}</span></div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-400">No valid L-match solution. Source and Load might be identical or invalid input.</div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4 min-h-[300px]">
          <h5 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-4 w-full text-left">Interactive Smith Chart (Sol 1)</h5>
          {validPoints ? (
            <SmithChart 
              points={[
                { r: sourceR, x: sourceX, label: 'Z_S', color: '#64748b' },
                { r: loadR, x: loadX, label: 'Z_L', color: '#0064a4' },
                { r: targetR, x: targetX, label: 'Z_S*', color: '#e03b24' },
                ...(solutions.length > 0 ? [{ r: midR, x: midX, color: '#f5a90f' }] : [])
              ]}
              paths={[
                ...(solutions.length > 0 ? [
                  { start: { r: loadR, x: loadX }, end: { r: midR, x: midX }, color: '#0064a4' },
                  { start: { r: midR, x: midX }, end: { r: targetR, x: targetX }, color: '#e03b24' }
                ] : [
                  { start: { r: sourceR, x: sourceX }, end: { r: loadR, x: loadX }, color: '#94a3b8' }
                ])
              ]}
            />
          ) : (
            <div className="text-sm text-gray-400">Waiting for valid inputs to plot.</div>
          )}
          <div className="text-xs text-slate-500 mt-2 text-center">Blue: Unmatched Load | Orange: Intermediate | Red: Matched (Z_S*)</div>
          <div className="text-xs text-slate-500 mt-2 text-center">Ideal, lossless, single-frequency L match. Component Q, self-resonance, pads/vias, distributed effects, stability, and realizability are not included.</div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   Receiver Cascade Analysis
   ========================================================================= */

export function ReceiverCascadeCalculator() {
  const [bw, setBw] = useState<string>('20'); // MHz
  const [nf, setNf] = useState<string>('3.5'); // dB
  const [iip3, setIip3] = useState<string>('-5.0'); // dBm
  const [snr, setSnr] = useState<string>('10.0'); // dB
  const [loss, setLoss] = useState<string>('2.0'); // dB

  const calcReceiver = () => {
    const bwHz = parseFloat(bw) * 1e6;
    const nF = parseFloat(nf);
    const ip3 = parseFloat(iip3);
    const sNr = parseFloat(snr);
    const lOss = parseFloat(loss);
    
    if (isNaN(bwHz) || isNaN(nF) || isNaN(ip3) || isNaN(sNr) || isNaN(lOss) || bwHz <= 0) return null;

    // Noise floor = -174 + 10*log10(BW) + NF
    const noiseFloor = -174.0 + 10.0 * Math.log10(bwHz) + nF;
    const mds = noiseFloor + sNr;
    const sfdr = (2.0 / 3.0) * (ip3 - noiseFloor);
    const sensitivity = mds + lOss;

    return { noiseFloor, sfdr, sensitivity };
  };

  const results = calcReceiver();

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-8">
      <h4 className="text-lg font-bold text-eng-blue dark:text-blue-300 mb-6">System Receiver Analysis (MDS & SFDR)</h4>
      <RFModelBadge level="closed-form" detail="Standard 290 K noise and third-order SFDR assumptions." />
      
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Bandwidth (MHz)</label>
              <input type="number" step="any" value={bw} onChange={(e) => setBw(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">System NF (dB)</label>
              <input type="number" step="0.1" value={nf} onChange={(e) => setNf(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">System IIP3 (dBm)</label>
              <input type="number" step="0.1" value={iip3} onChange={(e) => setIip3(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Required SNR (dB)</label>
              <input type="number" step="0.1" value={snr} onChange={(e) => setSnr(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Implementation Loss (dB)</label>
              <input type="number" step="0.1" value={loss} onChange={(e) => setLoss(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
          <h5 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2">Performance Metrics</h5>
          {results ? (
            <>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Input-Referred Receiver Noise</span> <span className="font-mono font-medium">{results.noiseFloor.toFixed(2)} dBm</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Spurious-Free Dynamic Range (SFDR)</span> <span className="font-mono font-medium text-uci-blue dark:text-blue-400">{results.sfdr.toFixed(2)} dB</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Receiver Sensitivity</span> <span className="font-mono font-medium text-green-600 dark:text-green-400 text-lg">{results.sensitivity.toFixed(2)} dBm</span></div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Uses −174 dBm/Hz at 290 K plus bandwidth and NF. SFDR=(2/3)(IIP3−noise) assumes two equal in-band interferers, third-order products, a 1 Hz-equivalent comparison convention, and no blockers, reciprocal mixing, compression, quantization, or phase-noise limit.</p>
            </>
          ) : (
            <div className="text-sm text-gray-400">Invalid input values</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   Patch Antenna Synthesis
   ========================================================================= */

export function PatchAntennaCalculator() {
  const [er, setEr] = useState<string>('4.4');
  const [height, setHeight] = useState<string>('1.6');
  const [freq, setFreq] = useState<string>('2.45');

  const erVal = parseFloat(er);
  const heightVal = parseFloat(height);
  const freqVal = parseFloat(freq);
  const valid = [erVal, heightVal, freqVal].every(Number.isFinite) && erVal >= 1 && heightVal > 0 && freqVal > 0;
  const results = valid ? designRectangularPatch({ er: erVal, heightMm: heightVal, frequencyGHz: freqVal }) : null;

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-8">
      <h4 className="text-lg font-bold text-eng-blue dark:text-blue-300 mb-6">Microstrip Patch Antenna Synthesis</h4>
      <RFModelBadge level="closed-form" detail="Balanis transmission-line and cavity models for the TM010 patch; verify with full-wave EM." />
      
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Dielectric Constant (εr)</label>
              <input type="number" step="0.1" value={er} onChange={(e) => setEr(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Substrate Height (mm)</label>
              <input type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Target Frequency (GHz)</label>
              <input type="number" step="0.1" value={freq} onChange={(e) => setFreq(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
            <h5 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2">Physical Dimensions</h5>
            {results ? (
              <>
                <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Patch Width (W)</span> <span className="font-mono font-medium text-uci-blue dark:text-blue-400 text-lg">{results.widthMm.toFixed(2)} mm</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Patch Length (L)</span> <span className="font-mono font-medium text-uci-blue dark:text-blue-400 text-lg">{results.lengthMm.toFixed(2)} mm</span></div>
                <hr className="border-gray-200 dark:border-gray-700 my-2" />
                <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Effective Permittivity (εeff)</span> <span className="font-mono font-medium">{results.effectivePermittivity.toFixed(3)}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Edge Resistance at Resonance</span> <span className="font-mono font-medium">{results.edgeResistanceOhm.toFixed(1)} Ω</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Directivity</span> <span className="font-mono font-medium text-eecs-teal">{results.directivityDbi.toFixed(2)} dBi</span></div>
                <p className="text-xs text-gray-500 dark:text-gray-400">First-order models from Balanis, <i>Antenna Theory</i>, ch. 14, for the TM₀₁₀ mode on a thin substrate over an infinite ground plane. W, εeff, the fringing extension ΔL and L come from the transmission-line model. The edge resistance is 1 / (2(G₁ + G₁₂)), with the slot conductance G₁ and the mutual conductance G₁₂ between the two radiating slots integrated numerically. The directivity integrates the two-slot cavity-model pattern that the 3D view draws. Feed geometry, finite ground, conductor and dielectric loss, surface waves, fabrication tolerance, and bandwidth need full-wave EM.</p>
              </>
            ) : (
              <div className="text-sm text-gray-400">Invalid input values</div>
            )}
          </div>
        </div>

        <div className="graph-grid relative min-h-[320px] overflow-hidden rounded-xl border border-line bg-bg-raised lg:min-h-[400px]">
          {results && (
            <PatchStage
              widthMm={results.widthMm}
              lengthMm={results.lengthMm}
              effectiveLengthMm={results.effectiveLengthMm}
              heightMm={heightVal}
              freqGHz={freqVal}
              label={`Rectangular patch ${results.widthMm.toFixed(1)} by ${results.lengthMm.toFixed(1)} mm on a ${height} mm substrate, with its broadside pattern`}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   Phased Array Beam Lab (3D). The 2D linear-array calculator it replaced is
   frozen in archive/components/PhasedArrayCalculator.tsx.
   ========================================================================= */

export function PhasedArrayCalculator() {
  return (
    <div className="bg-white/70 dark:bg-slate-900/70 p-4 sm:p-6 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-8">
      <h4 className="text-lg font-bold text-eng-blue dark:text-blue-300 mb-6">Phased Array Beam Lab</h4>
      <RFModelBadge level="closed-form" detail="Uniform-grid narrowband array factor times an ideal element pattern; not a realized radiation pattern." />
      <PhasedArrayLab />
    </div>
  );
}

/* =========================================================================
   PLL Loop Filter Synthesizer
   ========================================================================= */

export function PLLCalculator() {
  const [fc, setFc] = useState<string>('100'); // kHz
  const [pm, setPm] = useState<string>('45'); // Degrees
  const [kvco, setKvco] = useState<string>('50'); // MHz/V
  const [icp, setIcp] = useState<string>('5'); // mA
  const [n, setN] = useState<string>('100'); // Divider

  const calcPLL = () => {
    const f_c = parseFloat(fc) * 1e3; // Hz
    const phi = parseFloat(pm) * Math.PI / 180.0;
    const K_vco = parseFloat(kvco) * 1e6; // Hz/V
    const I_cp = parseFloat(icp) * 1e-3; // A
    const N_div = parseFloat(n);

    if (isNaN(f_c) || isNaN(phi) || isNaN(K_vco) || isNaN(I_cp) || isNaN(N_div) || f_c <= 0 || phi <= 0 || phi >= Math.PI/2 || K_vco <= 0 || I_cp <= 0 || N_div <= 0) return null;

    const w_c = 2.0 * Math.PI * f_c;
    const secPhi = 1.0 / Math.cos(phi);
    const tanPhi = Math.tan(phi);

    const T2 = (secPhi + tanPhi) / w_c;
    const T1 = (secPhi - tanPhi) / w_c;

    const C_tot = (I_cp * K_vco) / (N_div * w_c * w_c) * Math.sqrt(T2 / T1);
    
    const C1 = C_tot * (T1 / T2);
    const C2 = C_tot - C1;
    const R2 = T2 / C2;

    return { C1, C2, R2 };
  };

  const results = calcPLL();

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-8">
      <h4 className="text-lg font-bold text-eng-blue dark:text-blue-300 mb-6">PLL Loop Filter Synthesis (2nd Order Passive)</h4>
      <RFModelBadge level="closed-form" detail="Ideal Type-II second-order charge-pump PLL synthesis." />
      
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Target Unity-Gain Crossover (kHz)</label>
              <input type="number" step="any" value={fc} onChange={(e) => setFc(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phase Margin (Degrees)</label>
              <input type="number" step="any" value={pm} onChange={(e) => setPm(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">VCO Gain (MHz/V)</label>
              <input type="number" step="any" value={kvco} onChange={(e) => setKvco(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Charge Pump Current (mA)</label>
              <input type="number" step="any" value={icp} onChange={(e) => setIcp(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Feedback Divider Ratio (N)</label>
              <input type="number" step="1" value={n} onChange={(e) => setN(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
          <h5 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2">Filter Components</h5>
          {results ? (
            <>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Shunt Capacitor (C1)</span> <span className="font-mono font-medium text-uci-blue dark:text-blue-400 text-lg">{(results.C1 * 1e12 > 1000 ? results.C1 * 1e9 : results.C1 * 1e12).toFixed(2)} {results.C1 * 1e12 > 1000 ? 'nF' : 'pF'}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Series Capacitor (C2)</span> <span className="font-mono font-medium text-uci-blue dark:text-blue-400 text-lg">{(results.C2 * 1e12 > 1000 ? results.C2 * 1e9 : results.C2 * 1e12).toFixed(2)} {results.C2 * 1e12 > 1000 ? 'nF' : 'pF'}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Series Resistor (R2)</span> <span className="font-mono font-medium text-eecs-teal text-lg">{(results.R2 > 1000 ? results.R2 / 1e3 : results.R2).toFixed(2)} {results.R2 > 1000 ? 'kΩ' : 'Ω'}</span></div>
            </>
          ) : (
            <div className="text-sm text-gray-400">Invalid input values</div>
          )}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Ideal Type-II, second-order charge-pump PLL synthesis using Kpd=Icp/(2π), Kvco in Hz/V, no extra pole, and the entered crossover/phase margin. Charge-pump output resistance, VCO input capacitance, leakage, delay, reference spurs, discrete component choices, and PVT are excluded; verify the implemented loop in a PLL simulator before tapeout or hardware release.
          </div>
        </div>
      </div>
    </div>
  );
}

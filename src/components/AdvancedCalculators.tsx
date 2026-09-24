'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { SmithChart } from './SmithChart';
import { RFModelBadge } from './RFModelBadge';
import PhasedArrayLab from './rf/PhasedArrayLab';
import { designRectangularPatch } from '@/lib/patchAntenna';
import { lMatchSolutions, passiveLoopFilter2, receiverBudget } from '@/lib/rfCalculators';

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
    const [Rs, Xs, Rl, Xl, fGHz] = [rs, xs, rl, xl, freq].map(parseFloat);
    if (![Rs, Xs, Rl, Xl, fGHz].every(Number.isFinite) || Rs <= 0 || Rl <= 0 || fGHz <= 0) return [];
    const omega = 2.0 * Math.PI * (fGHz * 1e9);
    const counters = { 'shunt-at-load': 0, 'shunt-at-source': 0 };
    return lMatchSolutions(Rs, Xs, Rl, Xl).map((sol) => {
      const atLoad = sol.topology === 'shunt-at-load';
      counters[sol.topology] += 1;
      return {
        type: `Sol ${atLoad ? 'A' : 'B'}${counters[sol.topology]} (Shunt at ${atLoad ? 'Load' : 'Source'})`,
        series: formatSeriesReactance(sol.seriesX, omega),
        shunt: formatShuntSusceptance(sol.shuntB, omega),
        shuntPos: atLoad ? 'Load Side' : 'Source Side',
        seriesX: sol.seriesX,
        shuntB: sol.shuntB,
      };
    });
  };

  const solutions = calcLMatch();

  // Normalize for Smith Chart
  const z0 = 50;
  const [sourceR, sourceX, loadR, loadX] = [rs, xs, rl, xl].map((v) => parseFloat(v) / z0);
  // Matching targets Z_S conjugate
  const targetR = sourceR;
  const targetX = -sourceX;
  const validPoints = [sourceR, sourceX, loadR, loadX].every(Number.isFinite);

  // The first solution's path from the load: a shunt element moves along a constant-conductance
  // circle and a series element along a constant-resistance circle, so both legs are arcs.
  const toGamma = (r: number, x: number) => {
    const den = (r + 1) ** 2 + x * x;
    return { real: (r * r + x * x - 1) / den, imag: (2 * x) / den };
  };
  const seriesArc = (r: number, x0: number, x1: number) => Array.from({ length: 65 }, (_, k) => toGamma(r, x0 + ((x1 - x0) * k) / 64));
  const shuntArc = (r: number, x: number, deltaB: number) => {
    const den = r * r + x * x;
    const [g, b0] = [r / den, -x / den];
    return Array.from({ length: 65 }, (_, k) => {
      const b = b0 + (deltaB * k) / 64;
      const d = g * g + b * b;
      return toGamma(g / d, -b / d);
    });
  };
  const first = solutions[0];
  const trajectories = validPoints && first
    ? first.shuntPos === 'Load Side'
      ? (() => {
          const leg1 = shuntArc(loadR, loadX, first.shuntB * z0);
          const end = leg1[leg1.length - 1];
          const mid = { r: (1 - end.real ** 2 - end.imag ** 2) / ((1 - end.real) ** 2 + end.imag ** 2), x: (2 * end.imag) / ((1 - end.real) ** 2 + end.imag ** 2) };
          return [
            { points: leg1, color: '#0064a4', name: 'shunt' },
            { points: seriesArc(mid.r, mid.x, mid.x + first.seriesX / z0), color: '#e03b24', name: 'series' },
          ];
        })()
      : (() => {
          const leg1 = seriesArc(loadR, loadX, loadX + first.seriesX / z0);
          return [
            { points: leg1, color: '#0064a4', name: 'series' },
            { points: shuntArc(loadR, loadX + first.seriesX / z0, first.shuntB * z0), color: '#e03b24', name: 'shunt' },
          ];
        })()
    : [];
  const midGamma = trajectories[0]?.points.at(-1);

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
          <h5 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-4 w-full text-left">Smith Chart Path (Solution 1)</h5>
          {validPoints ? (
            <SmithChart
              points={[
                { r: sourceR, x: sourceX, label: 'Z_S', color: '#64748b' },
                { r: loadR, x: loadX, label: 'Z_L', color: '#0064a4' },
                { r: targetR, x: targetX, label: 'Z_S*', color: '#e03b24' },
                ...(midGamma ? [{ r: (1 - midGamma.real ** 2 - midGamma.imag ** 2) / ((1 - midGamma.real) ** 2 + midGamma.imag ** 2), x: (2 * midGamma.imag) / ((1 - midGamma.real) ** 2 + midGamma.imag ** 2), color: '#f5a90f' }] : [])
              ]}
              paths={solutions.length > 0 ? [] : [{ start: { r: sourceR, x: sourceX }, end: { r: loadR, x: loadX }, color: '#94a3b8' }]}
              gammaTrajectories={trajectories}
            />
          ) : (
            <div className="text-sm text-gray-400">Waiting for valid inputs to plot.</div>
          )}
          <div className="text-xs text-slate-500 mt-2 text-center">Blue arc: first element from the load · orange dot: intermediate impedance · red arc: second element, ending on Z_S*. Series elements follow constant-resistance circles, shunt elements constant-conductance circles.</div>
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
    const [bandwidthMHz, noiseFigureDb, iip3Dbm, requiredSnrDb, implementationLossDb] = [bw, nf, iip3, snr, loss].map(parseFloat);
    if (![bandwidthMHz, noiseFigureDb, iip3Dbm, requiredSnrDb, implementationLossDb].every(Number.isFinite) || bandwidthMHz <= 0) return null;
    const r = receiverBudget({ bandwidthHz: bandwidthMHz * 1e6, noiseFigureDb, iip3Dbm, requiredSnrDb, implementationLossDb });
    return { noiseFloor: r.noiseFloorDbm, sfdr: r.sfdrDb, sensitivity: r.sensitivityDbm };
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
              <p className="text-xs text-gray-500 dark:text-gray-400">Uses −174 dBm/Hz at 290 K plus bandwidth and NF. SFDR = (2/3)(IIP3 − N), with N the noise floor integrated over the stated bandwidth, is the range at which two equal in-band tones produce third-order products just at the floor; blockers, reciprocal mixing, compression, quantization, and phase-noise limits are excluded. Sensitivity adds the required SNR and the implementation loss to N.</p>
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
    const [fcKHz, pmDeg, kvcoMHz, icpMA, nDiv] = [fc, pm, kvco, icp, n].map(parseFloat);
    if (![fcKHz, pmDeg, kvcoMHz, icpMA, nDiv].every(Number.isFinite) || fcKHz <= 0 || pmDeg <= 0 || pmDeg >= 90 || kvcoMHz <= 0 || icpMA <= 0 || nDiv <= 0) return null;
    const f = passiveLoopFilter2({ crossoverHz: fcKHz * 1e3, phaseMarginDeg: pmDeg, kvcoHzPerV: kvcoMHz * 1e6, chargePumpA: icpMA * 1e-3, divider: nDiv });
    return { C1: f.c1F, C2: f.c2F, R2: f.r2Ohm };
  };

  const results = calcPLL();

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-8">
      <h4 className="text-lg font-bold text-eng-blue dark:text-blue-300 mb-6">PLL Loop Filter Synthesis (2nd Order Passive)</h4>
      <RFModelBadge level="closed-form" detail="Ideal type-II charge-pump PLL with a second-order passive filter (a third-order loop), phase-margin peak at the crossover." />
      
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

'use client';

import React, { useState } from 'react';
import { SmithChart } from './SmithChart';
import dynamic from 'next/dynamic';

// three.js arrives with the first 3D stage, not with the page.
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
    <div>
      
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Source Resistance (Ω)</label>
              <input type="number" step="any" value={rs} onChange={(e) => setRs(e.target.value)} className="field-input" />
            </div>
            <div>
              <label className="field-label">Source Reactance (Ω)</label>
              <input type="number" step="any" value={xs} onChange={(e) => setXs(e.target.value)} className="field-input" />
            </div>
            <div>
              <label className="field-label">Load Resistance (Ω)</label>
              <input type="number" step="any" value={rl} onChange={(e) => setRl(e.target.value)} className="field-input" />
            </div>
            <div>
              <label className="field-label">Load Reactance (Ω)</label>
              <input type="number" step="any" value={xl} onChange={(e) => setXl(e.target.value)} className="field-input" />
            </div>
            <div className="col-span-2">
              <label className="field-label">Frequency (GHz)</label>
              <input type="number" step="0.1" value={freq} onChange={(e) => setFreq(e.target.value)} className="field-input" />
            </div>
          </div>

          <div className="readout-panel space-y-4">
            <h5 className="kicker mb-3">Synthesized Networks</h5>
            {solutions.length > 0 ? (
              solutions.map((sol, i) => (
                <div key={i} className="rounded-[4px] border border-line bg-surface p-4">
                  <div className="text-xs font-bold text-uci-blue uppercase tracking-wide mb-2">{sol.type} Solution</div>
                  <div className="flex justify-between items-center text-sm mb-1"><span className="text-ink-2">Series Component</span> <span className="font-mono font-medium">{sol.series}</span></div>
                  <div className="flex justify-between items-center text-sm"><span className="text-ink-2">Shunt Component ({sol.shuntPos})</span> <span className="readout text-trace-2">{sol.shunt}</span></div>
                </div>
              ))
            ) : (
              <div className="text-sm text-ink-3">No valid L-match solution. Source and Load might be identical or invalid input.</div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-[4px] border border-line bg-bg-raised p-4 min-h-[300px]">
          <h5 className="kicker mb-4 w-full text-left">Smith chart · solution 1</h5>
          {validPoints ? (
            <SmithChart
              points={[
                { r: sourceR, x: sourceX, label: 'Z_S', color: 'var(--ink-3)' },
                { r: loadR, x: loadX, label: 'Z_L', color: 'var(--series-1)' },
                { r: targetR, x: targetX, label: 'Z_S*', color: 'var(--series-4)' },
                ...(solutions.length > 0 ? [{ r: midR, x: midX, color: 'var(--series-2)' }] : [])
              ]}
              paths={[
                ...(solutions.length > 0 ? [
                  { start: { r: loadR, x: loadX }, end: { r: midR, x: midX }, color: 'var(--series-1)' },
                  { start: { r: midR, x: midX }, end: { r: targetR, x: targetX }, color: 'var(--series-4)' }
                ] : [
                  { start: { r: sourceR, x: sourceX }, end: { r: loadR, x: loadX }, color: 'var(--line-strong)' }
                ])
              ]}
            />
          ) : (
            <div className="text-sm text-ink-3">Waiting for valid inputs to plot.</div>
          )}
          <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5 font-mono text-[10.5px] text-ink-3 [font-stretch:87.5%]">
            {[
              ['var(--series-1)', 'Load Z_L'],
              ['var(--series-2)', 'Intermediate'],
              ['var(--series-4)', 'Matched Z_S*'],
              ['var(--ink-3)', 'Source Z_S'],
            ].map(([colour, label]) => (
              <li key={label} className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ background: colour }} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
          <div className="text-xs text-ink-3 mt-2 text-center">Ideal, lossless, single-frequency L match. Component Q, self-resonance, pads/vias, distributed effects, stability, and realizability are not included.</div>
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
    <div>
      
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Bandwidth (MHz)</label>
              <input type="number" step="any" value={bw} onChange={(e) => setBw(e.target.value)} className="field-input" />
            </div>
            <div>
              <label className="field-label">System NF (dB)</label>
              <input type="number" step="0.1" value={nf} onChange={(e) => setNf(e.target.value)} className="field-input" />
            </div>
            <div>
              <label className="field-label">System IIP3 (dBm)</label>
              <input type="number" step="0.1" value={iip3} onChange={(e) => setIip3(e.target.value)} className="field-input" />
            </div>
            <div>
              <label className="field-label">Required SNR (dB)</label>
              <input type="number" step="0.1" value={snr} onChange={(e) => setSnr(e.target.value)} className="field-input" />
            </div>
            <div className="col-span-2">
              <label className="field-label">Implementation Loss (dB)</label>
              <input type="number" step="0.1" value={loss} onChange={(e) => setLoss(e.target.value)} className="field-input" />
            </div>
          </div>
        </div>

        <div className="readout-panel space-y-3">
          <h5 className="kicker mb-3">Performance Metrics</h5>
          {results ? (
            <>
              <div className="flex justify-between items-center"><span className="text-ink-2">Input-Referred Receiver Noise</span> <span className="font-mono font-medium">{results.noiseFloor.toFixed(2)} dBm</span></div>
              <div className="flex justify-between items-center"><span className="text-ink-2">Spurious-Free Dynamic Range (SFDR)</span> <span className="font-mono font-medium text-accent-ink">{results.sfdr.toFixed(2)} dB</span></div>
              <div className="flex justify-between items-center"><span className="text-ink-2">Receiver Sensitivity</span> <span className="readout text-lg text-trace-2">{results.sensitivity.toFixed(2)} dBm</span></div>
              <p className="text-xs leading-relaxed text-ink-3">Uses −174 dBm/Hz at 290 K plus bandwidth and NF. SFDR=(2/3)(IIP3−noise) assumes two equal in-band interferers, third-order products, a 1 Hz-equivalent comparison convention, and no blockers, reciprocal mixing, compression, quantization, or phase-noise limit.</p>
            </>
          ) : (
            <div className="text-sm text-ink-3">Invalid input values</div>
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

  const calcAntenna = () => {
    const e = parseFloat(er);
    const h = parseFloat(height) * 1e-3; // convert to meters
    const fGHz = parseFloat(freq);
    
    if (isNaN(e) || isNaN(h) || isNaN(fGHz) || e < 1 || h <= 0 || fGHz <= 0) return null;

    const f = fGHz * 1e9;
    const c = 299792458.0;

    // Patch width
    const w = c / (2.0 * f) * Math.sqrt(2.0 / (e + 1.0));

    // Effective permittivity
    const eEff = (e + 1.0) / 2.0 + ((e - 1.0) / 2.0) * (1.0 / Math.sqrt(1.0 + 12.0 * h / w));

    // Extension length
    const deltaL = 0.412 * h * ((eEff + 0.3) * (w / h + 0.264)) / ((eEff - 0.258) * (w / h + 0.8));

    // Patch length
    const l = c / (2.0 * f * Math.sqrt(eEff)) - 2.0 * deltaL;

    // Free-space wavelength
    const lambda0 = c / f;
    const k0 = 2.0 * Math.PI / lambda0;

    // Radiation conductance G1
    const k0h = k0 * h;
    const g1 = (w / (120.0 * lambda0)) * (1.0 - k0h * k0h / 24.0);

    // Directivity approximation
    const k0w = k0 * w;
    let i1 = 0.0;
    const numSteps = 200;
    const dTheta = Math.PI / numSteps;
    for (let i = 0; i <= numSteps; i++) {
        const theta = i * dTheta;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);
        const slotFactor = Math.abs(cosT) < 1e-10 ? k0w / 2.0 : Math.sin(k0w * cosT / 2.0) / cosT;
        const weight = (i === 0 || i === numSteps) ? 0.5 : 1.0;
        i1 += slotFactor * slotFactor * sinT * weight * dTheta;
    }
    const dLinear = 2.0 * k0w * k0w / Math.max(i1, 1e-15);
    const directivity = 10.0 * Math.log10(Math.max(dLinear, 1.0));

    return { 
      width: w * 1e3, 
      length: l * 1e3, 
      directivity,
      rin: 1.0 / (2.0 * Math.max(g1, 1e-15))
    };
  };

  const results = calcAntenna();

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">Dielectric Constant (εr)</label>
            <input type="number" step="0.1" value={er} onChange={(e) => setEr(e.target.value)} className="field-input" />
          </div>
          <div>
            <label className="field-label">Substrate Height (mm)</label>
            <input type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} className="field-input" />
          </div>
          <div className="col-span-2">
            <label className="field-label">Target Frequency (GHz)</label>
            <input type="number" step="0.1" value={freq} onChange={(e) => setFreq(e.target.value)} className="field-input" />
          </div>
        </div>

        <div className="readout-panel space-y-3">
          <h5 className="kicker mb-3">Physical Dimensions</h5>
          {results ? (
            <>
              <div className="flex justify-between items-center"><span className="text-ink-2">Patch Width (W)</span> <span className="readout text-lg text-accent-ink">{results.width.toFixed(2)} mm</span></div>
              <div className="flex justify-between items-center"><span className="text-ink-2">Patch Length (L)</span> <span className="readout text-lg text-accent-ink">{results.length.toFixed(2)} mm</span></div>
              <hr className="border-line my-2" />
              <div className="flex justify-between items-center"><span className="text-ink-2">Edge Input Impedance</span> <span className="readout">{results.rin.toFixed(1)} Ω</span></div>
              <div className="flex justify-between items-center"><span className="text-ink-2">Directivity</span> <span className="readout text-trace-2">{results.directivity.toFixed(2)} dBi</span></div>
              <p className="text-xs leading-relaxed text-ink-3">First-order rectangular-patch/cavity approximation. W, εeff, fringing extension, and L are synthesis estimates; the displayed edge resistance and directivity are rough slot-model values. Feed geometry, finite ground, conductor/dielectric loss, surface waves, fabrication tolerance, and bandwidth require full-wave EM optimization.</p>
            </>
          ) : (
            <div className="text-sm text-ink-3">Invalid input values</div>
          )}
        </div>
      </div>

      <div className="graph-grid relative min-h-[360px] overflow-hidden rounded-[4px] border border-line bg-bg-raised lg:min-h-[460px]">
        {results && (
          <PatchStage
            widthMm={results.width}
            lengthMm={results.length}
            heightMm={parseFloat(height)}
            freqGHz={parseFloat(freq)}
            label={`Rectangular patch ${results.width.toFixed(1)} by ${results.length.toFixed(1)} mm on a ${height} mm substrate, with its broadside pattern`}
          />
        )}
      </div>
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
    <div>
      
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Target Unity-Gain Crossover (kHz)</label>
              <input type="number" step="any" value={fc} onChange={(e) => setFc(e.target.value)} className="field-input" />
            </div>
            <div>
              <label className="field-label">Phase Margin (Degrees)</label>
              <input type="number" step="any" value={pm} onChange={(e) => setPm(e.target.value)} className="field-input" />
            </div>
            <div>
              <label className="field-label">VCO Gain (MHz/V)</label>
              <input type="number" step="any" value={kvco} onChange={(e) => setKvco(e.target.value)} className="field-input" />
            </div>
            <div>
              <label className="field-label">Charge Pump Current (mA)</label>
              <input type="number" step="any" value={icp} onChange={(e) => setIcp(e.target.value)} className="field-input" />
            </div>
            <div className="col-span-2">
              <label className="field-label">Feedback Divider Ratio (N)</label>
              <input type="number" step="1" value={n} onChange={(e) => setN(e.target.value)} className="field-input" />
            </div>
          </div>
        </div>

        <div className="readout-panel space-y-3">
          <h5 className="kicker mb-3">Filter Components</h5>
          {results ? (
            <>
              <div className="flex justify-between items-center"><span className="text-ink-2">Shunt Capacitor (C1)</span> <span className="readout text-lg text-accent-ink">{(results.C1 * 1e12 > 1000 ? results.C1 * 1e9 : results.C1 * 1e12).toFixed(2)} {results.C1 * 1e12 > 1000 ? 'nF' : 'pF'}</span></div>
              <div className="flex justify-between items-center"><span className="text-ink-2">Series Capacitor (C2)</span> <span className="readout text-lg text-accent-ink">{(results.C2 * 1e12 > 1000 ? results.C2 * 1e9 : results.C2 * 1e12).toFixed(2)} {results.C2 * 1e12 > 1000 ? 'nF' : 'pF'}</span></div>
              <div className="flex justify-between items-center"><span className="text-ink-2">Series Resistor (R2)</span> <span className="readout text-trace-2 text-lg">{(results.R2 > 1000 ? results.R2 / 1e3 : results.R2).toFixed(2)} {results.R2 > 1000 ? 'kΩ' : 'Ω'}</span></div>
            </>
          ) : (
            <div className="text-sm text-ink-3">Invalid input values</div>
          )}
          <div className="text-xs leading-relaxed text-ink-3">
            Ideal Type-II, second-order charge-pump PLL synthesis using Kpd=Icp/(2π), Kvco in Hz/V, no extra pole, and the entered crossover/phase margin. Charge-pump output resistance, VCO input capacitance, leakage, delay, reference spurs, discrete component choices, and PVT are excluded; verify the implemented loop in a PLL simulator before tapeout or hardware release.
          </div>
        </div>
      </div>
    </div>
  );
}

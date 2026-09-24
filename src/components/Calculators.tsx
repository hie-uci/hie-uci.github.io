'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { calculateCoplanarWaveguide, calculateMicrostrip, calculateSymmetricStripline, waveguideTE10 } from '@/lib/rfMath';
import { IP3_ABOVE_IP1DB_DB, IP3_ABOVE_OP1DB_DB, dopplerShiftHz, freeSpacePathLossDb, powerLevels, radarMaxRangeM, skinDepth, spotJitterDensity, thermalNoise, viaParasitics, vswrMetrics } from '@/lib/rfCalculators';
import { RFModelBadge } from './RFModelBadge';
import FmcwScope from './rf/fmcw/FmcwScope';
import StandingWavePlot from './rf/StandingWavePlot';

// three.js loads with the first 3D stage that mounts, never with the page.
const stageLoading = () => <div className="absolute inset-0 animate-pulse bg-surface-2/40" aria-hidden="true" />;
const TLineStage = dynamic(() => import('./rf/three/TLineStage'), { ssr: false, loading: stageLoading });
const WaveguideStage = dynamic(() => import('./rf/three/WaveguideStage'), { ssr: false, loading: stageLoading });
const ViaStage = dynamic(() => import('./rf/three/ViaStage'), { ssr: false, loading: stageLoading });
const SkinDepthStage = dynamic(() => import('./rf/three/SkinDepthStage'), { ssr: false, loading: stageLoading });

// Identities go infinite at a perfect match or a total reflection.
const finite = (value: number, digits: number) => (Number.isFinite(value) ? value.toFixed(digits) : '∞');

// The box a 3D stage fills; it replaces the old CSS isometric view.
const STAGE_BOX = 'graph-grid relative min-h-[320px] overflow-hidden rounded-xl border border-line bg-bg-raised lg:min-h-[400px]';

/* =========================================================================
   PCBWay Material Specifications
   ========================================================================= */

const MATERIALS = [
  { id: "custom", name: "Custom Substrate", category: "Custom", epsilonR: 4.4, lossTangent: 0.02, thicknesses: [] },
  { id: "fr4_tg130", name: "FR-4 TG130-140", category: "FR-4", epsilonR: 4.4, lossTangent: 0.020, thicknesses: [0.2, 0.3, 0.4, 0.6, 0.8, 1.0, 1.2, 1.6, 2.0, 2.4, 2.6, 2.8, 3.0, 3.2] },
  { id: "fr4_tg155", name: "FR-4 TG155", category: "FR-4", epsilonR: 4.4, lossTangent: 0.018, thicknesses: [0.2, 0.3, 0.4, 0.6, 0.8, 1.0, 1.2, 1.6, 2.0, 2.4, 2.6, 2.8, 3.0, 3.2] },
  { id: "ro4003c", name: "Rogers RO4003C", category: "Rogers", epsilonR: 3.55, lossTangent: 0.0027, thicknesses: [0.203, 0.305, 0.406, 0.508, 0.813, 1.524] },
  { id: "ro4350b", name: "Rogers RO4350B", category: "Rogers", epsilonR: 3.66, lossTangent: 0.0037, thicknesses: [0.101, 0.168, 0.254, 0.338, 0.422, 0.508, 0.762, 1.524] },
  { id: "rt5880", name: "Rogers RT5880", category: "Rogers", epsilonR: 2.20, lossTangent: 0.0009, thicknesses: [0.127, 0.254, 0.508, 0.787, 1.575, 3.175] }
];

const COPPER_WEIGHTS = [
  { id: "0.5oz", label: "0.5 oz (18 μm)", thickness_mm: 0.018 },
  { id: "1oz", label: "1 oz (35 μm)", thickness_mm: 0.035 },
  { id: "2oz", label: "2 oz (70 μm)", thickness_mm: 0.070 },
  { id: "3oz", label: "3 oz (105 μm)", thickness_mm: 0.105 },
];

interface SubstrateSelectorProps {
  er: string;
  setEr: (val: string) => void;
  height: string;
  setHeight: (val: string) => void;
  thickness?: string;
  setThickness?: (val: string) => void;
  showThickness?: boolean;
  heightLabel?: string;
}

function SubstrateSelector({ er, setEr, height, setHeight, thickness, setThickness, showThickness = false, heightLabel = 'Substrate Height' }: SubstrateSelectorProps) {
  const [matId, setMatId] = useState('fr4_tg130');
  const isCustomCopperThickness = showThickness
    && thickness !== undefined
    && !COPPER_WEIGHTS.some(c => c.thickness_mm.toString() === thickness);
  
  const handleMatChange = (id: string) => {
    setMatId(id);
    const m = MATERIALS.find(x => x.id === id);
    if (m) {
      setEr(m.epsilonR.toString());
      if (m.thicknesses.length > 0 && !m.thicknesses.includes(parseFloat(height))) {
        // Find closest thickness
        const currentH = parseFloat(height) || 0;
        const closest = m.thicknesses.reduce((prev, curr) => Math.abs(curr - currentH) < Math.abs(prev - currentH) ? curr : prev);
        setHeight(closest.toString());
      }
    }
  };

  const mat = MATERIALS.find(m => m.id === matId);
  const isCustomHeight = !mat
    || mat.thicknesses.length === 0
    || !mat.thicknesses.some(value => value.toString() === height);

  return (
    <div className="bg-uci-blue/5 border border-uci-blue/10 p-4 rounded-xl space-y-4 mb-4">
      <div>
        <label className="block text-xs font-semibold text-eng-blue dark:text-blue-300 uppercase tracking-wider mb-2">Substrate Preset</label>
        <select value={matId} onChange={(e) => handleMatChange(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-uci-blue outline-none">
          {MATERIALS.map(m => <option key={m.id} value={m.id}>{m.name} (εr={m.epsilonR})</option>)}
        </select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Dielectric Const (εr)</label>
          <input type="number" step="0.1" value={er} onChange={(e) => { setEr(e.target.value); setMatId('custom'); }} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">{heightLabel}</label>
          {mat && mat.thicknesses.length > 0 ? (
            <>
              <select
                value={isCustomHeight ? 'custom' : height}
                onChange={(e) => setHeight(e.target.value === 'custom' ? '' : e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono"
              >
                {mat.thicknesses.map(t => <option key={t} value={t}>{t} mm</option>)}
                <option value="custom">Custom (Input below)</option>
              </select>
              {isCustomHeight && (
                <div className="flex items-center gap-2 mt-2">
                  <input type="number" min="0" step="0.001" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" placeholder="Enter substrate height" />
                  <span className="text-xs text-gray-500">mm</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <input type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
              <span className="text-xs text-gray-500">mm</span>
            </div>
          )}
        </div>
        {showThickness && (
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Copper Weight / Thickness</label>
            <select
              value={isCustomCopperThickness ? 'custom' : thickness}
              onChange={(e) => setThickness && setThickness(e.target.value === 'custom' ? '' : e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono"
            >
              {COPPER_WEIGHTS.map(c => <option key={c.id} value={c.thickness_mm}>{c.label}</option>)}
              <option value="custom">Custom (Input below)</option>
            </select>
            {isCustomCopperThickness && (
              <input type="number" step="0.001" value={thickness ?? ''} onChange={(e) => setThickness && setThickness(e.target.value)} className="w-full mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" placeholder="Enter thickness in mm" />
            )}
          </div>
        )}
      </div>
      <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
        Preset εr values are typical design Dk values; FR-4 varies with resin content, glass weave, frequency, and vendor. Confirm the laminate datasheet and fabrication stackup before release.
      </p>
    </div>
  );
}

/* =========================================================================
   VSWR Calculator
   ========================================================================= */

export function VSWRCalculator() {
  const [inputType, setInputType] = useState<'vswr' | 'rl' | 'gamma'>('vswr');
  const [inputValue, setInputValue] = useState<string>('2.0');

  const calcResults = () => {
    const val = parseFloat(inputValue);
    if (!Number.isFinite(val)) return null;
    if (inputType === 'vswr' ? val < 1 : inputType === 'rl' ? val < 0 : val < 0 || val > 1) return null;
    const m = vswrMetrics({ kind: inputType === 'rl' ? 'returnLoss' : inputType, value: val });
    return { vswr: m.vswr, rl: m.returnLossDb, gamma: m.gamma, mismatchLoss: m.mismatchLossDb, reflPower: m.reflectedPercent, transPower: m.transmittedPercent };
  };

  const results = calcResults();

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-8">
      <h4 className="text-lg font-bold text-eng-blue dark:text-blue-300 mb-6">VSWR Interactive Calculator</h4>
      <RFModelBadge level="identity" detail="Lossless single-interface power-wave identities." />
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Input Parameter</label>
            <select
              value={inputType}
              onChange={(e) => setInputType(e.target.value as 'vswr' | 'rl' | 'gamma')}
              className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none"
            >
              <option value="vswr">VSWR</option>
              <option value="rl">Return Loss (dB)</option>
              <option value="gamma">Reflection Coefficient (|Γ|)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Value</label>
            <input
              type="number"
              step="any"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none"
            />
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
          <h5 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2">Calculated Results</h5>
          {results ? (
            <>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">VSWR</span> <span className="font-mono font-medium">{finite(results.vswr, 4)} : 1</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Return Loss</span> <span className="font-mono font-medium">{finite(results.rl, 3)} dB</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">|Γ|</span> <span className="font-mono font-medium">{results.gamma.toFixed(6)}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Mismatch Loss</span> <span className="font-mono font-medium">{finite(results.mismatchLoss, 4)} dB</span></div>
              <hr className="border-gray-200 dark:border-gray-800 my-2" />
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Reflected Power</span> <span className="font-mono font-medium text-red-500">{results.reflPower.toFixed(2)} %</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Transmitted Power</span> <span className="font-mono font-medium text-green-600 dark:text-green-400">{results.transPower.toFixed(2)} %</span></div>
            </>
          ) : (
            <div className="text-sm text-gray-400">Invalid input</div>
          )}
        </div>
      </div>

      {results && (
        <div className="readout-panel mt-6">
          <StandingWavePlot gamma={results.gamma} />
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   dB Calculator
   ========================================================================= */

export function DBCalculator() {
  const [powerInput, setPowerInput] = useState<string>('30');
  const [powerUnit, setPowerUnit] = useState<'dBm' | 'W' | 'mW'>('dBm');

  const calcPower = () => {
    const val = parseFloat(powerInput);
    if (!Number.isFinite(val) || (powerUnit !== 'dBm' && val <= 0)) return null;
    return powerLevels(val, powerUnit);
  };

  const results = calcPower();

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-8">
      <h4 className="text-lg font-bold text-eng-blue dark:text-blue-300 mb-6">Power / dB Calculator</h4>
      <RFModelBadge level="identity" detail="Unit conversion referenced to 1 mW and 1 W." />
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Input Unit</label>
            <select
              value={powerUnit}
              onChange={(e) => setPowerUnit(e.target.value as 'dBm' | 'W' | 'mW')}
              className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none"
            >
              <option value="dBm">dBm</option>
              <option value="W">Watts (W)</option>
              <option value="mW">Milliwatts (mW)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Value</label>
            <input
              type="number"
              step="any"
              value={powerInput}
              onChange={(e) => setPowerInput(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none"
            />
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
          <h5 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2">Calculated Results</h5>
          {results ? (
            <>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">dBm</span> <span className="font-mono font-medium">{results.dBm.toFixed(4)} dBm</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">dBW</span> <span className="font-mono font-medium">{results.dBW.toFixed(4)} dBW</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Milliwatts</span> <span className="font-mono font-medium">{results.mW.toFixed(6)} mW</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Watts</span> <span className="font-mono font-medium">{results.W.toExponential(4)} W</span></div>
            </>
          ) : (
            <div className="text-sm text-gray-400">Invalid input</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   Microstrip Calculator (with Isometric 3D View)
   ========================================================================= */

export function MicrostripCalculator() {
  const [er, setEr] = useState<string>('4.4');
  const [height, setHeight] = useState<string>('1.6');
  const [width, setWidth] = useState<string>('3.0');
  const [thickness, setThickness] = useState<string>('0.035');
  const [freq, setFreq] = useState<string>('2.45');

  const calcMicrostrip = () => {
    const w = parseFloat(width);
    const h = parseFloat(height);
    const e = parseFloat(er);
    const t = parseFloat(thickness);
    const fGHz = parseFloat(freq);
    
    if ([w, h, e, t, fGHz].some(Number.isNaN) || w <= 0 || h <= 0 || e < 1 || t < 0 || t >= h || t >= w / 2 || fGHz <= 0) return null;

    return calculateMicrostrip({ widthMm: w, heightMm: h, thicknessMm: t, er: e, frequencyGHz: fGHz });
  };

  const results = calcMicrostrip();

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-8">
      <h4 className="text-lg font-bold text-eng-blue dark:text-blue-300 mb-6">Microstrip Transmission Line</h4>
      <RFModelBadge level="closed-form" detail="Hammerstad–Jensen with thickness correction and Kirschning–Jansen dispersion." />
      
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <SubstrateSelector er={er} setEr={setEr} height={height} setHeight={setHeight} thickness={thickness} setThickness={setThickness} showThickness={true} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Trace Width (mm)</label>
              <input
                type="number" step="0.1" value={width} onChange={(e) => setWidth(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Frequency (GHz)</label>
              <input
                type="number" step="0.1" value={freq} onChange={(e) => setFreq(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono"
              />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3 mt-4 relative overflow-hidden">
            <h5 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2">Results (with Dispersion)</h5>
            {results ? (
              <>
                <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Z₀ @ {freq} GHz</span> <span className="font-mono font-medium text-uci-blue dark:text-blue-400 text-lg">{results.z0.toFixed(2)} Ω</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">εeff @ {freq} GHz</span> <span className="font-mono font-medium">{results.effectivePermittivity.toFixed(4)}</span></div>
                <hr className="border-gray-200 dark:border-gray-800 my-2" />
                <div className="flex justify-between items-center text-xs opacity-60"><span className="text-gray-600 dark:text-gray-400">Z₀ (quasi-static)</span> <span className="font-mono">{results.staticZ0.toFixed(2)} Ω</span></div>
                <div className="flex justify-between items-center text-xs opacity-60"><span className="text-gray-600 dark:text-gray-400">εeff (quasi-static)</span> <span className="font-mono">{results.staticEffectivePermittivity.toFixed(4)}</span></div>
                {results.warnings.map(warning => <p key={warning} className="text-xs text-amber-700 dark:text-amber-300">{warning}</p>)}
                <p className="text-xs text-gray-500 dark:text-gray-400">Closed-form approximation: full Hammerstad–Jensen quasi-static model with finite conductor thickness and Kirschning–Jansen dispersion. Conductor/dielectric loss, roughness, solder mask, and enclosure effects are excluded; verify final geometry with a 2.5D/3D EM solver.</p>
              </>
            ) : (
              <div className="text-sm text-gray-400">Invalid input values</div>
            )}
          </div>
        </div>

        <div className={STAGE_BOX}>
          <TLineStage
            geometry={{ kind: 'microstrip', widthMm: parseFloat(width), heightMm: parseFloat(height), thicknessMm: parseFloat(thickness) }}
            label={`Microstrip cross-section, ${width} mm trace on ${height} mm substrate, with quasi-TEM field lines`}
            caption={results ? `λg = c / (f √εeff) = ${(299.792458 / parseFloat(freq) / Math.sqrt(results.effectivePermittivity)).toFixed(1)} mm at ${freq} GHz. The field lines are a qualitative quasi-TEM sketch, not a field solution; the travelling wave is drawn compressed to two cycles and slowed down.` : undefined}
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   Waveguide Calculator
   ========================================================================= */

export function WaveguideCalculator() {
  const [a, setA] = useState<string>('22.86'); // WR90 standard
  const [freq, setFreq] = useState<string>('10');

  const aVal = parseFloat(a);
  const fVal = parseFloat(freq);
  const valid = Number.isFinite(aVal) && Number.isFinite(fVal) && aVal > 0 && fVal > 0;
  const result = valid ? waveguideTE10(aVal, fVal) : null;

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-8">
      <h4 className="text-lg font-bold text-eng-blue dark:text-blue-300 mb-6 flex items-center gap-3">
        Rectangular Waveguide (TE₁₀)
      </h4>
      <RFModelBadge level="identity" detail="Ideal PEC, homogeneous-fill rectangular-waveguide TE10 cutoff." />

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Broad Dimension &apos;a&apos; (mm)</label>
              <input type="number" step="any" value={a} onChange={(e) => setA(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Frequency (GHz)</label>
              <input type="number" step="any" value={freq} onChange={(e) => setFreq(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
            <h5 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2">Results</h5>
            {result ? (
              <>
                <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Cutoff Frequency (fc)</span> <span className="font-mono font-medium text-uci-blue dark:text-blue-400 text-lg">{result.cutoffGHz.toFixed(3)} GHz</span></div>
                {result.guideWavelengthMm !== null ? (
                  <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Guide Wavelength (λg)</span> <span className="font-mono font-medium">{result.guideWavelengthMm.toFixed(2)} mm</span></div>
                ) : (
                  <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Below cutoff · attenuation</span> <span className="font-mono font-medium text-amber-700 dark:text-amber-300">{result.attenuationDbPerMm.toFixed(3)} dB/mm</span></div>
                )}
                <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Free-space Wavelength (λ₀)</span> <span className="font-mono font-medium">{result.lambda0Mm.toFixed(2)} mm</span></div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Air-filled guide with perfectly conducting walls. The 3D view draws b = a/2, the proportion of standard WR sizes; the TE10 cutoff does not depend on b.</p>
              </>
            ) : (
              <div className="text-sm text-gray-400">Invalid input values</div>
            )}
          </div>
        </div>

        <div className={STAGE_BOX}>
          {result && (
            <WaveguideStage
              aMm={aVal}
              bMm={aVal / 2}
              guideWavelengthMm={result.guideWavelengthMm}
              attenuationDbPerMm={result.attenuationDbPerMm}
              label={`TE10 electric field in a ${a} mm waveguide at ${freq} GHz, ${result.propagating ? 'propagating' : 'below cutoff'}`}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   Stripline Calculator (with Isometric 3D View)
   ========================================================================= */

export function StriplineCalculator() {
  const [er, setEr] = useState<string>('4.4');
  const [b, setB] = useState<string>('3.2'); // Ground spacing
  const [width, setWidth] = useState<string>('1.5');
  const [thickness, setThickness] = useState<string>('0.035');

  const calcStripline = () => {
    const e = parseFloat(er);
    const bVal = parseFloat(b);
    const w = parseFloat(width);
    const t = parseFloat(thickness);
    
    if ([e, bVal, w, t].some(Number.isNaN) || w <= 0 || bVal <= 0 || e < 1 || t < 0 || t >= bVal) return null;

    return calculateSymmetricStripline({ widthMm: w, groundSpacingMm: bVal, thicknessMm: t, er: e });
  };

  const results = calcStripline();

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-8">
      <h4 className="text-lg font-bold text-eng-blue dark:text-blue-300 mb-6">Stripline Calculator</h4>
      <RFModelBadge level="closed-form" detail="Centered symmetric stripline with infinite planes and homogeneous dielectric." />
      
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <SubstrateSelector er={er} setEr={setEr} height={b} setHeight={setB} thickness={thickness} setThickness={setThickness} showThickness={true} heightLabel="Ground Spacing (b)" />
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Trace Width (mm)</label>
            <input type="number" step="0.1" value={width} onChange={(e) => setWidth(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3 mt-4">
            <h5 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2">Results</h5>
            {results ? (
              <>
                <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Characteristic Impedance (Z₀)</span> <span className="font-mono font-medium text-uci-blue dark:text-blue-400 text-lg">{results.z0.toFixed(2)} Ω</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">TEM Permittivity</span> <span className="font-mono font-medium">{results.effectivePermittivity.toFixed(4)}</span></div>
                {results.warnings.map(warning => <p key={warning} className="text-xs text-amber-700 dark:text-amber-300">{warning}</p>)}
                <p className="text-xs text-gray-500 dark:text-gray-400">Closed-form approximation for a symmetric, homogeneous stripline with the trace centered between infinite ground planes. Loss, surface roughness, sidewalls, and trace offset require field simulation.</p>
              </>
            ) : (
              <div className="text-sm text-gray-400">Invalid input values</div>
            )}
          </div>
        </div>

        <div className={STAGE_BOX}>
          <TLineStage
            geometry={{ kind: 'stripline', widthMm: parseFloat(width), heightMm: parseFloat(b), thicknessMm: parseFloat(thickness) }}
            label={`Stripline cross-section, ${width} mm trace centered between ground planes ${b} mm apart`}
            caption="Upper ground drawn translucent. The field lines are a qualitative TEM sketch, not a field solution; the travelling wave is schematic."
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   Coplanar Waveguide (CPW) Calculator (with Isometric 3D View)
   ========================================================================= */

export function CPWCalculator() {
  const [er, setEr] = useState<string>('4.4');
  const [height, setHeight] = useState<string>('1.6');
  const [width, setWidth] = useState<string>('2.0');
  const [gap, setGap] = useState<string>('0.2');

  const calcCPW = () => {
    const e = parseFloat(er);
    const h = parseFloat(height);
    const w = parseFloat(width);
    const s = parseFloat(gap);
    if (![e, h, w, s].every(Number.isFinite) || w <= 0 || s <= 0 || h <= 0 || e < 1) return null;
    const line = calculateCoplanarWaveguide({ widthMm: w, gapMm: s, heightMm: h, er: e });
    return { z0: line.z0, eEff: line.effectivePermittivity };
  };

  const results = calcCPW();

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-8">
      <h4 className="text-lg font-bold text-eng-blue dark:text-blue-300 mb-6">Coplanar Waveguide (CPW)</h4>
      <RFModelBadge level="closed-form" detail="Ideal unbacked CPW conformal-mapping model." />
      
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <SubstrateSelector er={er} setEr={setEr} height={height} setHeight={setHeight} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Center Trace Width (mm)</label>
              <input type="number" step="0.1" value={width} onChange={(e) => setWidth(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Gap (mm)</label>
              <input type="number" step="0.01" value={gap} onChange={(e) => setGap(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3 mt-4">
            <h5 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2">Results</h5>
            {results ? (
              <>
                <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Characteristic Impedance (Z₀)</span> <span className="font-mono font-medium text-uci-blue dark:text-blue-400 text-lg">{results.z0.toFixed(2)} Ω</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Effective Permittivity (εeff)</span> <span className="font-mono font-medium">{results.eEff.toFixed(4)}</span></div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Quasi-static conformal map for an unbacked CPW on a finite-height substrate (Simons, 2001), with exact elliptic integrals, infinitely wide grounds, zero conductor thickness, and no conductor or dielectric loss. Grounded CPW, solder mask, finite ground width, and discontinuities require an EM solver.</p>
              </>
            ) : (
              <div className="text-sm text-gray-400">Invalid input values</div>
            )}
          </div>
        </div>

        <div className={STAGE_BOX}>
          <TLineStage
            geometry={{ kind: 'cpw', widthMm: parseFloat(width), heightMm: parseFloat(height), thicknessMm: 0.035, gapMm: parseFloat(gap) }}
            label={`Coplanar waveguide cross-section, ${width} mm center strip with ${gap} mm slots on ${height} mm substrate`}
            caption="Unbacked CPW: the field fringes across both slots, above and inside the substrate. The field lines are a qualitative sketch and the travelling wave is schematic."
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   Skin Depth Calculator
   ========================================================================= */

export function SkinDepthCalculator() {
  const [material, setMaterial] = useState<string>('1.68e-8'); // Copper
  const [freqStr, setFreqStr] = useState<string>('2.45');
  
  const calcSkinDepth = () => {
    const rho = parseFloat(material);
    const fGHz = parseFloat(freqStr);
    if (!Number.isFinite(rho) || !Number.isFinite(fGHz) || rho <= 0 || fGHz <= 0) return null;
    const { depthM, surfaceResistanceOhm } = skinDepth(rho, fGHz * 1e9);
    return { delta_um: depthM * 1e6, rs: surfaceResistanceOhm };
  };

  const results = calcSkinDepth();

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-8">
      <h4 className="text-lg font-bold text-eng-blue dark:text-blue-300 mb-6">Skin Depth & Surface Resistance</h4>
      <RFModelBadge level="closed-form" detail="Good-conductor approximation with μr=1 and bulk resistivity." />
      
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Conductor Material</label>
              <select value={material} onChange={(e) => setMaterial(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono">
                <option value="1.68e-8">Copper (1.68×10⁻⁸ Ω·m)</option>
                <option value="2.65e-8">Aluminum (2.65×10⁻⁸ Ω·m)</option>
                <option value="2.44e-8">Gold (2.44×10⁻⁸ Ω·m)</option>
                <option value="1.59e-8">Silver (1.59×10⁻⁸ Ω·m)</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Frequency (GHz)</label>
              <input type="number" step="0.1" value={freqStr} onChange={(e) => setFreqStr(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
            <h5 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2">Results</h5>
            {results ? (
              <>
                <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Skin Depth (δ)</span> <span className="font-mono font-medium text-uci-blue dark:text-blue-400 text-lg">{results.delta_um.toFixed(3)} μm</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Surface Resistance (Rs)</span> <span className="font-mono font-medium">{results.rs.toFixed(5)} Ω/sq</span></div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Good-conductor formulas δ = √(2ρ/ωμ₀) and Rs = ρ/δ for a flat conductor much thicker than δ, with μr = 1 and 20 °C bulk resistivity; against the exact propagation constant the error is below 10⁻⁷ for metals up to 100 GHz. Temperature, alloys and plating, surface roughness, and the anomalous skin effect are excluded.</p>
              </>
            ) : (
              <div className="text-sm text-gray-400">Invalid input values</div>
            )}
          </div>
        </div>

        <div className={STAGE_BOX}>
          {results && (
            <SkinDepthStage
              depthUm={results.delta_um}
              frequencyGHz={parseFloat(freqStr)}
              label={`Current density in a conductor at ${freqStr} GHz, decaying with a skin depth of ${results.delta_um.toFixed(2)} micrometres`}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   PCB Via Calculator (Goldfarb Model)
   ========================================================================= */

export function PCBViaCalculator() {
  const [drill, setDrill] = useState<string>('0.2'); // mm
  const [pad, setPad] = useState<string>('0.4'); // mm
  const [antipad, setAntipad] = useState<string>('0.6'); // mm
  const [height, setHeight] = useState<string>('1.6'); // mm
  const [er, setEr] = useState<string>('4.4');

  const calcVia = () => {
    const [dDrill, dPad, dAnti, h, e] = [drill, pad, antipad, height, er].map(parseFloat);
    if (![dDrill, dPad, dAnti, h, e].every(Number.isFinite)) return null;
    if (dDrill <= 0 || dPad <= dDrill || dAnti <= dPad || h <= 0 || e < 1) return null;
    const v = viaParasitics({ drillMm: dDrill, padMm: dPad, antipadMm: dAnti, heightMm: h, er: e });
    return {
      L_nH: v.inductanceH * 1e9,
      C_pF: v.capacitanceF * 1e12,
      Z_ohms: v.impedanceScaleOhm,
      fres_GHz: v.lcCornerHz / 1e9,
      // Goldfarb & Pucel validated the inductance for h < 0.03 lambda0.
      fMaxGHz: (v.heightOverWavelengthLimit * 299.792458) / h,
    };
  };

  const results = calcVia();

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-8">
      <h4 className="text-lg font-bold text-eng-blue dark:text-blue-300 mb-6">PCB Via Parasitics</h4>
      <RFModelBadge level="rule-of-thumb" detail="Goldfarb–Pucel via-hole inductance and the Johnson–Graham empirical pad capacitance; a via is distributed, so check it with 3D EM." />
      
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <SubstrateSelector er={er} setEr={setEr} height={height} setHeight={setHeight} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Drill Diameter (mm)</label>
              <input type="number" step="0.05" value={drill} onChange={(e) => setDrill(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Pad Diameter (mm)</label>
              <input type="number" step="0.05" value={pad} onChange={(e) => setPad(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Anti-pad Diameter (Clearance, mm)</label>
              <input type="number" step="0.05" value={antipad} onChange={(e) => setAntipad(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
            <h5 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2">Results</h5>
            {results ? (
              <>
                <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Via-to-Ground Inductance (L)</span> <span className="font-mono font-medium">{results.L_nH.toFixed(4)} nH</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Pad-to-Plane Capacitance (C)</span> <span className="font-mono font-medium">{results.C_pF.toFixed(4)} pF</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">LC Impedance Scale √(L/C)</span> <span className="font-mono font-medium text-uci-blue dark:text-blue-400 text-lg">{results.Z_ohms.toFixed(2)} Ω</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Lumped LC Corner Estimate</span> <span className="font-mono font-medium">{results.fres_GHz.toFixed(2)} GHz</span></div>
                <div className="flex justify-between items-center text-xs"><span className="text-gray-600 dark:text-gray-400">Inductance model valid below</span> <span className="font-mono font-medium">{results.fMaxGHz.toFixed(1)} GHz</span></div>
              </>
            ) : (
              <div className="text-sm text-gray-400">Invalid input values (Ensure Anti-pad &gt; Pad)</div>
            )}
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-medium border border-amber-200 dark:border-amber-800/30">
              <strong>Models:</strong> L = (μ₀/2π)[h ln((h + √(r² + h²))/r) + 1.5(r − √(r² + h²))] for a via hole to ground (Goldfarb &amp; Pucel, IEEE MGWL 1991), validated for h &lt; 0.03 λ₀. C = 1.41 εr T D₁/(D₂ − D₁) pF with inch dimensions is the empirical pad-to-plane rule of Johnson &amp; Graham (1993). The often-quoted 5.08 h[ln(4h/d) + 1] nH is not used: its +1 overstates even an isolated rod&apos;s partial inductance, about 5.08 h[ln(4h/d) − 1] nH, by roughly 2×. √(L/C) is only an impedance scale and 1/(2π√LC) a lumped corner, not the via&apos;s distributed Z₀ or a guaranteed resonance; return vias, planes, stubs and pads need 3D EM.
            </div>
          </div>
        </div>

        <div className={STAGE_BOX}>
          {results && (
            <ViaStage
              drillMm={parseFloat(drill)}
              padMm={parseFloat(pad)}
              antipadMm={parseFloat(antipad)}
              heightMm={parseFloat(height)}
              label={`Plated via, ${drill} mm drill with ${pad} mm pads and ${antipad} mm antipad through a ${height} mm board`}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   Radar Range Equation & FSPL Calculator
   ========================================================================= */

export function RadarRangeCalculator() {
  const [pt, setPt] = useState<string>('10'); // dBm
  const [gt, setGt] = useState<string>('15'); // dBi
  const [gr, setGr] = useState<string>('15'); // dBi
  const [freqStr, setFreqStr] = useState<string>('60'); // GHz
  const [rcs, setRcs] = useState<string>('10'); // m^2 (Radar Cross Section)
  const [pmin, setPmin] = useState<string>('-90'); // dBm (Min Detectable Signal)
  const [systemLoss, setSystemLoss] = useState<string>('3'); // dB

  const calcRadar = () => {
    const [txPowerDbm, txGainDbi, rxGainDbi, fGHz, rcsM2, minSignalDbm, lossDb] = [pt, gt, gr, freqStr, rcs, pmin, systemLoss].map(parseFloat);
    if (![txPowerDbm, txGainDbi, rxGainDbi, fGHz, rcsM2, minSignalDbm, lossDb].every(Number.isFinite) || fGHz <= 0 || rcsM2 <= 0 || lossDb < 0) return null;
    const frequencyHz = fGHz * 1e9;
    return {
      R_max: radarMaxRangeM({ txPowerDbm, txGainDbi, rxGainDbi, frequencyHz, rcsM2, minSignalDbm, lossDb }),
      FSPL_100m: freeSpacePathLossDb(100, frequencyHz),
    };
  };

  const results = calcRadar();

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-8">
      <h4 className="text-lg font-bold text-eng-blue dark:text-blue-300 mb-6">Radar Range Equation & Free Space Path Loss</h4>
      <RFModelBadge level="closed-form" detail="Classical monostatic free-space radar equation with aggregate loss." />

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tx Power (dBm)</label>
              <input type="number" step="0.1" value={pt} onChange={(e) => setPt(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Min Det. Signal (dBm)</label>
              <input type="number" step="0.1" value={pmin} onChange={(e) => setPmin(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tx Ant. Gain (dBi)</label>
              <input type="number" step="0.1" value={gt} onChange={(e) => setGt(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Rx Ant. Gain (dBi)</label>
              <input type="number" step="0.1" value={gr} onChange={(e) => setGr(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Frequency (GHz)</label>
              <input type="number" step="0.1" value={freqStr} onChange={(e) => setFreqStr(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">RCS σ (m²)</label>
              <input type="number" step="0.1" value={rcs} onChange={(e) => setRcs(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Aggregate System / Propagation Loss (dB)</label>
              <input type="number" min="0" step="0.1" value={systemLoss} onChange={(e) => setSystemLoss(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
          <h5 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2">Results</h5>
          {results ? (
            <>
              <div className="flex justify-between items-center mb-4"><span className="text-gray-600 dark:text-gray-400">Max Radar Range</span> <span className="font-mono font-medium text-uci-blue dark:text-blue-400 text-2xl">{results.R_max.toFixed(1)} m</span></div>
              <div className="w-full h-px bg-gray-200 dark:bg-gray-800 my-2"></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">FSPL @ 100m</span> <span className="font-mono font-medium">{results.FSPL_100m.toFixed(1)} dB</span></div>
            </>
          ) : (
            <div className="text-sm text-gray-400">Invalid input values</div>
          )}
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Closed-form monostatic radar range equation using the entered aggregate loss. Gains, RCS, loss, and minimum detectable power are assumed constant and mutually consistent; real detection probability also depends on waveform integration, target fluctuation, clutter, noise figure, CFAR threshold, polarization, and atmospheric/weather loss.
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   FMCW Radar Calculator
   ========================================================================= */

export function FMCWRadarCalculator() {
  return (
    <div className="bg-white/70 dark:bg-slate-900/70 p-4 sm:p-6 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-8">
      <h4 className="text-lg font-bold text-eng-blue dark:text-blue-300 mb-6">FMCW Radar Parameters</h4>
      <RFModelBadge level="closed-form" detail="Ideal linear chirp and stationary-target beat-frequency limit." />
      <FmcwScope />
    </div>
  );
}

/* =========================================================================
   Doppler Shift Calculator
   ========================================================================= */

export function DopplerCalculator() {
  const [freq, setFreq] = useState<string>('60'); // GHz
  const [vel, setVel] = useState<string>('30'); // m/s

  const calcDoppler = () => {
    const fGHz = parseFloat(freq);
    const v = parseFloat(vel);
    if (!Number.isFinite(fGHz) || !Number.isFinite(v) || fGHz <= 0) return null;
    return { fd: dopplerShiftHz(fGHz * 1e9, v) / 1000 }; // kHz
  };

  const results = calcDoppler();

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-8">
      <h4 className="text-lg font-bold text-eng-blue dark:text-blue-300 mb-6">Doppler Shift</h4>
      <RFModelBadge level="closed-form" detail="Monostatic narrowband radial-motion approximation." />
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Carrier Frequency (GHz)</label>
            <input type="number" step="0.1" value={freq} onChange={(e) => setFreq(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
          </div>
          <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Radial Velocity (m/s, + approaching)</label>
            <input type="number" step="1" value={vel} onChange={(e) => setVel(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
          <h5 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2">Results</h5>
          {results ? (
            <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Doppler Shift (fd)</span> <span className="font-mono font-medium text-uci-blue dark:text-blue-400 text-lg">{results.fd.toFixed(2)} kHz</span></div>
          ) : (
            <div className="text-sm text-gray-400">Invalid input values</div>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">Monostatic, narrowband, direct line-of-sight approximation fd=2v/λ. Positive velocity is defined here as approaching, so positive fd is an upshift.</p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   Phase Noise to Jitter Calculator
   ========================================================================= */

export function PhaseNoiseCalculator() {
  const [pn, setPn] = useState<string>('-100'); // dBc/Hz
  const [fc, setFc] = useState<string>('10'); // GHz
  const [offset, setOffset] = useState<string>('1'); // MHz

  // Spot jitter density from one phase-noise value (IEEE Std 1139: S_phi(f) = 2 L(f)).
  const calcJitter = () => {
    const L_dBc = parseFloat(pn);
    const f_c = parseFloat(fc) * 1e9;
    const f_offset = parseFloat(offset) * 1e6;
    if (![L_dBc, f_c, f_offset].every(Number.isFinite) || f_c <= 0 || f_offset <= 0) return null;
    return { time_jitter_fs: spotJitterDensity(L_dBc, f_c) * 1e15, offsetMHz: f_offset / 1e6 };
  };

  const results = calcJitter();

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-8">
      <h4 className="text-lg font-bold text-eng-blue dark:text-blue-300 mb-6">Phase Noise to Jitter (Spot)</h4>
      <RFModelBadge level="closed-form" detail="Spot jitter density only; integrated RMS jitter needs the full phase-noise spectrum." />
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phase Noise L(f) (dBc/Hz)</label>
            <input type="number" step="1" value={pn} onChange={(e) => setPn(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Carrier Frequency (GHz)</label>
            <input type="number" step="0.1" value={fc} onChange={(e) => setFc(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Offset Frequency (MHz)</label>
            <input type="number" step="0.1" value={offset} onChange={(e) => setOffset(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
          <h5 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2">Results</h5>
          {results ? (
            <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Spot Jitter Density @ {results.offsetMHz.toFixed(3)} MHz</span> <span className="font-mono font-medium text-uci-blue dark:text-blue-400 text-lg">{results.time_jitter_fs.toFixed(3)} fs/√Hz</span></div>
          ) : (
            <div className="text-sm text-gray-400">Invalid input values</div>
          )}
          <div className="text-xs text-gray-500 mt-2">Note: Spot jitter provides the timing jitter density. Total RMS jitter requires integrating L(f) over an offset bandwidth.</div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   Linearity Converter (P1dB to OIP3)
   ========================================================================= */

export function LinearityCalculator() {
  const [p1db, setP1db] = useState<string>('10'); // dBm

  const calcLin = () => {
    const p1 = parseFloat(p1db);
    if (!Number.isFinite(p1)) return null;
    return { oip3: p1 + IP3_ABOVE_OP1DB_DB };
  };

  const results = calcLin();

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-8">
      <h4 className="text-lg font-bold text-eng-blue dark:text-blue-300 mb-6">Linearity Rule of Thumb (OP1dB → OIP3)</h4>
      <RFModelBadge level="rule-of-thumb" detail="Cubic memoryless-model heuristic; not a device identity." />
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Output 1 dB Compression Point, OP1dB (dBm)</label>
          <input type="number" step="0.1" value={p1db} onChange={(e) => setP1db(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
        </div>
        <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
          <h5 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2">Results</h5>
          {results ? (
            <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Estimated OIP3</span> <span className="font-mono font-medium text-uci-blue dark:text-blue-400 text-lg">{results.oip3.toFixed(1)} dBm</span></div>
          ) : (
            <div className="text-sm text-gray-400">Invalid input</div>
          )}
          <div className="text-xs text-gray-500 mt-2">For a memoryless cubic nonlinearity y = a₁x + a₃x³, IIP3 = IP1dB + {IP3_ABOVE_IP1DB_DB.toFixed(2)} dB at the input and OIP3 = OP1dB + {IP3_ABOVE_OP1DB_DB.toFixed(2)} dB at the output, since OP1dB sits 1 dB under the linear extrapolation that defines OIP3. The offset varies substantially by circuit, bias, frequency, matching, thermal effects, and measurement definition; do not use it as a substitute for two-tone characterization.</div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   Thermal Noise Calculator
   ========================================================================= */

export function ThermalNoiseCalculator() {
  const [temp, setTemp] = useState<string>('290'); // K
  const [bw, setBw] = useState<string>('1000'); // MHz

  const calcNoise = () => {
    const t = parseFloat(temp);
    const b = parseFloat(bw) * 1e6;
    if (!Number.isFinite(t) || !Number.isFinite(b) || t <= 0 || b <= 0) return null;
    const n = thermalNoise(t, b);
    return { p_dBm: n.powerDbm, p_density_dBm_Hz: n.densityDbmPerHz };
  };

  const results = calcNoise();

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-8">
      <h4 className="text-lg font-bold text-eng-blue dark:text-blue-300 mb-6">Thermal Noise Floor (kTB)</h4>
      <RFModelBadge level="identity" detail="Johnson–Nyquist available noise power for a matched resistor at temperature T." />
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Temperature (K)</label>
            <input type="number" step="1" value={temp} onChange={(e) => setTemp(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Bandwidth (MHz)</label>
            <input type="number" step="1" value={bw} onChange={(e) => setBw(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
          <h5 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2">Results</h5>
          {results ? (
            <>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Noise Density</span> <span className="font-mono font-medium text-uci-blue dark:text-blue-400 text-lg">{results.p_density_dBm_Hz.toFixed(1)} dBm/Hz</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Total Noise Power</span> <span className="font-mono font-medium">{results.p_dBm.toFixed(1)} dBm</span></div>
            </>
          ) : (
            <div className="text-sm text-gray-400">Invalid input</div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { calculateMicrostrip, calculateSymmetricStripline } from '@/lib/rfMath';
import { RFModelBadge } from './RFModelBadge';

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
}

function SubstrateSelector({ er, setEr, height, setHeight, thickness, setThickness, showThickness = false }: SubstrateSelectorProps) {
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
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Substrate Height</label>
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
    if (isNaN(val)) return null;

    let gamma = 0;
    let vswr = 1;
    let rl = 0;

    if (inputType === 'vswr') {
      if (val < 1) return null;
      vswr = val;
      gamma = (vswr - 1) / (vswr + 1);
      rl = gamma === 0 ? Infinity : -20 * Math.log10(gamma);
    } else if (inputType === 'rl') {
      if (val < 0) return null;
      rl = val;
      gamma = Math.pow(10, -rl / 20);
      vswr = gamma === 1 ? Infinity : (1 + gamma) / (1 - gamma);
    } else if (inputType === 'gamma') {
      if (val < 0 || val > 1) return null;
      gamma = val;
      vswr = gamma === 1 ? Infinity : (1 + gamma) / (1 - gamma);
      rl = gamma === 0 ? Infinity : -20 * Math.log10(gamma);
    }

    const mismatchLoss = -10 * Math.log10(1 - gamma * gamma);
    const reflPower = gamma * gamma * 100;
    const transPower = 100 - reflPower;

    return { vswr, rl, gamma, mismatchLoss, reflPower, transPower };
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
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">VSWR</span> <span className="font-mono font-medium">{results.vswr.toFixed(4)} : 1</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Return Loss</span> <span className="font-mono font-medium">{results.rl.toFixed(3)} dB</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">|Γ|</span> <span className="font-mono font-medium">{results.gamma.toFixed(6)}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Mismatch Loss</span> <span className="font-mono font-medium">{results.mismatchLoss.toFixed(4)} dB</span></div>
              <hr className="border-gray-200 dark:border-gray-800 my-2" />
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Reflected Power</span> <span className="font-mono font-medium text-red-500">{results.reflPower.toFixed(2)} %</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Transmitted Power</span> <span className="font-mono font-medium text-green-600 dark:text-green-400">{results.transPower.toFixed(2)} %</span></div>
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
   dB Calculator
   ========================================================================= */

export function DBCalculator() {
  const [powerInput, setPowerInput] = useState<string>('30');
  const [powerUnit, setPowerUnit] = useState<'dBm' | 'W' | 'mW'>('dBm');

  const calcPower = () => {
    const val = parseFloat(powerInput);
    if (isNaN(val)) return null;
    if ((powerUnit === 'mW' || powerUnit === 'W') && val <= 0) return null;

    let dBm = 0;
    if (powerUnit === 'dBm') dBm = val;
    else if (powerUnit === 'mW') dBm = 10 * Math.log10(val);
    else if (powerUnit === 'W') dBm = 10 * Math.log10(val * 1000);

    const mW = Math.pow(10, dBm / 10);
    const W = mW / 1000;
    const dBW = dBm - 30;

    return { dBm, mW, W, dBW };
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

        {/* 3D Isometric View */}
        <div 
          className="flex flex-col items-center justify-center h-full min-h-[250px] bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden relative"
          style={{ perspective: '1000px' }}
        >
          <p className="absolute top-3 left-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">3D PCB View</p>
          
          <motion.div 
            className="relative"
            animate={{ rotateX: 60, rotateZ: -45 }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
            style={{ transformStyle: 'preserve-3d', width: '200px', height: '200px' }}
          >
            {/* Ground Plane (Bottom) */}
            <div className="absolute inset-0 bg-yellow-600/80 shadow-[0_10px_20px_rgba(0,0,0,0.3)]" style={{ transform: 'translateZ(0px)', borderRadius: '4px' }} />
            
            {/* Substrate (Middle) */}
            <div className="absolute inset-0 bg-green-600/40 backdrop-blur-sm border border-green-500/30" style={{ transform: 'translateZ(20px)', borderRadius: '4px' }} />
            
            {/* Trace (Top) */}
            <motion.div 
              className="absolute bg-yellow-500 shadow-[0_5px_15px_rgba(255,210,0,0.4)]"
              style={{ transform: 'translateZ(40px)', height: '100%' }}
              animate={{ 
                width: `${Math.min(Math.max((parseFloat(width) / parseFloat(height)) * 20, 10), 180)}px`,
                left: `calc(50% - ${Math.min(Math.max((parseFloat(width) / parseFloat(height)) * 20, 10), 180)/2}px)`
              }}
              transition={{ type: "spring", stiffness: 100 }}
            />
          </motion.div>
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

  const calcCutoff = () => {
    const valA = parseFloat(a);
    if (isNaN(valA) || valA <= 0) return null;
    
    // fc = c / 2a
    const c = 299.792458; // mm/ns -> same as GHz * mm
    const fc = c / (2 * valA);
    return { fc };
  };

  const result = calcCutoff();

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-8">
      <h4 className="text-lg font-bold text-eng-blue dark:text-blue-300 mb-6 flex items-center gap-3">
        Rectangular Waveguide (TE₁₀)
      </h4>
      <RFModelBadge level="identity" detail="Ideal PEC, homogeneous-fill rectangular-waveguide TE10 cutoff." />
      
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Broad Dimension &apos;a&apos; (mm)</label>
          <input
            type="number" step="any"
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono"
          />
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
          <h5 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2">Results</h5>
          {result ? (
            <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Cutoff Frequency (fc)</span> <span className="font-mono font-medium text-uci-blue dark:text-blue-400 text-lg">{result.fc.toFixed(3)} GHz</span></div>
          ) : (
            <div className="text-sm text-gray-400">Invalid dimension</div>
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
          <SubstrateSelector er={er} setEr={setEr} height={b} setHeight={setB} thickness={thickness} setThickness={setThickness} showThickness={true} />
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

        {/* 3D Isometric View */}
        <div 
          className="flex flex-col items-center justify-center h-full min-h-[250px] bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden relative"
          style={{ perspective: '1000px' }}
        >
          <p className="absolute top-3 left-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">3D PCB View</p>
          
          <motion.div 
            className="relative"
            animate={{ rotateX: 60, rotateZ: -45 }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
            style={{ transformStyle: 'preserve-3d', width: '200px', height: '200px' }}
          >
            {/* Ground Plane (Bottom) */}
            <div className="absolute inset-0 bg-yellow-600/80 shadow-[0_10px_20px_rgba(0,0,0,0.3)]" style={{ transform: 'translateZ(0px)', borderRadius: '4px' }} />
            
            {/* Substrate (Lower half) */}
            <div className="absolute inset-0 bg-green-600/40 backdrop-blur-sm border border-green-500/30" style={{ transform: 'translateZ(20px)', borderRadius: '4px' }} />
            
            {/* Trace (Middle) */}
            <motion.div 
              className="absolute bg-yellow-500 shadow-[0_5px_15px_rgba(255,210,0,0.4)]"
              style={{ transform: 'translateZ(40px)', height: '100%' }}
              animate={{ 
                width: `${Math.min(Math.max((parseFloat(width) / parseFloat(b)) * 40, 10), 180)}px`,
                left: `calc(50% - ${Math.min(Math.max((parseFloat(width) / parseFloat(b)) * 40, 10), 180)/2}px)`
              }}
              transition={{ type: "spring", stiffness: 100 }}
            />

            {/* Substrate (Upper half) */}
            <div className="absolute inset-0 bg-green-600/40 backdrop-blur-sm border border-green-500/30" style={{ transform: 'translateZ(60px)', borderRadius: '4px' }} />
            
            {/* Ground Plane (Top) */}
            <div className="absolute inset-0 bg-yellow-600/50 backdrop-blur-[1px] border border-yellow-500/50 shadow-[0_5px_20px_rgba(0,0,0,0.2)]" style={{ transform: 'translateZ(80px)', borderRadius: '4px' }} />
          </motion.div>
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

  const ellipticRatio = (k: number) => {
    const kp = Math.sqrt(1.0 - k * k);
    const threshold = 1.0 / Math.sqrt(2.0);
    if (k <= threshold) {
      const sqrtKp = Math.sqrt(kp);
      const num = 2.0 * (1.0 + sqrtKp);
      const den = 1.0 - sqrtKp;
      if (den <= 0) return 1e10;
      return Math.PI / Math.log(num / den);
    } else {
      const sqrtK = Math.sqrt(k);
      const num = 2.0 * (1.0 + sqrtK);
      const den = 1.0 - sqrtK;
      if (den <= 0) return 1e10;
      return Math.log(num / den) / Math.PI;
    }
  };

  const calcCPW = () => {
    const e = parseFloat(er);
    const h = parseFloat(height);
    const w = parseFloat(width);
    const s = parseFloat(gap);
    
    if (isNaN(e) || isNaN(h) || isNaN(w) || isNaN(s) || w <= 0 || s <= 0 || h <= 0 || e < 1) return null;

    const a = w / 2.0;
    const ab = a + s;
    
    const k0 = a / ab;
    const ratio0 = ellipticRatio(k0);
    
    const piA = Math.PI * a / (4.0 * h);
    const piAB = Math.PI * ab / (4.0 * h);
    const tanhA = Math.tanh(piA);
    const tanhAB = Math.tanh(piAB);
    
    let k1 = 0;
    if (tanhAB > 1e-15) {
      k1 = tanhA / tanhAB;
    }
    
    const ratio1 = k1 > 0 ? ellipticRatio(k1) : 0;
    let eEff = (e + 1) / 2;
    if (ratio0 > 1e-15) {
      eEff = 1.0 + (e - 1.0) / 2.0 * (ratio1 / ratio0);
    }
    
    const ratio = ellipticRatio(k0);
    let z0 = 50;
    if (ratio > 0) {
      z0 = 30.0 * Math.PI / Math.sqrt(eEff) / ratio;
    }

    return { z0, eEff };
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
                <p className="text-xs text-gray-500 dark:text-gray-400">Closed-form conformal-mapping approximation for an unbacked CPW on a finite-thickness substrate, with infinite lateral ground width, zero conductor thickness, and no conductor/dielectric loss. Grounded CPW, solder mask, finite ground, and discontinuities require an EM solver.</p>
              </>
            ) : (
              <div className="text-sm text-gray-400">Invalid input values</div>
            )}
          </div>
        </div>

        {/* 3D Isometric View */}
        <div 
          className="flex flex-col items-center justify-center h-full min-h-[250px] bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden relative"
          style={{ perspective: '1000px' }}
        >
          <p className="absolute top-3 left-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">3D PCB View</p>
          
          <motion.div 
            className="relative"
            animate={{ rotateX: 60, rotateZ: -45 }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
            style={{ transformStyle: 'preserve-3d', width: '200px', height: '200px' }}
          >
            {/* Substrate */}
            <div className="absolute inset-0 bg-green-600/40 backdrop-blur-sm border border-green-500/30" style={{ transform: 'translateZ(0px)', borderRadius: '4px' }} />
            
            {/* Top Layer */}
            <div style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }} className="absolute inset-0">
              <motion.div 
                className="absolute bg-yellow-600 shadow-[0_5px_10px_rgba(0,0,0,0.2)]"
                style={{ height: '100%', left: '0' }}
                animate={{ 
                  width: `calc(50% - ${Math.min(Math.max((parseFloat(width)/2 + parseFloat(gap)) * 20, 10), 90)}px)`
                }}
                transition={{ type: "spring", stiffness: 100 }}
              />
              
              <motion.div 
                className="absolute bg-yellow-500 shadow-[0_5px_15px_rgba(255,210,0,0.4)]"
                style={{ height: '100%' }}
                animate={{ 
                  width: `${Math.min(Math.max(parseFloat(width) * 20, 5), 100)}px`,
                  left: `calc(50% - ${Math.min(Math.max(parseFloat(width) * 20, 5), 100)/2}px)`
                }}
                transition={{ type: "spring", stiffness: 100 }}
              />

              <motion.div 
                className="absolute bg-yellow-600 shadow-[0_5px_10px_rgba(0,0,0,0.2)]"
                style={{ height: '100%', right: '0' }}
                animate={{ 
                  width: `calc(50% - ${Math.min(Math.max((parseFloat(width)/2 + parseFloat(gap)) * 20, 10), 90)}px)`
                }}
                transition={{ type: "spring", stiffness: 100 }}
              />
            </div>
          </motion.div>
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
    
    if (isNaN(rho) || isNaN(fGHz) || fGHz <= 0) return null;
    
    const f = fGHz * 1e9;
    const mu0 = 4 * Math.PI * 1e-7;
    const omega = 2 * Math.PI * f;
    
    const delta = Math.sqrt(2 * rho / (omega * mu0)); // in meters
    const rs = rho / delta; // Ohms per square
    
    return { delta_um: delta * 1e6, rs };
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
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
          <h5 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2">Results</h5>
          {results ? (
            <>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Skin Depth (δ)</span> <span className="font-mono font-medium text-uci-blue dark:text-blue-400 text-lg">{results.delta_um.toFixed(3)} μm</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Surface Resistance (Rs)</span> <span className="font-mono font-medium">{results.rs.toFixed(5)} Ω/sq</span></div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Exact good-conductor approximation using μr=1 and the listed room-temperature bulk resistivity. Temperature, alloy/plating, roughness, and anomalous skin effect are excluded.</p>
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
   PCB Via Calculator (Goldfarb Model)
   ========================================================================= */

export function PCBViaCalculator() {
  const [drill, setDrill] = useState<string>('0.2'); // mm
  const [pad, setPad] = useState<string>('0.4'); // mm
  const [antipad, setAntipad] = useState<string>('0.6'); // mm
  const [height, setHeight] = useState<string>('1.6'); // mm
  const [er, setEr] = useState<string>('4.4');

  const calcVia = () => {
    const dDrill = parseFloat(drill);
    const dPad = parseFloat(pad);
    const dAnti = parseFloat(antipad);
    const h = parseFloat(height);
    const e = parseFloat(er);
    
    if (isNaN(dDrill) || isNaN(dPad) || isNaN(dAnti) || isNaN(h) || isNaN(e)) return null;
    if (dDrill <= 0 || dPad <= dDrill || dAnti <= dPad || h <= 0 || e < 1) return null;

    // Convert to inches for Goldfarb
    const h_in = h * 0.0393701;
    const drill_in = dDrill * 0.0393701;
    const pad_in = dPad * 0.0393701;
    const anti_in = dAnti * 0.0393701;

    // L (nH) = 5.08 * h * [ln(4h/d) + 1]
    const L_nH = 5.08 * h_in * (Math.log(4.0 * h_in / drill_in) + 1.0);
    if (L_nH <= 0) return null;
    
    // C (pF) = 1.41 * εr * T * D / (D_clearance - D)
    const C_pF = (1.41 * e * h_in * pad_in) / (anti_in - pad_in);
    
    // LC impedance scale = sqrt(L/C). This is not a distributed transmission-line Z0.
    const Z_ohms = Math.sqrt((L_nH * 1e-9) / (C_pF * 1e-12));
    
    // f_res = 1 / (2pi * sqrt(LC))
    const fres_GHz = 1.0 / (2.0 * Math.PI * Math.sqrt((L_nH * 1e-9) * (C_pF * 1e-12))) / 1e9;

    return { L_nH, C_pF, Z_ohms, fres_GHz };
  };

  const results = calcVia();

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-8">
      <h4 className="text-lg font-bold text-eng-blue dark:text-blue-300 mb-6">PCB Via Parasitics (Goldfarb Model)</h4>
      <RFModelBadge level="closed-form" detail="Lumped via L/C estimates; distributed behavior requires 3D EM." />
      
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
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
          <h5 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2">Results</h5>
          {results ? (
            <>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Via Inductance (L)</span> <span className="font-mono font-medium">{results.L_nH.toFixed(4)} nH</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Via Capacitance (C)</span> <span className="font-mono font-medium">{results.C_pF.toFixed(4)} pF</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">LC Impedance Scale √(L/C)</span> <span className="font-mono font-medium text-uci-blue dark:text-blue-400 text-lg">{results.Z_ohms.toFixed(2)} Ω</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Lumped LC Corner Estimate</span> <span className="font-mono font-medium">{results.fres_GHz.toFixed(2)} GHz</span></div>
            </>
          ) : (
            <div className="text-sm text-gray-400">Invalid input values (Ensure Anti-pad &gt; Pad)</div>
          )}
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-medium border border-amber-200 dark:border-amber-800/30">
            <strong>Model limit:</strong> √(L/C) is only an impedance scale and 1/(2π√LC) is a lumped corner estimate—not the via&apos;s distributed Z₀ or a guaranteed physical resonance. Model validity depends on via electrical length, return-via/plane geometry, antipads, pads, and stubs; use 3D EM when these details are electrically significant.
          </div>
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
    const P_t_dBm = parseFloat(pt);
    const G_t_dBi = parseFloat(gt);
    const G_r_dBi = parseFloat(gr);
    const f_GHz = parseFloat(freqStr);
    const sigma = parseFloat(rcs);
    const P_min_dBm = parseFloat(pmin);
    const lossDB = parseFloat(systemLoss);

    if ([P_t_dBm, G_t_dBi, G_r_dBi, f_GHz, sigma, P_min_dBm, lossDB].some(Number.isNaN) || f_GHz <= 0 || sigma <= 0 || lossDB < 0) return null;

    // FSPL calculation (for 100 meter reference to show)
    const lambda = 0.299792458 / f_GHz; // meters
    
    // Convert dBm to Watts
    const P_t_W = Math.pow(10, (P_t_dBm - 30) / 10);
    const P_min_W = Math.pow(10, (P_min_dBm - 30) / 10);
    
    // Linear gains
    const G_t = Math.pow(10, G_t_dBi / 10);
    const G_r = Math.pow(10, G_r_dBi / 10);
    const systemLossLinear = Math.pow(10, lossDB / 10);

    // Radar Equation for Max Range R: R^4 = (Pt * Gt * Gr * lambda^2 * sigma) / ((4*pi)^3 * Pmin)
    const numerator = P_t_W * G_t * G_r * Math.pow(lambda, 2) * sigma;
    const denominator = Math.pow(4 * Math.PI, 3) * P_min_W * systemLossLinear;
    const R_max = Math.pow(numerator / denominator, 0.25);

    // Free Space Path Loss at 100 meters
    const FSPL_100m = 20 * Math.log10(100) + 20 * Math.log10(f_GHz * 1e9) + 20 * Math.log10(4 * Math.PI / 0.299792458);

    return { R_max, FSPL_100m };
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

/* =========================================================================
   Doppler Shift Calculator
   ========================================================================= */

export function DopplerCalculator() {
  const [freq, setFreq] = useState<string>('60'); // GHz
  const [vel, setVel] = useState<string>('30'); // m/s

  const calcDoppler = () => {
    const f_GHz = parseFloat(freq);
    const v = parseFloat(vel);

    if (isNaN(f_GHz) || isNaN(v) || f_GHz <= 0) return null;

    const lambda = 0.299792458 / f_GHz; // meters
    const fd = (2 * v) / lambda; // Hz (assuming direct line of sight approach/recede)

    return { fd: fd / 1000 }; // kHz
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

  // Simplistic Spot Jitter estimation
  const calcJitter = () => {
    const L_dBc = parseFloat(pn);
    const f_c = parseFloat(fc) * 1e9;
    const f_offset = parseFloat(offset) * 1e6;

    if (isNaN(L_dBc) || isNaN(f_c) || isNaN(f_offset) || f_c <= 0 || f_offset <= 0) return null;

    // Jitter from spot phase noise (assuming 1Hz bandwidth for the spot calculation context, or flat integration)
    // A true jitter calculation requires integrating the phase noise profile. 
    // Here we provide a spot phase jitter estimation per unit bandwidth:
    const L_linear = Math.pow(10, L_dBc / 10);
    const phase_jitter_rad = Math.sqrt(2 * L_linear); // Rad RMS per sqrt(Hz)
    const time_jitter_fs = (phase_jitter_rad / (2 * Math.PI * f_c)) * 1e15;

    return { time_jitter_fs, offsetMHz: f_offset / 1e6 };
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
    if (isNaN(p1)) return null;
    return { oip3: p1 + 9.6 };
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
          <div className="text-xs text-gray-500 mt-2">Rule of thumb only: OIP3 ≈ OP1dB + 9.6 dB for a memoryless weakly nonlinear cubic model. The offset varies substantially by circuit, bias, frequency, matching, thermal effects, and measurement definition; do not use it as a substitute for two-tone characterization.</div>
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
    if (isNaN(t) || isNaN(b) || t <= 0 || b <= 0) return null;

    const k = 1.380649e-23; // Boltzmann constant
    const p_W = k * t * b;
    const p_dBm = 10 * Math.log10(p_W * 1000);
    const p_density_dBm_Hz = 10 * Math.log10(k * t * 1000);

    return { p_dBm, p_density_dBm_Hz };
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

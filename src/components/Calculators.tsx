'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

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
            <select value={height} onChange={(e) => setHeight(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono">
              {mat.thicknesses.map(t => <option key={t} value={t}>{t} mm</option>)}
              <option value="custom">Custom...</option>
            </select>
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
      vswr = Math.max(val, 1);
      gamma = (vswr - 1) / (vswr + 1);
      rl = -20 * Math.log10(gamma);
    } else if (inputType === 'rl') {
      rl = Math.max(val, 0.001);
      gamma = Math.pow(10, -rl / 20);
      vswr = (1 + gamma) / (1 - gamma);
    } else if (inputType === 'gamma') {
      gamma = Math.max(0, Math.min(val, 0.9999));
      vswr = (1 + gamma) / (1 - gamma);
      rl = -20 * Math.log10(gamma);
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
  const [freq, setFreq] = useState<string>('2.45');

  // Hammerstad-Jensen approximation for Z0 (Static)
  // Kirschning and Jansen model for dispersion
  const calcMicrostrip = () => {
    const w = parseFloat(width);
    const h = parseFloat(height);
    const e = parseFloat(er);
    const fGHz = parseFloat(freq);
    
    if (isNaN(w) || isNaN(h) || isNaN(e) || isNaN(fGHz) || w <= 0 || h <= 0 || e < 1 || fGHz <= 0) return null;

    const u = w / h;
    
    // Quasi-static effective permittivity (Hammerstad & Jensen)
    const eEff0 = ((e + 1) / 2) + ((e - 1) / 2) * Math.pow(1 + 12 * (1 / u), -0.5);
    
    // Static Z0
    let z0_static = 0;
    if (u <= 1) {
      z0_static = (60 / Math.sqrt(eEff0)) * Math.log(8 / u + 0.25 * u);
    } else {
      z0_static = (120 * Math.PI / Math.sqrt(eEff0)) / (u + 1.393 + 0.667 * Math.log(u + 1.444));
    }

    // Kirschning and Jansen Dispersion Model
    const fn = fGHz * h; // normalized frequency
    
    const P1 = 0.27488 + (0.6315 + 0.525 / Math.pow(1 + 0.0157 * fn, 20)) * u - 0.065683 * Math.exp(-0.5 * u);
    const P2 = 0.33622 * (1 - Math.exp(-0.03442 * e));
    const P3 = 0.0363 * Math.exp(-4.6 * u) * (1 - Math.exp(-Math.pow(fn / 38.7, 4.97)));
    const P4 = 1 + 2.751 * (1 - Math.exp(-Math.pow(e / 15.916, 8)));
    
    const P_f = P1 * P2 * Math.pow((0.1844 + P3 * P4) * fn, 1.5763);
    
    // Frequency dependent effective permittivity
    const eEff_f = e - (e - eEff0) / (1 + P_f);
    
    // Frequency dependent Z0
    const z0_f = z0_static * Math.sqrt(eEff0 / eEff_f);

    return { z0_static, eEff0, z0_f, eEff_f };
  };

  const results = calcMicrostrip();

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-8">
      <h4 className="text-lg font-bold text-eng-blue dark:text-blue-300 mb-6">Microstrip Transmission Line</h4>
      
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Dielectric Constant (εr)</label>
              <input
                type="number" step="0.1" value={er} onChange={(e) => setEr(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Substrate Height (mm)</label>
              <input
                type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono"
              />
            </div>
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
                <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Z₀ (High-Freq)</span> <span className="font-mono font-medium text-uci-blue dark:text-blue-400 text-lg">{results.z0_f.toFixed(2)} Ω</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">εeff (High-Freq)</span> <span className="font-mono font-medium">{results.eEff_f.toFixed(4)}</span></div>
                <hr className="border-gray-200 dark:border-gray-800 my-2" />
                <div className="flex justify-between items-center text-xs opacity-60"><span className="text-gray-600 dark:text-gray-400">Z₀ (Static/DC)</span> <span className="font-mono">{results.z0_static.toFixed(2)} Ω</span></div>
                <div className="flex justify-between items-center text-xs opacity-60"><span className="text-gray-600 dark:text-gray-400">εeff (Static/DC)</span> <span className="font-mono">{results.eEff0.toFixed(4)}</span></div>
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
    
    if (isNaN(e) || isNaN(bVal) || isNaN(w) || isNaN(t) || w <= 0 || bVal <= 0 || e < 1) return null;

    let we = w;
    if (t > 0 && w > t / (2.0 * Math.PI)) {
      we = w + (t / Math.PI) * (1.0 + Math.log(4.0 * Math.PI * w / t));
    }

    const ratio = we / bVal;
    let z0 = 50;
    if (ratio < 0.35) {
      z0 = (60.0 / Math.sqrt(e)) * Math.log(4.0 * bVal / (Math.PI * we));
    } else {
      const tOverB = Math.min(t / bVal, 0.99);
      const cf = (2.0 / Math.PI) * Math.log(1.0 / (1.0 - tOverB));
      z0 = (30.0 * Math.PI / Math.sqrt(e)) / (ratio / (1.0 - tOverB) + cf);
    }

    return { z0, eEff: e };
  };

  const results = calcStripline();

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-8">
      <h4 className="text-lg font-bold text-eng-blue dark:text-blue-300 mb-6">Stripline Calculator</h4>
      
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
                <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Effective Permittivity (εeff)</span> <span className="font-mono font-medium">{results.eEff.toFixed(4)}</span></div>
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
    if (dDrill <= 0 || dPad <= 0 || dAnti <= dPad || h <= 0) return null;

    // Convert to inches for Goldfarb
    const h_in = h * 0.0393701;
    const drill_in = dDrill * 0.0393701;
    const pad_in = dPad * 0.0393701;
    const anti_in = dAnti * 0.0393701;

    // L (nH) = 5.08 * h * [ln(4h/d) + 1]
    const L_nH = 5.08 * h_in * (Math.log(4.0 * h_in / drill_in) + 1.0);
    
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
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Resonant Frequency</span> <span className="font-mono font-medium">{results.fres_GHz.toFixed(2)} GHz</span></div>
            </>
          ) : (
            <div className="text-sm text-gray-400">Invalid input values (Ensure Anti-pad &gt; Pad)</div>
          )}
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium border border-red-200 dark:border-red-800/30">
            <strong>⚠️ High Frequency Warning:</strong> Lumped via models (like Goldfarb) break down and become highly inaccurate at mmWave frequencies (&gt; 5 GHz). Full 3D EM simulation is strictly required for high-frequency via design.
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

  const calcRadar = () => {
    const P_t_dBm = parseFloat(pt);
    const G_t_dBi = parseFloat(gt);
    const G_r_dBi = parseFloat(gr);
    const f_GHz = parseFloat(freqStr);
    const sigma = parseFloat(rcs);
    const P_min_dBm = parseFloat(pmin);

    if (isNaN(P_t_dBm) || isNaN(G_t_dBi) || isNaN(G_r_dBi) || isNaN(f_GHz) || f_GHz <= 0 || isNaN(sigma) || isNaN(P_min_dBm)) return null;

    // FSPL calculation (for 100 meter reference to show)
    const lambda = 0.299792458 / f_GHz; // meters
    
    // Convert dBm to Watts
    const P_t_W = Math.pow(10, (P_t_dBm - 30) / 10);
    const P_min_W = Math.pow(10, (P_min_dBm - 30) / 10);
    
    // Linear gains
    const G_t = Math.pow(10, G_t_dBi / 10);
    const G_r = Math.pow(10, G_r_dBi / 10);

    // Radar Equation for Max Range R: R^4 = (Pt * Gt * Gr * lambda^2 * sigma) / ((4*pi)^3 * Pmin)
    const numerator = P_t_W * G_t * G_r * Math.pow(lambda, 2) * sigma;
    const denominator = Math.pow(4 * Math.PI, 3) * P_min_W;
    const R_max = Math.pow(numerator / denominator, 0.25);

    // Free Space Path Loss at 100 meters
    const FSPL_100m = 20 * Math.log10(100) + 20 * Math.log10(f_GHz * 1e9) + 20 * Math.log10(4 * Math.PI / 0.299792458);

    return { R_max, FSPL_100m };
  };

  const results = calcRadar();

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm mt-8">
      <h4 className="text-lg font-bold text-eng-blue dark:text-blue-300 mb-6">Radar Range Equation & Free Space Path Loss</h4>

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
            Calculates the maximum detection range of a monostatic radar system based on the classical Radar Range Equation. It assumes free space propagation without atmospheric absorption loss.
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
            Max range uses the beat-frequency limit: Rmax = fIF,max·c/(2S), where S = B/Tc.
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
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Carrier Frequency (GHz)</label>
            <input type="number" step="0.1" value={freq} onChange={(e) => setFreq(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Radial Velocity (m/s)</label>
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
      <h4 className="text-lg font-bold text-eng-blue dark:text-blue-300 mb-6">Linearity Estimation (P1dB ↔ OIP3)</h4>
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">P1dB (dBm)</label>
          <input type="number" step="0.1" value={p1db} onChange={(e) => setP1db(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uci-blue outline-none font-mono" />
        </div>
        <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
          <h5 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2">Results</h5>
          {results ? (
            <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Estimated OIP3</span> <span className="font-mono font-medium text-uci-blue dark:text-blue-400 text-lg">{results.oip3.toFixed(1)} dBm</span></div>
          ) : (
            <div className="text-sm text-gray-400">Invalid input</div>
          )}
          <div className="text-xs text-gray-500 mt-2">Rule of thumb: OIP3 ≈ P1dB + 9.6 dB.</div>
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

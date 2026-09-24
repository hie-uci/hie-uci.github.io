'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { calculateMicrostrip, calculateSymmetricStripline, waveguideTE10 } from '@/lib/rfMath';

// three.js arrives with the first 3D stage, not with the page.
const stageLoading = () => <div className="absolute inset-0 animate-pulse bg-surface-2/40" aria-hidden="true" />;
const TLineStage = dynamic(() => import('./rf/three/TLineStage'), { ssr: false, loading: stageLoading });
const WaveguideStage = dynamic(() => import('./rf/three/WaveguideStage'), { ssr: false, loading: stageLoading });

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
  /** Label for the height field; stripline calls it the ground spacing. */
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
    <div className="rounded-[4px] border border-line bg-surface-2/50 p-4 space-y-4 mb-4">
      <div>
        <label className="field-label">Substrate Preset</label>
        <select value={matId} onChange={(e) => handleMatChange(e.target.value)} className="field-input">
          {MATERIALS.map(m => <option key={m.id} value={m.id}>{m.name} (εr={m.epsilonR})</option>)}
        </select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label">Dielectric Const (εr)</label>
          <input type="number" step="0.1" value={er} onChange={(e) => { setEr(e.target.value); setMatId('custom'); }} className="field-input" />
        </div>
        <div>
          <label className="field-label">{heightLabel}</label>
          {mat && mat.thicknesses.length > 0 ? (
            <>
              <select
                value={isCustomHeight ? 'custom' : height}
                onChange={(e) => setHeight(e.target.value === 'custom' ? '' : e.target.value)}
                className="field-input"
              >
                {mat.thicknesses.map(t => <option key={t} value={t}>{t} mm</option>)}
                <option value="custom">Custom (Input below)</option>
              </select>
              {isCustomHeight && (
                <div className="flex items-center gap-2 mt-2">
                  <input type="number" min="0" step="0.001" value={height} onChange={(e) => setHeight(e.target.value)} className="field-input" placeholder="Enter substrate height" />
                  <span className="text-xs text-ink-3">mm</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <input type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} className="field-input" />
              <span className="text-xs text-ink-3">mm</span>
            </div>
          )}
        </div>
        {showThickness && (
          <div className="col-span-2">
            <label className="field-label">Copper Weight / Thickness</label>
            <select
              value={isCustomCopperThickness ? 'custom' : thickness}
              onChange={(e) => setThickness && setThickness(e.target.value === 'custom' ? '' : e.target.value)}
              className="field-input"
            >
              {COPPER_WEIGHTS.map(c => <option key={c.id} value={c.thickness_mm}>{c.label}</option>)}
              <option value="custom">Custom (Input below)</option>
            </select>
            {isCustomCopperThickness && (
              <input type="number" step="0.001" value={thickness ?? ''} onChange={(e) => setThickness && setThickness(e.target.value)} className="field-input mt-2" placeholder="Enter thickness in mm" />
            )}
          </div>
        )}
      </div>
      <p className="text-[11px] leading-relaxed text-ink-3">
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
    <div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="field-label">Input Parameter</label>
            <select
              value={inputType}
              onChange={(e) => setInputType(e.target.value as 'vswr' | 'rl' | 'gamma')}
              className="field-input"
            >
              <option value="vswr">VSWR</option>
              <option value="rl">Return Loss (dB)</option>
              <option value="gamma">Reflection Coefficient (|Γ|)</option>
            </select>
          </div>
          <div>
            <label className="field-label">Value</label>
            <input
              type="number"
              step="any"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="field-input"
            />
          </div>
        </div>

        <div className="readout-panel space-y-3">
          <h5 className="kicker mb-3">Calculated Results</h5>
          {results ? (
            <>
              <div className="flex justify-between items-center"><span className="text-ink-2">VSWR</span> <span className="readout">{results.vswr.toFixed(4)} : 1</span></div>
              <div className="flex justify-between items-center"><span className="text-ink-2">Return Loss</span> <span className="readout">{results.rl.toFixed(3)} dB</span></div>
              <div className="flex justify-between items-center"><span className="text-ink-2">|Γ|</span> <span className="readout">{results.gamma.toFixed(6)}</span></div>
              <div className="flex justify-between items-center"><span className="text-ink-2">Mismatch Loss</span> <span className="readout">{results.mismatchLoss.toFixed(4)} dB</span></div>
              <hr className="border-line my-2" />
              <div className="flex justify-between items-center"><span className="text-ink-2">Reflected Power</span> <span className="font-mono font-medium text-marker-ink">{results.reflPower.toFixed(2)} %</span></div>
              <div className="flex justify-between items-center"><span className="text-ink-2">Transmitted Power</span> <span className="readout text-trace-2">{results.transPower.toFixed(2)} %</span></div>
            </>
          ) : (
            <div className="text-sm text-ink-3">Invalid input</div>
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
    <div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="field-label">Input Unit</label>
            <select
              value={powerUnit}
              onChange={(e) => setPowerUnit(e.target.value as 'dBm' | 'W' | 'mW')}
              className="field-input"
            >
              <option value="dBm">dBm</option>
              <option value="W">Watts (W)</option>
              <option value="mW">Milliwatts (mW)</option>
            </select>
          </div>
          <div>
            <label className="field-label">Value</label>
            <input
              type="number"
              step="any"
              value={powerInput}
              onChange={(e) => setPowerInput(e.target.value)}
              className="field-input"
            />
          </div>
        </div>

        <div className="readout-panel space-y-3">
          <h5 className="kicker mb-3">Calculated Results</h5>
          {results ? (
            <>
              <div className="flex justify-between items-center"><span className="text-ink-2">dBm</span> <span className="readout">{results.dBm.toFixed(4)} dBm</span></div>
              <div className="flex justify-between items-center"><span className="text-ink-2">dBW</span> <span className="readout">{results.dBW.toFixed(4)} dBW</span></div>
              <div className="flex justify-between items-center"><span className="text-ink-2">Milliwatts</span> <span className="readout">{results.mW.toFixed(6)} mW</span></div>
              <div className="flex justify-between items-center"><span className="text-ink-2">Watts</span> <span className="readout">{results.W.toExponential(4)} W</span></div>
            </>
          ) : (
            <div className="text-sm text-ink-3">Invalid input</div>
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
    <div>
      
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <SubstrateSelector er={er} setEr={setEr} height={height} setHeight={setHeight} thickness={thickness} setThickness={setThickness} showThickness={true} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Trace Width (mm)</label>
              <input
                type="number" step="0.1" value={width} onChange={(e) => setWidth(e.target.value)}
                className="field-input"
              />
            </div>
            <div>
              <label className="field-label">Frequency (GHz)</label>
              <input
                type="number" step="0.1" value={freq} onChange={(e) => setFreq(e.target.value)}
                className="field-input"
              />
            </div>
          </div>

          <div className="readout-panel space-y-3 mt-4">
            <h5 className="kicker mb-3">Results (with Dispersion)</h5>
            {results ? (
              <>
                <div className="flex justify-between items-center"><span className="text-ink-2">Z₀ @ {freq} GHz</span> <span className="readout text-lg text-accent-ink">{results.z0.toFixed(2)} Ω</span></div>
                <div className="flex justify-between items-center"><span className="text-ink-2">εeff @ {freq} GHz</span> <span className="readout">{results.effectivePermittivity.toFixed(4)}</span></div>
                <hr className="border-line my-2" />
                <div className="flex justify-between items-center text-xs opacity-60"><span className="text-ink-2">Z₀ (quasi-static)</span> <span className="font-mono">{results.staticZ0.toFixed(2)} Ω</span></div>
                <div className="flex justify-between items-center text-xs opacity-60"><span className="text-ink-2">εeff (quasi-static)</span> <span className="font-mono">{results.staticEffectivePermittivity.toFixed(4)}</span></div>
                {results.warnings.map(warning => <p key={warning} className="text-xs text-marker-ink">{warning}</p>)}
                <p className="text-xs leading-relaxed text-ink-3">Closed-form approximation: full Hammerstad–Jensen quasi-static model with finite conductor thickness and Kirschning–Jansen dispersion. Conductor/dielectric loss, roughness, solder mask, and enclosure effects are excluded; verify final geometry with a 2.5D/3D EM solver.</p>
              </>
            ) : (
              <div className="text-sm text-ink-3">Invalid input values</div>
            )}
          </div>
        </div>

        <div className="graph-grid relative min-h-[320px] overflow-hidden rounded-[4px] border border-line bg-bg-raised lg:min-h-[400px]">
          <TLineStage
            geometry={{ kind: 'microstrip', widthMm: parseFloat(width), heightMm: parseFloat(height), thicknessMm: parseFloat(thickness) }}
            label={`Microstrip cross-section, ${width} mm trace on ${height} mm substrate, with quasi-TEM field lines`}
            caption={results ? `λg = ${(299.792458 / parseFloat(freq) / Math.sqrt(results.effectivePermittivity)).toFixed(1)} mm at ${freq} GHz. The travelling wave is drawn compressed to two cycles.` : undefined}
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
  const [a, setA] = useState<string>('22.86'); // WR-90
  const [freq, setFreq] = useState<string>('10');

  const aVal = parseFloat(a);
  const fVal = parseFloat(freq);
  const result = aVal > 0 && fVal > 0 ? waveguideTE10(aVal, fVal) : null;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">Broad Dimension &apos;a&apos; (mm)</label>
            <input type="number" step="any" value={a} onChange={(e) => setA(e.target.value)} className="field-input" />
          </div>
          <div>
            <label className="field-label">Frequency (GHz)</label>
            <input type="number" step="any" value={freq} onChange={(e) => setFreq(e.target.value)} className="field-input" />
          </div>
        </div>

        <div className="readout-panel space-y-3">
          <h5 className="kicker mb-3">Results</h5>
          {result ? (
            <>
              <div className="flex justify-between items-center"><span className="text-ink-2">Cutoff Frequency (fc)</span> <span className="readout text-lg text-accent-ink">{result.cutoffGHz.toFixed(3)} GHz</span></div>
              {result.propagating ? (
                <div className="flex justify-between items-center"><span className="text-ink-2">Guide Wavelength (λg)</span> <span className="readout">{result.guideWavelengthMm!.toFixed(2)} mm</span></div>
              ) : (
                <div className="flex justify-between items-center"><span className="text-ink-2">Below cutoff · attenuation</span> <span className="readout text-marker-ink">{result.attenuationDbPerMm.toFixed(3)} dB/mm</span></div>
              )}
              <div className="flex justify-between items-center"><span className="text-ink-2">Free-space λ0</span> <span className="readout">{result.lambda0Mm.toFixed(2)} mm</span></div>
              <p className="text-xs leading-relaxed text-ink-3">Air-filled guide with perfectly conducting walls. The 3D view draws b = a/2, the proportion of standard WR sizes; the TE10 cutoff does not depend on b.</p>
            </>
          ) : (
            <div className="text-sm text-ink-3">Invalid input values</div>
          )}
        </div>
      </div>

      <div className="graph-grid relative min-h-[360px] overflow-hidden rounded-[4px] border border-line bg-bg-raised lg:min-h-[440px]">
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
    <div>
      
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <SubstrateSelector er={er} setEr={setEr} height={b} setHeight={setB} thickness={thickness} setThickness={setThickness} showThickness={true} heightLabel="Ground Spacing (b)" />
          <div>
            <label className="field-label">Trace Width (mm)</label>
            <input type="number" step="0.1" value={width} onChange={(e) => setWidth(e.target.value)} className="field-input" />
          </div>

          <div className="readout-panel space-y-3 mt-4">
            <h5 className="kicker mb-3">Results</h5>
            {results ? (
              <>
                <div className="flex justify-between items-center"><span className="text-ink-2">Characteristic Impedance (Z₀)</span> <span className="readout text-lg text-accent-ink">{results.z0.toFixed(2)} Ω</span></div>
                <div className="flex justify-between items-center"><span className="text-ink-2">TEM Permittivity</span> <span className="readout">{results.effectivePermittivity.toFixed(4)}</span></div>
                {results.warnings.map(warning => <p key={warning} className="text-xs text-marker-ink">{warning}</p>)}
                <p className="text-xs leading-relaxed text-ink-3">Closed-form approximation for a symmetric, homogeneous stripline with the trace centered between infinite ground planes. Loss, surface roughness, sidewalls, and trace offset require field simulation.</p>
              </>
            ) : (
              <div className="text-sm text-ink-3">Invalid input values</div>
            )}
          </div>
        </div>

        <div className="graph-grid relative min-h-[320px] overflow-hidden rounded-[4px] border border-line bg-bg-raised lg:min-h-[400px]">
          <TLineStage
            geometry={{ kind: 'stripline', widthMm: parseFloat(width), heightMm: parseFloat(b), thicknessMm: parseFloat(thickness) }}
            label={`Stripline cross-section, ${width} mm trace centered between ground planes ${b} mm apart`}
            caption="Upper ground drawn translucent. Field lines are a quasi-static sketch; the wave is schematic."
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
    <div>
      
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <SubstrateSelector er={er} setEr={setEr} height={height} setHeight={setHeight} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Center Trace Width (mm)</label>
              <input type="number" step="0.1" value={width} onChange={(e) => setWidth(e.target.value)} className="field-input" />
            </div>
            <div>
              <label className="field-label">Gap (mm)</label>
              <input type="number" step="0.01" value={gap} onChange={(e) => setGap(e.target.value)} className="field-input" />
            </div>
          </div>

          <div className="readout-panel space-y-3 mt-4">
            <h5 className="kicker mb-3">Results</h5>
            {results ? (
              <>
                <div className="flex justify-between items-center"><span className="text-ink-2">Characteristic Impedance (Z₀)</span> <span className="readout text-lg text-accent-ink">{results.z0.toFixed(2)} Ω</span></div>
                <div className="flex justify-between items-center"><span className="text-ink-2">Effective Permittivity (εeff)</span> <span className="readout">{results.eEff.toFixed(4)}</span></div>
                <p className="text-xs leading-relaxed text-ink-3">Closed-form conformal-mapping approximation for an unbacked CPW on a finite-thickness substrate, with infinite lateral ground width, zero conductor thickness, and no conductor/dielectric loss. Grounded CPW, solder mask, finite ground, and discontinuities require an EM solver.</p>
              </>
            ) : (
              <div className="text-sm text-ink-3">Invalid input values</div>
            )}
          </div>
        </div>

        <div className="graph-grid relative min-h-[320px] overflow-hidden rounded-[4px] border border-line bg-bg-raised lg:min-h-[400px]">
          <TLineStage
            geometry={{ kind: 'cpw', widthMm: parseFloat(width), heightMm: parseFloat(height), thicknessMm: 0.035, gapMm: parseFloat(gap) }}
            label={`Coplanar waveguide cross-section, ${width} mm center strip with ${gap} mm slots on ${height} mm substrate`}
            caption="Unbacked CPW: fields fringe across both slots, above and inside the substrate. The wave is schematic."
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
    <div>
      
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="field-label">Conductor Material</label>
              <select value={material} onChange={(e) => setMaterial(e.target.value)} className="field-input">
                <option value="1.68e-8">Copper (1.68×10⁻⁸ Ω·m)</option>
                <option value="2.65e-8">Aluminum (2.65×10⁻⁸ Ω·m)</option>
                <option value="2.44e-8">Gold (2.44×10⁻⁸ Ω·m)</option>
                <option value="1.59e-8">Silver (1.59×10⁻⁸ Ω·m)</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="field-label">Frequency (GHz)</label>
              <input type="number" step="0.1" value={freqStr} onChange={(e) => setFreqStr(e.target.value)} className="field-input" />
            </div>
          </div>
        </div>

        <div className="readout-panel space-y-3">
          <h5 className="kicker mb-3">Results</h5>
          {results ? (
            <>
              <div className="flex justify-between items-center"><span className="text-ink-2">Skin Depth (δ)</span> <span className="readout text-lg text-accent-ink">{results.delta_um.toFixed(3)} μm</span></div>
              <div className="flex justify-between items-center"><span className="text-ink-2">Surface Resistance (Rs)</span> <span className="readout">{results.rs.toFixed(5)} Ω/sq</span></div>
              <p className="text-xs leading-relaxed text-ink-3">Exact good-conductor approximation using μr=1 and the listed room-temperature bulk resistivity. Temperature, alloy/plating, roughness, and anomalous skin effect are excluded.</p>
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
    <div>
      
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <SubstrateSelector er={er} setEr={setEr} height={height} setHeight={setHeight} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Drill Diameter (mm)</label>
              <input type="number" step="0.05" value={drill} onChange={(e) => setDrill(e.target.value)} className="field-input" />
            </div>
            <div>
              <label className="field-label">Pad Diameter (mm)</label>
              <input type="number" step="0.05" value={pad} onChange={(e) => setPad(e.target.value)} className="field-input" />
            </div>
            <div className="col-span-2">
              <label className="field-label">Anti-pad Diameter (Clearance, mm)</label>
              <input type="number" step="0.05" value={antipad} onChange={(e) => setAntipad(e.target.value)} className="field-input" />
            </div>
          </div>
        </div>

        <div className="readout-panel space-y-3">
          <h5 className="kicker mb-3">Results</h5>
          {results ? (
            <>
              <div className="flex justify-between items-center"><span className="text-ink-2">Via Inductance (L)</span> <span className="readout">{results.L_nH.toFixed(4)} nH</span></div>
              <div className="flex justify-between items-center"><span className="text-ink-2">Via Capacitance (C)</span> <span className="readout">{results.C_pF.toFixed(4)} pF</span></div>
              <div className="flex justify-between items-center"><span className="text-ink-2">LC Impedance Scale √(L/C)</span> <span className="readout text-lg text-accent-ink">{results.Z_ohms.toFixed(2)} Ω</span></div>
              <div className="flex justify-between items-center"><span className="text-ink-2">Lumped LC Corner Estimate</span> <span className="readout">{results.fres_GHz.toFixed(2)} GHz</span></div>
            </>
          ) : (
            <div className="text-sm text-ink-3">Invalid input values (Ensure Anti-pad &gt; Pad)</div>
          )}
          <div className="mt-4 rounded-[4px] border border-marker-ink/40 bg-marker/10 p-3 text-xs font-medium text-marker-ink">
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
    <div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Tx Power (dBm)</label>
              <input type="number" step="0.1" value={pt} onChange={(e) => setPt(e.target.value)} className="field-input" />
            </div>
            <div>
              <label className="field-label">Min Det. Signal (dBm)</label>
              <input type="number" step="0.1" value={pmin} onChange={(e) => setPmin(e.target.value)} className="field-input" />
            </div>
            <div>
              <label className="field-label">Tx Ant. Gain (dBi)</label>
              <input type="number" step="0.1" value={gt} onChange={(e) => setGt(e.target.value)} className="field-input" />
            </div>
            <div>
              <label className="field-label">Rx Ant. Gain (dBi)</label>
              <input type="number" step="0.1" value={gr} onChange={(e) => setGr(e.target.value)} className="field-input" />
            </div>
            <div>
              <label className="field-label">Frequency (GHz)</label>
              <input type="number" step="0.1" value={freqStr} onChange={(e) => setFreqStr(e.target.value)} className="field-input" />
            </div>
            <div>
              <label className="field-label">RCS σ (m²)</label>
              <input type="number" step="0.1" value={rcs} onChange={(e) => setRcs(e.target.value)} className="field-input" />
            </div>
            <div className="col-span-2">
              <label className="field-label">Aggregate System / Propagation Loss (dB)</label>
              <input type="number" min="0" step="0.1" value={systemLoss} onChange={(e) => setSystemLoss(e.target.value)} className="field-input" />
            </div>
          </div>
        </div>

        <div className="readout-panel space-y-3">
          <h5 className="kicker mb-3">Results</h5>
          {results ? (
            <>
              <div className="flex justify-between items-center mb-4"><span className="text-ink-2">Max Radar Range</span> <span className="font-mono font-medium text-accent-ink text-2xl">{results.R_max.toFixed(1)} m</span></div>
              <div className="my-2 h-px w-full bg-line"></div>
              <div className="flex justify-between items-center"><span className="text-ink-2">FSPL @ 100m</span> <span className="readout">{results.FSPL_100m.toFixed(1)} dB</span></div>
            </>
          ) : (
            <div className="text-sm text-ink-3">Invalid input values</div>
          )}
          <div className="mt-4 text-xs leading-relaxed text-ink-3">
            Closed-form monostatic radar range equation using the entered aggregate loss. Gains, RCS, loss, and minimum detectable power are assumed constant and mutually consistent; real detection probability also depends on waveform integration, target fluctuation, clutter, noise figure, CFAR threshold, polarization, and atmospheric/weather loss.
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
    <div>
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div>
            <label className="field-label">Carrier Frequency (GHz)</label>
            <input type="number" step="0.1" value={freq} onChange={(e) => setFreq(e.target.value)} className="field-input" />
          </div>
          <div>
              <label className="field-label">Radial Velocity (m/s, + approaching)</label>
            <input type="number" step="1" value={vel} onChange={(e) => setVel(e.target.value)} className="field-input" />
          </div>
        </div>
        <div className="readout-panel space-y-3">
          <h5 className="kicker mb-3">Results</h5>
          {results ? (
            <div className="flex justify-between items-center"><span className="text-ink-2">Doppler Shift (fd)</span> <span className="readout text-lg text-accent-ink">{results.fd.toFixed(2)} kHz</span></div>
          ) : (
            <div className="text-sm text-ink-3">Invalid input values</div>
          )}
          <p className="text-xs leading-relaxed text-ink-3">Monostatic, narrowband, direct line-of-sight approximation fd=2v/λ. Positive velocity is defined here as approaching, so positive fd is an upshift.</p>
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
    <div>
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div>
            <label className="field-label">Phase Noise L(f) (dBc/Hz)</label>
            <input type="number" step="1" value={pn} onChange={(e) => setPn(e.target.value)} className="field-input" />
          </div>
          <div>
            <label className="field-label">Carrier Frequency (GHz)</label>
            <input type="number" step="0.1" value={fc} onChange={(e) => setFc(e.target.value)} className="field-input" />
          </div>
          <div>
            <label className="field-label">Offset Frequency (MHz)</label>
            <input type="number" step="0.1" value={offset} onChange={(e) => setOffset(e.target.value)} className="field-input" />
          </div>
        </div>
        <div className="readout-panel space-y-3">
          <h5 className="kicker mb-3">Results</h5>
          {results ? (
            <div className="flex justify-between items-center"><span className="text-ink-2">Spot Jitter Density @ {results.offsetMHz.toFixed(3)} MHz</span> <span className="readout text-lg text-accent-ink">{results.time_jitter_fs.toFixed(3)} fs/√Hz</span></div>
          ) : (
            <div className="text-sm text-ink-3">Invalid input values</div>
          )}
          <div className="text-xs text-ink-3 mt-2">Note: Spot jitter provides the timing jitter density. Total RMS jitter requires integrating L(f) over an offset bandwidth.</div>
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
    <div>
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div>
          <label className="field-label">Output 1 dB Compression Point, OP1dB (dBm)</label>
          <input type="number" step="0.1" value={p1db} onChange={(e) => setP1db(e.target.value)} className="field-input" />
        </div>
        <div className="readout-panel space-y-3">
          <h5 className="kicker mb-3">Results</h5>
          {results ? (
            <div className="flex justify-between items-center"><span className="text-ink-2">Estimated OIP3</span> <span className="readout text-lg text-accent-ink">{results.oip3.toFixed(1)} dBm</span></div>
          ) : (
            <div className="text-sm text-ink-3">Invalid input</div>
          )}
          <div className="text-xs text-ink-3 mt-2">Rule of thumb only: OIP3 ≈ OP1dB + 9.6 dB for a memoryless weakly nonlinear cubic model. The offset varies substantially by circuit, bias, frequency, matching, thermal effects, and measurement definition; do not use it as a substitute for two-tone characterization.</div>
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
    <div>
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div>
            <label className="field-label">Temperature (K)</label>
            <input type="number" step="1" value={temp} onChange={(e) => setTemp(e.target.value)} className="field-input" />
          </div>
          <div>
            <label className="field-label">Bandwidth (MHz)</label>
            <input type="number" step="1" value={bw} onChange={(e) => setBw(e.target.value)} className="field-input" />
          </div>
        </div>
        <div className="readout-panel space-y-3">
          <h5 className="kicker mb-3">Results</h5>
          {results ? (
            <>
              <div className="flex justify-between items-center"><span className="text-ink-2">Noise Density</span> <span className="readout text-lg text-accent-ink">{results.p_density_dBm_Hz.toFixed(1)} dBm/Hz</span></div>
              <div className="flex justify-between items-center"><span className="text-ink-2">Total Noise Power</span> <span className="readout">{results.p_dBm.toFixed(1)} dBm</span></div>
            </>
          ) : (
            <div className="text-sm text-ink-3">Invalid input</div>
          )}
        </div>
      </div>
    </div>
  );
}

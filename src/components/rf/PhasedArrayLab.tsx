'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Readout, Segmented, Slider, Stepper } from './controls';
import PatternCutPlot from './PatternCutPlot';
import PhaseMap from './PhaseMap';
import {
  cutMetrics,
  directivityDbi,
  elementPhasesDeg,
  hasGratingLobe,
  maxGratingFreeSpacing,
  patternCut,
  samplePattern,
  type ArrayConfig,
  type Taper,
} from '@/lib/arrayPattern';

// three.js loads only when this module mounts, never with the rest of the page.
const ArrayPatternStage = dynamic(() => import('./three/ArrayPatternStage'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse bg-surface-2/40" aria-hidden="true" />,
});

type ElementKind = 'isotropic' | 'cosine';

const DEFAULTS = { nx: 8, ny: 8, spacing: 0.5, theta0: 25, phi0: 30, taper: 'uniform' as Taper, element: 'cosine' as ElementKind };

export default function PhasedArrayLab() {
  const [nx, setNx] = useState(DEFAULTS.nx);
  const [ny, setNy] = useState(DEFAULTS.ny);
  const [spacing, setSpacing] = useState(DEFAULTS.spacing);
  const [theta0, setTheta0] = useState(DEFAULTS.theta0);
  const [phi0, setPhi0] = useState(DEFAULTS.phi0);
  const [taper, setTaper] = useState<Taper>(DEFAULTS.taper);
  const [element, setElement] = useState<ElementKind>(DEFAULTS.element);

  const cfg = useMemo<ArrayConfig>(
    () => ({ nx, ny, spacing, theta0Deg: theta0, phi0Deg: phi0, taper, elementQ: element === 'cosine' ? 1 : 0 }),
    [nx, ny, spacing, theta0, phi0, taper, element],
  );
  // Heavy work trails the controls so dragging a slider stays smooth.
  const live = useDeferredValue(cfg);
  const grid = useMemo(() => samplePattern(live, 73, 145), [live]);
  const phases = useMemo(() => elementPhasesDeg(live), [live]);
  const cut = useMemo(() => patternCut(live, live.phi0Deg), [live]);
  const metrics = useMemo(() => cutMetrics(cut), [cut]);
  const directivity = useMemo(() => directivityDbi(live, 180, 360), [live]);
  const grating = hasGratingLobe(spacing, theta0);
  const limit = maxGratingFreeSpacing(theta0);

  const reset = () => {
    setNx(DEFAULTS.nx);
    setNy(DEFAULTS.ny);
    setSpacing(DEFAULTS.spacing);
    setTheta0(DEFAULTS.theta0);
    setPhi0(DEFAULTS.phi0);
    setTaper(DEFAULTS.taper);
    setElement(DEFAULTS.element);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid overflow-hidden rounded-[4px] border border-line lg:grid-cols-[272px_minmax(0,1fr)_210px]">
        <div className="flex flex-col gap-6 border-b border-line p-5 lg:border-b-0 lg:border-r">
          <div className="flex flex-col gap-2.5">
            <span className="field-label mb-0">Array · Nx × Ny</span>
            <div className="flex items-center gap-2">
              <Stepper label="Columns Nx" value={nx} min={1} max={16} onChange={setNx} />
              <span className="font-mono text-ink-3" aria-hidden="true">×</span>
              <Stepper label="Rows Ny" value={ny} min={1} max={16} onChange={setNy} />
            </div>
          </div>
          <Slider label="Spacing d/λ" value={spacing} min={0.25} max={1} step={0.01} format={(v) => `${v.toFixed(2)} λ`} onChange={setSpacing} />
          <Slider label="Steer θ" value={theta0} min={0} max={75} step={1} format={(v) => `${v}°`} onChange={setTheta0} accent />
          <Slider label="Steer φ" value={phi0} min={0} max={355} step={5} format={(v) => `${v}°`} onChange={setPhi0} accent />
          <Segmented<Taper>
            label="Taper"
            value={taper}
            onChange={setTaper}
            options={[
              { value: 'uniform', label: 'Uniform' },
              { value: 'cosine', label: 'Cosine' },
              { value: 'hamming', label: 'Hamming' },
            ]}
          />
          <Segmented<ElementKind>
            label="Element"
            value={element}
            onChange={setElement}
            options={[
              { value: 'isotropic', label: 'Isotropic' },
              { value: 'cosine', label: 'cos θ' },
            ]}
          />
          <button type="button" onClick={reset} className="btn-icon h-10 w-fit px-3 font-mono text-[11px] [font-stretch:87.5%]">
            Reset
          </button>
        </div>

        <div className="graph-grid relative h-[360px] border-b border-line bg-bg-raised sm:h-[460px] lg:h-auto lg:min-h-[520px] lg:border-b-0">
          <ArrayPatternStage
            cfg={live}
            grid={grid}
            phasesDeg={phases}
            label={`3D radiation pattern of a ${nx} by ${ny} array steered to theta ${theta0} degrees, phi ${phi0} degrees`}
            badge={
              <span className="rounded-sm bg-marker px-2 py-1 font-mono text-[11px] text-on-marker [font-stretch:87.5%]">
                Beam θ {theta0.toFixed(1)}° φ {phi0.toFixed(1)}°
              </span>
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-px bg-line lg:grid-cols-1">
          <div className="bg-surface p-5">
            <Readout label="Directivity" value={directivity.toFixed(1)} unit="dBi" large />
          </div>
          <div className="bg-surface p-5">
            <Readout label={`HPBW · φ ${phi0}° cut`} value={metrics.hpbwDeg === null ? '—' : `${metrics.hpbwDeg.toFixed(1)}°`} />
          </div>
          <div className="bg-surface p-5">
            <Readout label="Peak sidelobe" value={metrics.sidelobeDb === null ? '—' : `${metrics.sidelobeDb.toFixed(1)}`} unit={metrics.sidelobeDb === null ? undefined : 'dB'} />
          </div>
          <div className="bg-surface p-5">
            <Readout
              label="Grating lobes"
              value={grating ? 'Present' : 'None'}
              tone={grating ? 'warn' : 'good'}
              note={`d < λ / (1 + sin θ) = ${limit.toFixed(2)} λ`}
            />
          </div>
          <div className="col-span-2 bg-surface p-5 lg:col-span-1">
            <Readout label="Cut peak" value={`${metrics.peakDeg.toFixed(1)}°`} note="Beam peak in the φ cut; it drifts from θ when the element pattern pulls it toward broadside." />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="readout-panel">
          <PatternCutPlot cut={cut} peakDeg={metrics.peakDeg} title={`Pattern cut · φ = ${phi0}° plane`} />
        </div>
        <div className="readout-panel">
          <PhaseMap phasesDeg={phases} />
        </div>
      </div>

      <p className="text-xs leading-relaxed text-ink-3">
        Narrowband array factor on a uniform rectangular grid, multiplied by an ideal element pattern: isotropic, or cos θ over a ground plane (upper hemisphere only). Directivity is integrated numerically over the full sphere. The model excludes mutual coupling, scan impedance, feed and quantization errors, edge effects, and polarization; use full-wave EM for a realized pattern.
      </p>
    </div>
  );
}

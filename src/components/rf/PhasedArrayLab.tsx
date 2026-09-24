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
  peakSidelobeDb,
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
  const sidelobe = useMemo(() => peakSidelobeDb(live), [live]);
  const grating = hasGratingLobe(cfg);
  const limit = maxGratingFreeSpacing(cfg);

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
    // Sized by container queries: the toolbox content column is narrower than the viewport.
    <div className="@container flex flex-col gap-6">
      <div className="grid overflow-hidden rounded-xl border border-line @3xl:grid-cols-[272px_minmax(0,1fr)]">
        <div className="flex flex-col gap-6 border-b border-line p-5 @3xl:border-b-0 @3xl:border-r">
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
          <button type="button" onClick={reset} className="btn-icon h-10 w-fit px-4 text-sm">
            Reset
          </button>
        </div>

        <div className="graph-grid relative h-[340px] bg-bg-raised @md:h-[420px] @3xl:h-auto @3xl:min-h-[520px]">
          <ArrayPatternStage
            cfg={live}
            grid={grid}
            phasesDeg={phases}
            label={`3D radiation pattern of a ${nx} by ${ny} array steered to theta ${theta0} degrees, phi ${phi0} degrees`}
            badge={
              <span className="rounded-full bg-marker px-2.5 py-1 font-mono text-[11px] font-semibold text-on-marker shadow-sm">
                Beam θ {theta0.toFixed(1)}° φ {phi0.toFixed(1)}°
              </span>
            }
          />
        </div>
      </div>

      {/* The last cell spans two columns so the hairline grid never leaves a gap. */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line @xl:grid-cols-3 [&>*:last-child]:col-span-2">
        <div className="bg-surface p-4 @md:p-5">
          <Readout label="Directivity" value={directivity.toFixed(1)} unit="dBi" tone="accent" large />
        </div>
        <div className="bg-surface p-4 @md:p-5">
          <Readout label={<>HPBW · <span className="normal-case">φ {phi0}°</span> cut</>} value={metrics.hpbwDeg === null ? '—' : `${metrics.hpbwDeg.toFixed(1)}°`} />
        </div>
        <div className="bg-surface p-4 @md:p-5">
          <Readout label="Peak sidelobe" value={sidelobe === null ? '—' : sidelobe.toFixed(1)} unit={sidelobe === null ? undefined : 'dB'} note="Whole pattern, grating lobes excluded." />
        </div>
        <div className="bg-surface p-4 @md:p-5">
          <Readout
            label="Grating lobes"
            value={grating ? 'Present' : 'None'}
            tone={grating ? 'warn' : 'good'}
            note={Number.isFinite(limit) ? `Free of them for d < ${limit.toFixed(3)} λ at this steer.` : 'A single element has none.'}
          />
        </div>
        <div className="bg-surface p-4 @md:p-5">
          <Readout label="Cut peak" value={`${metrics.peakDeg.toFixed(1)}°`} note="Beam peak in the φ cut; it drifts from θ when the element pattern pulls it toward broadside." />
        </div>
      </div>

      <div className="grid gap-6 @2xl:grid-cols-[minmax(0,1fr)_240px]">
        <div className="readout-panel">
          <PatternCutPlot cut={cut} peakDeg={metrics.peakDeg} phiDeg={phi0} />
        </div>
        <div className="readout-panel">
          <PhaseMap phasesDeg={phases} />
        </div>
      </div>

      <p className="text-xs leading-relaxed text-ink-3">
        Narrowband array factor on a uniform rectangular grid, multiplied by an ideal element pattern: isotropic, or cos θ over a ground plane (upper hemisphere only). Directivity is 4π U<sub>max</sub> / ∫U dΩ, integrated numerically over the full sphere. The peak sidelobe is searched over all visible directions, so it can sit outside the φ cut plotted below; a grating lobe is flagged when a lattice lobe at (u₀ + pλ/d, v₀ + qλ/d) reaches the visible circle u² + v² ≤ 1. In the 3D view the lobe radius is the normalized pattern from 0 to −40 dB, and the element tiles pulse at their true steering phases, slowed down; the travelling rings and the size of the element grid are illustrative. The model excludes mutual coupling, scan impedance, feed and quantization errors, edge effects, and polarization; use full-wave EM for a realized pattern.
      </p>
    </div>
  );
}

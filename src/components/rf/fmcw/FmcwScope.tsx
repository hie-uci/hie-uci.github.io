'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { beatFrequency, chirpDerived, roundTripDelay, type RangeWindow } from '@/lib/fmcw';
import { useElementWidth } from '@/lib/useElementWidth';
import { Readout, Segmented, Slider } from '../controls';
import { ChirpLoupe, ChirpPlot } from './ChirpPlot';
import IfTrace from './IfTrace';
import RangeProfile from './RangeProfile';
import { hz, joined, metres, seconds } from './format';

const LOUPE_W = 220;
const SIDE_BY_SIDE_MIN = 640; // below this the magnifier drops under the chirp plot
const IF_WINDOW_CYCLES = 20; // the IF strip shows this many cycles at the IF-limited range

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line px-5 py-3 font-mono text-[10.5px] text-ink-3 [font-stretch:87.5%]">
      <span className="inline-flex items-center gap-2">
        <span className="h-0.5 w-5 bg-trace" aria-hidden="true" /> TX chirp
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="w-5 border-t-[1.5px] border-dashed" style={{ borderColor: 'var(--series-2)' }} aria-hidden="true" /> RX echo, delayed <span className="math-var text-[12.5px]">τ</span>
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="h-3 w-px bg-trace/70" aria-hidden="true" /> Sweep
      </span>
    </div>
  );
}

/** Animated FMCW chirp scope: chirps and their delay, the beat tone, and the range profile it becomes. */
export default function FmcwScope() {
  const [bandwidthGHz, setBandwidthGHz] = useState(4);
  const [chirpUs, setChirpUs] = useState(20);
  const [ifMHz, setIfMHz] = useState(10);
  const [rangeM, setRangeM] = useState(5);
  const [pair, setPair] = useState<'one' | 'two'>('one');
  const [separation, setSeparation] = useState(1.5); // in range cells
  const [rangeWindow, setRangeWindow] = useState<RangeWindow>('rect');
  const [columnRef, columnWidth] = useElementWidth<HTMLDivElement>(900);

  const derived = chirpDerived({ bandwidthHz: bandwidthGHz * 1e9, chirpS: chirpUs * 1e-6, ifBandwidthHz: ifMHz * 1e6 });
  const rangeLimit = 1.25 * derived.maxRangeM;
  const target = Math.min(Math.max(rangeM, 0.05), rangeLimit);
  const tau = roundTripDelay(target);
  const beat = beatFrequency(target, derived.slopeHzPerS);
  const beyondIf = target > derived.maxRangeM;
  const cell = derived.rangeResolutionM;
  const targets = useMemo(() => (pair === 'two' ? [target, target + separation * cell] : [target]), [pair, target, separation, cell]);
  // The profile samples a few thousand points; let slider drags stay smooth.
  const profileTargets = useDeferredValue(targets);

  const sideBySide = columnWidth >= SIDE_BY_SIDE_MIN;
  const chirpWidth = sideBySide ? columnWidth - LOUPE_W - 1 : columnWidth;
  const slope = derived.slopeHzPerS / 1e12; // Hz/s to MHz/µs
  const slopeValue = slope.toFixed(slope >= 100 ? 0 : slope >= 10 ? 1 : 2); // three significant figures

  return (
    <div className="flex flex-col gap-6">
      <div className="grid overflow-hidden rounded-[4px] border border-line lg:grid-cols-[272px_minmax(0,1fr)]">
        <div className="flex flex-col gap-6 border-b border-line p-5 lg:border-b-0 lg:border-r">
          <Slider label="Sweep bandwidth B" value={bandwidthGHz} min={0.25} max={10} step={0.25} format={(v) => `${v.toFixed(2)} GHz`} onChange={setBandwidthGHz} />
          <Slider label="Chirp time Tc" value={chirpUs} min={5} max={200} step={1} format={(v) => `${v} µs`} onChange={setChirpUs} />
          <Slider label="IF bandwidth" value={ifMHz} min={1} max={50} step={0.5} format={(v) => `${v.toFixed(1)} MHz`} onChange={setIfMHz} />
          <Slider label="Target range R" value={target} min={0.05} max={rangeLimit} step={rangeLimit / 500} format={(v) => joined(metres(v))} onChange={setRangeM} accent />
          <Segmented<'one' | 'two'>
            label="Targets"
            value={pair}
            onChange={setPair}
            options={[
              { value: 'one', label: 'One' },
              { value: 'two', label: 'Two, equal' },
            ]}
          />
          {pair === 'two' && <Slider label="Separation" value={separation} min={0.25} max={4} step={0.05} format={(v) => `${v.toFixed(2)} ΔR`} onChange={setSeparation} />}
          <Segmented<RangeWindow>
            label="Range FFT window"
            value={rangeWindow}
            onChange={setRangeWindow}
            options={[
              { value: 'rect', label: 'Rectangular' },
              { value: 'hann', label: 'Hann' },
            ]}
          />
        </div>

        <div ref={columnRef} className="min-w-0 bg-bg-raised">
          <Legend />
          <div className={`flex border-b border-line ${sideBySide ? 'flex-row' : 'flex-col'}`}>
            <ChirpPlot width={chirpWidth} chirpS={chirpUs * 1e-6} tauS={tau} label={`Transmit and received chirps, ${bandwidthGHz} GHz over ${chirpUs} microseconds, echo delayed ${joined(seconds(tau))}`} />
            <div className={sideBySide ? 'border-l border-line' : 'border-t border-line'}>
              <ChirpLoupe width={chirpWidth} chirpS={chirpUs * 1e-6} tauS={tau} beatHz={beat} size={sideBySide ? LOUPE_W : columnWidth} />
            </div>
          </div>
          <div className="border-b border-line">
            <IfTrace width={columnWidth} beatHz={beat} windowS={IF_WINDOW_CYCLES / (ifMHz * 1e6)} filtered={beyondIf} />
          </div>
          <RangeProfile width={columnWidth} targets={profileTargets} resolutionM={derived.rangeResolutionM} maxRangeM={derived.maxRangeM} window={rangeWindow} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[4px] border border-line bg-line sm:grid-cols-3 lg:grid-cols-5 [&>*:last-child]:col-span-2 lg:[&>*:last-child]:col-span-1">
        <div className="bg-surface p-5">
          <Readout label="Range resolution" value={metres(derived.rangeResolutionM)[0]} unit={metres(derived.rangeResolutionM)[1]} tone="accent" large />
        </div>
        <div className="bg-surface p-5">
          <Readout label="Chirp slope" value={slopeValue} unit="MHz/µs" large />
        </div>
        <div className="bg-surface p-5">
          <Readout label="IF-limited range" value={metres(derived.maxRangeM)[0]} unit={metres(derived.maxRangeM)[1]} large />
        </div>
        <div className="bg-surface p-5">
          <Readout label="Beat frequency" value={hz(beat)[0]} unit={hz(beat)[1]} tone={beyondIf ? 'alert' : 'warn'} note={beyondIf ? 'Above the IF bandwidth.' : undefined} large />
        </div>
        <div className="bg-surface p-5">
          <Readout label="Round-trip delay" value={seconds(tau)[0]} unit={seconds(tau)[1]} large />
        </div>
      </div>

      <p className="text-[12px] leading-relaxed text-ink-3">
        Ideal linear chirp and stationary point targets. The IF is complex (IQ), so the beat spectrum has no mirror image. Two targets are equal in strength and add in power. Doppler, phase noise, chirp nonlinearity and ADC sampling are not modeled. R_max = f_IF·c / 2S is the beat-frequency limit alone.
      </p>
    </div>
  );
}

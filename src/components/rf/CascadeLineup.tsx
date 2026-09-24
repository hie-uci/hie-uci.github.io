'use client';

import { useId, useMemo, useState } from 'react';
import { levelPlan, type LevelPlan, type LineupStage } from '@/lib/cascadeMath';
import { useElementWidth } from '@/lib/useElementWidth';
import { Readout, Slider } from './controls';

// Noise bandwidth moves on a 1-2-5 ladder from 1 kHz to 10 GHz, like an instrument's RBW knob.
const BANDWIDTH_STEPS = Array.from({ length: 7 }, (_, decade) => [1, 2, 5].map((m) => m * 10 ** (decade + 3))).flat().concat(1e10);
const DEFAULT_BANDWIDTH_STEP = BANDWIDTH_STEPS.indexOf(1e8);

function formatHz(hz: number): string {
  const [unit, scale] = hz >= 1e9 ? ['GHz', 1e9] : hz >= 1e6 ? ['MHz', 1e6] : ['kHz', 1e3];
  return `${hz / (scale as number)} ${unit}`;
}

/** Stage colours follow chain order so the canvas, the strip and the budgets agree. */
export const stageColor = (index: number) => `var(--series-${(index % 8) + 1})`;

const minus = (text: string) => text.replace('-', '−');
const signed = (value: number, digits = 1) => (value > 0 ? `+${value.toFixed(digits)}` : minus(value.toFixed(digits)));
const level = (value: number) => minus(value.toFixed(1));

// Plot frame in CSS pixels. The width follows the container so type stays at its set size.
const H = 330;
const M = { l: 52, r: 96, t: 26, b: 66 };
const MIN_W = 600;
const BOTTOM = H - M.b;
const OFF_SCALE_DB = 80; // an OIP3 this far above the strongest signal is drawn as an arrow

interface Scale {
  x: (k: number) => number;
  y: (dbm: number) => number;
  yMax: number;
  ticks: number[];
}

function makeScale(plan: LevelPlan, width: number): Scale {
  const { nodes } = plan;
  const signals = nodes.map((n) => n.signalDbm);
  const top = Math.max(...signals);
  const oip3 = nodes.flatMap((n) => (n.oip3Dbm !== undefined && n.oip3Dbm <= top + OFF_SCALE_DB ? [n.oip3Dbm] : []));
  const yMin = Math.floor((Math.min(...signals, ...nodes.map((n) => n.noiseDbm)) - 12) / 10) * 10;
  const yMax = Math.max(yMin + 60, Math.ceil((Math.max(top, ...oip3) + 12) / 10) * 10);
  const step = yMax - yMin > 90 ? 20 : 10;
  const ticks: number[] = [];
  for (let v = Math.floor(yMax / step) * step; v >= yMin; v -= step) ticks.push(v); // ticks on multiples of the step
  const plotW = width - M.l - M.r;
  return {
    x: (k) => M.l + (plotW * k) / Math.max(1, nodes.length - 1),
    y: (dbm) => M.t + ((yMax - dbm) / (yMax - yMin)) * (BOTTOM - M.t),
    yMax,
    ticks,
  };
}

function HeadroomDimension({ x, y1, y2, value }: { x: number; y1: number; y2: number; value: number }) {
  const mid = (y1 + y2) / 2;
  return (
    <g stroke="var(--marker-ink)" fill="var(--marker-ink)">
      <line x1={x} x2={x} y1={y1 - 6} y2={y2 + 3} strokeWidth={1} strokeDasharray="3 3" />
      <line x1={x - 4} x2={x + 4} y1={y2} y2={y2} strokeWidth={1} />
      <text x={x - 8} y={mid} textAnchor="end" stroke="none" fontSize={10.5}>
        {value.toFixed(1)} dB
      </text>
      <text x={x - 8} y={mid + 13} textAnchor="end" stroke="none" fontSize={9.5} fill="var(--ink-3)">
        headroom
      </text>
    </g>
  );
}

/** Ceiling marks for each stage's OIP3; the tightest one is called out in gold. */
function Oip3Marks({ plan, s }: { plan: LevelPlan; s: Scale }) {
  const tight = plan.tightestStage + 1;
  const tightNode = plan.nodes[tight];
  return (
    <g className="font-mono" fontSize={10}>
      {plan.nodes.map((node, k) => {
        if (node.oip3Dbm === undefined) return null;
        if (node.oip3Dbm > s.yMax) {
          return (
            <g key={k} fill="var(--ink-3)">
              <path d={`M${s.x(k) - 4} ${M.t + 6}l4-6 4 6`} fill="none" stroke="var(--ink-3)" strokeWidth={1.2} />
              <text x={s.x(k) + 8} y={M.t + 6}>
                OIP3 {level(node.oip3Dbm)}
              </text>
            </g>
          );
        }
        const colour = k === tight ? 'var(--marker-ink)' : 'var(--ink-2)';
        const yo = s.y(node.oip3Dbm);
        return (
          <g key={k}>
            <line x1={s.x(k) - 14} x2={s.x(k) + 14} y1={yo} y2={yo} stroke={colour} strokeWidth={2} />
            <text x={s.x(k) + 18} y={yo + 3.5} fill={colour}>
              OIP3 {level(node.oip3Dbm)}
            </text>
          </g>
        );
      })}
      {tightNode?.oip3Dbm !== undefined && tightNode.oip3Dbm <= s.yMax && (
        <HeadroomDimension x={s.x(tight) - 22} y1={s.y(tightNode.signalDbm)} y2={s.y(tightNode.oip3Dbm)} value={plan.tightestHeadroomDB} />
      )}
    </g>
  );
}

/** Stage strip under the plot: colour key, name, gain and the cascaded NF so far. */
function StageStrip({ stages, s }: { stages: LineupStage[]; s: Scale }) {
  const compact = stages.length > 4;
  return (
    <g className="font-mono">
      {[...stages, null].map((_, k) => (
        <line key={k} x1={s.x(k)} x2={s.x(k)} y1={BOTTOM} y2={BOTTOM + 7} stroke="var(--line-strong)" />
      ))}
      {stages.map((stage, i) => {
        const cx = (s.x(i) + s.x(i + 1)) / 2;
        return (
          <g key={stage.id}>
            <line x1={s.x(i) + 5} x2={s.x(i + 1) - 5} y1={BOTTOM + 16} y2={BOTTOM + 16} stroke={stageColor(i)} strokeWidth={2.5} />
            <text x={cx} y={BOTTOM + 35} textAnchor="middle" fontSize={11} fill="var(--ink)">
              {String(i + 1).padStart(2, '0')} {stage.name}
            </text>
            <text x={cx} y={BOTTOM + 51} textAnchor="middle" fontSize={10} fill="var(--ink-3)">
              {signed(stage.gainDB)} dB{compact ? '' : ` · cum NF ${stage.cumulativeNFdB.toFixed(2)}`}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function SnrDimension({ x, ySignal, yNoise, snr }: { x: number; ySignal: number; yNoise: number; snr: number }) {
  const mid = (ySignal + yNoise) / 2;
  return (
    <g stroke="var(--ink-2)" fill="var(--ink-2)" className="font-mono" fontSize={10.5}>
      <line x1={x} x2={x} y1={ySignal} y2={yNoise} strokeWidth={1} />
      <line x1={x - 4} x2={x + 4} y1={ySignal} y2={ySignal} strokeWidth={1} />
      <line x1={x - 4} x2={x + 4} y1={yNoise} y2={yNoise} strokeWidth={1} />
      <text x={x + 9} y={mid - 2} stroke="none" fill="var(--ink)">
        SNR
      </text>
      <text x={x + 9} y={mid + 12} stroke="none" fill={snr < 0 ? 'var(--alert)' : 'var(--ink-2)'}>
        {level(snr)} dB
      </text>
    </g>
  );
}

function LevelDiagram({ stages, plan, bandwidthLabel }: { stages: LineupStage[]; plan: LevelPlan; bandwidthLabel: string }) {
  const hatch = useId();
  const [ref, measured] = useElementWidth<HTMLDivElement>(760);
  const width = Math.max(MIN_W, measured);
  const s = useMemo(() => makeScale(plan, width), [plan, width]);
  const { nodes } = plan;
  const last = nodes.length - 1;
  const point = (k: number, dbm: number) => `${s.x(k).toFixed(1)},${s.y(dbm).toFixed(1)}`;
  const signal = nodes.map((n, k) => point(k, n.signalDbm)).join(' ');
  const noiseSeq = nodes.map((n, k) => point(k, n.noiseDbm));
  const corridor = `${signal} ${[...noiseSeq].reverse().join(' ')}`;
  const floorArea = `${s.x(0)},${BOTTOM} ${noiseSeq.join(' ')} ${s.x(last)},${BOTTOM}`;
  const anchor = (k: number) => (k === 0 ? 'start' : k === last ? 'end' : 'middle');
  const nudge = (k: number) => (k === 0 ? 6 : k === last ? -6 : 0);

  return (
    <div ref={ref} className="overflow-x-auto">
      <svg
        width={width}
        height={H}
        viewBox={`0 0 ${width} ${H}`}
        className="block"
        role="img"
        aria-label={`Level diagram. Signal ${level(nodes[0].signalDbm)} dBm in, ${level(nodes[last].signalDbm)} dBm out. Output SNR ${level(plan.snrOutDB)} dB over ${bandwidthLabel}.`}
      >
        <defs>
          <pattern id={hatch} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--line-strong)" strokeWidth="1" />
          </pattern>
        </defs>

        <g className="font-mono" fontSize={10} fill="var(--ink-3)">
          <text x={M.l - 10} y={M.t - 12} textAnchor="end">
            dBm
          </text>
          {s.ticks.map((t) => (
            <g key={t}>
              <line x1={M.l} x2={width - M.r} y1={s.y(t)} y2={s.y(t)} stroke="var(--line)" />
              <text x={M.l - 10} y={s.y(t) + 3.5} textAnchor="end">
                {minus(String(t))}
              </text>
            </g>
          ))}
        </g>

        <polygon points={floorArea} fill={`url(#${hatch})`} />
        <polygon points={corridor} fill="var(--trace)" fillOpacity={0.09} />
        <polyline points={noiseSeq.join(' ')} fill="none" stroke="var(--ink-3)" strokeWidth={1.25} strokeDasharray="5 4" />
        <polyline points={signal} fill="none" stroke="var(--trace)" strokeWidth={2} strokeLinejoin="round" />

        <Oip3Marks plan={plan} s={s} />

        <g className="font-mono" fontSize={10.5}>
          {nodes.map((n, k) => (
            <g key={k}>
              <circle cx={s.x(k)} cy={s.y(n.signalDbm)} r={3.5} fill="var(--bg-raised)" stroke="var(--trace)" strokeWidth={2} />
              <text x={s.x(k) + nudge(k)} y={s.y(n.signalDbm) - 10} textAnchor={anchor(k)} fill="var(--ink)">
                {level(n.signalDbm)}
              </text>
              <text x={s.x(k) + nudge(k)} y={s.y(n.noiseDbm) + 16} textAnchor={anchor(k)} fill="var(--ink-3)" fontSize={9.5}>
                {level(n.noiseDbm)}
              </text>
            </g>
          ))}
        </g>

        <SnrDimension x={s.x(last) + 16} ySignal={s.y(nodes[last].signalDbm)} yNoise={s.y(nodes[last].noiseDbm)} snr={plan.snrOutDB} />
        <StageStrip stages={stages} s={s} />
      </svg>
    </div>
  );
}

/** A 100 % bar split by stage, with the dominant contributor set in full ink. */
function Budget({ title, note, stages, share }: { title: string; note: string; stages: LineupStage[]; share: (s: LineupStage) => number }) {
  const values = stages.map((s) => Math.max(0, share(s)));
  const top = values.indexOf(Math.max(...values));
  const isTop = (i: number) => i === top && values[i] > 0;
  return (
    <div className="bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h4 className="kicker text-[10.5px]">{title}</h4>
        <span className="text-[12px] text-ink-3">{note}</span>
      </div>
      <div className="mt-4 flex h-2.5 w-full gap-px overflow-hidden rounded-[2px] bg-surface-2" aria-hidden="true">
        {stages.map((s, i) => (
          <span key={s.id} className="h-full" style={{ width: `${(values[i] * 100).toFixed(3)}%`, background: stageColor(i) }} />
        ))}
      </div>
      <ol className="mt-4 flex flex-col gap-2">
        {stages.map((s, i) => (
          <li key={s.id} className="flex items-center gap-3 text-[13px]">
            <span className="size-2.5 shrink-0 rounded-[1px]" style={{ background: stageColor(i) }} aria-hidden="true" />
            <span className="font-mono text-[11px] text-ink-3">{String(i + 1).padStart(2, '0')}</span>
            <span className={`flex-1 ${isTop(i) ? 'font-semibold text-ink' : 'text-ink-2'}`}>{s.name}</span>
            <span className={`readout text-[13px] ${isTop(i) ? 'text-ink' : 'text-ink-2'}`}>{(values[i] * 100).toFixed(1)} %</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Level diagram plus noise and linearity budgets for the resolved chain. */
export default function CascadeLineup({ stages, frequencyLabel }: { stages: LineupStage[]; frequencyLabel?: string }) {
  const [inputDbm, setInputDbm] = useState(-60);
  const [bandwidthStep, setBandwidthStep] = useState(DEFAULT_BANDWIDTH_STEP);
  const bandwidth = BANDWIDTH_STEPS[bandwidthStep];
  const plan = useMemo(() => levelPlan(stages, inputDbm, bandwidth), [stages, inputDbm, bandwidth]);
  const bandwidthLabel = formatHz(bandwidth);
  const tight = stages[plan.tightestStage];
  const squeezed = plan.tightestHeadroomDB < 10;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid overflow-hidden rounded-[4px] border border-line lg:grid-cols-[248px_minmax(0,1fr)]">
        <div className="flex flex-col gap-6 border-b border-line p-5 lg:border-b-0 lg:border-r">
          <div>
            <h4 className="kicker text-[10.5px]">Level diagram</h4>
            <p className="mt-2 text-[13px] leading-snug text-ink-3">Drive the chain and watch the margins move at every interface.</p>
          </div>
          <Slider label="Input power" value={inputDbm} min={-120} max={0} step={1} format={(v) => `${level(v)} dBm`} onChange={setInputDbm} />
          <Slider label="Noise bandwidth" value={bandwidthStep} min={0} max={BANDWIDTH_STEPS.length - 1} step={1} format={(i) => formatHz(BANDWIDTH_STEPS[i])} onChange={setBandwidthStep} />
          <div className="grid grid-cols-3 gap-4 border-t border-line pt-5 lg:grid-cols-1 lg:gap-5">
            <Readout label="Output SNR" value={level(plan.snrOutDB)} unit="dB" tone={plan.snrOutDB < 0 ? 'alert' : 'ink'} />
            <Readout label="SFDR" value={Number.isFinite(plan.sfdrDB) ? plan.sfdrDB.toFixed(1) : '—'} unit="dB" />
            <Readout
              label="Tightest headroom"
              value={Number.isFinite(plan.tightestHeadroomDB) ? level(plan.tightestHeadroomDB) : '—'}
              unit="dB"
              tone={squeezed ? 'alert' : 'warn'}
              note={tight ? (squeezed ? `${tight.name} is within 10 dB of its OIP3: expect compression.` : `At the ${tight.name} output.`) : undefined}
            />
          </div>
        </div>

        <figure className="min-w-0 bg-bg-raised">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line px-5 py-3 font-mono text-[10.5px] text-ink-3 [font-stretch:87.5%]">
            <span className="inline-flex items-center gap-2">
              <span className="h-0.5 w-5 bg-trace" aria-hidden="true" /> Signal
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-5 border-t border-dashed border-ink-3" aria-hidden="true" /> Noise floor · {bandwidthLabel}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-0.5 w-4 bg-ink-2" aria-hidden="true" /> Stage OIP3
            </span>
            <span className="inline-flex items-center gap-2 text-marker-ink">
              <span className="h-0.5 w-4 bg-marker-ink" aria-hidden="true" /> Tightest headroom
            </span>
          </div>
          <div className="px-3 pb-2 pt-3">
            <LevelDiagram stages={stages} plan={plan} bandwidthLabel={bandwidthLabel} />
          </div>
          <figcaption className="border-t border-line px-5 py-3 text-[12px] leading-relaxed text-ink-3">
            <span className="mb-1 block font-mono text-[10.5px] text-ink-2 [font-stretch:87.5%] sm:hidden">Swipe the diagram sideways to see every stage.</span>
            Matched-stage Friis lineup{frequencyLabel ? ` ${frequencyLabel}` : ''}. Noise uses kT₀ = −174 dBm/Hz. P1dB sits about 10 dB below OIP3 for a third-order nonlinearity, so headroom under 10 dB means compression.
          </figcaption>
        </figure>
      </div>

      <div className="grid gap-px overflow-hidden rounded-[4px] border border-line bg-line md:grid-cols-2">
        <Budget title="Noise budget" note="Share of F − 1 each stage adds" stages={stages} share={(s) => s.noiseShare} />
        <Budget title="Linearity budget" note="Share of 1 / IIP3 each stage adds" stages={stages} share={(s) => s.linearityShare} />
      </div>
    </div>
  );
}

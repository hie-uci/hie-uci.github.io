'use client';

import { useId, useMemo } from 'react';
import { rangeProfileDb, type RangeWindow } from '@/lib/fmcw';
import { joined, metres } from './format';

const FLOOR_DB = -60;
const TOP_DB = 6;
const M = { l: 46, r: 18 };
const OVERVIEW_H = 74;
const DETAIL_H = 214;
const DETAIL_HALF_CELLS = 8; // the detail view spans ±8 range cells around the targets

interface ProfileProps {
  width: number;
  targets: number[];
  resolutionM: number;
  maxRangeM: number;
  window: RangeWindow;
}

/** Evenly spaced ranges, plus the exact target ranges so every peak is sampled at its top. */
function sampleRanges(lo: number, hi: number, count: number, exact: number[]): number[] {
  const out = Array.from({ length: count }, (_, i) => lo + ((hi - lo) * i) / (count - 1));
  exact.forEach((r) => {
    if (r > lo && r < hi) out.push(r);
  });
  return out.sort((a, b) => a - b);
}

/** A 1-2-5 step that gives about `count` ticks across `span`. */
function niceStep(span: number, count: number): number {
  const raw = span / count;
  const decade = 10 ** Math.floor(Math.log10(raw) + 1e-9);
  const m = (raw / decade) * (1 + 1e-9); // 0.6 / 3 is 0.19999999999999998, not 0.2
  return decade * (m >= 5 ? 5 : m >= 2 ? 2 : 1);
}

function ticksBetween(lo: number, hi: number, count: number): number[] {
  const step = niceStep(hi - lo, count);
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-9; v += step) out.push(Number(v.toPrecision(12)));
  return out;
}

const tickLabel = (m: number, step: number) => (step < 1 ? `${m.toFixed(Math.max(0, -Math.floor(Math.log10(step))))}` : m.toFixed(0));

interface Frame {
  x: (r: number) => number;
  y: (db: number) => number;
  top: number;
  bottom: number;
}

function frame(width: number, lo: number, hi: number, top: number, bottom: number): Frame {
  const plotW = Math.max(120, width - M.l - M.r);
  return {
    x: (r) => M.l + ((r - lo) / (hi - lo)) * plotW,
    y: (db) => top + ((TOP_DB - db) / (TOP_DB - FLOOR_DB)) * (bottom - top),
    top,
    bottom,
  };
}

function curve(ranges: number[], dbs: number[], f: Frame) {
  const line = ranges.map((r, i) => `${i ? 'L' : 'M'}${f.x(r).toFixed(1)} ${f.y(dbs[i]).toFixed(1)}`).join('');
  const area = `${line}L${f.x(ranges.at(-1)!).toFixed(1)} ${f.bottom}L${f.x(ranges[0]).toFixed(1)} ${f.bottom}Z`;
  return { line, area };
}

/** Hatched band past the IF limit, where the beat frequency is above the IF filter. */
function BeyondIf({ f, fromM, toM, hatch }: { f: Frame; fromM: number; toM: number; hatch: string }) {
  if (fromM >= toM) return null;
  return <rect x={f.x(fromM)} y={f.top} width={f.x(toM) - f.x(fromM)} height={f.bottom - f.top} fill={`url(#${hatch})`} />;
}

/** Full span from zero to past the IF limit, with the detail window marked. */
function Overview({ width, targets, resolutionM, maxRangeM, window, detail, hatch }: ProfileProps & { detail: [number, number]; hatch: string }) {
  const hi = maxRangeM * 1.25;
  const f = frame(width, 0, hi, 8, OVERVIEW_H - 22);
  const ranges = useMemo(() => sampleRanges(0, hi, 1400, targets), [hi, targets]);
  const dbs = useMemo(() => rangeProfileDb(ranges, targets, resolutionM, window, FLOOR_DB), [ranges, targets, resolutionM, window]);
  const { line, area } = curve(ranges, dbs, f);
  const step = niceStep(hi, 6);
  const x0 = f.x(detail[0]);
  const x1 = Math.max(x0 + 4, f.x(detail[1]));

  return (
    <svg width={width} height={OVERVIEW_H} viewBox={`0 0 ${width} ${OVERVIEW_H}`} className="block" role="img" aria-label={`Range profile from 0 to ${joined(metres(hi))}`}>
      <BeyondIf f={f} fromM={maxRangeM} toM={hi} hatch={hatch} />
      <line x1={f.x(0)} x2={f.x(hi)} y1={f.bottom} y2={f.bottom} stroke="var(--line-strong)" />
      <path d={area} fill="var(--trace)" fillOpacity={0.14} />
      <path d={line} fill="none" stroke="var(--trace)" strokeWidth={1.25} />
      <line x1={f.x(maxRangeM)} x2={f.x(maxRangeM)} y1={f.top - 4} y2={f.bottom} stroke="var(--ink-3)" strokeDasharray="3 3" />
      <rect x={x0} y={f.top - 4} width={x1 - x0} height={f.bottom - f.top + 4} fill="var(--marker)" fillOpacity={0.12} stroke="var(--marker-ink)" strokeWidth={1} />
      <g className="font-mono" fontSize={10} fill="var(--ink-3)">
        {ticksBetween(0, hi, 6).map((t) => (
          <text key={t} x={f.x(t)} y={OVERVIEW_H - 6} textAnchor="middle">
            {tickLabel(t, step)}
          </text>
        ))}
        <text x={M.l - 8} y={f.bottom + 3.5} textAnchor="end">
          m
        </text>
        <text x={f.x(maxRangeM) + 6} y={f.top + 6}>
          IF limit
        </text>
      </g>
    </svg>
  );
}

/** Zoomed view around the targets: main lobe, sidelobes and the resolution cell. */
function Detail({ width, targets, resolutionM, maxRangeM, window, span, hatch }: ProfileProps & { span: [number, number]; hatch: string }) {
  const [lo, hi] = span;
  const f = frame(width, lo, hi, 26, DETAIL_H - 26);
  const ranges = useMemo(() => sampleRanges(lo, hi, 700, targets), [lo, hi, targets]);
  const dbs = useMemo(() => rangeProfileDb(ranges, targets, resolutionM, window, FLOOR_DB), [ranges, targets, resolutionM, window]);
  const { line, area } = curve(ranges, dbs, f);
  const tickCount = width < 460 ? 2 : 5; // intervals: a phone gets three labels, not five
  const step = niceStep(hi - lo, tickCount);
  const cell = { x0: f.x(targets[0]), x1: f.x(targets[0] + resolutionM), y: f.y(-50) };
  // The label sits right of the cell unless that would run off the plot.
  const labelRight = cell.x1 + 6 + 160 <= width - M.r;

  return (
    <svg width={width} height={DETAIL_H} viewBox={`0 0 ${width} ${DETAIL_H}`} className="block" role="img" aria-label={`Range profile around the target, ${targets.length} target${targets.length > 1 ? 's' : ''}`}>
      <BeyondIf f={f} fromM={Math.max(lo, maxRangeM)} toM={hi} hatch={hatch} />
      <g className="font-mono" fontSize={10} fill="var(--ink-3)">
        {[0, -20, -40, -60].map((db) => (
          <g key={db}>
            <line x1={M.l} x2={width - M.r} y1={f.y(db)} y2={f.y(db)} stroke={db === 0 ? 'var(--line-strong)' : 'var(--line)'} />
            <text x={M.l - 8} y={f.y(db) + 3.5} textAnchor="end">
              {db === 0 ? '0 dB' : `−${-db}`}
            </text>
          </g>
        ))}
        {ticksBetween(lo, hi, tickCount).map((t) => (
          <text key={t} x={f.x(t)} y={DETAIL_H - 8} textAnchor="middle">
            {tickLabel(t, step)} m
          </text>
        ))}
      </g>
      <path d={area} fill="var(--trace)" fillOpacity={0.1} />
      <path d={line} fill="none" stroke="var(--trace)" strokeWidth={1.75} strokeLinejoin="round" />
      {targets.map((t, i) => (
        <g key={i} className="font-mono" fontSize={10} fill="var(--series-2)">
          <path d={`M${f.x(t) - 5} ${f.top - 14}h10l-5 7z`} />
          <line x1={f.x(t)} x2={f.x(t)} y1={f.top - 6} y2={f.bottom} stroke="var(--series-2)" strokeOpacity={0.45} strokeDasharray="2 3" />
          <text x={f.x(t) + (i ? 8 : -8)} y={f.top - 8} textAnchor={i ? 'start' : 'end'}>
            T{i + 1}
          </text>
        </g>
      ))}
      <g stroke="var(--ink)" strokeWidth={1}>
        <line x1={cell.x0} x2={cell.x1} y1={cell.y} y2={cell.y} />
        <line x1={cell.x0} x2={cell.x0} y1={cell.y - 4} y2={cell.y + 4} />
        <line x1={cell.x1} x2={cell.x1} y1={cell.y - 4} y2={cell.y + 4} />
      </g>
      <text
        x={labelRight ? cell.x1 + 6 : cell.x0 - 6}
        y={cell.y + 3.5}
        textAnchor={labelRight ? 'start' : 'end'}
        className="font-mono"
        fontSize={10.5}
        fill="var(--ink)"
        paintOrder="stroke"
        stroke="var(--bg-raised)"
        strokeWidth={4}
      >
        <tspan className="math-var" fontSize={12.5}>ΔR</tspan> = c/2B = {joined(metres(resolutionM))}
      </text>
    </svg>
  );
}

/** Beat spectrum shown as range: a full-span overview above a zoomed detail. */
export default function RangeProfile(props: ProfileProps) {
  const hatch = useId();
  const { targets, resolutionM } = props;
  const lo = Math.min(...targets);
  const hi = Math.max(...targets);
  const half = Math.max(DETAIL_HALF_CELLS, (hi - lo) / resolutionM / 2 + 5) * resolutionM;
  const mid = (lo + hi) / 2;
  const span: [number, number] = [Math.max(0, mid - half), mid + half];

  return (
    <div>
      <svg width={0} height={0} className="absolute" aria-hidden="true">
        <defs>
          <pattern id={hatch} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--line-strong)" strokeWidth="1" />
          </pattern>
        </defs>
      </svg>
      <Overview {...props} detail={span} hatch={hatch} />
      <div className="border-t border-line" />
      <Detail {...props} span={span} hatch={hatch} />
    </div>
  );
}

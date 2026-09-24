'use client';

import { createContext, use, useCallback, useDeferredValue, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useUpdateNodeInternals,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { calculateCascade, stageLineup, type CascadeBlock, type CascadeResult, type SweptCascadeResult } from '@/lib/cascadeMath';
import { parseTouchstone, type ParseResult } from '@/lib/sParameterEngine';
import { useElementWidth } from '@/lib/useElementWidth';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { useMotionMode } from '@/lib/useMotionMode';
import { BlockGlyph, type BlockKind } from './rf/BlockGlyph';
import CascadeLineup, { stageColor } from './rf/CascadeLineup';
import { Readout } from './rf/controls';

// React Flow needs node data assignable to Record<string, unknown>; interfaces lack that implicit index signature.
type RFBlockData = {
  kind: BlockKind;
  name: string;
  gain: number;
  nf: number;
  oip3: number;
  sParamData?: ParseResult;
  sParamFileName?: string;
  fileError?: string;
};
type RFBlockNode = Node<RFBlockData, 'rfBlock'>;

const PARTS: Record<BlockKind, { label: string; gain: number; nf: number; oip3: number }> = {
  LNA: { label: 'Low-noise amplifier', gain: 15, nf: 1.5, oip3: 20 },
  Filter: { label: 'Band-pass filter', gain: -2, nf: 2, oip3: 100 },
  Mixer: { label: 'Mixer', gain: -6, nf: 6, oip3: 15 },
  PA: { label: 'Power amplifier', gain: 20, nf: 6, oip3: 35 },
  Attenuator: { label: 'Attenuator', gain: -6, nf: 6, oip3: 100 },
};
const PART_ORDER: BlockKind[] = ['LNA', 'Filter', 'Mixer', 'PA', 'Attenuator'];
const STAGE_PITCH = 250;
const NODE_WIDTH = 204; // matches the node card's w-[204px]
const NODE_HEIGHT = 220; // node card with its file row, used to size the phone canvas

const minus = (text: string) => text.replace('-', '−');
const signed = (value: number, digits = 1) => (value > 0 ? `+${value.toFixed(digits)}` : minus(value.toFixed(digits)));
const figure = (value: number, digits = 2) => (Number.isFinite(value) ? minus(value.toFixed(digits)) : '—');

function makeBlock(id: string, kind: BlockKind, position: { x: number; y: number }): RFBlockNode {
  const { gain, nf, oip3 } = PARTS[kind];
  return { id, type: 'rfBlock', position, data: { kind, name: kind, gain, nf, oip3 } };
}

const initialNodes: RFBlockNode[] = [
  makeBlock('1', 'LNA', { x: 0, y: 0 }),
  makeBlock('2', 'Filter', { x: STAGE_PITCH, y: 0 }),
  makeBlock('3', 'Mixer', { x: 2 * STAGE_PITCH, y: 0 }),
];
const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
];

function formatSummaryFrequency(frequency?: number): string {
  if (frequency === undefined) return '';
  if (frequency >= 1e9) return `at ${(frequency / 1e9).toFixed(3)} GHz`;
  if (frequency >= 1e6) return `at ${(frequency / 1e6).toFixed(3)} MHz`;
  return `at ${frequency.toFixed(0)} Hz`;
}

/* ───────────────────────────── chain resolution ───────────────────────────── */

interface ChainResolution {
  chain: CascadeBlock[];
  warnings: string[];
}

/** Follow first outgoing edges from one input block, noting branches and cycles. */
function walk(start: string, outgoing: Map<string, string[]>, nameOf: (id: string) => string) {
  const ids: string[] = [];
  const notes: string[] = [];
  const seen = new Set<string>();
  let current: string | undefined = start;
  while (current && !seen.has(current)) {
    seen.add(current);
    ids.push(current);
    const next: string[] = outgoing.get(current) ?? [];
    if (next.length > 1) notes.push(`${nameOf(current)} feeds more than one block. Results follow its first connection only.`);
    const following: string | undefined = next[0];
    if (following && seen.has(following)) notes.push('The chain loops back on itself. Results stop before the repeated block.');
    current = following;
  }
  return { ids, notes };
}

/** Resolve the analysed chain: the longest path from a block with no input. */
function resolveChain(nodes: RFBlockNode[], edges: Edge[]): ChainResolution {
  if (!nodes.length) return { chain: [], warnings: [] };
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const incoming = new Map(nodes.map((n) => [n.id, 0]));
  const outgoing = new Map<string, string[]>(nodes.map((n) => [n.id, []]));
  for (const edge of edges) {
    if (!byId.has(edge.source) || !byId.has(edge.target)) continue;
    incoming.set(edge.target, (incoming.get(edge.target) ?? 0) + 1);
    outgoing.get(edge.source)?.push(edge.target);
  }
  const starts = nodes.filter((n) => incoming.get(n.id) === 0);
  if (!starts.length) return { chain: [], warnings: ['Every block has an input, so the chain is a loop. Remove one connection to give it a start.'] };

  const nameOf = (id: string) => byId.get(id)?.data.name ?? id;
  const walks = starts.map((n) => walk(n.id, outgoing, nameOf));
  const best = walks.reduce((a, b) => (b.ids.length > a.ids.length ? b : a));
  const warnings = [...best.notes];
  if (starts.length > 1) warnings.unshift('Some blocks are not connected to the chain. They are drawn dashed and left out of the results.');

  const chain = best.ids.map((id) => {
    const { data } = byId.get(id)!;
    return { id, name: data.name, gain: data.gain, nf: data.nf, oip3: data.oip3, sParamData: data.sParamData, sParamFileName: data.sParamFileName };
  });
  return { chain, warnings };
}

/* ───────────────────────────────── node card ───────────────────────────────── */

interface CascadeActions {
  update: (id: string, patch: Partial<Pick<RFBlockData, 'gain' | 'nf' | 'oip3'>>) => void;
  loadFile: (id: string, file: File) => void;
  clearFile: (id: string) => void;
  remove: (id: string) => void;
  order: ReadonlyMap<string, number>;
  /** Matched |S21| gain, dB, for file-driven stages in the chain at the summary frequency. */
  measuredGain: ReadonlyMap<string, number>;
  /** Phone layout: the chain runs top to bottom and the canvas is static. */
  vertical: boolean;
}

const CascadeContext = createContext<CascadeActions | null>(null);

function useCascade(): CascadeActions {
  const actions = use(CascadeContext);
  if (!actions) throw new Error('RF block rendered outside SystemCascadeBuilder.');
  return actions;
}

/** Numeric field that keeps the visitor's partial input ("-", "1.") until it parses. */
function NodeNumber({ label, unit, value, onCommit, disabled, title }: { label: string; unit: string; value: number; onCommit: (v: number) => void; disabled?: boolean; title?: string }) {
  const [draft, setDraft] = useState<string | null>(null);
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">
        {label} <span className="normal-case tracking-normal">{unit}</span>
      </label>
      <input
        id={id}
        type="number"
        step="any"
        value={draft ?? String(value)}
        disabled={disabled}
        title={title}
        onChange={(e) => {
          const text = e.target.value;
          setDraft(text);
          const parsed = Number(text);
          if (text.trim() !== '' && Number.isFinite(parsed)) onCommit(parsed);
        }}
        onBlur={() => setDraft(null)}
        className="nodrag h-8 w-[76px] rounded-md border border-line-strong bg-bg-raised px-2 text-right font-mono text-[12px] tabular-nums text-ink [appearance:textfield] hover:border-ink-3 focus:outline-none focus:ring-2 focus:ring-uci-blue disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </div>
  );
}

function FileRow({ id, data }: { id: string; data: RFBlockData }) {
  const cascade = useCascade();
  return (
    <div className="border-t border-line px-3 py-2.5">
      {data.sParamData ? (
        <div className="flex items-center gap-2">
          <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-trace" title={data.sParamFileName}>
            S21 · {data.sParamFileName}
          </span>
          <button type="button" className="nodrag text-[11px] font-medium text-ink-3 underline-offset-2 hover:text-ink hover:underline" onClick={() => cascade.clearFile(id)}>
            Unload
          </button>
        </div>
      ) : (
        <label className="nodrag flex cursor-pointer items-center gap-2 rounded-md text-[11.5px] font-medium text-ink-2 hover:text-accent-ink has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-uci-blue">
          <svg viewBox="0 0 12 12" className="size-3 shrink-0 text-trace" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 1.5v6M3.5 5 6 7.5 8.5 5M2 10.5h8" />
          </svg>
          Load measured .s2p
          <input
            type="file"
            accept=".s2p"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = ''; // allow re-selecting the same file after an error
              if (file) cascade.loadFile(id, file);
            }}
          />
        </label>
      )}
      {data.fileError && (
        <p role="alert" className="mt-1.5 text-[11px] leading-snug text-alert">
          {data.fileError}
        </p>
      )}
    </div>
  );
}

function RFBlock({ id, data, selected }: NodeProps<RFBlockNode>) {
  const cascade = useCascade();
  const index = cascade.order.get(id);
  const inChain = index !== undefined;
  const measured = cascade.measuredGain.get(id);
  const updateNodeInternals = useUpdateNodeInternals();
  // Handles move between the sides and the top/bottom edges when the layout flips. React Flow
  // measures a new node itself; forcing that on mount would resolve a queued fitView while
  // the other nodes are still unmeasured, zooming onto this one node.
  const measuredLayout = useRef(cascade.vertical);
  useEffect(() => {
    if (measuredLayout.current === cascade.vertical) return;
    measuredLayout.current = cascade.vertical;
    updateNodeInternals(id);
  }, [cascade.vertical, id, updateNodeInternals]);
  const frame = selected ? 'border-marker-ink' : inChain ? 'border-line-strong' : 'border-dashed border-line-strong opacity-70';
  return (
    <div className={`w-[204px] rounded-lg border bg-surface text-ink shadow-sm transition-[border-color,opacity] duration-200 ${frame}`}>
      <Handle type="target" position={cascade.vertical ? Position.Top : Position.Left} />
      <div className="flex items-center gap-2.5 border-b border-line py-2 pl-3 pr-1.5">
        <span
          className="size-2 shrink-0 rounded-full"
          style={inChain ? { background: stageColor(index) } : { boxShadow: 'inset 0 0 0 1px var(--line-strong)' }}
          aria-hidden="true"
        />
        <span className="font-mono text-[11px] text-ink-3">{inChain ? String(index + 1).padStart(2, '0') : '—'}</span>
        <BlockGlyph kind={data.kind} className="text-ink-2" />
        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">{data.name}</span>
        <button
          type="button"
          className="nodrag grid size-7 place-items-center rounded-md text-[16px] leading-none text-ink-3 transition-colors hover:bg-surface-2 hover:text-alert"
          aria-label={`Remove ${data.name}`}
          onClick={() => cascade.remove(id)}
        >
          ×
        </button>
      </div>
      <div className="flex flex-col gap-2 px-3 py-3">
        <NodeNumber
          label="Gain"
          unit="dB"
          value={measured === undefined ? data.gain : Number(measured.toFixed(2))}
          disabled={Boolean(data.sParamData)}
          title={data.sParamData ? `Gain is |S21| of ${data.sParamFileName}${measured === undefined ? '' : ' at the summary frequency'}` : undefined}
          onCommit={(v) => cascade.update(id, { gain: v })}
        />
        <NodeNumber label="NF" unit="dB" value={data.nf} onCommit={(v) => cascade.update(id, { nf: v })} />
        <NodeNumber label="OIP3" unit="dBm" value={data.oip3} onCommit={(v) => cascade.update(id, { oip3: v })} />
      </div>
      <FileRow id={id} data={data} />
      <Handle type="source" position={cascade.vertical ? Position.Bottom : Position.Right} />
    </div>
  );
}

const nodeTypes = { rfBlock: RFBlock };

/* ─────────────────────────────── side panels ─────────────────────────────── */

function PartsBin({ onAdd, onReset, onClear }: { onAdd: (kind: BlockKind) => void; onReset: () => void; onClear: () => void }) {
  return (
    <div className="flex flex-col border-b border-line @3xl:border-b-0 @3xl:border-r">
      <div className="px-5 pb-4 pt-5">
        <h4 className="kicker text-[11px]">Parts</h4>
        <p className="mt-2 text-[13px] leading-snug text-ink-3">Click a part to append it to the chain, or drag from an output port to an input port.</p>
      </div>
      <ul className="grid grid-cols-1 gap-px border-y border-line bg-line @md:grid-cols-2 @md:[&>li:last-child]:col-span-2 @3xl:grid-cols-1 @3xl:[&>li:last-child]:col-span-1">
        {PART_ORDER.map((kind) => {
          const part = PARTS[kind];
          return (
            <li key={kind} className="bg-bg">
              <button type="button" onClick={() => onAdd(kind)} className="group flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-surface-2 focus-visible:bg-surface-2">
                <BlockGlyph kind={kind} className="text-ink-3 transition-colors group-hover:text-trace" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-semibold text-ink">
                    <span className="sr-only">Add </span>
                    {part.label}
                  </span>
                  <span className="readout mt-0.5 block text-[11px] text-ink-3">
                    G {signed(part.gain)} · NF {part.nf} · IP3 {part.oip3}
                  </span>
                </span>
                <span className="text-xl leading-none text-ink-3 transition-colors group-hover:text-accent-ink" aria-hidden="true">
                  +
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto grid grid-cols-2 gap-2 p-5">
        <button type="button" onClick={onReset} className="btn-icon h-10 w-full whitespace-nowrap px-2 text-[13px]">
          Reset example
        </button>
        <button type="button" onClick={onClear} className="btn-icon h-10 w-full whitespace-nowrap px-2 text-[13px]">
          Clear canvas
        </button>
      </div>
    </div>
  );
}

function Summary({ result, frequencyLabel }: { result: CascadeResult; frequencyLabel: string }) {
  const cells = [
    { label: 'Cascaded gain', value: figure(result.cascadedGain), unit: 'dB' },
    { label: 'Noise figure', value: figure(result.cascadedNF), unit: 'dB' },
    { label: 'Output IP3', value: figure(result.cascadedOIP3), unit: 'dBm' },
    { label: 'Input IP3', value: figure(result.cascadedIIP3), unit: 'dBm' },
  ];
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="grid grid-cols-2 gap-px bg-line @2xl:grid-cols-4">
        {cells.map((cell) => (
          <div key={cell.label} className="bg-surface p-4 @md:p-5">
            <Readout label={cell.label} value={cell.value} unit={cell.unit} tone={cell.label === 'Cascaded gain' ? 'accent' : 'ink'} large />
          </div>
        ))}
      </div>
      {frequencyLabel && <p className="border-t border-line bg-surface px-5 py-2.5 text-[11.5px] text-ink-3">Summary values {frequencyLabel}, the middle sample of the band the loaded files share</p>}
    </div>
  );
}

const axisTick = { fill: 'var(--ink-3)', fontSize: 11, fontFamily: 'var(--font-geist-mono)' };

function SweptChart({ data }: { data: SweptCascadeResult[] }) {
  return (
    <figure className="panel p-5">
      <figcaption className="kicker mb-4 text-[11px]">Swept cascade across the common S-parameter band</figcaption>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 28, left: -6, bottom: 4 }}>
            <CartesianGrid stroke="var(--line)" vertical={false} />
            <XAxis dataKey="frequency" tickFormatter={(v: number) => `${(v / 1e9).toFixed(1)} G`} tick={axisTick} stroke="var(--line-strong)" />
            <YAxis tick={axisTick} stroke="var(--line-strong)" />
            <Tooltip
              contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line-strong)', borderRadius: 8, fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: 'var(--ink)' }}
              labelStyle={{ color: 'var(--ink-3)' }}
              labelFormatter={(v) => `${(Number(v) / 1e9).toFixed(3)} GHz`}
              formatter={(v, name) => [figure(Number(v)), name]}
            />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'var(--font-geist-mono)', color: 'var(--ink-2)' }} />
            <Line type="monotone" dataKey="cascadedGain" name="Gain dB" stroke="var(--series-1)" dot={false} strokeWidth={2} isAnimationActive={false} />
            <Line type="monotone" dataKey="cascadedNF" name="NF dB" stroke="var(--series-2)" dot={false} strokeWidth={2} isAnimationActive={false} />
            <Line type="monotone" dataKey="cascadedOIP3" name="OIP3 dBm" stroke="var(--series-3)" dot={false} strokeWidth={2} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

/* ───────────────────────────────── builder ───────────────────────────────── */

/** Node, edge and file handlers shared by the canvas and the node cards. */
function useCascadeGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState<RFBlockNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
  const { deleteElements } = useReactFlow();

  const patch = useCallback(
    (id: string, next: Partial<RFBlockData>) => setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...next } } : n))),
    [setNodes],
  );

  const loadFile = useCallback(
    async (id: string, file: File) => {
      if (!/\.s2p$/i.test(file.name)) {
        patch(id, { fileError: `${file.name} is not a two-port file. The cascade needs a .s2p Touchstone file.` });
        return;
      }
      try {
        const parsed = parseTouchstone(await file.text(), 2);
        if (parsed.errors?.length || !parsed.points.length) throw new Error(parsed.errors?.join(' ') || 'No network-data points were found.');
        patch(id, { sParamData: parsed, sParamFileName: file.name, fileError: undefined });
      } catch (err) {
        patch(id, { fileError: `Could not read ${file.name}: ${err instanceof Error ? err.message : String(err)}` });
      }
    },
    [patch],
  );

  // Deleting a block from the middle of a straight chain reconnects its neighbours.
  // React Flow reports the cut edges here, after it has already removed them from state.
  const onDelete = useCallback(
    ({ nodes: gone, edges: cut }: { nodes: RFBlockNode[]; edges: Edge[] }) => {
      const goneIds = new Set(gone.map((n) => n.id));
      const bridges: Edge[] = gone.flatMap((node) => {
        const ins = cut.filter((e) => e.target === node.id);
        const outs = cut.filter((e) => e.source === node.id);
        if (ins.length !== 1 || outs.length !== 1) return [];
        const source = ins[0].source;
        const target = outs[0].target;
        return goneIds.has(source) || goneIds.has(target) ? [] : [{ id: `e${source}-${target}`, source, target, animated: true }];
      });
      if (bridges.length) setEdges((eds) => bridges.reduce((acc, edge) => addEdge(edge, acc), eds));
    },
    [setEdges],
  );

  const actions = useMemo(
    () => ({
      update: (id: string, next: Partial<Pick<RFBlockData, 'gain' | 'nf' | 'oip3'>>) => patch(id, next),
      loadFile: (id: string, file: File) => void loadFile(id, file),
      clearFile: (id: string) => patch(id, { sParamData: undefined, sParamFileName: undefined, fileError: undefined }),
      remove: (id: string) => void deleteElements({ nodes: [{ id }] }),
    }),
    [patch, loadFile, deleteElements],
  );

  return { nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange, onDelete, actions };
}

function Builder() {
  const { nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange, onDelete, actions } = useCascadeGraph();
  const { fitView, setViewport } = useReactFlow();
  const [canvasRef, canvasWidth] = useElementWidth<HTMLDivElement>(0);
  const motion = useMotionMode();
  const nextId = useRef(initialNodes.length + 1);

  // Dragging rewrites node positions every frame; the analysis can trail behind at low priority.
  const liveNodes = useDeferredValue(nodes);
  const liveEdges = useDeferredValue(edges);
  const { chain, warnings: chainWarnings } = useMemo(() => resolveChain(liveNodes, liveEdges), [liveNodes, liveEdges]);
  const result = useMemo(() => (chain.length ? calculateCascade(chain) : null), [chain]);
  const lineup = useMemo(() => (result ? stageLineup(chain, result.summaryFrequency) : null), [chain, result]);
  const order = useMemo(() => new Map(chain.map((block, i) => [block.id, i])), [chain]);
  const measuredGain = useMemo(
    () => new Map((lineup ?? []).flatMap((stage, i) => (chain[i]?.sParamData ? [[stage.id, stage.gainDB] as const] : []))),
    [lineup, chain],
  );
  const vertical = useMediaQuery('(max-width: 639px)');
  const context = useMemo(() => ({ ...actions, order, measuredGain, vertical }), [actions, order, measuredGain, vertical]);
  // Positions are stored for the wide layout; the phone layout shows them transposed.
  const shownNodes = useMemo(() => (vertical ? nodes.map((n) => ({ ...n, position: { x: n.position.y, y: n.position.x } })) : nodes), [nodes, vertical]);
  const frequencyLabel = formatSummaryFrequency(result?.summaryFrequency);
  const warnings = [...chainWarnings, ...(result?.warnings ?? [])];

  const refit = useCallback(() => void fitView({ padding: 0.2, duration: motion === 'reduced' ? 0 : 320 }), [fitView, motion]);

  // Wide layout: fit the chain whenever the layout switches back.
  useEffect(() => {
    if (!vertical) refit();
  }, [vertical, refit]);

  // Phone layout: one column at full size. The geometry is known, so place the viewport
  // directly instead of fitting, which would run before React Flow sees the new canvas height.
  const xs = shownNodes.map((n) => n.position.x);
  const ys = shownNodes.map((n) => n.position.y);
  const minX = xs.length ? Math.min(...xs) : 0;
  const minY = ys.length ? Math.min(...ys) : 0;
  const spanY = ys.length ? Math.max(...ys) - minY : 0;
  useEffect(() => {
    if (vertical && canvasWidth) void setViewport({ x: (canvasWidth - NODE_WIDTH) / 2 - minX, y: 44 - minY, zoom: 1 });
  }, [vertical, canvasWidth, minX, minY, setViewport]);

  const addBlock = (kind: BlockKind) => {
    const id = `b${nextId.current++}`;
    const tailId = chain.at(-1)?.id;
    const tail = nodes.find((n) => n.id === tailId);
    setNodes((nds) => [...nds, makeBlock(id, kind, tail ? { x: tail.position.x + STAGE_PITCH, y: tail.position.y } : { x: 0, y: 0 })]);
    if (tailId) setEdges((eds) => addEdge({ id: `e${tailId}-${id}`, source: tailId, target: id, animated: true }, eds));
    if (!vertical) refit();
  };

  const reset = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    if (!vertical) refit();
  };

  const clear = () => {
    setNodes([]);
    setEdges([]);
  };

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)), [setEdges]);

  return (
    <CascadeContext value={context}>
      <div className="@container flex flex-col gap-6">
        <div className="grid overflow-hidden rounded-xl border border-line @3xl:grid-cols-[248px_minmax(0,1fr)]">
          <PartsBin onAdd={addBlock} onReset={reset} onClear={clear} />
          <div ref={canvasRef} className="relative h-[440px] bg-bg-raised sm:h-[480px]" style={vertical ? { height: Math.max(360, spanY + NODE_HEIGHT + 68) } : undefined}>
            <ReactFlow
              className={`cascade-flow ${vertical ? 'cascade-flow-static' : ''}`}
              nodes={shownNodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onDelete={onDelete}
              onConnect={onConnect}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.3}
              maxZoom={1.6}
              zoomOnScroll={false}
              preventScrolling={false}
              nodesDraggable={!vertical}
              panOnDrag={!vertical}
              zoomOnPinch={!vertical}
              zoomOnDoubleClick={!vertical}
              deleteKeyCode={['Backspace', 'Delete']}
            >
              <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
              {!vertical && <Controls showInteractive={false} position="bottom-left" />}
            </ReactFlow>
            <p className="kicker pointer-events-none absolute right-4 top-3.5 text-[10.5px]">Signal flows {vertical ? 'top to bottom' : 'left to right'}</p>
            {!nodes.length && (
              <p className="pointer-events-none absolute inset-0 grid place-items-center px-8 text-center text-[14px] text-ink-3">The canvas is empty. Add a part to start a chain.</p>
            )}
          </div>
        </div>

        {result && <Summary result={result} frequencyLabel={frequencyLabel} />}

        {warnings.length > 0 && (
          <ul className="flex flex-col gap-1.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        )}

        {result?.sweptResults && result.sweptResults.length > 0 && <SweptChart data={result.sweptResults} />}

        {lineup && lineup.length > 0 && <CascadeLineup stages={lineup} frequencyLabel={frequencyLabel} />}
      </div>
    </CascadeContext>
  );
}

/** Drag-and-drop receiver chain with Friis cascade results, a level diagram and noise/linearity budgets. */
export default function SystemCascadeBuilder() {
  return (
    <ReactFlowProvider>
      <Builder />
    </ReactFlowProvider>
  );
}

'use client';

import { Label, SIGNAL, Vignette } from './frame';

// A differential pair as a graph (devices as nodes, nets as edges) becomes a placed and routed
// layout: each device lights in turn and lands in the layout, then the nets are routed. Drawn,
// not the output of the lab's models.
const CYCLE_S = 8;
const NODES = [
  { x: 30, y: 40, cell: { x: 146, y: 30 } },
  { x: 82, y: 40, cell: { x: 196, y: 30 } },
  { x: 30, y: 92, cell: { x: 146, y: 80 } },
  { x: 82, y: 92, cell: { x: 196, y: 80 } },
  { x: 56, y: 136, cell: { x: 171, y: 124 } },
];
const EDGES: [number, number][] = [[0, 1], [0, 2], [1, 3], [2, 4], [3, 4]];
const CELL = { w: 30, h: 20 };

/** Manhattan route between the facing edges of two layout cells. */
function route(a: number, b: number): string {
  const p = NODES[a].cell;
  const q = NODES[b].cell;
  const ax = p.x + CELL.w / 2;
  const bx = q.x + CELL.w / 2;
  if (p.y === q.y) return `M${p.x + CELL.w} ${p.y + CELL.h / 2} H${q.x}`;
  const ay = p.y + CELL.h;
  const midY = (ay + q.y) / 2;
  return `M${ax} ${ay} V${midY} H${bx} V${q.y}`;
}

function Drawing({ t }: { t: number }) {
  const c = t % CYCLE_S;
  const placed = Math.min(NODES.length, Math.floor(c / 0.5));
  const routed = Math.max(0, Math.min(1, (c - 2.5) / 2.5));
  const fade = c > 7 ? 1 - (c - 7) : 1;
  return (
    <g opacity={fade}>
      {/* circuit graph */}
      {EDGES.map(([a, b]) => (
        <path key={`${a}-${b}`} d={`M${NODES[a].x} ${NODES[a].y} L${NODES[b].x} ${NODES[b].y}`} opacity={0.55} />
      ))}
      {NODES.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={7} className={i < placed ? SIGNAL : undefined}
          stroke="currentColor" fill={i < placed ? 'currentColor' : 'none'} fillOpacity={i < placed ? 0.35 : 0} />
      ))}
      <path d="M106 86 H128 M122 81 L129 86 L122 91" />
      {/* layout: cells with gate fingers, then routing */}
      {NODES.slice(0, placed).map((n, i) => (
        <g key={i}>
          <rect x={n.cell.x} y={n.cell.y} width={CELL.w} height={CELL.h} rx={1.5} className={SIGNAL} fill="currentColor" fillOpacity={0.2} stroke="currentColor" />
          <path d={`M${n.cell.x + 9} ${n.cell.y} v${CELL.h} M${n.cell.x + 15} ${n.cell.y} v${CELL.h} M${n.cell.x + 21} ${n.cell.y} v${CELL.h}`} strokeWidth={1} opacity={0.6} />
        </g>
      ))}
      {routed > 0 && EDGES.map(([a, b]) => (
        <path key={`r${a}-${b}`} d={route(a, b)} pathLength={1} strokeDasharray={`${routed} 1`} className={SIGNAL} stroke="currentColor" />
      ))}
      <Label x={56} y={164} anchor="middle">circuit graph</Label>
      <Label x={186} y={164} anchor="middle">layout</Label>
    </g>
  );
}

export default function AiLayout() {
  return (
    <Vignette title="From circuit graph to layout" chip="Illustration, AI-driven layout synthesis" still={6}>
      {(t) => <Drawing t={t} />}
    </Vignette>
  );
}

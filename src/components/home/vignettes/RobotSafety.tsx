'use client';

import { Label, SIGNAL, Vignette } from './frame';

// A radar at the robot's base sorts returns into angle bins; when a person steps inside the safety
// radius the arm slows to a quarter speed. The walk and the speeds are illustrative.
const CYCLE_S = 9;
const RADAR = { x: 182, y: 148 };
const SAFE_R = 74;
const BINS = [150, 162, 174, 186, 198, 210];

/** Person's x position: walk in, pause near the robot, walk back out. */
function personX(t: number): number {
  const c = t % CYCLE_S;
  if (c < 3.5) return -6 + (c / 3.5) * 128;
  if (c < 5.5) return 122;
  if (c < 9) return 122 - ((c - 5.5) / 3.5) * 128;
  return -6;
}

const near = (x: number) => Math.hypot(x - RADAR.x, 128 - RADAR.y) < SAFE_R;

const DT = 0.05;
/** Arm speed in rad/s: full while the zone is clear, a quarter while someone is inside it. */
const speedAt = (s: number) => (near(personX(s)) ? 0.25 : 1) * 2.4;
const PHASE_PER_CYCLE = (() => {
  let p = 0;
  for (let s = 0; s < CYCLE_S; s += DT) p += speedAt(s) * DT;
  return p;
})();

/** Arm phase: the integral of its speed since t = 0. */
function armPhase(t: number): number {
  const n = Math.floor(t / CYCLE_S);
  let p = n * PHASE_PER_CYCLE;
  for (let s = n * CYCLE_S; s < t; s += DT) p += speedAt(s) * DT;
  return p;
}

function Drawing({ t }: { t: number }) {
  const px = personX(t);
  const inside = near(px);
  const ph = armPhase(t);
  const a1 = -90 + 35 * Math.sin(ph);
  const a2 = a1 + 60 + 30 * Math.sin(ph + 1);
  const rad = (d: number) => (d * Math.PI) / 180;
  const j1 = { x: RADAR.x + 40 * Math.cos(rad(a1)), y: RADAR.y - 8 + 40 * Math.sin(rad(a1)) };
  const j2 = { x: j1.x + 30 * Math.cos(rad(a2)), y: j1.y + 30 * Math.sin(rad(a2)) };
  const personAngle = (Math.atan2(128 - RADAR.y, px - RADAR.x) * 180) / Math.PI + 360;
  const step = Math.sin(t * 9) * (px > -6 && px < 122 ? 5 : 0);
  return (
    <>
      {/* angle bins; the one holding the person lights up */}
      {BINS.map((b) => {
        const lit = Math.abs(personAngle - b) < 6 && px > 0;
        const p1 = { x: RADAR.x + 120 * Math.cos(rad(b - 6)), y: RADAR.y + 120 * Math.sin(rad(b - 6)) };
        const p2 = { x: RADAR.x + 120 * Math.cos(rad(b + 6)), y: RADAR.y + 120 * Math.sin(rad(b + 6)) };
        return (
          <path key={b} d={`M${RADAR.x} ${RADAR.y} L${p1.x.toFixed(1)} ${p1.y.toFixed(1)} L${p2.x.toFixed(1)} ${p2.y.toFixed(1)} Z`}
            className={lit ? SIGNAL : undefined} stroke="currentColor" fill={lit ? 'currentColor' : 'none'} fillOpacity={lit ? 0.18 : 0} opacity={lit ? 0.9 : 0.18} strokeWidth={1} />
        );
      })}
      <path d={`M${RADAR.x - SAFE_R} ${RADAR.y} A${SAFE_R} ${SAFE_R} 0 0 1 ${RADAR.x} ${RADAR.y - SAFE_R}`}
        strokeDasharray="4 4" className={inside ? SIGNAL : undefined} stroke="currentColor" opacity={inside ? 1 : 0.5} />
      {/* robot arm on its base, with the radar chip */}
      <path d={`M${RADAR.x - 14} ${RADAR.y + 6} H${RADAR.x + 14} M${RADAR.x} ${RADAR.y + 6} V${RADAR.y - 8}`} />
      <path d={`M${RADAR.x} ${RADAR.y - 8} L${j1.x.toFixed(1)} ${j1.y.toFixed(1)} L${j2.x.toFixed(1)} ${j2.y.toFixed(1)}`} strokeWidth={3} />
      <circle cx={j1.x} cy={j1.y} r={3} />
      <rect x={RADAR.x - 22} y={RADAR.y - 4} width={9} height={9} rx={1.5} className={SIGNAL} stroke="currentColor" />
      {/* the person */}
      <circle cx={px} cy={102} r={6} />
      <path d={`M${px} 108 V128 M${px} 128 L${px - step} 146 M${px} 128 L${px + step} 146 M${px - 8} 116 H${px + 8}`} />
      {inside && <Label x={RADAR.x} y={30} anchor="end">arm slows</Label>}
    </>
  );
}

export default function RobotSafety() {
  return (
    <Vignette title="Robots that slow for people" chip="Illustration, dual-band MIMO radar" still={4.5}>
      {(t) => <Drawing t={t} />}
    </Vignette>
  );
}

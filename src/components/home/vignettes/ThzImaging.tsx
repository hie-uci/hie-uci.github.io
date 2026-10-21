'use client';

import { SIGNAL, Vignette } from './frame';

// A focused THz spot rasters across a sealed envelope and the transmitted power builds an image
// pixel by pixel; the key inside absorbs and shows. Drawn, not computed.
const COLS = 24;
const ROWS = 13;
const PX = 8;
const ENV_X = 24;
const ENV_Y = 50;
const SCAN_S = 5;
const HOLD_S = 1.6;
const CYCLE_S = SCAN_S + HOLD_S + 0.6;

/** True where the hidden key lies: a ring bow, a shaft and two teeth. */
function insideKey(x: number, y: number): boolean {
  const d = Math.hypot(x - 66, y - 102);
  if (d <= 17 && d >= 6) return true;
  if (x >= 80 && x <= 172 && y >= 97 && y <= 107) return true;
  if (x >= 146 && x <= 156 && y >= 107 && y <= 122) return true;
  return x >= 162 && x <= 172 && y >= 107 && y <= 117;
}

const pixels = Array.from({ length: COLS * ROWS }, (_, n) => {
  const i = n % COLS;
  const j = Math.floor(n / COLS);
  const cx = ENV_X + i * PX + PX / 2;
  const cy = ENV_Y + j * PX + PX / 2;
  return { x: cx - 3.5, y: cy - 3.5, cx, cy, key: insideKey(cx, cy), grain: 0.08 + ((i * 7 + j * 13) % 5) * 0.03 };
});

function Drawing({ t }: { t: number }) {
  const c = t % CYCLE_S;
  const shown = Math.min(pixels.length, Math.floor((c / SCAN_S) * pixels.length));
  const fade = c > SCAN_S + HOLD_S ? 1 - (c - SCAN_S - HOLD_S) / 0.6 : 1;
  const spot = c < SCAN_S ? pixels[Math.min(shown, pixels.length - 1)] : null;
  return (
    <>
      {/* the image builds up pixel by pixel as the focused beam rasters */}
      <g className={SIGNAL} fill="currentColor" stroke="none" opacity={fade}>
        {pixels.slice(0, shown).map((p, n) => (
          <rect key={n} x={p.x} y={p.y} width={7} height={7} rx={1} opacity={p.key ? 0.9 : p.grain} />
        ))}
      </g>
      {/* THz source and its focused beam */}
      <rect x={108} y={8} width={24} height={13} rx={2} />
      <path d="M113 8v-3M120 8v-3M127 8v-3" strokeWidth={1} />
      {spot && <path d={`M120 21 L${spot.cx} ${spot.cy}`} className={SIGNAL} stroke="currentColor" opacity={0.8} />}
      {spot && <circle cx={spot.cx} cy={spot.cy} r={2.5} className={SIGNAL} fill="currentColor" stroke="none" />}
      {/* the package, drawn over its image */}
      <rect x={ENV_X} y={ENV_Y} width={COLS * PX} height={ROWS * PX} rx={3} />
      <path d={`M${ENV_X} ${ENV_Y} L120 ${ENV_Y + 56} L${ENV_X + COLS * PX} ${ENV_Y}`} opacity={0.6} />
    </>
  );
}

export default function ThzImaging() {
  return (
    <Vignette title="Seeing inside a package" chip="Illustration, 0.32 THz transmitter" still={SCAN_S + 0.5}>
      {(t) => <Drawing t={t} />}
    </Vignette>
  );
}

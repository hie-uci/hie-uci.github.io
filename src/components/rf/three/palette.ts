import * as THREE from 'three';

export interface StagePalette {
  dark: boolean;
  trace: THREE.Color;
  trace2: THREE.Color;
  marker: THREE.Color;
  ink: THREE.Color;
  ink3: THREE.Color;
  line: THREE.Color;
  lineOpacity: number;
  copper: THREE.Color;
  copperShade: THREE.Color;
  substrate: THREE.Color;
  substrateOpacity: number;
  /** Pattern colormap stops, low to high. */
  ramp: THREE.Color[];
}

function cssColor(name: string): { color: THREE.Color; alpha: number } {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const rgba = raw.match(/^rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,/]+([\d.]+))?\s*\)$/i);
  if (rgba) {
    const [, r, g, b, a] = rgba;
    return { color: new THREE.Color(Number(r) / 255, Number(g) / 255, Number(b) / 255), alpha: a === undefined ? 1 : Number(a) };
  }
  // The CSS minifier may rewrite rgba() tokens as #rrggbbaa or #rgba; split the alpha off.
  const hex = raw.match(/^#([0-9a-f]{3,8})$/i);
  if (hex && (hex[1].length === 4 || hex[1].length === 8)) {
    const h = hex[1].length === 4 ? hex[1].replace(/./g, (ch) => ch + ch) : hex[1];
    return { color: new THREE.Color(`#${h.slice(0, 6)}`), alpha: parseInt(h.slice(6, 8), 16) / 255 };
  }
  return { color: new THREE.Color(raw || '#888888'), alpha: 1 };
}

/** Read the live theme tokens so 3D stages match the page in both themes. */
export function readPalette(): StagePalette {
  const dark = document.documentElement.classList.contains('dark');
  const line = cssColor('--line-strong');
  return {
    dark,
    trace: cssColor('--trace').color,
    trace2: cssColor('--trace-2').color,
    marker: cssColor('--marker').color,
    ink: cssColor('--ink').color,
    ink3: cssColor('--ink-3').color,
    line: line.color,
    lineOpacity: Math.max(0.35, line.alpha * 2.2),
    copper: new THREE.Color(dark ? '#c9923a' : '#b8832f'),
    copperShade: new THREE.Color(dark ? '#6f4d1c' : '#8a6424'),
    substrate: new THREE.Color(dark ? '#2f5f66' : '#6f9fa6'),
    substrateOpacity: dark ? 0.72 : 0.5,
    ramp: dark
      ? [new THREE.Color('#0b1f3a'), new THREE.Color('#0064a4'), new THREE.Color('#38bdf8'), new THREE.Color('#ffd200')]
      : [new THREE.Color('#c7dcee'), new THREE.Color('#3d8fc6'), new THREE.Color('#0064a4'), new THREE.Color('#e0b400')],
  };
}

/** Sample the ramp at t in 0..1 into `out`. */
export function rampColor(ramp: THREE.Color[], t: number, out: THREE.Color): THREE.Color {
  const x = Math.min(1, Math.max(0, t)) * (ramp.length - 1);
  const i = Math.min(ramp.length - 2, Math.floor(x));
  return out.copy(ramp[i]).lerp(ramp[i + 1], x - i);
}

/** Call `onChange` whenever the html class (and therefore the theme) changes. */
export function subscribeTheme(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import * as THREE from 'three';
import ThreeCanvas from './ThreeCanvas';
import { disposeObject, type StageRuntime } from './stageRuntime';
import { rampColor, readPalette, subscribeTheme, type StagePalette } from './palette';
import { twoSlotField } from '@/lib/patchAntenna';

interface PatchStageProps {
  widthMm: number;
  lengthMm: number;
  /** L + 2ΔL, the slot separation of the two-slot pattern. */
  effectiveLengthMm: number;
  heightMm: number;
  freqGHz: number;
  label: string;
}

const C_MM_GHZ = 299.792458; // c in mm·GHz

function slab(w: number, h: number, d: number, color: THREE.Color, opacity = 1, metal = 0.3) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: metal, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 }),
  );
  mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12 })));
  return mesh;
}

/**
 * Two-slot cavity-model pattern (Balanis eq. 14-43), the one the directivity integrates:
 * resonant length along the three.js z-axis, width along x, upper hemisphere only.
 * The radius is proportional to |E|.
 */
function buildLobe(patch: { widthMm: number; heightMm: number; effectiveLengthMm: number }, freqGHz: number, scale: number, baseY: number, p: StagePalette) {
  const k0 = (2 * Math.PI * freqGHz) / C_MM_GHZ;
  const nT = 40;
  const nP = 80;
  const pos = new Float32Array(nT * nP * 3);
  const col = new Float32Array(nT * nP * 3);
  const c = new THREE.Color();
  let peak = 0;
  const mags: number[] = [];
  for (let i = 0; i < nT; i++) {
    const th = (Math.PI / 2) * (i / (nT - 1));
    for (let j = 0; j < nP; j++) {
      const ph = (2 * Math.PI * j) / (nP - 1);
      const ux = Math.sin(th) * Math.cos(ph); // along L
      const uy = Math.sin(th) * Math.sin(ph); // along W
      const m = twoSlotField(ux, uy, k0, patch);
      mags.push(m);
      if (m > peak) peak = m;
    }
  }
  for (let i = 0; i < nT; i++) {
    const th = (Math.PI / 2) * (i / (nT - 1));
    for (let j = 0; j < nP; j++) {
      const ph = (2 * Math.PI * j) / (nP - 1);
      const k = i * nP + j;
      const r = (mags[k] / (peak || 1)) * scale;
      pos.set([r * Math.sin(th) * Math.sin(ph), baseY + r * Math.cos(th), r * Math.sin(th) * Math.cos(ph)], k * 3);
      rampColor(p.ramp, mags[k] / (peak || 1), c);
      col.set([c.r, c.g, c.b], k * 3);
    }
  }
  const index: number[] = [];
  for (let i = 0; i < nT - 1; i++) {
    for (let j = 0; j < nP - 1; j++) {
      const a = i * nP + j;
      index.push(a, a + nP, a + 1, a + nP, a + nP + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setIndex(index);
  g.computeVertexNormals();
  return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, transparent: true, opacity: 0.42, side: THREE.DoubleSide, depthWrite: false, roughness: 0.6 }));
}

/** Rectangular patch drawn to scale from the synthesis, with oscillating fringing fields and its broadside pattern. */
export default function PatchStage({ widthMm, lengthMm, effectiveLengthMm, heightMm, freqGHz, label }: PatchStageProps) {
  const [runtime, setRuntime] = useState<StageRuntime | null>(null);
  const [themeTick, setThemeTick] = useState(0);
  const onReady = useCallback((rt: StageRuntime | null) => setRuntime(rt), []);

  useEffect(() => subscribeTheme(() => setThemeTick((t) => t + 1)), []);

  useEffect(() => {
    if (!runtime) return;
    const hemi = new THREE.HemisphereLight(0xe6f1ff, 0x0b1f3a, 1.5);
    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(3, 6, 4);
    runtime.scene.add(hemi, key);
    return () => {
      runtime.scene.remove(hemi, key);
    };
  }, [runtime]);

  useEffect(() => {
    if (!runtime || ![widthMm, lengthMm, effectiveLengthMm, heightMm, freqGHz].every((v) => Number.isFinite(v) && v > 0)) return;
    const p = readPalette();
    const ground = Math.max(widthMm, lengthMm) * 2.1;
    const s = 4 / ground; // the ground plane is always 4 units across
    const W = widthMm * s;
    const L = lengthMm * s;
    const h = Math.max(0.05, heightMm * s);
    const root = new THREE.Group();

    const gnd = slab(4, 0.04, 4, p.copperShade);
    gnd.position.y = -0.02;
    const sub = slab(4, h, 4, p.substrate, p.substrateOpacity, 0);
    sub.position.y = h / 2;
    const patch = slab(W, 0.014, L, p.copper);
    patch.position.y = h + 0.007;
    const feedW = Math.max(0.06, W / 12);
    const feedLen = 2 - L / 2;
    const feed = slab(feedW, 0.014, feedLen, p.copper);
    feed.position.set(0, h + 0.007, L / 2 + feedLen / 2);
    root.add(gnd, sub, patch, feed);

    // Fringing arcs at the two radiating edges (z = ±L/2), several positions along W.
    const arcs: THREE.Line[] = [];
    for (const sign of [-1, 1]) {
      for (let i = 0; i < 6; i++) {
        const x = -W / 2 + (W * (i + 0.5)) / 6;
        for (const [reach, bulge] of [
          [0.16, 0.13],
          [0.3, 0.22],
        ] as const) {
          const pts: THREE.Vector3[] = [];
          for (let k = 0; k <= 24; k++) {
            const t = k / 24;
            pts.push(new THREE.Vector3(x, (h + 0.014) * (1 - t) + bulge * Math.sin(Math.PI * t), sign * (L / 2 + reach * t)));
          }
          const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: p.trace, transparent: true, opacity: 0.85 }));
          arcs.push(line);
          root.add(line);
        }
      }
    }

    const lobe = buildLobe({ widthMm, heightMm, effectiveLengthMm }, freqGHz, 1.2, h + 0.02, p);
    root.add(lobe);
    runtime.scene.add(root);
    runtime.invalidate();

    // The fringing field oscillates at the carrier; both edges swing together, which is why the patch radiates broadside.
    const stop = runtime.onFrame((t) => {
      const a = 0.25 + 0.7 * Math.abs(Math.cos(2 * Math.PI * 0.7 * t));
      arcs.forEach((line) => {
        (line.material as THREE.LineBasicMaterial).opacity = a;
      });
    });
    return () => {
      stop();
      runtime.scene.remove(root);
      disposeObject(root);
      runtime.invalidate();
    };
  }, [runtime, widthMm, lengthMm, effectiveLengthMm, heightMm, freqGHz, themeTick]);

  return (
    <ThreeCanvas
      init={{ cameraPosition: [4.8, 3.9, 5.4], target: [0, 0.3, 0], fov: 34, minDistance: 2.5, maxDistance: 16 }}
      onReady={onReady}
      label={label}
    >
      <p className="pointer-events-none absolute left-4 top-3.5 kicker text-[10px]">Patch to scale · two-slot pattern</p>
      <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg-raised via-bg-raised/85 to-transparent px-4 pb-3 pt-10 text-[11.5px] leading-snug text-ink-3">
        Patch and substrate to scale; the feed line and the ground-plane size are illustrative, and the model assumes an infinite ground. The lobe is the two-slot cavity-model pattern, with radius proportional to |E|. The fringing arcs are a sketch: they swing in phase at both radiating edges, which is why the patch radiates broadside.
      </p>
    </ThreeCanvas>
  );
}

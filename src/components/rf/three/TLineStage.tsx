'use client';

import { useCallback, useEffect, useState } from 'react';
import * as THREE from 'three';
import ThreeCanvas from './ThreeCanvas';
import { disposeObject, type StageRuntime } from './stageRuntime';
import { readPalette, subscribeTheme, type StagePalette } from './palette';

export type TLineKind = 'microstrip' | 'stripline' | 'cpw';

export interface TLineGeometry {
  kind: TLineKind;
  /** Signal trace width, mm. */
  widthMm: number;
  /** Substrate height (microstrip, CPW) or ground-to-ground spacing (stripline), mm. */
  heightMm: number;
  /** Conductor thickness, mm (drawn at least 2% of the height so it stays visible). */
  thicknessMm: number;
  /** CPW slot width, mm. */
  gapMm?: number;
}

interface TLineStageProps {
  geometry: TLineGeometry;
  label: string;
  className?: string;
  caption?: string;
}

interface Built {
  root: THREE.Group;
  wave: THREE.Line;
  waveBase: number;
  length: number;
}

function box(w: number, h: number, d: number, color: THREE.Color, opacity = 1): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: opacity < 1 ? 0 : 0.35, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 }),
  );
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12 }));
  mesh.add(edges);
  return mesh;
}

/** Field line in the front cross-section (z = front) from (x0, y0) to (x1, y1), bowed by `bulge`. */
function fieldLine(x0: number, y0: number, x1: number, y1: number, bulge: number, z: number, color: THREE.Color, opacity: number): THREE.Line {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 32; i++) {
    const t = i / 32;
    pts.push(new THREE.Vector3(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t + bulge * Math.sin(Math.PI * t), z));
  }
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
}

function buildScene(g: TLineGeometry, p: StagePalette): Built {
  // Everything is normalized so the substrate height is 1 unit; the camera frames it the same way for any input.
  const s = 1 / g.heightMm;
  const w = Math.max(0.05, g.widthMm * s);
  const t = Math.max(0.02, g.thicknessMm * s);
  const gap = Math.max(0.04, (g.gapMm ?? 0) * s);
  const boardW = Math.max(4.2, w * 3, g.kind === 'cpw' ? w + 2 * gap + 2.4 : 0);
  const length = boardW * 0.95;
  const zFront = length / 2;
  const root = new THREE.Group();

  const substrate = box(boardW, 1, length, p.substrate, p.substrateOpacity);
  substrate.position.set(0, 0.5, 0);

  const groundThick = 0.06;
  if (g.kind !== 'cpw') {
    const ground = box(boardW, groundThick, length, p.copperShade);
    ground.position.set(0, -groundThick / 2, 0);
    root.add(ground);
  }

  const traceY = g.kind === 'stripline' ? 0.5 : 1 + t / 2;
  const trace = box(w, t, length, p.copper);
  trace.position.set(0, traceY, 0);
  root.add(substrate, trace);

  if (g.kind === 'stripline') {
    const top = box(boardW, groundThick, length, p.copperShade, 0.35);
    top.position.set(0, 1 + groundThick / 2, 0);
    root.add(top);
  }
  if (g.kind === 'cpw') {
    const side = (boardW - w) / 2 - gap;
    for (const sign of [-1, 1]) {
      const plane = box(side, t, length, p.copperShade);
      plane.position.set(sign * (w / 2 + gap + side / 2), 1 + t / 2, 0);
      root.add(plane);
    }
  }

  // Quasi-static E-field sketch in the front cross-section.
  const fz = zFront + 0.01;
  const edge = w / 2;
  if (g.kind === 'microstrip') {
    for (let i = 0; i < 5; i++) {
      const x = -edge + (w * (i + 0.5)) / 5;
      root.add(fieldLine(x, 1, x, 0, 0, fz, p.trace, 0.95));
    }
    // Fringing lines land on the ground plane, which ends at the board edge.
    const room = boardW / 2 - edge - 0.12;
    [0.3, 0.6, 0.92].forEach((frac, k) => {
      const reach = room * frac;
      for (const sign of [-1, 1]) root.add(fieldLine(sign * edge, 1 + t, sign * (edge + reach), 0, 0.35 + 0.3 * k, fz, p.trace, 0.85 - 0.2 * k));
    });
  } else if (g.kind === 'stripline') {
    for (let i = 0; i < 4; i++) {
      const x = -edge + (w * (i + 0.5)) / 4;
      root.add(fieldLine(x, 0.5 - t / 2, x, 0, 0, fz, p.trace, 0.95), fieldLine(x, 0.5 + t / 2, x, 1, 0, fz, p.trace, 0.95));
    }
    [0.5, 1.1].forEach((reach, k) => {
      for (const sign of [-1, 1]) {
        root.add(fieldLine(sign * edge, 0.5, sign * (edge + reach), 0, -0.12 - 0.1 * k, fz, p.trace, 0.8 - 0.25 * k));
        root.add(fieldLine(sign * edge, 0.5, sign * (edge + reach), 1, 0.12 + 0.1 * k, fz, p.trace, 0.8 - 0.25 * k));
      }
    });
  } else {
    [0.25, 0.55, 0.95].forEach((bow, k) => {
      for (const sign of [-1, 1]) {
        root.add(fieldLine(sign * edge, 1 + t, sign * (edge + gap), 1 + t, bow * (0.4 + gap), fz, p.trace, 0.9 - 0.2 * k));
        root.add(fieldLine(sign * edge, 1, sign * (edge + gap), 1, -bow * (0.35 + gap), fz, p.trace, 0.7 - 0.18 * k));
      }
    });
  }

  // Travelling voltage wave above the signal conductor.
  const waveBase = traceY + t / 2 + (g.kind === 'stripline' ? 0.75 : 0.45);
  const wavePts = Array.from({ length: 161 }, (_, i) => new THREE.Vector3(0, waveBase, zFront - (length * i) / 160));
  const wave = new THREE.Line(new THREE.BufferGeometry().setFromPoints(wavePts), new THREE.LineBasicMaterial({ color: p.marker }));
  root.add(wave);

  return { root, wave, waveBase, length };
}

/** Transmission-line field view shared by the microstrip, stripline and CPW calculators. */
export default function TLineStage({ geometry, label, className = '', caption }: TLineStageProps) {
  const [runtime, setRuntime] = useState<StageRuntime | null>(null);
  const [themeTick, setThemeTick] = useState(0);
  const onReady = useCallback((rt: StageRuntime | null) => setRuntime(rt), []);

  useEffect(() => subscribeTheme(() => setThemeTick((t) => t + 1)), []);

  useEffect(() => {
    if (!runtime) return;
    const hemi = new THREE.HemisphereLight(0xe6f1ff, 0x0b1f3a, 1.5);
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(3, 6, 5);
    runtime.scene.add(hemi, key);
    return () => {
      runtime.scene.remove(hemi, key);
    };
  }, [runtime]);

  const { kind, widthMm, heightMm, thicknessMm, gapMm } = geometry;

  useEffect(() => {
    if (!runtime) return;
    if (![widthMm, heightMm, thicknessMm].every((v) => Number.isFinite(v) && v > 0)) return;
    const palette = readPalette();
    const built = buildScene({ kind, widthMm, heightMm, thicknessMm, gapMm }, palette);
    runtime.scene.add(built.root);
    runtime.invalidate();

    const positions = built.wave.geometry.getAttribute('position') as THREE.BufferAttribute;
    const k = (2 * Math.PI * 2) / built.length; // two cycles along the drawn length
    const draw = (phase: number) => {
      for (let i = 0; i < positions.count; i++) {
        const z = positions.getZ(i);
        positions.setY(i, built.waveBase + 0.28 * Math.sin(k * z + phase));
      }
      positions.needsUpdate = true;
    };
    draw(0);
    const stop = runtime.onFrame((elapsed) => draw(elapsed * 2.4));
    return () => {
      stop();
      runtime.scene.remove(built.root);
      disposeObject(built.root);
      runtime.invalidate();
    };
  }, [runtime, kind, widthMm, heightMm, thicknessMm, gapMm, themeTick]);

  return (
    <ThreeCanvas
      init={{ cameraPosition: [6.6, 5.0, 10.4], target: [0, 0.35, 0.6], fov: 30, minDistance: 4, maxDistance: 32 }}
      onReady={onReady}
      label={label}
      className={className}
    >
      <p className="pointer-events-none absolute left-4 top-3.5 kicker text-[10px]">Field view · cross-section to scale</p>
      {caption && (
        <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg-raised via-bg-raised/85 to-transparent px-4 pb-3 pt-10 text-[11.5px] leading-snug text-ink-3">
          {caption}
        </p>
      )}
    </ThreeCanvas>
  );
}

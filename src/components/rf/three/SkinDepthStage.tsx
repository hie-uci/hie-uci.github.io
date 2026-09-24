'use client';

import { useCallback, useEffect, useState } from 'react';
import * as THREE from 'three';
import ThreeCanvas from './ThreeCanvas';
import { disposeObject, type StageRuntime } from './stageRuntime';
import { rampColor, readPalette, subscribeTheme } from './palette';

interface SkinDepthStageProps {
  /** Skin depth, used for the caption; the drawing is in units of delta. */
  depthUm: number;
  frequencyGHz: number;
  label: string;
}

const DEPTHS = 5; // the block shows 5 delta of conductor
const UNIT = 0.5; // scene units per delta
const LENGTH = 3.2; // along the current
const COLS = 6;
const ROWS = 11;

/**
 * A good conductor filling the half-space below its surface, cut open along the current. The front
 * face is shaded by |J| / J0 = exp(-z / delta); arrows show J(z, t) = J0 exp(-z / delta) cos(wt - z / delta),
 * which decays and lags in phase with depth.
 */
export default function SkinDepthStage({ depthUm, frequencyGHz, label }: SkinDepthStageProps) {
  const [runtime, setRuntime] = useState<StageRuntime | null>(null);
  const [themeTick, setThemeTick] = useState(0);
  const onReady = useCallback((rt: StageRuntime | null) => setRuntime(rt), []);

  useEffect(() => subscribeTheme(() => setThemeTick((t) => t + 1)), []);

  useEffect(() => {
    if (!runtime) return;
    const hemi = new THREE.HemisphereLight(0xe6f1ff, 0x0b1f3a, 1.4);
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(2, 5, 4);
    runtime.scene.add(hemi, key);
    return () => {
      runtime.scene.remove(hemi, key);
    };
  }, [runtime]);

  useEffect(() => {
    if (!runtime) return;
    const p = readPalette();
    const depth = DEPTHS * UNIT;
    const width = 1.4;
    const root = new THREE.Group();

    // Conductor body, and the front face shaded by exp(-z / delta).
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(LENGTH, depth, width),
      new THREE.MeshStandardMaterial({ color: p.copperShade, roughness: 0.45, metalness: 0.5, transparent: true, opacity: 0.55, depthWrite: false }),
    );
    body.position.y = -depth / 2;
    const face = new THREE.PlaneGeometry(LENGTH, depth, 1, 80);
    const colors = new Float32Array(face.attributes.position.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < face.attributes.position.count; i++) {
      const z = -face.attributes.position.getY(i) + depth / 2; // depth below the surface, scene units
      rampColor(p.ramp, Math.exp(-z / UNIT), c);
      colors.set([c.r, c.g, c.b], i * 3);
    }
    face.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const faceMesh = new THREE.Mesh(face, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }));
    faceMesh.position.set(0, -depth / 2, width / 2 + 0.002);
    root.add(body, faceMesh);

    // Depth marks at delta, 2 delta and 3 delta on the front face.
    for (let k = 1; k <= 3; k++) {
      const y = -k * UNIT;
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-LENGTH / 2, y, width / 2 + 0.01), new THREE.Vector3(LENGTH / 2, y, width / 2 + 0.01)]),
        new THREE.LineDashedMaterial({ color: p.ink, dashSize: 0.06, gapSize: 0.05, transparent: true, opacity: 0.7 }),
      );
      line.computeLineDistances();
      root.add(line);
    }

    // Current arrows on the front face, along the length.
    const count = COLS * ROWS;
    const shaft = new Float32Array(count * 6);
    const shaftColor = new Float32Array(count * 6);
    const shafts = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ vertexColors: true }));
    shafts.geometry.setAttribute('position', new THREE.BufferAttribute(shaft, 3));
    shafts.geometry.setAttribute('color', new THREE.BufferAttribute(shaftColor, 3));
    const heads = new THREE.InstancedMesh(new THREE.ConeGeometry(0.028, 0.07, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }), count);
    root.add(shafts, heads);
    const xs = Array.from({ length: COLS }, (_, i) => -LENGTH / 2 + (LENGTH * (i + 0.5)) / COLS);
    const zs = Array.from({ length: ROWS }, (_, j) => ((j + 0.5) / ROWS) * depth); // depth below the surface
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const plusX = new THREE.Vector3(1, 0, 0);
    const minusX = new THREE.Vector3(-1, 0, 0);
    const front = width / 2 + 0.03;

    const draw = (t: number) => {
      const wt = 2 * Math.PI * 0.45 * t;
      let k = 0;
      for (const z of zs) {
        const j = Math.exp(-z / UNIT) * Math.cos(wt - z / UNIT);
        const half = 0.24 * j;
        const colour = j >= 0 ? p.trace : p.marker;
        for (const x of xs) {
          shaft.set([x - half, -z, front, x + half, -z, front], k * 6);
          shaftColor.set([colour.r, colour.g, colour.b, colour.r, colour.g, colour.b], k * 6);
          q.setFromUnitVectors(up, j >= 0 ? plusX : minusX);
          const scale = Math.min(1, Math.abs(j) * 3);
          m.compose(new THREE.Vector3(x + half, -z, front), q, new THREE.Vector3(scale, scale, scale));
          heads.setMatrixAt(k, m);
          heads.setColorAt(k, colour);
          k++;
        }
      }
      shafts.geometry.attributes.position.needsUpdate = true;
      shafts.geometry.attributes.color.needsUpdate = true;
      heads.instanceMatrix.needsUpdate = true;
      if (heads.instanceColor) heads.instanceColor.needsUpdate = true;
    };
    draw(0);
    runtime.scene.add(root);
    runtime.invalidate();
    const stop = runtime.onFrame((t) => draw(t));
    return () => {
      stop();
      runtime.scene.remove(root);
      disposeObject(root);
      runtime.invalidate();
    };
  }, [runtime, themeTick]);

  const um = Number.isFinite(depthUm) ? (depthUm >= 100 ? depthUm.toFixed(0) : depthUm >= 10 ? depthUm.toFixed(1) : depthUm.toFixed(2)) : '—';

  return (
    <ThreeCanvas
      init={{ cameraPosition: [1.5, 0.35, 3.9], target: [0, -1.1, 0], fov: 34, minDistance: 1.5, maxDistance: 14 }}
      onReady={onReady}
      label={label}
    >
      <p className="pointer-events-none absolute left-4 top-3.5 kicker text-[10px]">
        Current density · depth in units of <span className="normal-case">δ</span>
      </p>
      <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg-raised via-bg-raised/85 to-transparent px-4 pb-3 pt-10 text-[11.5px] leading-snug text-ink-3">
        J(z, t) = J₀ e^(−z/δ) cos(ωt − z/δ), with δ = {um} µm at {frequencyGHz} GHz: the current runs parallel to the surface, falls to 37 %, 14 % and 5 % at the dashed lines δ, 2δ and 3δ, and lags in phase with depth. Half-space model; the motion is slowed down.
      </p>
    </ThreeCanvas>
  );
}

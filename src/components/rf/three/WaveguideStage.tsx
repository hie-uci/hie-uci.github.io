'use client';

import { useCallback, useEffect, useState } from 'react';
import * as THREE from 'three';
import ThreeCanvas from './ThreeCanvas';
import { disposeObject, type StageRuntime } from './stageRuntime';
import { readPalette, subscribeTheme } from './palette';

interface WaveguideStageProps {
  aMm: number;
  bMm: number;
  /** Guide wavelength in mm when propagating, null below cutoff. */
  guideWavelengthMm: number | null;
  /** Evanescent attenuation in dB/mm below cutoff. */
  attenuationDbPerMm: number;
  label: string;
}

const COLS = 9; // arrows across the broad wall
const ROWS = 22; // arrows along the guide

/** Bottom and side walls as translucent copper, plus an outline that includes the cut-away top. */
function buildWalls(a: number, b: number, length: number, copper: THREE.Color): THREE.Group {
  const group = new THREE.Group();
  const wallMat = new THREE.MeshStandardMaterial({ color: copper, roughness: 0.45, metalness: 0.4, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false });
  const bottom = new THREE.Mesh(new THREE.PlaneGeometry(a, length), wallMat);
  bottom.rotation.x = -Math.PI / 2;
  const left = new THREE.Mesh(new THREE.PlaneGeometry(length, b), wallMat);
  left.rotation.y = Math.PI / 2;
  left.position.set(-a / 2, b / 2, 0);
  const right = left.clone();
  right.position.x = a / 2;
  const outline = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(a, b, length)),
    new THREE.LineBasicMaterial({ color: copper, transparent: true, opacity: 0.7 }),
  );
  outline.position.y = b / 2;
  group.add(bottom, left, right, outline);
  return group;
}

/**
 * TE10 electric field: vertical arrows whose length follows sin(pi x / a).
 * Above cutoff the pattern travels at the guide wavelength; below it the field
 * stands and decays along the guide.
 */
export default function WaveguideStage({ aMm, bMm, guideWavelengthMm, attenuationDbPerMm, label }: WaveguideStageProps) {
  const [runtime, setRuntime] = useState<StageRuntime | null>(null);
  const [themeTick, setThemeTick] = useState(0);
  const onReady = useCallback((rt: StageRuntime | null) => setRuntime(rt), []);

  useEffect(() => subscribeTheme(() => setThemeTick((t) => t + 1)), []);

  useEffect(() => {
    if (!runtime) return;
    const hemi = new THREE.HemisphereLight(0xe6f1ff, 0x0b1f3a, 1.4);
    const key = new THREE.DirectionalLight(0xffffff, 1.3);
    key.position.set(3, 5, 4);
    runtime.scene.add(hemi, key);
    return () => {
      runtime.scene.remove(hemi, key);
    };
  }, [runtime]);

  useEffect(() => {
    if (!runtime || !(aMm > 0 && bMm > 0)) return;
    const p = readPalette();
    // Normalize: the broad wall is 2 units wide.
    const s = 2 / aMm;
    const a = 2;
    const b = bMm * s;
    const length = 6;
    const root = new THREE.Group();

    root.add(buildWalls(a, b, length, p.copper));

    const count = COLS * ROWS;
    const shaftPositions = new Float32Array(count * 6);
    const shaftColors = new Float32Array(count * 6);
    const shafts = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ vertexColors: true }));
    shafts.geometry.setAttribute('position', new THREE.BufferAttribute(shaftPositions, 3));
    shafts.geometry.setAttribute('color', new THREE.BufferAttribute(shaftColors, 3));
    const heads = new THREE.InstancedMesh(new THREE.ConeGeometry(0.035, 0.09, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }), count);
    root.add(shafts, heads);

    const xs = Array.from({ length: COLS }, (_, i) => -a / 2 + (a * (i + 0.5)) / COLS);
    const zs = Array.from({ length: ROWS }, (_, j) => length / 2 - (length * (j + 0.5)) / ROWS);
    const beta = guideWavelengthMm ? (2 * Math.PI) / (guideWavelengthMm * s) : 0;
    const alpha = guideWavelengthMm ? 0 : (attenuationDbPerMm / (20 / Math.LN10)) / s; // Np per unit
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const down = new THREE.Vector3(0, -1, 0);
    const Y = new THREE.Vector3(0, 1, 0);

    const draw = (t: number) => {
      const omega = 2 * Math.PI * 0.55;
      let k = 0;
      for (let j = 0; j < ROWS; j++) {
        const z = zs[j];
        const travel = length / 2 - z; // distance from the input port at the front
        const f = guideWavelengthMm ? Math.cos(beta * travel - omega * t) : Math.exp(-alpha * travel) * Math.cos(omega * t);
        for (let i = 0; i < COLS; i++) {
          const e = Math.sin((Math.PI * (xs[i] + a / 2)) / a) * f;
          const half = 0.42 * b * e;
          const c = e >= 0 ? p.trace : p.marker;
          const y0 = b / 2 - half;
          const y1 = b / 2 + half;
          shaftPositions.set([xs[i], y0, z, xs[i], y1, z], k * 6);
          shaftColors.set([c.r, c.g, c.b, c.r, c.g, c.b], k * 6);
          q.setFromUnitVectors(Y, e >= 0 ? up : down);
          const scale = Math.min(1, Math.abs(e) * 1.6);
          m.compose(new THREE.Vector3(xs[i], y1, z), q, new THREE.Vector3(scale, scale, scale));
          heads.setMatrixAt(k, m);
          heads.setColorAt(k, c);
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
  }, [runtime, aMm, bMm, guideWavelengthMm, attenuationDbPerMm, themeTick]);

  return (
    <ThreeCanvas init={{ cameraPosition: [4.6, 3.4, 5.6], target: [0, 0.35, 0], fov: 34, minDistance: 2.5, maxDistance: 18 }} onReady={onReady} label={label}>
      <p className="pointer-events-none absolute left-4 top-3.5 kicker text-[10px]">TE₁₀ electric field · top wall cut away</p>
      <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg-raised via-bg-raised/85 to-transparent px-4 pb-3 pt-10 text-[11.5px] leading-snug text-ink-3">
        {guideWavelengthMm
          ? 'E = sin(πx/a) cos(ωt − βz): blue and gold are opposite field directions. The pattern repeats every guide wavelength, drawn to scale against a; the motion is slowed down.'
          : 'Below cutoff the mode is evanescent: the field oscillates in place and decays as exp(−αz) along the guide, drawn to scale; the motion is slowed down.'}
      </p>
    </ThreeCanvas>
  );
}

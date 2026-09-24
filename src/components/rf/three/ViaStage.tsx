'use client';

import { useCallback, useEffect, useState } from 'react';
import * as THREE from 'three';
import ThreeCanvas from './ThreeCanvas';
import { disposeObject, type StageRuntime } from './stageRuntime';
import { readPalette, subscribeTheme, type StagePalette } from './palette';

interface ViaStageProps {
  drillMm: number;
  padMm: number;
  antipadMm: number;
  heightMm: number;
  label: string;
}

const copperMaterial = (color: THREE.Color) => new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.55, side: THREE.DoubleSide });

/** A square plane of side w at height y with a circular hole of radius r (the antipad), thickness t. */
function planeWithHole(w: number, r: number, y: number, t: number, color: THREE.Color): THREE.Mesh {
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2, -w / 2);
  shape.lineTo(w / 2, -w / 2);
  shape.lineTo(w / 2, w / 2);
  shape.lineTo(-w / 2, w / 2);
  shape.closePath();
  if (r > 0) {
    const hole = new THREE.Path();
    hole.absarc(0, 0, r, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false, curveSegments: 48 });
  geometry.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.45, transparent: true, opacity: 0.6, depthWrite: false }));
  mesh.position.y = y;
  return mesh;
}

function ring(inner: number, outer: number, y: number, color: THREE.Color): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.RingGeometry(inner, outer, 48), copperMaterial(color));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = y;
  return mesh;
}

/** Magnetic field circles around the barrel with arrowheads showing the sense of rotation. */
function fieldRings(radii: number[], heights: number[], p: StagePalette) {
  const group = new THREE.Group();
  const materials: THREE.Material[] = [];
  for (const y of heights) {
    for (const [k, r] of radii.entries()) {
      const material = new THREE.LineBasicMaterial({ color: p.trace, transparent: true, opacity: 0.8 - 0.2 * k });
      materials.push(material);
      const pts = Array.from({ length: 65 }, (_, i) => new THREE.Vector3(r * Math.cos((2 * Math.PI * i) / 64), y, r * Math.sin((2 * Math.PI * i) / 64)));
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), material));
      for (let a = 0; a < 3; a++) {
        // Current flows down the barrel, so H circulates clockwise seen from above (right-hand rule).
        const angle = (2 * Math.PI * a) / 3 + k;
        const head = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.05, 10), new THREE.MeshBasicMaterial({ color: p.trace, transparent: true }));
        materials.push(head.material as THREE.Material);
        head.position.set(r * Math.cos(angle), y, r * Math.sin(angle));
        const tangent = new THREE.Vector3(Math.sin(angle), 0, -Math.cos(angle)).multiplyScalar(-1);
        head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent.normalize());
        group.add(head);
      }
    }
  }
  return { group, materials };
}

/** Electric field sketch: short arcs across the antipad gap from the inner pad to the plane edge. */
function gapArcs(inner: number, outer: number, y: number, p: StagePalette) {
  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({ color: p.marker, transparent: true, opacity: 0.9 });
  for (let a = 0; a < 12; a++) {
    const angle = (2 * Math.PI * a) / 12;
    const pts = Array.from({ length: 17 }, (_, i) => {
      const t = i / 16;
      const r = inner + (outer - inner) * t;
      return new THREE.Vector3(r * Math.cos(angle), y + 0.06 * (outer - inner) * 4 * t * (1 - t), r * Math.sin(angle));
    });
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), material));
  }
  return { group, material };
}

/**
 * Plated via drawn to scale against the board height: top pad, one inner plane with its antipad,
 * and a connection to the bottom ground, as in the via-to-ground inductance model.
 */
export default function ViaStage({ drillMm, padMm, antipadMm, heightMm, label }: ViaStageProps) {
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
    if (!runtime || ![drillMm, padMm, antipadMm, heightMm].every((v) => Number.isFinite(v) && v > 0)) return;
    if (!(padMm > drillMm && antipadMm > padMm)) return;
    const p = readPalette();
    // The board height is one unit; everything else keeps its ratio to it.
    const s = 1 / heightMm;
    const r = (drillMm / 2) * s;
    const padR = (padMm / 2) * s;
    const antiR = (antipadMm / 2) * s;
    const width = Math.max(1.8, antiR * 5);
    const copperT = 0.018;
    const root = new THREE.Group();

    const substrate = new THREE.Mesh(
      new THREE.BoxGeometry(width, 1, width),
      new THREE.MeshStandardMaterial({ color: p.substrate, transparent: true, opacity: p.substrateOpacity * 0.55, roughness: 0.6, depthWrite: false }),
    );
    substrate.position.y = 0.5;
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1 + copperT, 48, 1, true), copperMaterial(p.copper));
    barrel.position.y = 0.5;
    root.add(
      substrate,
      barrel,
      ring(r, padR, 1 + copperT / 2, p.copper), // top pad
      planeWithHole(width, antiR, 0.5 - copperT / 2, copperT, p.copperShade), // inner plane with its antipad
      ring(r, padR, 0.5, p.copper), // inner pad inside the antipad
      planeWithHole(width, 0, -copperT, copperT, p.copperShade), // bottom ground, joined to the via
    );

    const rings = fieldRings([r * 1.8, r * 3, r * 4.6].filter((v) => v < width / 2), [0.2, 0.78], p);
    const arcs = gapArcs(padR, antiR, 0.5, p);
    root.add(rings.group, arcs.group);
    runtime.scene.add(root);
    runtime.invalidate();

    // The fields oscillate at the signal frequency; the swing is slowed down.
    const stop = runtime.onFrame((t) => {
      const swing = Math.abs(Math.cos(2 * Math.PI * 0.6 * t));
      rings.materials.forEach((m) => {
        m.opacity = 0.2 + 0.7 * swing;
      });
      arcs.material.opacity = 0.2 + 0.75 * Math.abs(Math.sin(2 * Math.PI * 0.6 * t));
    });
    return () => {
      stop();
      runtime.scene.remove(root);
      disposeObject(root);
      runtime.invalidate();
    };
  }, [runtime, drillMm, padMm, antipadMm, heightMm, themeTick]);

  return (
    <ThreeCanvas
      init={{ cameraPosition: [1.8, 1.05, 2.3], target: [0, 0.42, 0], fov: 34, minDistance: 1, maxDistance: 12 }}
      onReady={onReady}
      label={label}
    >
      <p className="pointer-events-none absolute left-4 top-3.5 kicker text-[10px]">Via to scale · fields sketched</p>
      <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg-raised via-bg-raised/85 to-transparent px-4 pb-3 pt-10 text-[11.5px] leading-snug text-ink-3">
        Barrel, pads and antipad to scale against the board height. The stack is illustrative: a via from the top pad to the bottom ground, through one inner plane and its antipad. The magnetic field circles the barrel and the electric field crosses the antipad gap; both are sketches, and the motion is slowed down.
      </p>
    </ThreeCanvas>
  );
}

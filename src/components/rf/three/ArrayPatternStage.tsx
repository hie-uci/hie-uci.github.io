'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import ThreeCanvas from './ThreeCanvas';
import type { StageRuntime } from './stageRuntime';
import { disposeObject } from './stageRuntime';
import { rampColor, readPalette, subscribeTheme, type StagePalette } from './palette';
import type { ArrayConfig, PatternGrid } from '@/lib/arrayPattern';

const FLOOR_DB = -40;
const DEG = Math.PI / 180;

/** Physics frame is z-up; three.js is y-up. */
function toThree(x: number, y: number, z: number) {
  return new THREE.Vector3(x, z, -y);
}

function buildGroundGrid(palette: StagePalette): THREE.LineSegments {
  const pts: number[] = [];
  for (const r of [0.25, 0.5, 0.75, 1]) {
    const n = 96;
    for (let i = 0; i < n; i++) {
      const a0 = (2 * Math.PI * i) / n;
      const a1 = (2 * Math.PI * (i + 1)) / n;
      pts.push(r * Math.cos(a0), 0, r * Math.sin(a0), r * Math.cos(a1), 0, r * Math.sin(a1));
    }
  }
  for (let d = 0; d < 360; d += 30) {
    pts.push(0, 0, 0, Math.cos(d * DEG), 0, Math.sin(d * DEG));
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  const material = new THREE.LineBasicMaterial({ color: palette.line, transparent: true, opacity: palette.lineOpacity });
  return new THREE.LineSegments(geometry, material);
}

/** Pattern surface: radius and colour both follow normalized dB. */
function buildPattern(grid: PatternGrid, palette: StagePalette): THREE.Group {
  const { nTheta, nPhi, theta, phi, power } = grid;
  const positions = new Float32Array(nTheta * nPhi * 3);
  const colors = new Float32Array(nTheta * nPhi * 3);
  const c = new THREE.Color();
  for (let i = 0; i < nTheta; i++) {
    for (let j = 0; j < nPhi; j++) {
      const k = i * nPhi + j;
      const db = Math.max(FLOOR_DB, 10 * Math.log10(Math.max(power[k], 1e-12)));
      const r = (db - FLOOR_DB) / -FLOOR_DB;
      const v = toThree(r * Math.sin(theta[i]) * Math.cos(phi[j]), r * Math.sin(theta[i]) * Math.sin(phi[j]), r * Math.cos(theta[i]));
      positions.set([v.x, v.y, v.z], k * 3);
      rampColor(palette.ramp, r, c);
      colors.set([c.r, c.g, c.b], k * 3);
    }
  }
  const index: number[] = [];
  for (let i = 0; i < nTheta - 1; i++) {
    for (let j = 0; j < nPhi - 1; j++) {
      const a = i * nPhi + j;
      const b = a + nPhi;
      index.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  const surface = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, metalness: 0, side: THREE.DoubleSide, transparent: true, opacity: 0.93 }),
  );

  // Sparse latitude/longitude lines give the lobes their shape at a glance.
  const wire: number[] = [];
  const push = (k: number) => wire.push(positions[k * 3], positions[k * 3 + 1], positions[k * 3 + 2]);
  for (let i = 0; i < nTheta; i += 6) {
    for (let j = 0; j < nPhi - 1; j++) {
      push(i * nPhi + j);
      push(i * nPhi + j + 1);
    }
  }
  for (let j = 0; j < nPhi; j += 10) {
    for (let i = 0; i < nTheta - 1; i++) {
      push(i * nPhi + j);
      push((i + 1) * nPhi + j);
    }
  }
  const wireGeometry = new THREE.BufferGeometry();
  wireGeometry.setAttribute('position', new THREE.Float32BufferAttribute(wire, 3));
  const lines = new THREE.LineSegments(wireGeometry, new THREE.LineBasicMaterial({ color: palette.ink, transparent: true, opacity: palette.dark ? 0.12 : 0.18 }));

  const group = new THREE.Group();
  group.add(surface, lines);
  return group;
}

interface Elements {
  mesh: THREE.InstancedMesh;
  phasesRad: number[];
}

function buildElements(cfg: ArrayConfig, phasesDeg: number[][], palette: StagePalette): Elements {
  const count = cfg.nx * cfg.ny;
  const pitch = Math.min(0.07, 0.62 / Math.max(cfg.nx, cfg.ny));
  const size = pitch * 0.62;
  const geometry = new THREE.PlaneGeometry(size, size);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  const m = new THREE.Matrix4();
  const phasesRad: number[] = [];
  let k = 0;
  for (let n = 0; n < cfg.ny; n++) {
    for (let i = 0; i < cfg.nx; i++) {
      const p = toThree((i - (cfg.nx - 1) / 2) * pitch, (n - (cfg.ny - 1) / 2) * pitch, 0.002);
      m.makeTranslation(p.x, p.y, p.z);
      mesh.setMatrixAt(k, m);
      mesh.setColorAt(k, palette.copper);
      phasesRad.push(phasesDeg[n][i] * DEG);
      k++;
    }
  }
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return { mesh, phasesRad };
}

function beamDirection(cfg: ArrayConfig): THREE.Vector3 {
  const t = cfg.theta0Deg * DEG;
  const p = cfg.phi0Deg * DEG;
  return toThree(Math.sin(t) * Math.cos(p), Math.sin(t) * Math.sin(p), Math.cos(t)).normalize();
}

function buildBeam(dir: THREE.Vector3, palette: StagePalette): THREE.Group {
  const group = new THREE.Group();
  const lineGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), dir.clone().multiplyScalar(1.22)]);
  const line = new THREE.Line(lineGeometry, new THREE.LineDashedMaterial({ color: palette.marker, dashSize: 0.035, gapSize: 0.025 }));
  line.computeLineDistances();
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.018, 16, 12), new THREE.MeshBasicMaterial({ color: palette.marker }));
  tip.position.copy(dir.clone().multiplyScalar(1.22));
  group.add(line, tip);
  return group;
}

function buildWavefronts(dir: THREE.Vector3, palette: StagePalette): THREE.Mesh[] {
  return [0, 1, 2].map(() => {
    const mesh = new THREE.Mesh(
      new THREE.RingGeometry(0.02, 0.24, 48),
      new THREE.MeshBasicMaterial({ color: palette.trace, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }),
    );
    mesh.lookAt(dir);
    return mesh;
  });
}

interface ArrayPatternStageProps {
  cfg: ArrayConfig;
  grid: PatternGrid;
  phasesDeg: number[][];
  label: string;
  /** Overlay shown under the stage title, e.g. the live beam direction. */
  badge?: React.ReactNode;
  className?: string;
}

/** 3D view of the Phased Array Beam Lab. Rebuilds geometry when the configuration changes. */
export default function ArrayPatternStage({ cfg, grid, phasesDeg, label, badge, className = '' }: ArrayPatternStageProps) {
  const [runtime, setRuntime] = useState<StageRuntime | null>(null);
  const [themeTick, setThemeTick] = useState(0);
  const rootRef = useRef<THREE.Group | null>(null);

  const onReady = useCallback((rt: StageRuntime | null) => setRuntime(rt), []);

  useEffect(() => subscribeTheme(() => setThemeTick((t) => t + 1)), []);

  // Lights live for the lifetime of the runtime.
  useEffect(() => {
    if (!runtime) return;
    const hemi = new THREE.HemisphereLight(0xdcecff, 0x0b1f3a, 1.6);
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(2, 3, 1.5);
    runtime.scene.add(hemi, key);
    return () => {
      runtime.scene.remove(hemi, key);
    };
  }, [runtime]);

  useEffect(() => {
    if (!runtime) return;
    const palette = readPalette();
    const root = new THREE.Group();
    const dir = beamDirection(cfg);
    const elements = buildElements(cfg, phasesDeg, palette);
    const waves = buildWavefronts(dir, palette);
    root.add(buildGroundGrid(palette), buildPattern(grid, palette), elements.mesh, buildBeam(dir, palette), ...waves);
    runtime.scene.add(root);
    rootRef.current = root;
    runtime.invalidate();

    const color = new THREE.Color();
    const stop = runtime.onFrame((t) => {
      // Each element brightens at its own phase: the ripple crosses the aperture toward the beam.
      const omega = 2 * Math.PI * 0.9;
      elements.phasesRad.forEach((ph, k) => {
        const s = 0.5 + 0.5 * Math.cos(omega * t + ph);
        color.copy(palette.copperShade).lerp(palette.marker, s);
        elements.mesh.setColorAt(k, color);
      });
      if (elements.mesh.instanceColor) elements.mesh.instanceColor.needsUpdate = true;
      waves.forEach((w, i) => {
        const f = (t * 0.28 + i / waves.length) % 1;
        w.position.copy(dir).multiplyScalar(0.3 + f * 0.95);
        (w.material as THREE.MeshBasicMaterial).opacity = 0.22 * Math.sin(Math.PI * f);
      });
    });

    return () => {
      stop();
      runtime.scene.remove(root);
      disposeObject(root);
      rootRef.current = null;
      runtime.invalidate();
    };
  }, [runtime, cfg, grid, phasesDeg, themeTick]);

  return (
    <ThreeCanvas
      init={{ cameraPosition: [2.1, 1.55, 2.35], target: [0, 0.3, 0], fov: 34, minDistance: 1.2, maxDistance: 7 }}
      onReady={onReady}
      label={label}
      className={className}
    >
      <div className="pointer-events-none absolute left-4 top-3.5 flex flex-col items-start gap-2">
        <span className="kicker text-[10px]">
          3D pattern · normalized <span className="normal-case">dB</span>
        </span>
        {badge}
      </div>
      <div className="pointer-events-none absolute right-4 top-3.5 flex h-32 gap-2" aria-hidden="true">
        <div className="flex flex-col justify-between text-right font-mono text-[10px] text-ink-3">
          <span>0</span>
          <span>−10</span>
          <span>−20</span>
          <span>−30</span>
          <span>−40</span>
        </div>
        <div className="w-2 rounded-sm bg-[linear-gradient(180deg,#e0b400,#0064a4_36%,#3d8fc6_70%,#c7dcee)] dark:bg-[linear-gradient(180deg,#ffd200,#38bdf8_36%,#0064a4_70%,#0b1f3a)]" />
      </div>
      <div className="pointer-events-none absolute bottom-3.5 left-4 kicker hidden text-[10px] sm:block">Drag to orbit · scroll to zoom · double-click to reset</div>
    </ThreeCanvas>
  );
}

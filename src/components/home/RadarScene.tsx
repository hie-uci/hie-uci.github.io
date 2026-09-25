'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import ThreeCanvas from '@/components/rf/three/ThreeCanvas';
import { disposeObject, type StageRuntime } from '@/components/rf/three/stageRuntime';
import { imgSrc } from '@/lib/basePath';
import { C0, beatFrequency, chirpDerived, rangeProfileDb } from '@/lib/fmcw';

interface RadarSceneProps {
  /** Animate while true; hold the last frame otherwise. */
  playing: boolean;
}

/** Metres per scene unit: the readouts measure the drawn geometry. */
const M_PER_UNIT = 0.3;
/** 14 GHz is the 49–63 GHz sweep of the lab's FMCW radar chip; the 100 µs chirp time is an example. */
const CHIRP = chirpDerived({ bandwidthHz: 14e9, chirpS: 100e-6, ifBandwidthHz: 10e6 });
/** On-screen wave speed, scene units per second. */
const WAVE_SPEED = 1.5;
const SLOWDOWN = C0 / (WAVE_SPEED * M_PER_UNIT);
/** One on-screen chirp, and its wavefront rate at the start and end: the fronts crowd as the frequency rises. */
const CHIRP_VIS_S = 2.4;
const FRONTS_START = 1.6;
const FRONTS_STOP = 4.4;
const ARC_LEN = 0.46;
const ARC_SEG = 10;
const MAX_ARCS = 140;
const PROFILE_MAX_M = 2;
const PROFILE_N = 200;
const PROFILE_GRID = Array.from({ length: PROFILE_N }, (_, i) => (i / (PROFILE_N - 1)) * PROFILE_MAX_M);
const DIE_SRC = '/images/chips/individual/sheet1-04-49-63-ghz-fmcw-radar.png';
const TX_COLOR = new THREE.Color('#ffc44d');
const RX_COLOR = new THREE.Color('#4cc3ff');
const UP = new THREE.Vector3(0, 1, 0);
/** The shot is framed for a 30° vertical view on a 2.5 : 1 card; narrower cards widen the vertical view instead of cropping the targets. */
const FRAMED_FOV = 30;
const FRAMED_ASPECT = 2.5;

const BOARD = { w: 2.9, h: 1.75, t: 0.06 };
const RX_COLS = [-1.05, -0.72, -0.39, -0.06];
const TX_COLS = [0.55, 0.88];
const PATCH_ROWS = [1.48, 1.28, 1.08];
const CHIP = { x: 0.05, y: 0.5, size: 0.52 };

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const smooth = (x: number) => {
  const u = Math.min(1, Math.max(0, x));
  return u * u * (3 - 2 * u);
};

function canvasTexture(size: number, draw: (ctx: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Radar scene: 2D canvas unavailable for a texture.');
  draw(ctx);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Optical breadboard: dark anodised plate with a tapped-hole grid. */
function buildTable(textures: THREE.Texture[]): THREE.Mesh {
  const map = canvasTexture(128, (ctx) => {
    ctx.fillStyle = '#1c1f25';
    ctx.fillRect(0, 0, 128, 128);
    ctx.beginPath();
    ctx.arc(64, 64, 13, 0, Math.PI * 2);
    ctx.fillStyle = '#040506';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#3a3f49';
    ctx.stroke();
  });
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(52, 33);
  map.anisotropy = 8;
  textures.push(map);
  const table = new THREE.Mesh(new THREE.PlaneGeometry(16, 10), new THREE.MeshStandardMaterial({ map, roughness: 0.72, metalness: 0.35 }));
  table.rotation.x = -Math.PI / 2;
  table.position.set(0.8, 0, -0.8);
  return table;
}

interface Board {
  root: THREE.Group;
  face: THREE.Group;
  txLocal: THREE.Vector3;
  rxLocal: THREE.Vector3;
  traces: { points: THREE.Vector3[]; tx: boolean }[];
}

/** Radar PCB: 4 receive and 2 transmit series-fed patch columns wired to the lab's radar die. */
function buildBoard(die: THREE.Texture): Board {
  const { w, h, t } = BOARD;
  const z = t / 2;
  const root = new THREE.Group();
  const face = new THREE.Group();
  face.rotation.x = -0.2; // leans back about its bottom edge
  root.add(face);
  const pcb = new THREE.Mesh(new THREE.BoxGeometry(w, h, t), new THREE.MeshStandardMaterial({ color: '#13233a', roughness: 0.5, metalness: 0.15 }));
  pcb.position.y = h / 2;
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(2.62, 0.68), new THREE.MeshStandardMaterial({ color: '#b3b8bf', roughness: 0.6, metalness: 0.2 }));
  panel.position.set(0, 1.28, z + 0.001);
  face.add(pcb, panel);

  const copper = new THREE.MeshStandardMaterial({ color: '#d99b5f', roughness: 0.28, metalness: 0.9 });
  const patch = new THREE.PlaneGeometry(0.15, 0.15);
  const feed = new THREE.PlaneGeometry(0.02, 0.42);
  for (const x of [...RX_COLS, ...TX_COLS]) {
    const line = new THREE.Mesh(feed, copper);
    line.position.set(x, 1.28, z + 0.002);
    face.add(line);
    for (const y of PATCH_ROWS) {
      const m = new THREE.Mesh(patch, copper);
      m.position.set(x, y, z + 0.003);
      face.add(m);
    }
  }

  const pkg = new THREE.Mesh(new THREE.BoxGeometry(CHIP.size, CHIP.size, 0.05), new THREE.MeshStandardMaterial({ color: '#0c0e12', roughness: 0.6, metalness: 0.2 }));
  pkg.position.set(CHIP.x, CHIP.y, z + 0.025);
  const image = die.image as { width: number; height: number };
  const dieMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.44, (0.44 * image.height) / image.width), new THREE.MeshBasicMaterial({ map: die }));
  dieMesh.position.set(CHIP.x, CHIP.y, z + 0.0515);
  face.add(pkg, dieMesh);
  face.add(buildSmallParts(z));

  const columns = [...RX_COLS.map((x) => ({ x, tx: false })), ...TX_COLS.map((x) => ({ x, tx: true }))];
  const traces = columns.map(({ x, tx }, k) => {
    const x0 = CHIP.x - 0.2 + k * 0.08;
    const top = CHIP.y + CHIP.size / 2;
    return { tx, points: [new THREE.Vector3(x0, top, z + 0.004), new THREE.Vector3(x0, top + 0.08, z + 0.004), new THREE.Vector3(x, 0.96, z + 0.004), new THREE.Vector3(x, 1.005, z + 0.004)] };
  });
  for (const trace of traces) {
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(trace.points),
      new THREE.LineBasicMaterial({ color: trace.tx ? TX_COLOR : RX_COLOR, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending }),
    );
    face.add(line);
  }
  return { root, face, traces, txLocal: new THREE.Vector3(mean(TX_COLS), 1.28, z), rxLocal: new THREE.Vector3(mean(RX_COLS), 1.28, z) };
}

/** Package pins, SMD parts and mounting holes, placed deterministically. */
function buildSmallParts(z: number): THREE.Group {
  const group = new THREE.Group();
  const pin = new THREE.BoxGeometry(0.035, 0.018, 0.012);
  const gold = new THREE.MeshStandardMaterial({ color: '#c8a45a', roughness: 0.3, metalness: 0.9 });
  const pins = new THREE.InstancedMesh(pin, gold, 28);
  const m = new THREE.Matrix4();
  const half = CHIP.size / 2 + 0.012;
  for (let i = 0; i < 28; i++) {
    const side = Math.floor(i / 7);
    const u = -0.18 + (i % 7) * 0.06;
    const [x, y, rot] = [[u, half, 0], [u, -half, 0], [half, u, Math.PI / 2], [-half, u, Math.PI / 2]][side];
    m.makeRotationZ(rot).setPosition(CHIP.x + x, CHIP.y + y, z + 0.008);
    pins.setMatrixAt(i, m);
  }
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const parts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.07, 0.035, 0.025), new THREE.MeshStandardMaterial({ color: '#2a2f38', roughness: 0.5, metalness: 0.3 }), 26);
  for (let i = 0; i < 26; i++) {
    let x = 0;
    let y = 0;
    do {
      x = -1.3 + rand() * 2.6;
      y = 0.14 + rand() * 0.72;
    } while (Math.abs(x - CHIP.x) < 0.45 && Math.abs(y - CHIP.y) < 0.42);
    m.makeRotationZ(rand() < 0.5 ? 0 : Math.PI / 2).setPosition(x, y, z + 0.012);
    parts.setMatrixAt(i, m);
  }
  const hole = new THREE.CircleGeometry(0.05, 20);
  const dark = new THREE.MeshBasicMaterial({ color: '#05070a' });
  for (const [x, y] of [[-1.33, 0.12], [1.33, 0.12], [-1.33, 1.63], [1.33, 1.63]]) {
    const c = new THREE.Mesh(hole, dark);
    c.position.set(x, y, z + 0.002);
    group.add(c);
  }
  group.add(pins, parts);
  return group;
}

/** Trihedral corner reflector on a post; `aperture` is the centre of its mouth, in reflector space. */
function buildCornerReflector(mirror: THREE.Material, steel: THREE.Material): { root: THREE.Group; reflector: THREE.Group; aperture: THREE.Vector3 } {
  const a = 0.52;
  const geometry = new THREE.BufferGeometry();
  const o = [0, 0, 0];
  const [x, y, zz] = [[a, 0, 0], [0, a, 0], [0, 0, a]];
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([...o, ...x, ...y, ...o, ...y, ...zz, ...o, ...zz, ...x], 3));
  geometry.computeVertexNormals();
  const reflector = new THREE.Group();
  reflector.add(
    new THREE.Mesh(geometry, mirror),
    new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: '#e8edf3', transparent: true, opacity: 0.55 })),
  );
  reflector.position.y = 0.74;
  const root = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.72, 16), steel);
  post.position.y = 0.36;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.05, 32), new THREE.MeshStandardMaterial({ color: '#15171c', roughness: 0.5, metalness: 0.5 }));
  base.position.y = 0.025;
  root.add(reflector, post, base);
  return { root, reflector, aperture: new THREE.Vector3(a / 3, a / 3, a / 3) };
}

/** Linear stage whose carriage slides a sphere along the line of sight (local +x points at the radar). A sphere echoes the same from any angle. */
function buildSphereStage(steel: THREE.Material): { root: THREE.Group; carriage: THREE.Group; sphereLocal: THREE.Vector3 } {
  const dark = new THREE.MeshStandardMaterial({ color: '#191c22', roughness: 0.45, metalness: 0.5 });
  const root = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.1, 0.44), dark);
  base.position.y = 0.05;
  const rail = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.012, 0.06), new THREE.MeshStandardMaterial({ color: '#3a404b', roughness: 0.3, metalness: 0.8 }));
  rail.position.y = 0.106;
  const carriage = new THREE.Group();
  const block = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.07, 0.34), dark);
  block.position.y = 0.145;
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.5, 16), steel);
  post.position.y = 0.43;
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.2, 48, 32), steel);
  sphere.position.y = 0.86;
  carriage.add(block, post, sphere);
  root.add(base, rail, carriage);
  return { root, carriage, sphereLocal: new THREE.Vector3(0, 0.86, 0) };
}

interface Path {
  from: THREE.Vector3;
  to: THREE.Vector3;
  dir: THREE.Vector3;
  side: THREE.Vector3;
  length: number;
}

function makePath(): Path {
  return { from: new THREE.Vector3(), to: new THREE.Vector3(), dir: new THREE.Vector3(), side: new THREE.Vector3(), length: 0 };
}

function setPath(path: Path, from: THREE.Vector3, to: THREE.Vector3) {
  path.from.copy(from);
  path.to.copy(to);
  path.dir.subVectors(to, from);
  path.length = path.dir.length();
  path.dir.divideScalar(path.length);
  path.side.copy(UP).addScaledVector(path.dir, -path.dir.dot(UP)).normalize();
}

interface Arc {
  path: number;
  s: number;
  color: THREE.Color;
}

/** Spherical wavefronts: each front is an arc of radius s centred on its source, drawn as a ribbon. */
class WaveField {
  readonly ribbons: THREE.Mesh;
  readonly beads: THREE.Points;
  readonly rays: THREE.LineSegments;
  private readonly arcs: Arc[] = [];

  constructor(dot: THREE.Texture) {
    const verts = (ARC_SEG + 1) * 2;
    const index: number[] = [];
    for (let a = 0; a < MAX_ARCS; a++) {
      for (let j = 0; j < ARC_SEG; j++) {
        const b = a * verts + j * 2;
        index.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
      }
    }
    const additive = { vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false } as const;
    this.ribbons = new THREE.Mesh(dynamicGeometry(MAX_ARCS * verts).setIndex(index), new THREE.MeshBasicMaterial({ ...additive, side: THREE.DoubleSide }));
    this.beads = new THREE.Points(dynamicGeometry(MAX_ARCS), new THREE.PointsMaterial({ ...additive, map: dot, size: 0.1, sizeAttenuation: true }));
    this.rays = new THREE.LineSegments(dynamicGeometry(8), new THREE.LineBasicMaterial({ ...additive, opacity: 0.45 }));
    for (const o of [this.ribbons, this.beads, this.rays]) o.frustumCulled = false;
  }

  spawn(path: number, color: THREE.Color) {
    if (this.arcs.length < MAX_ARCS) this.arcs.push({ path, s: 0, color });
  }

  /** Move every front by ds; return those that reached the end of their path. */
  advance(ds: number, paths: Path[]): Arc[] {
    const arrived: Arc[] = [];
    for (let i = this.arcs.length - 1; i >= 0; i--) {
      const arc = this.arcs[i];
      arc.s += ds;
      if (arc.s >= paths[arc.path].length) arrived.push(...this.arcs.splice(i, 1));
    }
    return arrived;
  }

  write(paths: Path[]) {
    const pos = this.ribbons.geometry.attributes.position.array as Float32Array;
    const col = this.ribbons.geometry.attributes.color.array as Float32Array;
    const bPos = this.beads.geometry.attributes.position.array as Float32Array;
    const bCol = this.beads.geometry.attributes.color.array as Float32Array;
    const p = new THREE.Vector3();
    this.arcs.forEach((arc, k) => {
      const path = paths[arc.path];
      const radius = Math.max(0.05, arc.s);
      const half = Math.min(0.8, ARC_LEN / (2 * radius));
      const fade = smooth(arc.s / 0.3) * smooth((path.length - arc.s) / 0.4);
      for (let j = 0; j <= ARC_SEG; j++) {
        const phi = -half + (2 * half * j) / ARC_SEG;
        p.copy(path.from).addScaledVector(path.dir, radius * Math.cos(phi)).addScaledVector(path.side, radius * Math.sin(phi));
        const glow = fade * (0.3 + 0.7 * Math.cos((phi / half) * (Math.PI / 2)));
        const v = (k * (ARC_SEG + 1) + j) * 6;
        pos.set([p.x - 0.016 * path.dir.x, p.y - 0.016 * path.dir.y, p.z - 0.016 * path.dir.z, p.x + 0.016 * path.dir.x, p.y + 0.016 * path.dir.y, p.z + 0.016 * path.dir.z], v);
        col.set([arc.color.r * glow, arc.color.g * glow, arc.color.b * glow, arc.color.r * glow, arc.color.g * glow, arc.color.b * glow], v);
      }
      p.copy(path.from).addScaledVector(path.dir, radius);
      bPos.set([p.x, p.y, p.z], k * 3);
      bCol.set([arc.color.r * fade, arc.color.g * fade, arc.color.b * fade], k * 3);
    });
    const rPos = this.rays.geometry.attributes.position.array as Float32Array;
    const rCol = this.rays.geometry.attributes.color.array as Float32Array;
    paths.forEach((path, i) => {
      const c = i % 2 === 0 ? TX_COLOR : RX_COLOR;
      rPos.set([path.from.x, path.from.y, path.from.z, path.to.x, path.to.y, path.to.z], i * 6);
      rCol.set([c.r, c.g, c.b, c.r, c.g, c.b], i * 6);
    });
    this.ribbons.geometry.setDrawRange(0, this.arcs.length * ARC_SEG * 6);
    this.beads.geometry.setDrawRange(0, this.arcs.length);
    for (const o of [this.ribbons, this.beads, this.rays]) {
      o.geometry.attributes.position.needsUpdate = true;
      o.geometry.attributes.color.needsUpdate = true;
    }
  }
}

function dynamicGeometry(vertices: number): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices * 3), 3).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(vertices * 3), 3).setUsage(THREE.DynamicDrawUsage));
  return g;
}

/** Expanding rings on the table where a front hits a target. */
class RingPool {
  readonly group = new THREE.Group();
  private readonly rings: { mesh: THREE.Mesh; age: number }[] = [];
  private next = 0;

  constructor(count: number) {
    const geometry = new THREE.RingGeometry(0.94, 1, 64);
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      mesh.rotation.x = -Math.PI / 2;
      mesh.visible = false;
      this.group.add(mesh);
      this.rings.push({ mesh, age: 0 });
    }
  }

  spawn(at: THREE.Vector3, color: THREE.Color) {
    const ring = this.rings[this.next];
    this.next = (this.next + 1) % this.rings.length;
    ring.age = 0;
    ring.mesh.position.set(at.x, 0.012, at.z);
    (ring.mesh.material as THREE.MeshBasicMaterial).color.copy(color);
    ring.mesh.visible = true;
  }

  update(dt: number) {
    for (const ring of this.rings) {
      if (!ring.mesh.visible) continue;
      ring.age += dt;
      const u = ring.age / 1.6;
      if (u >= 1) {
        ring.mesh.visible = false;
        continue;
      }
      const s = 0.22 + 0.9 * u;
      ring.mesh.scale.set(s, s, s);
      (ring.mesh.material as THREE.MeshBasicMaterial).opacity = 0.5 * Math.pow(1 - u, 1.5);
    }
  }
}

interface Overlay {
  a: RefObject<HTMLSpanElement | null>;
  b: RefObject<HTMLSpanElement | null>;
  profile: RefObject<SVGPathElement | null>;
  tx: RefObject<HTMLSpanElement | null>;
  rx: RefObject<HTMLSpanElement | null>;
}

interface RadarSim {
  step: (dt: number) => void;
}

interface SimParts {
  runtime: StageRuntime;
  board: Board;
  reflector: THREE.Group;
  aperture: THREE.Vector3;
  carriage: THREE.Group;
  sphereLocal: THREE.Vector3;
  waves: WaveField;
  rings: RingPool;
  overlay: Overlay;
}

function readout(rangeM: number) {
  return `R ${rangeM.toFixed(2)} m · f_b ${(beatFrequency(rangeM, CHIRP.slopeHzPerS) / 1e6).toFixed(2)} MHz`;
}

/** The chirp emitter, the moving sphere and the readouts; ranges come from the scene's own geometry. */
function createRadarSim(parts: SimParts): RadarSim {
  const { runtime, board, waves, rings, overlay } = parts;
  const tx = board.face.localToWorld(board.txLocal.clone());
  const rx = board.face.localToWorld(board.rxLocal.clone());
  const targetA = parts.reflector.localToWorld(parts.aperture.clone());
  const targetB = new THREE.Vector3();
  const paths = [makePath(), makePath(), makePath(), makePath()];
  const canvas = runtime.renderer.domElement;
  const v = new THREE.Vector3();
  let clock = 0;
  let aspect = 0;
  let fronts = 0;
  let hits = 0;
  let nextReadout = 0;

  const place = (el: HTMLElement | null, at: THREE.Vector3) => {
    if (!el) return;
    v.copy(at).project(runtime.camera);
    el.style.transform = `translate(${((v.x + 1) / 2) * canvas.clientWidth}px, ${((1 - v.y) / 2) * canvas.clientHeight}px) translate(-50%, -190%)`;
  };

  return {
    step(dt: number) {
      clock += dt;
      if (runtime.camera.aspect !== aspect) {
        aspect = runtime.camera.aspect;
        const half = Math.atan((Math.tan(THREE.MathUtils.degToRad(FRAMED_FOV / 2)) * FRAMED_ASPECT) / Math.min(aspect, FRAMED_ASPECT));
        runtime.camera.fov = THREE.MathUtils.radToDeg(2 * half);
        runtime.camera.updateProjectionMatrix();
      }
      parts.carriage.position.x = 0.28 * Math.sin((2 * Math.PI * clock) / 7);
      parts.carriage.updateMatrixWorld(true);
      parts.carriage.localToWorld(targetB.copy(parts.sphereLocal));
      setPath(paths[0], tx, targetA);
      setPath(paths[1], targetA, rx);
      setPath(paths[2], tx, targetB);
      setPath(paths[3], targetB, rx);

      const tc = clock % CHIRP_VIS_S;
      fronts += (FRONTS_START + ((FRONTS_STOP - FRONTS_START) * tc) / CHIRP_VIS_S) * dt;
      for (; fronts >= 1; fronts -= 1) {
        waves.spawn(0, TX_COLOR);
        waves.spawn(2, TX_COLOR);
      }
      for (const arc of waves.advance(WAVE_SPEED * dt, paths)) {
        if (arc.path % 2 === 1) continue;
        waves.spawn(arc.path + 1, RX_COLOR);
        if (hits++ % 3 === 0) rings.spawn(arc.path === 0 ? targetA : targetB, hits % 2 ? RX_COLOR : TX_COLOR);
      }
      rings.update(dt);
      waves.write(paths);
      place(overlay.tx.current, tx);
      place(overlay.rx.current, rx);

      if (clock < nextReadout) return;
      nextReadout = clock + 0.125;
      const ra = ((paths[0].length + paths[1].length) / 2) * M_PER_UNIT;
      const rb = ((paths[2].length + paths[3].length) / 2) * M_PER_UNIT;
      if (overlay.a.current) overlay.a.current.textContent = readout(ra);
      if (overlay.b.current) overlay.b.current.textContent = readout(rb);
      const db = rangeProfileDb(PROFILE_GRID, [ra, rb], CHIRP.rangeResolutionM, 'hann', -40);
      overlay.profile.current?.setAttribute('d', db.map((d, i) => `${i ? 'L' : 'M'}${((i / (PROFILE_N - 1)) * 200).toFixed(1)} ${(4 + (-d / 40) * 30).toFixed(1)}`).join(''));
    },
  };
}

/** Everything the scene draws, placed in the world; returns the parts the simulation moves. */
function assemble(runtime: StageRuntime, die: THREE.Texture, overlay: Overlay, textures: THREE.Texture[]): { root: THREE.Group; sim: RadarSim } {
  const root = new THREE.Group();
  const mirror = new THREE.MeshStandardMaterial({ color: '#cfd5dd', roughness: 0.2, metalness: 1, side: THREE.DoubleSide, flatShading: true });
  const steel = new THREE.MeshStandardMaterial({ color: '#dfe4ea', roughness: 0.22, metalness: 1 });
  const board = buildBoard(die);
  board.root.position.set(-2.45, 0, 0.35);
  board.root.rotation.y = 1.15;
  const corner = buildCornerReflector(mirror, steel);
  corner.root.position.set(2.3, 0, -1.5);
  const stage = buildSphereStage(steel);
  stage.root.position.set(1.95, 0, 0.95);
  const rings = new RingPool(8);
  const dot = canvasTexture(64, (ctx) => {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.45)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
  });
  textures.push(dot);
  const waves = new WaveField(dot);
  root.add(buildTable(textures), board.root, corner.root, stage.root, rings.group, waves.ribbons, waves.beads, waves.rays);
  runtime.scene.add(root);
  root.updateMatrixWorld(true);

  // Aim the reflector's boresight and the stage's travel at the radar.
  const radar = board.face.localToWorld(board.txLocal.clone()).add(board.face.localToWorld(board.rxLocal.clone())).multiplyScalar(0.5);
  const reflectorAt = corner.reflector.getWorldPosition(new THREE.Vector3());
  corner.reflector.quaternion.setFromUnitVectors(new THREE.Vector3(1, 1, 1).normalize(), radar.clone().sub(reflectorAt).normalize());
  const toRadar = radar.clone().sub(stage.root.position);
  stage.root.rotation.y = Math.atan2(-toRadar.z, toRadar.x);
  root.updateMatrixWorld(true);

  const sim = createRadarSim({ runtime, board, reflector: corner.reflector, aperture: corner.aperture, carriage: stage.carriage, sphereLocal: stage.sphereLocal, waves, rings, overlay });
  return { root, sim };
}

/** Tone mapping, a studio environment for the metals, fog, a key light and the orbit limits; returns the undo. */
function setUpLook(runtime: StageRuntime): () => void {
  const { renderer, scene, controls } = runtime;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.04);
  scene.environment = env.texture;
  scene.environmentIntensity = 0.6;
  scene.fog = new THREE.Fog(0x020617, 7, 13);
  const key = new THREE.DirectionalLight(0xfff1dc, 1.4);
  key.position.set(-3, 6, 5);
  scene.add(key);
  if (controls) {
    controls.enableZoom = false; // the wheel keeps scrolling the page
    controls.minPolarAngle = 1.0;
    controls.maxPolarAngle = 1.45;
    controls.minAzimuthAngle = -0.4;
    controls.maxAzimuthAngle = 0.6;
    controls.rotateSpeed = 0.55;
    controls.update();
  }
  return () => {
    scene.remove(key);
    scene.environment = null;
    scene.fog = null;
    env.dispose();
    disposeObject(room);
    pmrem.dispose();
  };
}

/**
 * The radar card's live view: an FMCW board illuminating a corner reflector and a sphere on a linear
 * stage. Wavefronts crowd through each chirp; echoes return to the receive columns. Ranges and beat
 * frequencies are computed from the drawn geometry with the chirp below.
 */
export default function RadarScene({ playing }: RadarSceneProps) {
  const [runtime, setRuntime] = useState<StageRuntime | null>(null);
  const [sim, setSim] = useState<RadarSim | null>(null);
  const onReady = useCallback((rt: StageRuntime | null) => setRuntime(rt), []);
  const a = useRef<HTMLSpanElement>(null);
  const b = useRef<HTMLSpanElement>(null);
  const profile = useRef<SVGPathElement>(null);
  const tx = useRef<HTMLSpanElement>(null);
  const rx = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!runtime) return;
    let cancelled = false;
    const textures: THREE.Texture[] = [];
    let root: THREE.Group | null = null;
    const undoLook = setUpLook(runtime);

    new THREE.TextureLoader()
      .loadAsync(imgSrc(DIE_SRC))
      .then((die) => {
        textures.push(die);
        if (cancelled) return;
        die.colorSpace = THREE.SRGBColorSpace;
        die.anisotropy = 4;
        const built = assemble(runtime, die, { a, b, profile, tx, rx }, textures);
        root = built.root;
        for (let i = 0; i < 150; i++) built.sim.step(1 / 30); // start with the fronts already in flight
        runtime.invalidate();
        setSim(built.sim);
      })
      .catch((error) => console.error('Radar scene: the radar die photo failed to load.', error));

    return () => {
      cancelled = true;
      setSim(null);
      if (root) {
        runtime.scene.remove(root);
        disposeObject(root);
      }
      undoLook();
      textures.forEach((t) => t.dispose());
      runtime.invalidate();
    };
  }, [runtime]);

  useEffect(() => {
    if (!runtime || !sim || !playing) return;
    return runtime.onFrame((_t, dt) => sim.step(dt));
  }, [runtime, sim, playing]);

  const tag = 'pointer-events-none absolute left-0 top-0 rounded border bg-slate-950/85 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-[0.12em]';

  return (
    <ThreeCanvas
      init={{ cameraPosition: [0.18, 2.3, 5.73], target: [-0.55, 0.62, -0.3], fov: FRAMED_FOV, minDistance: 3, maxDistance: 10, requireGpu: true }}
      onReady={onReady}
      label="Live 3D view: an FMCW radar board illuminating a corner reflector and a moving sphere, with ranges and beat frequencies computed from the geometry"
      className={`bg-slate-950 transition-opacity duration-500 ${sim ? 'opacity-100' : 'opacity-0'}`}
      fallback={null}
    >
      <span ref={rx} className={`${tag} border-cyan-200/70 text-cyan-100`}>RX</span>
      <span ref={tx} className={`${tag} border-amber-200/70 text-amber-100`}>TX</span>
      <p className="pointer-events-none absolute right-3 top-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/85">
        Live · FMCW radar · 49–63 GHz
      </p>
      <div className="@container pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-transparent px-3 pb-2 pt-7">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0 font-mono text-[10.5px] leading-[1.5] text-slate-200">
            <div className="truncate">
              <span className="font-bold text-amber-200">A</span> corner reflector · <span ref={a}>—</span>
            </div>
            <div className="truncate">
              <span className="font-bold text-cyan-200">B</span> moving sphere · <span ref={b}>—</span>
            </div>
          </div>
          <svg viewBox="0 0 200 44" className="hidden h-11 w-36 shrink-0 @md:block" aria-hidden="true">
            <line x1="0" y1="34" x2="200" y2="34" stroke="rgba(148,163,184,0.35)" strokeWidth="1" />
            <path ref={profile} fill="none" stroke="#7dd3fc" strokeWidth="1.4" />
            <text x="0" y="43" fill="#94a3b8" fontSize="8" fontFamily="monospace">0</text>
            <text x="200" y="43" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="end">2 m</text>
          </svg>
        </div>
        <p className="mt-0.5 text-[9.5px] leading-snug text-slate-400">
          ΔR = c/2B = {(CHIRP.rangeResolutionM * 100).toFixed(2)} cm · B = 14 GHz, T<sub>c</sub> = 100 µs (example chirp) · ranges from the drawn geometry · waves slowed ~{(SLOWDOWN / 1e8).toFixed(0)}×10⁸
        </p>
      </div>
    </ThreeCanvas>
  );
}

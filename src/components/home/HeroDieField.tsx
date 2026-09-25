'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import ThreeCanvas from '@/components/rf/three/ThreeCanvas';
import { disposeObject, type StageRuntime } from '@/components/rf/three/stageRuntime';
import { readPalette, subscribeTheme } from '@/components/rf/three/palette';
import { imgSrc } from '@/lib/basePath';
import { HERO_DIE_DIR, HERO_DIES, type HeroDie } from './heroDies';

interface HeroDieFieldProps {
  /** Called once every die texture is on the GPU and the first frame is drawn. */
  onShown: () => void;
}

const FOV = 30;
const CAMERA_Z = 16;
const PULSE_EVERY_S = 3.2;
const PULSE_S = 2.6;
const FADE_IN_S = 1.4;

/** The blurrier a die was in the flat mosaic, the farther back it sits, and the fainter. */
const depthForBlur = (blurPx: number) => 3 - 5.3 * blurPx;
const fadeForBlur = (blurPx: number) => Math.max(0.4, 1.1 - 0.33 * blurPx);
/** Pulses go to the dies at the sides, never behind the headline. */
const atSide = (die: HeroDie) => (die.left ?? die.right ?? 0) < 25;

interface DieNode {
  die: HeroDie;
  group: THREE.Group;
  body: THREE.Mesh;
  faceMaterials: THREE.Material[];
  glow: THREE.Mesh;
  rings: THREE.Mesh[];
  aspect: number;
  opacity: number;
  phase: number;
  tilt: [number, number];
}

interface Pulse {
  node: DieNode;
  start: number;
}

function glowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Hero die field: 2D canvas unavailable for the glow texture.');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

interface DieStyle {
  box: THREE.BoxGeometry;
  plane: THREE.PlaneGeometry;
  ring: THREE.RingGeometry;
  glow: THREE.Texture;
  dark: boolean;
  accent: THREE.Color;
}

/** The die photo redrawn at most 512 px wide with the flat mosaic's blur, so depth still reads as focus. */
function blurredTexture(source: THREE.Texture, die: HeroDie): THREE.CanvasTexture {
  const image = source.image as HTMLImageElement;
  const width = Math.min(512, image.width);
  const height = Math.round((image.height * width) / image.width);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Hero die field: 2D canvas unavailable for the die photo.');
  ctx.filter = `blur(${((die.blurPx * width) / die.width).toFixed(2)}px)`;
  ctx.drawImage(image, 0, 0, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** One die: a thin slab with the photo on its face, a glow behind it and two rings for its pulse. */
function buildDie(die: HeroDie, texture: THREE.Texture, index: number, style: DieStyle): DieNode {
  const { dark, accent } = style;
  const image = texture.image as { width: number; height: number };
  const opacity = die.opacity * (dark ? 1.7 : 1.4) * fadeForBlur(die.blurPx);
  const face = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity });
  const edge = new THREE.MeshStandardMaterial({ color: dark ? '#273043' : '#5b6474', roughness: 0.35, metalness: 0.6, transparent: true, opacity });
  // BoxGeometry material order: +x, -x, +y, -y, +z (face), -z.
  const body = new THREE.Mesh(style.box, [edge, edge, edge, edge, face, edge]);
  const glow = new THREE.Mesh(
    style.plane,
    new THREE.MeshBasicMaterial({ map: style.glow, color: accent, transparent: true, opacity: 0, depthWrite: false, blending: dark ? THREE.AdditiveBlending : THREE.NormalBlending }),
  );
  glow.position.z = -0.6;
  glow.scale.set(1.9, 1.9, 1);
  body.add(glow);
  const group = new THREE.Group();
  group.add(body);
  const rings = [0, 1].map(() => {
    const ring = new THREE.Mesh(
      style.ring,
      new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, blending: dark ? THREE.AdditiveBlending : THREE.NormalBlending }),
    );
    group.add(ring);
    return ring;
  });
  const phase = index * 1.7;
  return {
    die,
    group,
    body,
    faceMaterials: [face, edge],
    glow,
    rings,
    aspect: image.height / image.width,
    opacity,
    phase,
    tilt: [0.18 * Math.sin(phase * 2.3), 0.24 * Math.cos(phase * 1.9)],
  };
}

/** Put each die where the flat mosaic had it, at its own depth, at the same on-screen size. */
function layout(nodes: DieNode[], boxW: number, boxH: number) {
  for (const node of nodes) {
    const { die } = node;
    const z = depthForBlur(die.blurPx);
    const visH = 2 * (CAMERA_Z - z) * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const visW = visH * (boxW / boxH);
    const cx = die.left !== undefined ? (die.left / 100) * boxW + die.width / 2 : boxW - ((die.right ?? 0) / 100) * boxW - die.width / 2;
    const cy = die.top !== undefined ? (die.top / 100) * boxH + die.width / 2 : boxH - ((die.bottom ?? 0) / 100) * boxH - die.width / 2;
    const width = (die.width / boxW) * visW;
    node.group.position.set((cx / boxW - 0.5) * visW, (0.5 - cy / boxH) * visH, z);
    node.group.userData.baseY = node.group.position.y;
    node.group.userData.width = width;
    node.body.scale.set(width, width * node.aspect, width);
    node.body.rotation.set(node.tilt[0], node.tilt[1], THREE.MathUtils.degToRad(-die.rotateDeg));
  }
}

/** Glow and two expanding rings on one die; 0 ≤ u ≤ 1 through the pulse. */
function drawPulse(node: DieNode, u: number) {
  (node.glow.material as THREE.MeshBasicMaterial).opacity = 0.4 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.6)), 1.5);
  const width = node.group.userData.width as number;
  node.rings.forEach((ring, k) => {
    const v = Math.min(1, Math.max(0, (u - k * 0.22) / (1 - k * 0.22)));
    const r = width * (0.6 + 0.85 * v);
    ring.scale.set(r, r, 1);
    ring.rotation.copy(node.body.rotation);
    (ring.material as THREE.MeshBasicMaterial).opacity = v > 0 && v < 1 ? 0.38 * Math.pow(1 - v, 1.6) : 0;
  });
}

/** Per-frame update: layout on resize, fade-in, pointer parallax, drift, and the ring pulses. */
function createAnimator(nodes: DieNode[], runtime: StageRuntime, pointer: THREE.Vector2) {
  const canvas = runtime.renderer.domElement;
  const pulsing = nodes.filter((n) => atSide(n.die));
  const parallax = new THREE.Vector2();
  let size = { w: 0, h: 0 };
  let start = -1;
  let pulse: Pulse | null = null;
  let nextPulse = 1.5;
  return (t: number, dt: number) => {
    if (canvas.clientWidth !== size.w || canvas.clientHeight !== size.h) {
      size = { w: canvas.clientWidth, h: canvas.clientHeight };
      layout(nodes, size.w, size.h);
    }
    if (start < 0) start = t;
    const fade = Math.min(1, (t - start) / FADE_IN_S);
    parallax.lerp(pointer, 1 - Math.exp(-dt * 2.2));
    runtime.camera.position.set(parallax.x * 1.4, -parallax.y * 0.8, CAMERA_Z);
    runtime.camera.lookAt(0, 0, 0);
    for (const n of nodes) {
      n.group.position.y = (n.group.userData.baseY as number) + 0.14 * Math.sin(t * 0.33 + n.phase);
      n.body.rotation.x = n.tilt[0] + 0.1 * Math.sin(t * 0.27 + n.phase * 1.3);
      n.body.rotation.y = n.tilt[1] + 0.14 * Math.sin(t * 0.21 + n.phase * 0.7);
      for (const m of n.faceMaterials) m.opacity = n.opacity * fade;
    }
    if (t >= nextPulse) {
      if (pulse) drawPulse(pulse.node, 1);
      pulse = { node: pulsing[Math.floor(Math.random() * pulsing.length)], start: t };
      nextPulse = t + PULSE_EVERY_S * (0.8 + 0.4 * Math.random());
    }
    if (pulse) drawPulse(pulse.node, Math.min(1, (t - pulse.start) / PULSE_S));
  };
}

/**
 * The hero's die photos as slabs floating at different depths. They drift, follow the pointer
 * with parallax, and every few seconds one die sends out a ring — decoration, not a field model.
 */
export default function HeroDieField({ onShown }: HeroDieFieldProps) {
  const [runtime, setRuntime] = useState<StageRuntime | null>(null);
  const [themeTick, setThemeTick] = useState(0);
  const onReady = useCallback((rt: StageRuntime | null) => setRuntime(rt), []);
  const shownRef = useRef(onShown);

  useEffect(() => {
    shownRef.current = onShown;
  }, [onShown]);

  useEffect(() => subscribeTheme(() => setThemeTick((t) => t + 1)), []);

  useEffect(() => {
    if (!runtime) return;
    const hemi = new THREE.HemisphereLight(0xdde8ff, 0x0b1f3a, 1.2);
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(-5, 7, 9);
    runtime.scene.add(hemi, key);
    return () => {
      runtime.scene.remove(hemi, key);
    };
  }, [runtime]);

  useEffect(() => {
    if (!runtime) return;
    let cancelled = false;
    let stopFrame: (() => void) | null = null;
    const p = readPalette();
    const accent = p.dark ? p.marker : p.trace;
    const root = new THREE.Group();
    const textures: THREE.Texture[] = [];
    const style: DieStyle = {
      box: new THREE.BoxGeometry(1, 1, 0.045),
      plane: new THREE.PlaneGeometry(1, 1),
      ring: new THREE.RingGeometry(0.985, 1, 96),
      glow: glowTexture(),
      dark: p.dark,
      accent,
    };
    textures.push(style.glow);
    const pointer = new THREE.Vector2();
    const onPointer = (e: PointerEvent) => pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    window.addEventListener('pointermove', onPointer, { passive: true });

    const loader = new THREE.TextureLoader();
    Promise.all(HERO_DIES.map((d) => loader.loadAsync(imgSrc(HERO_DIE_DIR + d.file))))
      .then((loaded) => {
        textures.push(...loaded);
        if (cancelled) return;
        const faces = HERO_DIES.map((die, i) => blurredTexture(loaded[i], die));
        textures.push(...faces);
        const nodes = HERO_DIES.map((die, i) => buildDie(die, faces[i], i, style));
        nodes.forEach((n) => root.add(n.group));
        runtime.scene.add(root);
        stopFrame = runtime.onFrame(createAnimator(nodes, runtime, pointer));
        // Two frames: one to lay out and draw, one to be sure it reached the screen.
        requestAnimationFrame(() => requestAnimationFrame(() => !cancelled && shownRef.current()));
      })
      .catch((error) => console.error('Hero die field: a die photo failed to load, keeping the flat mosaic.', error));

    return () => {
      cancelled = true;
      stopFrame?.();
      window.removeEventListener('pointermove', onPointer);
      runtime.scene.remove(root);
      disposeObject(root);
      textures.forEach((t) => t.dispose());
      runtime.invalidate();
    };
  }, [runtime, themeTick]);

  return (
    <ThreeCanvas
      init={{ cameraPosition: [0, 0, CAMERA_Z], target: [0, 0, 0], fov: FOV, orbit: false, requireGpu: true }}
      onReady={onReady}
      label="Chip dies designed by the HIE Lab, floating in depth"
      className="pointer-events-none"
      fallback={null}
    />
  );
}

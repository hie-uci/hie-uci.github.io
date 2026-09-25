import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface StageInit {
  canvas: HTMLCanvasElement;
  cameraPosition: [number, number, number];
  target?: [number, number, number];
  fov?: number;
  orbit?: boolean;
  minDistance?: number;
  maxDistance?: number;
  /** Refuse a software (CPU) WebGL context, so a decorative stage falls back instead of stalling the page. */
  requireGpu?: boolean;
}

export type FrameHandler = (elapsedSeconds: number, deltaSeconds: number) => void;

/**
 * Owns one WebGL renderer, scene and camera. Renders on demand: a frame is drawn
 * only when something changed (props, camera, resize) or while an animation is
 * registered and motion is allowed. Off-screen or hidden stages stop the loop.
 */
export class StageRuntime {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly controls: OrbitControls | null;

  private readonly handlers = new Set<FrameHandler>();
  private readonly home: { position: THREE.Vector3; target: THREE.Vector3 };
  private dirty = true;
  private running = false;
  private interacting = false;
  private visible = true;
  private reduced = false;
  private raf = 0;
  private last = 0;
  private elapsed = 0;

  constructor(init: StageInit) {
    this.renderer = new THREE.WebGLRenderer({
      canvas: init.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'low-power',
      failIfMajorPerformanceCaveat: init.requireGpu ?? false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.camera = new THREE.PerspectiveCamera(init.fov ?? 35, 1, 0.01, 1000);
    this.camera.position.set(...init.cameraPosition);
    const target = new THREE.Vector3(...(init.target ?? [0, 0, 0]));
    this.camera.lookAt(target);
    this.home = { position: this.camera.position.clone(), target: target.clone() };

    if (init.orbit === false) {
      this.controls = null;
    } else {
      const controls = new OrbitControls(this.camera, init.canvas);
      controls.target.copy(target);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.enablePan = false;
      controls.minDistance = init.minDistance ?? 0.5;
      controls.maxDistance = init.maxDistance ?? 50;
      controls.addEventListener('start', this.onStart);
      controls.addEventListener('end', this.onEnd);
      controls.addEventListener('change', this.invalidate);
      controls.update();
      this.controls = controls;
    }
  }

  private onStart = () => {
    this.interacting = true;
    this.ensureLoop();
  };

  private onEnd = () => {
    this.interacting = false;
  };

  /** Request one redraw. */
  invalidate = () => {
    this.dirty = true;
    this.ensureLoop();
  };

  resetView() {
    this.camera.position.copy(this.home.position);
    this.controls?.target.copy(this.home.target);
    this.controls?.update();
    this.invalidate();
  }

  setSize(width: number, height: number) {
    if (width <= 0 || height <= 0) return;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.invalidate();
  }

  setVisible(visible: boolean) {
    this.visible = visible;
    if (visible) this.ensureLoop();
  }

  setReducedMotion(reduced: boolean) {
    this.reduced = reduced;
    this.invalidate();
  }

  get motionAllowed() {
    return !this.reduced;
  }

  onFrame(handler: FrameHandler): () => void {
    this.handlers.add(handler);
    this.ensureLoop();
    return () => {
      this.handlers.delete(handler);
    };
  }

  private ensureLoop() {
    if (this.running || !this.visible) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  private tick = (now: number) => {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    const animating = !this.reduced && this.handlers.size > 0;
    if (animating) {
      this.elapsed += dt;
      this.handlers.forEach((h) => h(this.elapsed, dt));
    }
    const moved = this.controls ? this.controls.update() : false;
    if (animating || moved || this.dirty) {
      this.renderer.render(this.scene, this.camera);
      this.dirty = false;
    }
    if (this.visible && (animating || moved || this.interacting || this.dirty)) {
      this.raf = requestAnimationFrame(this.tick);
    } else {
      this.running = false;
    }
  };

  dispose() {
    cancelAnimationFrame(this.raf);
    this.running = false;
    this.handlers.clear();
    if (this.controls) {
      this.controls.removeEventListener('start', this.onStart);
      this.controls.removeEventListener('end', this.onEnd);
      this.controls.removeEventListener('change', this.invalidate);
      this.controls.dispose();
    }
    disposeObject(this.scene);
    this.renderer.dispose();
  }
}

/** Free GPU memory held by an object tree. */
export function disposeObject(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    mesh.geometry?.dispose();
    const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(material)) material.forEach((m) => m.dispose());
    else material?.dispose();
  });
}

'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { StageRuntime, type StageInit } from './stageRuntime';
import { useMotionMode } from '@/lib/useMotionMode';

interface ThreeCanvasProps {
  init: Omit<StageInit, 'canvas'>;
  /** Receives the runtime once WebGL is up, and null when it is torn down. */
  onReady: (runtime: StageRuntime | null) => void;
  /** What the picture shows, for screen readers. */
  label: string;
  className?: string;
  children?: ReactNode;
}

/**
 * Lazily creates a WebGL stage when it nears the viewport, keeps it sized to
 * its box, pauses it off-screen, and disposes of it on unmount. It fills its
 * nearest positioned ancestor, which owns the size.
 */
export default function ThreeCanvas({ init, onReady, label, className = '', children }: ThreeCanvasProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<StageRuntime | null>(null);
  const initRef = useRef(init);
  const readyRef = useRef(onReady);
  const [failed, setFailed] = useState(false);
  const motion = useMotionMode();

  useEffect(() => {
    readyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return;
    let inView = false;
    let resize: ResizeObserver | null = null;

    const syncVisibility = () => runtimeRef.current?.setVisible(inView && document.visibilityState === 'visible');

    const start = () => {
      if (runtimeRef.current) return;
      try {
        const runtime = new StageRuntime({ ...initRef.current, canvas });
        runtimeRef.current = runtime;
        runtime.setReducedMotion(document.documentElement.getAttribute('data-motion') === 'reduced');
        runtime.setSize(box.clientWidth, box.clientHeight);
        resize = new ResizeObserver(() => runtime.setSize(box.clientWidth, box.clientHeight));
        resize.observe(box);
        syncVisibility();
        readyRef.current(runtime);
      } catch (error) {
        console.error('3D stage could not start WebGL:', error);
        setFailed(true);
      }
    };

    const nearObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) start();
      },
      { rootMargin: '300px 0px' },
    );
    const viewObserver = new IntersectionObserver((entries) => {
      inView = entries.some((e) => e.isIntersecting);
      syncVisibility();
    });
    nearObserver.observe(box);
    viewObserver.observe(box);
    document.addEventListener('visibilitychange', syncVisibility);

    return () => {
      nearObserver.disconnect();
      viewObserver.disconnect();
      resize?.disconnect();
      document.removeEventListener('visibilitychange', syncVisibility);
      readyRef.current(null);
      runtimeRef.current?.dispose();
      runtimeRef.current = null;
    };
  }, []);

  useEffect(() => {
    runtimeRef.current?.setReducedMotion(motion === 'reduced');
  }, [motion]);

  return (
    <div ref={boxRef} className={`absolute inset-0 overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label}
        onDoubleClick={() => runtimeRef.current?.resetView()}
        className="absolute inset-0 h-full w-full touch-pan-y select-none"
      />
      {failed && (
        <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-ink-3">
          This 3D view needs WebGL, which this browser has turned off. The calculator and its readouts still work.
        </p>
      )}
      {children}
    </div>
  );
}

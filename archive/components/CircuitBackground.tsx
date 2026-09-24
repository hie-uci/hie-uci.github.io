'use client';

import { useEffect, useRef, useCallback } from 'react';

type CircuitVariant = 'default' | 'radar' | 'thz-waves' | 'ic-layout';

interface CircuitBackgroundProps {
  className?: string;
  density?: number;
  variant?: CircuitVariant;
  interactive?: boolean;
}

interface Node {
  x: number;
  y: number;
  connections: number[];
  isEmitter?: boolean;
}

interface Wave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  opacity: number;
}

export default function CircuitBackground({
  className = '',
  density = 40,
  variant = 'default',
  interactive = false,
}: CircuitBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const reducedMotion = useRef(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -1000, y: -1000 };
  }, []);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    if (interactive) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleMouseLeave);
    }

    // Generate nodes based on variant
    const nodes: Node[] = [];
    const gridSpacing = variant === 'ic-layout' ? 50 : 0;

    if (variant === 'ic-layout') {
      // Grid-aligned nodes for IC layout
      const cols = Math.floor(w / gridSpacing);
      const rows = Math.floor(h / gridSpacing);
      for (let r = 1; r < rows; r++) {
        for (let c = 1; c < cols; c++) {
          if (Math.random() < 0.4) {
            nodes.push({
              x: c * gridSpacing,
              y: r * gridSpacing,
              connections: [],
            });
          }
        }
      }
    } else {
      for (let i = 0; i < density; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          connections: [],
          isEmitter: variant === 'thz-waves' && i < 3,
        });
      }
    }

    // Connect nearby nodes — Manhattan routing for ic-layout
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        const maxDist = variant === 'ic-layout' ? gridSpacing * 2.2 : 150;
        if (dist < maxDist && nodes[i].connections.length < 3) {
          nodes[i].connections.push(j);
        }
      }
    }

    // EM waves for radar/thz-waves variants
    const waves: Wave[] = [];
    const emitters = nodes.filter((n) => n.isEmitter);

    // For radar variant, use center as emitter
    if (variant === 'radar') {
      emitters.push({ x: w / 2, y: h / 2, connections: [], isEmitter: true });
    }

    let frame: number;
    let time = 0;

    const spawnWave = (emitter: Node) => {
      waves.push({
        x: emitter.x,
        y: emitter.y,
        radius: 0,
        maxRadius: Math.max(w, h) * 0.6,
        speed: 0.8 + Math.random() * 0.4,
        opacity: 0.3,
      });
    };

    let waveTimer = 0;

    const draw = () => {
      if (reducedMotion.current) {
        // Draw static version
        ctx.clearRect(0, 0, w, h);
        for (const node of nodes) {
          for (const connIdx of node.connections) {
            const target = nodes[connIdx];
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            if (variant === 'ic-layout') {
              // Manhattan routing
              ctx.lineTo(target.x, node.y);
              ctx.lineTo(target.x, target.y);
            } else {
              const midX = node.x + (target.x - node.x) * 0.5;
              ctx.lineTo(midX, node.y);
              ctx.lineTo(midX, target.y);
              ctx.lineTo(target.x, target.y);
            }
            ctx.strokeStyle = 'rgba(0, 100, 164, 0.08)';
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
        for (const node of nodes) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 100, 164, 0.15)';
          ctx.fill();
        }
        return; // no animation loop
      }

      time += 0.005;
      waveTimer += 0.005;
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Draw connections
      for (const node of nodes) {
        for (const connIdx of node.connections) {
          const target = nodes[connIdx];
          const alpha = 0.06 + 0.04 * Math.sin(time + node.x * 0.01);

          // Mouse proximity boost
          const midX2 = (node.x + target.x) / 2;
          const midY2 = (node.y + target.y) / 2;
          const distToMouse = Math.hypot(midX2 - mx, midY2 - my);
          const mouseBoost = interactive ? Math.max(0, 1 - distToMouse / 200) * 0.15 : 0;

          ctx.beginPath();
          if (variant === 'ic-layout') {
            // Manhattan routing: horizontal then vertical
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(target.x, node.y);
            ctx.lineTo(target.x, target.y);
          } else {
            const midX = node.x + (target.x - node.x) * 0.5;
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(midX, node.y);
            ctx.lineTo(midX, target.y);
            ctx.lineTo(target.x, target.y);
          }

          const r = 0;
          const g = 100;
          const b = 164;
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha + mouseBoost})`;
          ctx.lineWidth = 0.8 + mouseBoost * 3;
          ctx.stroke();
        }
      }

      // Draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const pulse = 0.5 + 0.5 * Math.sin(time * 2 + i * 0.5);
        let alpha = 0.1 + 0.1 * pulse;
        let radius = 2 + pulse;

        // Mouse proximity: nodes glow and grow
        const distToMouse = Math.hypot(node.x - mx, node.y - my);
        if (interactive && distToMouse < 150) {
          const proximity = 1 - distToMouse / 150;
          alpha += proximity * 0.4;
          radius += proximity * 3;
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 100, 164, ${alpha})`;
        ctx.fill();

        // Gold highlight on some nodes
        if (i % 5 === 0) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 210, 0, ${alpha * 0.5})`;
          ctx.fill();
        }

        // Emitter glow
        if (node.isEmitter) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(82, 129, 136, ${0.1 + 0.1 * pulse})`;
          ctx.fill();
        }
      }

      // Spawn EM waves periodically
      if ((variant === 'radar' || variant === 'thz-waves') && waveTimer > 0.15) {
        waveTimer = 0;
        if (emitters.length > 0) {
          const emitter = emitters[Math.floor(Math.random() * emitters.length)];
          spawnWave(emitter);
        }
      }

      // Draw and update EM waves
      for (let i = waves.length - 1; i >= 0; i--) {
        const wave = waves[i];
        wave.radius += wave.speed;
        wave.opacity = 0.3 * (1 - wave.radius / wave.maxRadius);

        if (wave.opacity <= 0) {
          waves.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        if (variant === 'radar') {
          // Radar: semi-circular sweep arcs
          ctx.arc(wave.x, wave.y, wave.radius, -Math.PI * 0.6, Math.PI * 0.6);
        } else {
          // THz: full circular ripples
          ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        }
        ctx.strokeStyle = `rgba(82, 129, 136, ${wave.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      frame = requestAnimationFrame(draw);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!frame) draw();
        } else {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(canvas);

    return () => {
      window.removeEventListener('resize', resize);
      if (interactive) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [density, variant, interactive, handleMouseMove, handleMouseLeave]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${interactive ? '' : 'pointer-events-none'} ${className}`}
    />
  );
}

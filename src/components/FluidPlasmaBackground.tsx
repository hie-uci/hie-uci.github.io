'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
}

export default function FluidPlasmaBackground({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width: number, height: number;
    let animationId: number;
    let particles: Particle[] = [];

    // Physics parameters
    const MOUSE_RADIUS = 180;    // Reduced slightly
    const MOUSE_FORCE = 0.7;     // Reduced slightly
    const SPRING_STIFFNESS = 0.03; 
    const FRICTION = 0.88;       
    const SPACING = 55;          // Increased spacing significantly (fewer particles)

    // Clean, modern light mode colors (water/glass feel) - extremely subtle
    const colorsLight = ['rgba(0, 100, 164, 0.15)', 'rgba(82, 129, 136, 0.12)', 'rgba(0, 164, 255, 0.1)'];
    // High-contrast, glowing dark mode colors (plasma feel)
    const colorsDark = ['rgba(56, 189, 248, 0.6)', 'rgba(125, 211, 252, 0.4)', 'rgba(0, 100, 164, 0.5)'];

    const initParticles = () => {
      particles = [];
      const cols = Math.floor(width / SPACING);
      const rows = Math.floor(height / SPACING);
      const isDark = theme === 'dark';
      const palette = isDark ? colorsDark : colorsLight;

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          // Add some organic noise to the grid
          const offsetX = (Math.random() - 0.5) * 10;
          const offsetY = (Math.random() - 0.5) * 10;
          const x = i * SPACING + offsetX;
          const y = j * SPACING + offsetY;
          
          particles.push({
            x, y,
            baseX: x, baseY: y,
            vx: 0, vy: 0,
            color: palette[Math.floor(Math.random() * palette.length)],
            size: Math.random() * 1.5 + 1
          });
        }
      }
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };
    
    window.addEventListener('resize', resize);
    resize();

    let mouseX = -1000;
    let mouseY = -1000;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      mouseX = clientX;
      mouseY = clientY;
    };

    const handlePointerLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('mouseleave', handlePointerLeave);

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      
      // Create a massive outward burst
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - clientX;
        const dy = p.y - clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 300) {
          const force = (300 - dist) / 300;
          const angle = Math.atan2(dy, dx);
          const strength = 15; // Impulse strength
          p.vx += Math.cos(angle) * force * strength;
          p.vy += Math.sin(angle) * force * strength;
        }
      }
    };

    window.addEventListener('mousedown', handlePointerDown);

    let time = 0;

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);
      
      const isDark = theme === 'dark';

      // We draw the particles as glowing nodes that are repelled by the mouse
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 1. Mouse Repulsion Force
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * force * MOUSE_FORCE;
          p.vy += Math.sin(angle) * force * MOUSE_FORCE;
        }

        // 2. Ambient Flow / Wind
        p.vx += Math.sin(p.baseY * 0.01 + time) * 0.02;
        p.vy += Math.cos(p.baseX * 0.01 + time) * 0.02;

        // 3. Spring Force (return to base)
        const springDx = p.baseX - p.x;
        const springDy = p.baseY - p.y;
        p.vx += springDx * SPRING_STIFFNESS;
        p.vy += springDy * SPRING_STIFFNESS;

        // Apply velocities
        p.vx *= FRICTION;
        p.vy *= FRICTION;
        p.x += p.vx;
        p.y += p.vy;

        // Draw particle
        ctx.beginPath();
        // If it's displaced significantly, make it glow brighter
        const displacement = Math.sqrt(springDx * springDx + springDy * springDy);
        const glow = Math.min(1, displacement / 50);
        
        if (glow > 0.1) {
            ctx.arc(p.x, p.y, p.size + glow * 2, 0, Math.PI * 2);
            ctx.fillStyle = isDark 
                ? `rgba(56, 189, 248, ${0.4 + glow * 0.6})`
                : `rgba(0, 100, 164, ${0.4 + glow * 0.4})`;
        } else {
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
        }
        
        ctx.fill();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('mouseleave', handlePointerLeave);
      window.removeEventListener('mousedown', handlePointerDown);
      cancelAnimationFrame(animationId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 opacity-80 ${className}`}
    />
  );
}

'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  opacity: number;
  frequency: number;
}

export default function WaveInterferenceBackground({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width: number, height: number;
    let animationId: number;
    const ripples: Ripple[] = [];
    
    // Antennas that constantly emit waves
    const antennas = [
      { x: 0.2, y: 0.8 }, // Bottom left
      { x: 0.8, y: 0.8 }, // Bottom right
    ];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    window.addEventListener('resize', resize);
    resize();

    const spawnRipple = (x: number, y: number, isStrong = false) => {
      ripples.push({
        x,
        y,
        radius: 0,
        maxRadius: Math.max(width, height) * 1.5,
        speed: isStrong ? 3 : 2,
        opacity: isStrong ? 0.8 : 0.4,
        frequency: isStrong ? 0.05 : 0.02,
      });
    };

    let lastSpawnTime = 0;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      
      const now = performance.now();
      if (now - lastSpawnTime > 100) { // Limit spawn rate
         spawnRipple(clientX, clientY, false);
         lastSpawnTime = now;
      }
    };
    
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      spawnRipple(clientX, clientY, true);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('touchstart', handlePointerDown, { passive: false });

    let frameCount = 0;

    const render = () => {
      frameCount++;
      const isDark = theme === 'dark';
      
      // Clear background
      ctx.clearRect(0, 0, width, height);

      // Add a subtle grid
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 56, 109, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      ctx.beginPath();
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Ambient antenna emission
      if (frameCount % 120 === 0) {
        antennas.forEach(a => spawnRipple(a.x * width, a.y * height, false));
      }

      // Draw interference pattern (Ripples)
      // Using 'lighter' or 'screen' allows overlapping ripples to become brighter (constructive interference)
      ctx.globalCompositeOperation = isDark ? 'screen' : 'multiply';

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        
        // Calculate opacity based on radius (fade out as it expands)
        const currentOpacity = r.opacity * (1 - (r.radius / r.maxRadius));
        
        if (currentOpacity <= 0) {
          ripples.splice(i, 1);
          continue;
        }

        // Draw multiple rings for each ripple to simulate wavelength
        const numRings = 3;
        for(let j = 0; j < numRings; j++) {
           const ringRadius = Math.max(0, r.radius - j * 20);
           if (ringRadius <= 0) continue;
           
           ctx.beginPath();
           ctx.arc(r.x, r.y, ringRadius, 0, Math.PI * 2);
           
           const ringOpacity = currentOpacity * (1 - j / numRings);
           if (isDark) {
             ctx.strokeStyle = `rgba(56, 189, 248, ${ringOpacity})`; // Light blue
           } else {
             ctx.strokeStyle = `rgba(0, 100, 164, ${ringOpacity})`; // UCI blue
           }
           ctx.lineWidth = 1.5;
           ctx.stroke();
        }
      }
      
      ctx.globalCompositeOperation = 'source-over';

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('touchstart', handlePointerDown);
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

'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import Matter from 'matter-js';

export default function FallingChipsBackground({ className = '' }: { className?: string }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!sceneRef.current) return;

    const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      MouseConstraint = Matter.MouseConstraint,
      Mouse = Matter.Mouse,
      Composite = Matter.Composite,
      Bodies = Matter.Bodies;

    // create engine
    const engine = Engine.create();
    const world = engine.world;

    // create renderer
    const width = window.innerWidth;
    const height = window.innerHeight;

    const isDark = theme === 'dark';
    const wireframes = false;
    const background = 'transparent';

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width,
        height,
        wireframes,
        background,
        pixelRatio: window.devicePixelRatio
      }
    });

    Render.run(render);

    // create runner
    const runner = Runner.create();
    Runner.run(runner, engine);

    // add walls
    const wallOptions = { isStatic: true, render: { visible: false } };
    Composite.add(world, [
      Bodies.rectangle(width / 2, height + 50, width * 2, 100, wallOptions), // floor
      Bodies.rectangle(-50, height / 2, 100, height * 2, wallOptions), // left wall
      Bodies.rectangle(width + 50, height / 2, 100, height * 2, wallOptions) // right wall
    ]);

    // add some chips (rectangles)
    const chipColors = isDark 
       ? ['#0f172a', '#1e293b', '#0064a4', '#38bdf8'] 
       : ['#ffffff', '#f8f9fc', '#0064a4', '#ffd200'];
       
    const chipStroke = isDark ? '#334155' : '#e2e8f0';

    const chips: Matter.Body[] = [];
    for (let i = 0; i < 20; i++) {
      const size = Math.random() * 40 + 30;
      const isSquare = Math.random() > 0.5;
      const w = isSquare ? size : size * 1.5;
      const h = size;
      
      const chip = Bodies.rectangle(
        Math.random() * width,
        Math.random() * -height - 100, // spawn above screen
        w,
        h,
        {
          restitution: 0.6,
          friction: 0.1,
          render: {
             fillStyle: chipColors[Math.floor(Math.random() * chipColors.length)],
             strokeStyle: chipStroke,
             lineWidth: 2
          }
        }
      );
      chips.push(chip);
    }
    
    Composite.add(world, chips);

    // add mouse control
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false
        }
      }
    });

    Composite.add(world, mouseConstraint);

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    // Resize handler
    const handleResize = () => {
       render.canvas.width = window.innerWidth * window.devicePixelRatio;
       render.canvas.height = window.innerHeight * window.devicePixelRatio;
       render.options.width = window.innerWidth;
       render.options.height = window.innerHeight;
       // Adjust floor
       const floor = world.bodies.find(b => b.isStatic && b.position.y > height);
       if (floor) {
          Matter.Body.setPosition(floor, { x: window.innerWidth / 2, y: window.innerHeight + 50 });
       }
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      Render.stop(render);
      Runner.stop(runner);
      Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, [theme]);

  return (
    <div 
      ref={sceneRef} 
      className={`fixed inset-0 w-full h-full z-0 opacity-40 pointer-events-auto ${className}`}
      style={{ pointerEvents: 'auto' }} // Needs pointer events for mouse interaction
    />
  );
}

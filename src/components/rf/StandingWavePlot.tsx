'use client';

import { useEffect, useRef, useState } from 'react';
import { useElementWidth } from '@/lib/useElementWidth';
import { useMotionMode } from '@/lib/useMotionMode';

const H = 210;
const M = { l: 46, r: 18, t: 16, b: 34 };
const SPAN = 1.25; // wavelengths shown, from the load toward the generator
const SAMPLES = 241;
const Y_MAX = 2; // |V| never exceeds 1 + |Γ| <= 2

/**
 * Voltage along a lossless line, normalized to the incident wave, at distance d from the load:
 * envelope |1 + Γ e^(-j2βd)| and instantaneous cos(ωt + βd) + Γ cos(ωt - βd). Γ is taken real and
 * positive, so a voltage maximum sits at the load.
 */
export default function StandingWavePlot({ gamma }: { gamma: number }) {
  const [boxRef, width] = useElementWidth<HTMLDivElement>(640);
  const svgRef = useRef<SVGSVGElement>(null);
  const motion = useMotionMode();
  const [phase, setPhase] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || motion === 'reduced') return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      // One carrier cycle every two seconds: slowed down by many orders of magnitude.
      setPhase((ph) => (ph + Math.PI * ((now - last) / 1000)) % (2 * Math.PI));
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, motion]);

  const g = Math.min(1, Math.max(0, gamma));
  const plotW = Math.max(160, width - M.l - M.r);
  const plotH = H - M.t - M.b;
  const x = (d: number) => M.l + plotW * (1 - d / SPAN); // the load is at the right edge
  const y = (v: number) => M.t + (plotH * (Y_MAX - v)) / (2 * Y_MAX);
  const ds = Array.from({ length: SAMPLES }, (_, i) => (SPAN * i) / (SAMPLES - 1));
  const envelope = ds.map((d) => Math.sqrt(1 + g * g + 2 * g * Math.cos(4 * Math.PI * d)));
  const upper = ds.map((d, i) => `${i ? 'L' : 'M'}${x(d).toFixed(1)} ${y(envelope[i]).toFixed(1)}`).join('');
  const lower = ds.map((d, i) => `${i ? 'L' : 'M'}${x(d).toFixed(1)} ${y(-envelope[i]).toFixed(1)}`).join('');
  const band = `${upper}${[...ds].reverse().map((d, i) => `L${x(d).toFixed(1)} ${y(-envelope[SAMPLES - 1 - i]).toFixed(1)}`).join('')}Z`;
  const wave = ds.map((d, i) => `${i ? 'L' : 'M'}${x(d).toFixed(1)} ${y(Math.cos(phase + 2 * Math.PI * d) + g * Math.cos(phase - 2 * Math.PI * d)).toFixed(1)}`).join('');
  const vswr = g >= 1 ? '∞' : ((1 + g) / (1 - g)).toFixed(2);
  const ticks = plotW >= 420 ? [0, 0.25, 0.5, 0.75, 1, 1.25] : [0, 0.5, 1]; // a phone gets three labels
  // Vmax is labelled above its line and Vmin below, so the two never collide.
  const levels = [
    { v: 1 + g, dy: -5, text: `Vmax = 1 + |Γ| = ${(1 + g).toFixed(2)}` },
    { v: 1 - g, dy: 12, text: `Vmin = 1 − |Γ| = ${(1 - g).toFixed(2)}` },
  ];

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="kicker flex flex-wrap justify-between gap-2 text-[10.5px]">
        <span>
          Standing wave on the line · <span className="normal-case">VSWR = Vmax / Vmin = {vswr}</span>
        </span>
        <span className="normal-case">|V| / |V⁺| vs distance from the load</span>
      </figcaption>
      <div ref={boxRef}>
        <svg ref={svgRef} width={width} height={H} viewBox={`0 0 ${width} ${H}`} className="block" role="img" aria-label={`Standing wave for reflection coefficient ${g.toFixed(3)}: maximum ${(1 + g).toFixed(2)}, minimum ${(1 - g).toFixed(2)} of the incident amplitude, VSWR ${vswr}`}>
          <g className="font-mono" fontSize={10} fill="var(--ink-3)">
            {[-2, -1, 0, 1, 2].map((v) => (
              <g key={v}>
                <line x1={M.l} x2={M.l + plotW} y1={y(v)} y2={y(v)} stroke={v === 0 ? 'var(--line-strong)' : 'var(--line)'} />
                <text x={M.l - 8} y={y(v) + 3.5} textAnchor="end">
                  {v === 0 ? '0' : v > 0 ? `+${v}` : `−${-v}`}
                </text>
              </g>
            ))}
            {ticks.map((d) => (
              <g key={d}>
                <line x1={x(d)} x2={x(d)} y1={M.t} y2={M.t + plotH + 4} stroke="var(--line)" />
                <text x={x(d)} y={H - 12} textAnchor={d === 0 ? 'end' : d === SPAN ? 'start' : 'middle'}>
                  {d === 0 ? 'load' : `${d} λ`}
                </text>
              </g>
            ))}
          </g>
          <path d={band} fill="var(--trace)" fillOpacity={0.08} />
          <path d={upper} fill="none" stroke="var(--trace)" strokeWidth={1.5} />
          <path d={lower} fill="none" stroke="var(--trace)" strokeWidth={1.5} strokeOpacity={0.5} />
          <path d={wave} fill="none" stroke="var(--series-2)" strokeWidth={1.8} strokeLinejoin="round" />
          <g className="font-mono" fontSize={10}>
            {levels.map((l) => (
              <g key={l.text}>
                <line x1={M.l} x2={M.l + plotW} y1={y(l.v)} y2={y(l.v)} stroke="var(--ink-3)" strokeDasharray="3 4" />
                <text x={M.l + 6} y={y(l.v) + l.dy} fill="var(--ink-2)" paintOrder="stroke" stroke="var(--bg-raised)" strokeWidth={4}>
                  {l.text}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
      <p className="text-xs leading-relaxed text-ink-3">
        Blue: the envelope |V(d)| = |V⁺| √(1 + |Γ|² + 2|Γ| cos 2βd); gold: the voltage at one instant, animated and slowed down. Maxima repeat every λ/2 and each minimum sits λ/4 from a maximum. The load phase is not an input, so Γ is taken real and positive, which puts a maximum at the load; another phase slides the pattern along the line without changing the VSWR.
      </p>
    </figure>
  );
}

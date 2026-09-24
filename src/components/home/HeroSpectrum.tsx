'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { rulerChips, siliconSpanGHz, type Chip } from '@/data/chips';
import { assignLanes, bandCenter, decadeTicks, formatFrequency, IEEE_BANDS, logPosition, pct } from '@/lib/spectrum';

const ticks = decadeTicks();
const DEFAULT_SLUG = 'quadrupler-920';

interface Segment {
  chip: Chip;
  band: [number, number];
  start: number;
  end: number;
  lane: number;
}

function buildSegments(): Segment[] {
  const raw = rulerChips.flatMap((chip) =>
    chip.bandsGHz!.map((band) => ({ chip, band, start: logPosition(band[0]), end: logPosition(band[1]) })),
  );
  const lanes = assignLanes(raw.map((s) => ({ start: s.start, end: Math.max(s.end, s.start + 0.006) })));
  return raw.map((s, i) => ({ ...s, lane: lanes[i] }));
}

const SEGMENTS = buildSegments();

function flagTransform(position: number) {
  if (position < 0.06) return 'translateX(0)';
  if (position > 0.94) return 'translateX(-100%)';
  return 'translateX(-50%)';
}

function FeaturedDie({ chip, index, total, onStep }: { chip: Chip; index: number; total: number; onStep: (d: number) => void }) {
  return (
    <figure className="flex flex-col gap-4">
      <div className="ticks ticks-marker relative flex aspect-[4/3] items-center justify-center border border-line bg-bg-raised">
        <span className="kicker absolute left-4 top-3.5 text-[10px]">Featured die</span>
        <span className="kicker absolute right-4 top-3.5 text-[10px] normal-case">
          {String(index + 1).padStart(2, '0')} / {total}
        </span>
        <Image
          key={chip.slug}
          src={chip.web}
          alt={`Die photo: ${chip.name}`}
          width={chip.width}
          height={chip.height}
          sizes="(min-width: 1024px) 30vw, 90vw"
          className="enter-fade h-[74%] w-[84%] object-contain"
        />
      </div>
      <figcaption className="flex items-start justify-between gap-4">
        <div className="min-w-0" aria-live="polite">
          <p className="text-xl font-semibold leading-snug [font-stretch:104%]">{chip.name}</p>
          <p className="mt-1.5 font-mono text-[11px] leading-relaxed text-ink-3 [font-stretch:87.5%]">
            {chip.technology} · {chip.category} · {chip.frequency}
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button type="button" className="btn-icon font-mono" aria-label="Previous die" onClick={() => onStep(-1)}>
            ←
          </button>
          <button type="button" className="btn-icon font-mono" aria-label="Next die" onClick={() => onStep(1)}>
            →
          </button>
        </div>
      </figcaption>
    </figure>
  );
}

function Ruler({ segments, activeSlug, onPick }: { segments: Segment[]; activeSlug: string; onPick: (slug: string) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = segments.find((s) => s.chip.slug === activeSlug) ?? segments[segments.length - 1];
  const markerPos = logPosition(bandCenter(active.band));

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (i + delta + segments.length) % segments.length;
    refs.current[next]?.focus();
    onPick(segments[next].chip.slug);
  };

  return (
    <div className="-mx-5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0">
      <div className="relative h-[132px] min-w-[860px]">
        <div className="absolute inset-x-0 top-[76px] h-px bg-line-strong" aria-hidden="true" />
        {ticks.map((t) => (
          <div
            key={t.fGHz}
            aria-hidden="true"
            className={`absolute top-[76px] w-px ${t.major ? 'h-[11px] bg-ink-3' : 'h-[5px] bg-line-strong'}`}
            style={{ left: pct(t.position) }}
          />
        ))}
        {ticks
          .filter((t) => t.major)
          .map((t) => (
            <span
              key={`l${t.fGHz}`}
              aria-hidden="true"
              className="absolute top-[94px] whitespace-nowrap font-mono text-[11px] text-ink-3 [font-stretch:87.5%]"
              style={{ left: pct(t.position), transform: flagTransform(t.position) }}
            >
              {t.label}
            </span>
          ))}
        {IEEE_BANDS.map((b) => {
          const from = logPosition(b.range[0]);
          const to = logPosition(b.range[1]);
          return (
            <span
              key={b.name}
              aria-hidden="true"
              className="absolute top-[116px] border-l border-line text-center font-mono text-[10px] text-ink-3 [font-stretch:87.5%]"
              style={{ left: pct(from), width: pct(to - from) }}
            >
              {b.name}
            </span>
          );
        })}

        <div role="group" aria-label="Fabricated dies by operating frequency">
          {segments.map((s, i) => {
            const isActive = s.chip.slug === activeSlug;
            const point = s.band[0] === s.band[1];
            const top = s.lane === 0 ? 64 : 50;
            return (
              <button
                key={`${s.chip.slug}-${s.band[0]}`}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                type="button"
                aria-pressed={isActive}
                aria-label={`${s.chip.name}, ${s.chip.frequency}`}
                onClick={() => onPick(s.chip.slug)}
                onKeyDown={(e) => onKey(e, i)}
                className="group absolute -translate-y-1/2 rounded-sm p-[7px] outline-offset-0"
                style={{
                  left: `calc(${pct(s.start)} - 7px)`,
                  top: `${top + 3}px`,
                  width: point ? '22px' : `calc(${pct(s.end - s.start)} + 14px)`,
                }}
              >
                <span
                  className={`block transition-colors duration-200 ${point ? 'h-2 w-2 rounded-full' : 'h-[5px] rounded-full'} ${
                    isActive ? 'bg-marker' : 'bg-trace/80 group-hover:bg-trace'
                  }`}
                />
              </button>
            );
          })}
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-[24px] h-[62px] w-px bg-marker transition-[left] duration-500 ease-[var(--ease-out-expo)]"
          style={{ left: pct(markerPos) }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0 whitespace-nowrap rounded-sm bg-marker px-2 py-[3px] font-mono text-[11px] text-on-marker transition-[left] duration-500 ease-[var(--ease-out-expo)] [font-stretch:87.5%]"
          style={{ left: pct(markerPos), transform: flagTransform(markerPos) }}
        >
          f {active.chip.frequency}
        </span>
      </div>
    </div>
  );
}

/** Homepage hero: headline, featured die and the interactive spectrum ruler. */
export default function HeroSpectrum() {
  const [activeSlug, setActiveSlug] = useState(DEFAULT_SLUG);
  const activeIndex = Math.max(0, rulerChips.findIndex((c) => c.slug === activeSlug));
  const chip = rulerChips[activeIndex];

  const step = (delta: number) => {
    const next = (activeIndex + delta + rulerChips.length) % rulerChips.length;
    setActiveSlug(rulerChips[next].slug);
  };

  return (
    <div className="flex flex-col gap-10 xl:gap-12">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7 xl:col-span-8">
          <p className="kicker enter-fade flex items-center gap-3.5">
            <span className="block h-0.5 w-7 bg-marker" aria-hidden="true" />
            UC Irvine · Department of EECS
          </p>
          <h1 className="mt-6 flex flex-col">
            <span className="display-hero kinetic-widen">High-speed</span>
            <span className="enter-rise mt-2 text-[clamp(2.25rem,1rem+4.6vw,4.75rem)] font-[720] leading-[1.02] tracking-[-0.03em] [animation-delay:120ms] [font-stretch:94%]">
              Integrated Electronics
            </span>
            <span className="accent-serif enter-rise text-[clamp(2.75rem,1.2rem+5.6vw,6rem)] leading-[0.95] text-ink-2 [animation-delay:200ms]">
              Laboratory
            </span>
          </h1>
          <p className="lede enter-rise mt-7 max-w-xl [animation-delay:280ms]">
            Pioneering mm-wave and terahertz electronic circuits and systems for next-generation sensing, imaging, and communications.
          </p>
          <div className="enter-rise mt-8 flex flex-wrap gap-3 [animation-delay:340ms]">
            <Link href="/research" className="btn btn-primary">
              Explore Research <span className="font-mono" aria-hidden="true">→</span>
            </Link>
            <Link href="/available-positions" className="btn btn-ghost">
              Join Our Team
            </Link>
          </div>
        </div>
        <div className="enter-rise lg:col-span-5 xl:col-span-4 [animation-delay:220ms]">
          <FeaturedDie chip={chip} index={activeIndex} total={rulerChips.length} onStep={step} />
        </div>
      </div>

      <div className="enter-fade [animation-delay:420ms]">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <p className="kicker">
            Our silicon · {formatFrequency(siliconSpanGHz[0])} to {formatFrequency(siliconSpanGHz[1])}
          </p>
          <p className="kicker hidden sm:block">{rulerChips.length} dies at their operating bands · select one</p>
        </div>
        <Ruler segments={SEGMENTS} activeSlug={activeSlug} onPick={setActiveSlug} />
      </div>
    </div>
  );
}

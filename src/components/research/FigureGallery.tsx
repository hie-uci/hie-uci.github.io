'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import Lightbox, { type LightboxItem } from '@/components/Lightbox';
import type { ResearchFigure } from '@/data/researchProjects';
import { figureSize as sizeOf, figureWebSrc as webSrc } from '@/lib/researchFigures';
import { useMotionMode } from '@/lib/useMotionMode';

interface GalleryProps {
  figures: ResearchFigure[];
  /** Project number, for "Fig. 2.3" captions. */
  project: number;
  projectTitle: string;
}

/**
 * Research figures as uncropped plates in a column layout. Diagrams and plots
 * keep their full frame; a click opens the lightbox with the full-resolution original.
 */
export default function FigureGallery({ figures, project, projectTitle }: GalleryProps) {
  const motion = useMotionMode();
  const [open, setOpen] = useState<number | null>(null);
  const stills = useMemo(() => figures.map((f, i) => ({ f, n: i + 1 })).filter(({ f }) => !f.videoSrc), [figures]);
  const items: LightboxItem[] = useMemo(
    () => stills.map(({ f, n }) => ({ src: webSrc(f.src), fullSrc: f.src, alt: f.alt, title: `Fig. ${project}.${n}`, meta: projectTitle })),
    [stills, project, projectTitle],
  );

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 [&>*]:mb-4">
        {figures.map((f, i) => {
          const label = `Fig. ${project}.${i + 1}`;
          if (f.videoSrc) {
            const [w, h] = sizeOf(f.posterSrc ?? f.src);
            return (
              <figure key={f.videoSrc} className="break-inside-avoid">
                <div className="overflow-hidden rounded-[3px] bg-black ring-1 ring-line">
                  <video
                    className="block h-auto w-full"
                    width={w}
                    height={h}
                    autoPlay={motion !== 'reduced'}
                    controls={motion === 'reduced'}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster={f.posterSrc ?? f.src}
                    aria-label={f.alt}
                  >
                    <source src={f.videoSrc} type="video/mp4" />
                  </video>
                </div>
                <figcaption className="mt-2 flex justify-between font-mono text-[10.5px] text-ink-3 [font-stretch:87.5%]">
                  <span>{label}</span>
                  <span>Animation</span>
                </figcaption>
              </figure>
            );
          }
          const [w, h] = sizeOf(f.src);
          const index = stills.findIndex((s) => s.f === f);
          return (
            <figure key={f.src} className="break-inside-avoid">
              <button
                type="button"
                onClick={() => setOpen(index)}
                aria-label={`Enlarge ${label}: ${f.alt}`}
                className="group block w-full overflow-hidden rounded-[3px] bg-white p-3 ring-1 ring-line transition-shadow duration-300 hover:ring-line-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ink dark:brightness-[0.94]"
              >
                <Image
                  src={webSrc(f.src)}
                  alt={f.alt}
                  width={w}
                  height={h}
                  sizes="(min-width: 1280px) 26vw, (min-width: 640px) 40vw, 92vw"
                  className="h-auto w-full transition-transform duration-500 ease-[var(--ease-signal)] group-hover:scale-[1.015]"
                />
              </button>
              <figcaption className="mt-2 flex justify-between font-mono text-[10.5px] text-ink-3 [font-stretch:87.5%]">
                <span>{label}</span>
                <span aria-hidden="true">Enlarge ⤢</span>
              </figcaption>
            </figure>
          );
        })}
      </div>
      <Lightbox items={items} index={open} onClose={() => setOpen(null)} onIndexChange={setOpen} />
    </>
  );
}

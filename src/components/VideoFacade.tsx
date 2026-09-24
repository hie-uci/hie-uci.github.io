'use client';

import Image from 'next/image';
import { useState } from 'react';

/**
 * A YouTube video that loads only when played. Until then it is a thumbnail and a
 * play button, so a page of tutorials does not start four players on arrival.
 */
export default function VideoFacade({ id, title }: { id: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[4px] border border-line bg-black">
      {playing ? (
        <iframe
          className="absolute inset-0 size-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 size-full" aria-label={`Play video: ${title}`}>
          {/* External thumbnail; the static export has no image optimizer to route it through. */}
          <Image src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" fill unoptimized sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" aria-hidden="true" />
          <span className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-marker text-on-marker transition-transform duration-300 group-hover:scale-105" aria-hidden="true">
            <svg viewBox="0 0 16 16" className="ml-1 size-6" fill="currentColor">
              <path d="M4 2.5v11l9-5.5z" />
            </svg>
          </span>
          <span className="absolute bottom-3 left-4 font-mono text-[11px] text-white/85 [font-stretch:87.5%]">Plays from YouTube</span>
        </button>
      )}
    </div>
  );
}

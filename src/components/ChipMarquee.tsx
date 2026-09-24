'use client';

import { useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import Lightbox, { type LightboxItem } from './Lightbox';
import { chips, type Chip } from '@/data/chips';

const half = Math.ceil(chips.length / 2);
const rows: Chip[][] = [chips.slice(0, half), chips.slice(half)];

function ChipTile({ chip, onOpen, hidden }: { chip: Chip; onOpen: () => void; hidden: boolean }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      tabIndex={hidden ? -1 : 0}
      aria-hidden={hidden || undefined}
      aria-label={hidden ? undefined : `Open die photo: ${chip.name}`}
      className="group relative h-[150px] w-[210px] shrink-0 overflow-hidden rounded-[3px] border border-line bg-bg-raised text-left transition-colors duration-300 hover:border-line-strong sm:h-[168px] sm:w-[236px]"
    >
      <Image
        src={chip.thumb}
        alt=""
        width={480}
        height={Math.round((480 * chip.height) / chip.width)}
        sizes="240px"
        className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
      />
      <span className="absolute inset-x-0 bottom-0 translate-y-1 bg-gradient-to-t from-[rgba(3,6,12,0.88)] to-transparent px-3 pb-2.5 pt-8 opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
        <span className="block font-mono text-[11px] leading-snug text-white [font-stretch:87.5%]">{chip.shortName}</span>
      </span>
    </button>
  );
}

/** Two counter-scrolling rows of die photos. Hover or focus pauses a row; a click opens the gallery lightbox. */
export default function ChipMarquee() {
  const [open, setOpen] = useState<number | null>(null);
  const items = useMemo<LightboxItem[]>(
    () =>
      chips.map((c) => ({
        src: c.web,
        fullSrc: c.image,
        alt: `Die photo: ${c.name}`,
        title: c.name,
        meta: `${c.technology} · ${c.category} · ${c.frequency}`,
      })),
    [],
  );
  const close = useCallback(() => setOpen(null), []);

  return (
    <>
      <div className="flex flex-col gap-4">
        {rows.map((row, r) => (
          <div key={r} className="chip-marquee-row">
            <div
              className="chip-marquee-track flex gap-4"
              style={{ animation: `${r === 0 ? 'marquee-left' : 'marquee-right'} ${r === 0 ? 46 : 52}s linear infinite` }}
            >
              {/* The row is duplicated for a seamless loop; the copy is hidden from assistive tech. */}
              {[...row, ...row].map((chip, i) => (
                <ChipTile
                  key={`${chip.slug}-${i}`}
                  chip={chip}
                  hidden={i >= row.length}
                  onOpen={() => setOpen(chips.indexOf(chip))}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <Lightbox items={items} index={open} onClose={close} onIndexChange={setOpen} />
    </>
  );
}

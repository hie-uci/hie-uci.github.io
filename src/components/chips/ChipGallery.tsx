'use client';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Lightbox, { type LightboxItem } from '@/components/Lightbox';
import { chipCategories, chips, type Chip, type ChipCategory } from '@/data/chips';

type Filter = ChipCategory | 'All';

/** Opens the chip named by ?chip=slug, the link site search uses; kept in Suspense so the grid stays static. */
function UrlSync({ onChip }: { onChip: (slug: string | null) => void }) {
  const slug = useSearchParams().get('chip');
  useEffect(() => onChip(slug), [slug, onChip]);
  return null;
}

function setChipParam(slug: string | null) {
  const url = new URL(window.location.href);
  if (slug) url.searchParams.set('chip', slug);
  else url.searchParams.delete('chip');
  window.history.replaceState(null, '', `${url.pathname}${url.search}`);
}

function ChipPlate({ chip, index, onOpen }: { chip: Chip; index: number; onOpen: () => void }) {
  return (
    <article id={chip.slug} className="group scroll-mt-40">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Enlarge the ${chip.name} die photograph`}
        className="ticks relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[4px] border border-line bg-white p-6 transition-colors hover:border-line-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ink sm:p-10 dark:brightness-[0.94]"
      >
        <Image
          src={chip.web}
          alt={`${chip.name} die photograph`}
          width={chip.width}
          height={chip.height}
          sizes="(min-width: 1024px) 44vw, 92vw"
          priority={index < 2}
          className="h-full w-full object-contain transition-transform duration-700 ease-[var(--ease-signal)] group-hover:scale-[1.03]"
        />
        <span className="absolute left-4 top-3.5 font-mono text-[10.5px] text-[#5b6b80] [font-stretch:87.5%]">{String(index + 1).padStart(2, '0')}</span>
        <span className="absolute right-4 top-3.5 font-mono text-[10.5px] text-[#5b6b80] opacity-0 transition-opacity [font-stretch:87.5%] group-hover:opacity-100 group-focus-within:opacity-100">
          Enlarge ⤢
        </span>
      </button>
      <div className="mt-4 flex items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="kicker text-[10.5px]">{chip.category}</p>
          <h2 className="mt-2 text-[1.3rem] font-bold leading-tight tracking-[-0.01em] [font-stretch:104%]">{chip.name}</h2>
        </div>
        <dl className="shrink-0 text-right font-mono text-[12px] leading-relaxed [font-stretch:87.5%]">
          <dt className="sr-only">Process</dt>
          <dd className="text-ink-2">{chip.technology}</dd>
          <dt className="sr-only">Frequency</dt>
          <dd className="text-marker-ink">{chip.frequency}</dd>
        </dl>
      </div>
    </article>
  );
}

/** Category filter, die-photo plates and the lightbox with the lossless original. */
export default function ChipGallery() {
  const [filter, setFilter] = useState<Filter>('All');
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const visible = useMemo(() => (filter === 'All' ? chips : chips.filter((c) => c.category === filter)), [filter]);
  const items: LightboxItem[] = useMemo(
    () => visible.map((c) => ({ src: c.image, fullSrc: c.image, alt: `${c.name} die photograph`, title: c.name, meta: `${c.technology} · ${c.frequency}` })),
    [visible],
  );
  const openIndex = openSlug ? visible.findIndex((c) => c.slug === openSlug) : -1;

  // A chip named in the URL opens even when the current filter hides it.
  const fromUrl = useCallback((slug: string | null) => {
    if (slug && chips.some((c) => c.slug === slug)) {
      setFilter((f) => (f === 'All' || chips.find((c) => c.slug === slug)?.category === f ? f : 'All'));
      setOpenSlug(slug);
    } else {
      setOpenSlug(null);
    }
  }, []);

  const open = (slug: string | null) => {
    setOpenSlug(slug);
    setChipParam(slug);
  };

  const counts = (f: Filter) => (f === 'All' ? chips.length : chips.filter((c) => c.category === f).length);

  return (
    <>
      <Suspense fallback={null}>
        <UrlSync onChip={fromUrl} />
      </Suspense>

      <div className="sticky top-[66px] z-20 -mx-5 border-b border-line bg-bg/96 px-5 py-4 backdrop-blur-sm sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12 xl:top-[107px]">
        <div role="radiogroup" aria-label="Chip category" className="flex gap-[3px] overflow-x-auto rounded-lg border border-line bg-bg-raised p-[3px] [scrollbar-width:none] lg:w-fit [&::-webkit-scrollbar]:hidden">
          {(['All', ...chipCategories] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              role="radio"
              aria-checked={filter === f}
              onClick={() => setFilter(f)}
              className={`flex min-h-9 shrink-0 items-center gap-2 rounded-md px-3 font-mono text-[11px] transition-colors [font-stretch:87.5%] ${
                filter === f ? 'bg-surface-2 text-ink shadow-[inset_0_0_0_1px_var(--line)]' : 'text-ink-3 hover:text-ink'
              }`}
            >
              {f}
              <span className={filter === f ? 'text-marker-ink' : 'text-ink-3'}>{counts(f)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-x-10 gap-y-14 md:grid-cols-2">
        {visible.map((chip) => (
          <ChipPlate key={chip.slug} chip={chip} index={chips.indexOf(chip)} onOpen={() => open(chip.slug)} />
        ))}
      </div>

      <Lightbox items={items} index={openIndex >= 0 ? openIndex : null} onClose={() => open(null)} onIndexChange={(i) => open(visible[i]?.slug ?? null)} />
    </>
  );
}

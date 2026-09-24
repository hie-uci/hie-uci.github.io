'use client';

import { useSearchParams } from 'next/navigation';
import { Fragment, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { publications, publicationTypeLabels, type Publication, type PubType } from '@/data/publications';
import { matchesPublication } from '@/lib/publicationSearch';
import { words } from '@/lib/text';

type Filter = PubType | 'all';
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'journal', label: 'Journal' },
  { value: 'conference', label: 'Conference' },
  { value: 'patent', label: 'Patent' },
  { value: 'talk', label: 'Talks' },
];
const TYPE_ORDER: Record<PubType, number> = { journal: 0, conference: 1, patent: 2, talk: 3 };
const TYPE_TONE: Record<PubType, string> = { journal: 'text-accent-ink', conference: 'text-trace-2', patent: 'text-marker-ink', talk: 'text-ink-2' };
const isFilter = (v: string | null): v is Filter => FILTERS.some((f) => f.value === v);

/**
 * Mirrors ?q= and ?type= into the browser. It sits in its own Suspense boundary so the
 * static HTML keeps the full list; the filter applies right after hydration and on later
 * navigations, including links from site search and the research page.
 */
function UrlSync({ onChange }: { onChange: (query: string, filter: Filter) => void }) {
  const params = useSearchParams();
  const query = params.get('q') ?? '';
  const type = params.get('type');
  useEffect(() => onChange(query, isFilter(type) ? type : 'all'), [query, type, onChange]);
  return null;
}

/** Marks the parts of `text` that begin with a query word. */
function Highlight({ text, query }: { text: string; query: string }) {
  const wanted = words(query);
  if (!wanted.length) return <>{text}</>;
  const pattern = new RegExp(`(^|[^\\p{L}\\p{N}])(${wanted.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'giu');
  const parts: { text: string; hit: boolean }[] = [];
  let last = 0;
  for (const m of text.matchAll(pattern)) {
    const start = (m.index ?? 0) + m[1].length;
    parts.push({ text: text.slice(last, start), hit: false }, { text: text.slice(start, start + m[2].length), hit: true });
    last = start + m[2].length;
  }
  parts.push({ text: text.slice(last), hit: false });
  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>{p.hit ? <mark className="rounded-[2px] bg-marker/35 text-inherit">{p.text}</mark> : p.text}</Fragment>
      ))}
    </>
  );
}

function PublicationRow({ pub, query }: { pub: Publication; query: string }) {
  return (
    <li className="py-5 first:pt-1">
      <p className="kicker flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px]">
        <span className={TYPE_TONE[pub.type]}>{publicationTypeLabels[pub.type]}</span>
        {pub.venue && (
          <span className="text-ink-2">
            <Highlight text={pub.venue} query={query} />
          </span>
        )}
        {pub.highlight && <span className="text-marker-ink">★ {pub.highlight}</span>}
      </p>
      <h3 className="mt-2 max-w-[70ch] text-[1.0625rem] font-semibold leading-snug">
        {pub.link ? (
          <a href={pub.link} target="_blank" rel="noopener noreferrer" className="group transition-colors hover:text-accent-ink">
            <Highlight text={pub.title} query={query} />
            <span aria-hidden="true" className="ml-1.5 inline-block font-mono text-[0.8em] text-marker-ink transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
              ↗
            </span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <Highlight text={pub.title} query={query} />
        )}
      </h3>
      <p className="mt-1.5 max-w-[80ch] text-[14px] leading-relaxed text-ink-2">
        <Highlight text={pub.authors} query={query} />
      </p>
    </li>
  );
}

/** Search, type filter and the year-grouped list. The URL carries the filter, so any view can be shared. */
export default function PublicationBrowser() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const fromUrl = useCallback((q: string, f: Filter) => {
    setQuery(q);
    setFilter(f);
  }, []);

  const writeUrl = (q: string, f: Filter) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q);
    if (f !== 'all') params.set('type', f);
    const search = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${search ? `?${search}` : ''}`);
  };

  const matching = useMemo(() => publications.filter((p) => matchesPublication(p, query)), [query]);
  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: matching.length, journal: 0, conference: 0, patent: 0, talk: 0 };
    matching.forEach((p) => (c[p.type] += 1));
    return c;
  }, [matching]);
  const grouped = useMemo(() => {
    const byYear = new Map<number, Publication[]>();
    for (const p of matching) if (filter === 'all' || p.type === filter) byYear.set(p.year, [...(byYear.get(p.year) ?? []), p]);
    return [...byYear.entries()].sort((a, b) => b[0] - a[0]).map(([year, list]) => [year, list.sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type])] as const);
  }, [matching, filter]);
  const shown = grouped.reduce((n, [, list]) => n + list.length, 0);

  return (
    <>
      <Suspense fallback={null}>
        <UrlSync onChange={fromUrl} />
      </Suspense>

      <div className="sticky top-[66px] z-20 -mx-5 border-b border-line bg-bg/96 px-5 py-4 backdrop-blur-sm sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12 xl:top-[107px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search publications</span>
            <input
              type="search"
              value={query}
              placeholder="Search title, author, venue or year"
              onChange={(e) => {
                setQuery(e.target.value);
                writeUrl(e.target.value, filter);
              }}
              className="field-input pl-10"
            />
            <svg viewBox="0 0 16 16" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-3" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <circle cx="7" cy="7" r="4.75" />
              <path d="m10.5 10.5 3.5 3.5" strokeLinecap="round" />
            </svg>
          </label>
          <div role="radiogroup" aria-label="Publication type" className="flex gap-[3px] overflow-x-auto rounded-lg border border-line bg-bg-raised p-[3px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                role="radio"
                aria-checked={filter === f.value}
                onClick={() => {
                  setFilter(f.value);
                  writeUrl(query, f.value);
                }}
                className={`flex min-h-9 shrink-0 items-center gap-2 rounded-md px-3 font-mono text-[11px] transition-colors [font-stretch:87.5%] ${
                  filter === f.value ? 'bg-surface-2 text-ink shadow-[inset_0_0_0_1px_var(--line)]' : 'text-ink-3 hover:text-ink'
                }`}
              >
                {f.label}
                <span className={filter === f.value ? 'text-marker-ink' : 'text-ink-3'}>{counts[f.value]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="kicker mt-8 text-[10.5px]" aria-live="polite">
        Showing {shown} of {publications.length}
        {query.trim() && <> for “{query.trim()}”</>}
      </p>

      {grouped.length === 0 ? (
        <div className="mt-10 border-t border-line-strong py-16">
          <p className="display-3">Nothing matches that search.</p>
          <button type="button" className="btn btn-ghost mt-6" onClick={() => {
              fromUrl('', 'all');
              writeUrl('', 'all');
            }}>
            Clear search and filter
          </button>
        </div>
      ) : (
        <ol className="mt-4">
          {grouped.map(([year, list]) => (
            <li key={year} className="grid gap-4 border-t border-line-strong py-8 md:grid-cols-[150px_minmax(0,1fr)] md:gap-10">
              {/* Sticks 24 px under the header plus the filter bar: 66+137, 66+77 and 107+77 px. */}
              <div className="md:sticky md:top-[227px] md:self-start lg:top-[167px] xl:top-[208px]">
                <p className="readout text-[2.5rem] leading-none">{year}</p>
                <p className="kicker mt-2 text-[10px]">
                  {list.length} {list.length === 1 ? 'entry' : 'entries'}
                </p>
              </div>
              <ul className="divide-y divide-line">
                {list.map((p) => (
                  <PublicationRow key={`${p.title}-${p.venue}`} pub={p} query={query} />
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

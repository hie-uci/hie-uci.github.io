'use client';

import { useMemo, useState } from 'react';
import { labNews, newsCategoryLabels, type NewsCategory, type NewsItem } from '@/data/news';

type Filter = NewsCategory | 'all';
const ORDER: NewsCategory[] = ['award', 'defense', 'publication', 'conference', 'milestone'];
/** One colour per category, carried by a small mark; the label itself stays quiet. */
const DOT: Record<NewsCategory, string> = {
  award: 'var(--marker)',
  defense: 'var(--series-3)',
  publication: 'var(--series-1)',
  conference: 'var(--series-5)',
  milestone: 'var(--series-4)',
};

const month = (item: NewsItem) => item.date.split(' ')[0];

function NewsRow({ item, latest }: { item: NewsItem; latest: boolean }) {
  return (
    <li className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-4 gap-y-1.5 py-4 sm:grid-cols-[3.5rem_9.5rem_minmax(0,1fr)] sm:gap-x-6">
      <span className="readout pt-0.5 text-[13px] uppercase text-ink-3">{month(item)}</span>
      <span className="kicker flex items-center gap-2.5 pt-0.5 text-[10.5px] max-sm:col-start-2 max-sm:row-start-1">
        <span className="size-2 shrink-0 rotate-45" style={{ background: DOT[item.category] }} aria-hidden="true" />
        {newsCategoryLabels[item.category]}
      </span>
      <p className="text-[16px] leading-snug max-sm:col-start-2">
        {item.link ? (
          <a href={item.link} target="_blank" rel="noopener noreferrer" className="group transition-colors hover:text-accent-ink">
            {item.title}
            <span aria-hidden="true" className="ml-1.5 font-mono text-[0.8em] text-marker-ink">
              ↗
            </span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          item.title
        )}
        {latest && <span className="kicker ml-3 whitespace-nowrap align-[0.15em] text-[10px] text-marker-ink">Latest</span>}
      </p>
    </li>
  );
}

/** Category filter over a year-grouped log of lab news. */
export default function NewsChronicle() {
  const [filter, setFilter] = useState<Filter>('all');
  const newest = labNews[0];
  const years = useMemo(() => {
    const shown = filter === 'all' ? labNews : labNews.filter((n) => n.category === filter);
    const byYear = new Map<number, NewsItem[]>();
    shown.forEach((n) => byYear.set(n.year, [...(byYear.get(n.year) ?? []), n]));
    return [...byYear.entries()].sort((a, b) => b[0] - a[0]);
  }, [filter]);
  const count = (f: Filter) => (f === 'all' ? labNews.length : labNews.filter((n) => n.category === f).length);

  return (
    <>
      <div className="sticky top-[66px] z-20 -mx-5 border-b border-line bg-bg/96 px-5 py-4 backdrop-blur-sm sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12 xl:top-[107px]">
        <div role="radiogroup" aria-label="News category" className="flex gap-[3px] overflow-x-auto rounded-lg border border-line bg-bg-raised p-[3px] [scrollbar-width:none] lg:w-fit [&::-webkit-scrollbar]:hidden">
          {(['all', ...ORDER] as Filter[]).map((f) => (
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
              {f !== 'all' && <span className="size-1.5 rotate-45" style={{ background: DOT[f] }} aria-hidden="true" />}
              {f === 'all' ? 'All' : newsCategoryLabels[f]}
              <span className={filter === f ? 'text-marker-ink' : 'text-ink-3'}>{count(f)}</span>
            </button>
          ))}
        </div>
      </div>

      <ol className="mt-10">
        {years.map(([year, items]) => (
          <li key={year} className="grid gap-2 border-t border-line-strong pt-6 pb-4 md:grid-cols-[150px_minmax(0,1fr)] md:gap-10">
            <h2 className="readout text-[2.5rem] leading-none md:sticky md:top-[227px] md:self-start lg:top-[167px] xl:top-[208px]">{year}</h2>
            <ul className="divide-y divide-line">
              {items.map((item) => (
                <NewsRow key={`${item.date}-${item.title}`} item={item} latest={item === newest} />
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </>
  );
}

import { newsCategoryLabels, type NewsCategory, type NewsItem } from '@/data/news';

const categoryTone: Record<NewsCategory, string> = {
  award: 'text-amber-700 dark:text-uci-gold',
  milestone: 'text-teal-700 dark:text-teal-300',
  publication: 'text-uci-blue dark:text-sky-300',
  conference: 'text-uci-blue dark:text-sky-300',
  defense: 'text-uci-blue dark:text-sky-300',
};

interface NewsPanelProps {
  items: NewsItem[];
  /** Under a year heading the year is already said, so the date column shows the month alone. */
  monthOnly?: boolean;
  className?: string;
}

/**
 * News items as rows of one glass panel: a date column, the headline, and the
 * category as a coloured dot with its name. Used by Home and the News page.
 */
export default function NewsPanel({ items, monthOnly = false, className = '' }: NewsPanelProps) {
  const columns = monthOnly
    ? 'grid-cols-[2.75rem_1fr] sm:grid-cols-[3rem_1fr_6.5rem]'
    : 'grid-cols-[4.75rem_1fr] sm:grid-cols-[5.5rem_1fr_6.5rem]';
  return (
    <ul className={`rounded-2xl glass-ios divide-y divide-panel-line ${className}`}>
      {items.map((item) => (
        <li
          key={`${item.date}-${item.title}`}
          className={`grid gap-x-4 px-5 py-4 sm:items-baseline sm:gap-x-6 sm:px-6 ${columns}`}
        >
          <span className="text-sm tabular-nums text-slate-500 dark:text-slate-400">
            {monthOnly ? item.date.split(' ')[0] : item.date}
          </span>
          {item.link ? (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[15px] font-medium leading-snug text-slate-900 underline decoration-slate-900/25 underline-offset-4 hover:text-uci-blue hover:decoration-current dark:text-slate-100 dark:decoration-white/25 dark:hover:text-sky-300"
            >
              {item.title}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            <p className="text-[15px] font-medium leading-snug text-slate-900 dark:text-slate-100">{item.title}</p>
          )}
          <span className={`col-start-2 mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium sm:col-start-3 sm:mt-0 ${categoryTone[item.category]}`}>
            <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
            {newsCategoryLabels[item.category]}
          </span>
        </li>
      ))}
    </ul>
  );
}

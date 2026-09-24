'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OPEN_SEARCH_EVENT, type OpenSearchDetail } from '@/lib/commandPalette';
import { buildSearchIndex, searchIndex, type SearchItem } from '@/lib/searchIndex';
import { navLinks } from '@/data/site';
import { rfTools, toolHref } from '@/data/rfTools';

const SUGGESTED_TOOLS = ['phased-array', 'microstrip', 'cascade-builder', 'fmcw', 's-parameters'];

function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));
}

function defaultItems(): SearchItem[] {
  const pages = navLinks.slice(1).map<SearchItem>((l) => ({
    id: `Pages:${l.href}`,
    group: 'Pages',
    title: l.name,
    meta: l.description,
    href: l.href,
    external: false,
    haystack: '',
    titleKey: '',
  }));
  const tools = SUGGESTED_TOOLS.map((id) => rfTools.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => !!t)
    .map<SearchItem>((t) => ({
      id: `RF Toolbox:${t.id}`,
      group: 'RF Toolbox',
      title: t.name,
      meta: t.summary,
      href: toolHref(t),
      external: false,
      haystack: '',
      titleKey: '',
    }));
  return [...tools, ...pages];
}

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const [index, setIndex] = useState<SearchItem[] | null>(null);

  const results = useMemo(() => {
    if (!query.trim()) return defaultItems();
    return index ? searchIndex(index, query) : [];
  }, [index, query]);

  const show = useCallback((prefill = '') => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    setIndex((current) => current ?? buildSearchIndex());
    setQuery(prefill);
    setActive(0);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    returnFocus.current?.focus?.();
  }, []);

  // Global shortcuts: Cmd/Ctrl+K toggles, "/" opens when not typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (open) close();
        else show();
      } else if (e.key === '/' && !open && !isTypingTarget(e.target)) {
        e.preventDefault();
        show();
      }
    };
    const onOpen = (e: Event) => show((e as CustomEvent<OpenSearchDetail>).detail?.query ?? '');
    window.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_SEARCH_EVENT, onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpen);
    };
  }, [open, show, close]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const go = useCallback(
    (entry: SearchItem | undefined) => {
      if (!entry) return;
      setOpen(false);
      if (entry.external) {
        window.open(entry.href, '_blank', 'noopener,noreferrer');
      } else {
        router.push(entry.href);
      }
    },
    [router],
  );

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(results[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'Tab') {
      // The dialog has one control; keep focus inside it.
      e.preventDefault();
    }
  };

  if (!open) return null;

  const activeId = results[active] ? `search-opt-${active}` : undefined;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[10vh]">
      <div className="enter-fade absolute inset-0 bg-overlay backdrop-blur-sm" onClick={close} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search the lab"
        className="enter-rise relative flex max-h-[76vh] w-full max-w-2xl flex-col overflow-hidden rounded-md border border-line-strong bg-surface shadow-[var(--shadow-pop)]"
      >
        <div className="flex items-center gap-3 border-b border-line px-5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-ink-3" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
            role="combobox"
            aria-expanded="true"
            aria-controls="search-results"
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            placeholder="Search tools, people, papers, chips…"
            className="h-16 w-full bg-transparent text-lg text-ink outline-none placeholder:text-ink-3"
          />
          <kbd className="shrink-0 rounded border border-line px-1.5 py-0.5 font-mono text-[10.5px] text-ink-3">esc</kbd>
        </div>

        <ul id="search-results" ref={listRef} role="listbox" aria-label="Results" className="overflow-y-auto py-2">
          {results.length === 0 && (
            <li className="px-5 py-10 text-center text-sm text-ink-3">
              Nothing matches “{query}”. Try a tool name, a frequency, or a person.
            </li>
          )}
          {results.map((entry, i) => {
            const header = i === 0 || results[i - 1].group !== entry.group ? entry.group : null;
            const selected = i === active;
            return (
              <li key={entry.id} role="presentation">
                {header && (
                  <p className="kicker px-5 pb-1.5 pt-3 text-[10.5px]" role="presentation">
                    {query.trim() ? header : header === 'RF Toolbox' ? 'Popular tools' : 'Jump to'}
                  </p>
                )}
                <div
                  id={`search-opt-${i}`}
                  role="option"
                  aria-selected={selected}
                  data-index={i}
                  onMouseMove={() => setActive(i)}
                  onClick={() => go(entry)}
                  className={`mx-2 flex cursor-pointer items-center justify-between gap-4 rounded px-3 py-2.5 ${selected ? 'bg-surface-2' : ''}`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] text-ink">{entry.title}</span>
                    <span className="block truncate font-mono text-[11px] text-ink-3 [font-stretch:87.5%]">{entry.meta}</span>
                  </span>
                  <span className={`shrink-0 font-mono text-xs ${selected ? 'text-marker-ink' : 'text-transparent'}`} aria-hidden="true">
                    {entry.external ? '↗' : '↵'}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-4 border-t border-line px-5 py-3 font-mono text-[10.5px] text-ink-3 [font-stretch:87.5%]">
          <span>↑ ↓ move</span>
          <span>↵ open</span>
          <span>esc close</span>
          <span className="ml-auto">Everything is searched in your browser</span>
        </div>
      </div>
    </div>
  );
}

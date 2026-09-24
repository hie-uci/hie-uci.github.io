// Site search for the command palette. Everything is static data, so the index
// is built once in the browser and searched synchronously; nothing leaves the page.

import { navLinks } from '@/data/site';
import { rfTools, rfCategories, toolHref } from '@/data/rfTools';
import { publications, publicationTypeLabels } from '@/data/publications';
import { director, phdStudents, undergradResearchers, phdAlumni, otherAlumni } from '@/data/team';
import { chips } from '@/data/chips';
import { labNews, newsCategoryLabels } from '@/data/news';
import { normalize } from './text';

export type SearchGroup = 'Pages' | 'RF Toolbox' | 'People' | 'Publications' | 'Chips' | 'News';

export const GROUP_ORDER: SearchGroup[] = ['Pages', 'RF Toolbox', 'People', 'Chips', 'Publications', 'News'];

export interface SearchItem {
  id: string;
  group: SearchGroup;
  title: string;
  /** One line under the title: venue, role, category. */
  meta: string;
  href: string;
  external: boolean;
  /** Lower-cased, accent-folded text the query is matched against. */
  haystack: string;
  /** Title only, normalized, for ranking. */
  titleKey: string;
}

export { normalize };

/** Anchor id for a person on /team; the team page uses the same function. */
export function personSlug(name: string): string {
  return normalize(name)
    .replace(/^prof\.?\s+/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function item(
  group: SearchGroup,
  id: string,
  title: string,
  meta: string,
  href: string,
  extra: string[] = [],
): SearchItem {
  return {
    id: `${group}:${id}`,
    group,
    title,
    meta,
    href,
    external: /^https?:\/\//.test(href),
    haystack: normalize([title, meta, ...extra].join(' ')),
    titleKey: normalize(title),
  };
}

export function buildSearchIndex(): SearchItem[] {
  const categoryName = new Map(rfCategories.map((c) => [c.id, c.name]));
  const people = [
    { name: director.name, role: director.title, extra: [director.expertise] },
    ...phdStudents.map((m) => ({ name: m.name, role: 'PhD Student', extra: [m.focus] })),
    ...undergradResearchers.map((m) => ({ name: m.name, role: 'Undergraduate Researcher', extra: [m.focus] })),
    ...phdAlumni.map((a) => ({ name: a.name, role: `Alumni · ${a.detail}`, extra: [a.now ?? ''] })),
    ...otherAlumni.map((a) => ({ name: a.name, role: `Alumni · ${a.detail}`, extra: [a.now ?? ''] })),
  ];

  return [
    ...navLinks.map((l) => item('Pages', l.href, l.name, l.description, l.href)),
    ...rfTools.map((t) =>
      item('RF Toolbox', t.id, t.name, categoryName.get(t.category) ?? '', toolHref(t), [t.summary, ...t.keywords]),
    ),
    ...people.map((p) => item('People', personSlug(p.name), p.name, p.role, `/team/#${personSlug(p.name)}`, p.extra)),
    ...chips.map((c) =>
      item('Chips', c.slug, c.name, `${c.technology} · ${c.category}`, `/chip-gallery/?chip=${c.slug}`, [c.frequency]),
    ),
    ...publications.map((p, i) =>
      item(
        'Publications',
        String(i),
        p.title,
        `${publicationTypeLabels[p.type]} · ${p.venue} · ${p.year}`,
        p.link ?? `/publications/?q=${encodeURIComponent(p.title.slice(0, 48))}`,
        [p.authors],
      ),
    ),
    ...labNews.map((n, i) => item('News', String(i), n.title, `${newsCategoryLabels[n.category]} · ${n.date}`, n.link ?? '/news/')),
  ];
}

/**
 * Every query token must appear somewhere in the item. Title hits outrank body
 * hits, and a title that starts with the token ranks highest.
 */
export function searchIndex(index: SearchItem[], query: string, perGroup = 6): SearchItem[] {
  const tokens = normalize(query).split(' ').filter(Boolean);
  if (tokens.length === 0) return [];

  const scored: { entry: SearchItem; score: number }[] = [];
  for (const entry of index) {
    let score = 0;
    let matchedAll = true;
    for (const token of tokens) {
      if (!entry.haystack.includes(token)) {
        matchedAll = false;
        break;
      }
      if (entry.titleKey.startsWith(token)) score += 30;
      else if (entry.titleKey.includes(` ${token}`)) score += 22;
      else if (entry.titleKey.includes(token)) score += 16;
      else score += 6;
    }
    if (matchedAll) scored.push({ entry, score });
  }

  scored.sort((a, b) => b.score - a.score || a.entry.title.length - b.entry.title.length);
  const counts = new Map<SearchGroup, number>();
  const kept: SearchItem[] = [];
  for (const { entry } of scored) {
    const n = counts.get(entry.group) ?? 0;
    if (n >= perGroup) continue;
    counts.set(entry.group, n + 1);
    kept.push(entry);
  }
  return GROUP_ORDER.flatMap((group) => kept.filter((entry) => entry.group === group));
}

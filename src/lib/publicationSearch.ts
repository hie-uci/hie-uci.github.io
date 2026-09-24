import { publicationTypeLabels, type Publication } from '@/data/publications';
import { words } from './text';

function publicationWords(p: Publication): string[] {
  return words(`${p.title} ${p.authors} ${p.venue} ${p.year} ${publicationTypeLabels[p.type]} ${p.highlight ?? ''}`);
}

/**
 * True when every query word begins some word of the entry, so "JSSC 2025"
 * finds IEEE JSSC papers from 2025 and "aps" does not match inside "gaps".
 */
export function matchesPublication(p: Publication, query: string): boolean {
  const wanted = words(query);
  if (!wanted.length) return true;
  const have = publicationWords(p);
  return wanted.every((w) => have.some((h) => h.startsWith(w)));
}

export function searchPublications(list: Publication[], query: string): Publication[] {
  return list.filter((p) => matchesPublication(p, query));
}

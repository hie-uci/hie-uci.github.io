import PageHero from '@/components/PageHero';
import PageWrapper from '@/components/PageWrapper';
import Shell from '@/components/Shell';
import PublicationBrowser from '@/components/publications/PublicationBrowser';
import { publications, type PubType } from '@/data/publications';
import { serializeJsonLd, SITE_URL } from '@/lib/metadata';

const publicationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'HIE Lab Publications',
  url: `${SITE_URL}/publications/`,
  itemListElement: publications
    .filter((p) => Boolean(p.link) && (p.type === 'journal' || p.type === 'conference'))
    .map((p, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'ScholarlyArticle',
        headline: p.title,
        datePublished: String(p.year),
        url: p.link,
        author: p.authors
          .replace(/,?\s+and\s+/g, ', ')
          .split(',')
          .map((name) => ({ '@type': 'Person', name: name.trim() })),
        isPartOf: { '@type': 'Periodical', name: p.venue },
      },
    })),
};

const TREND_YEARS = 7;
const latest = Math.max(...publications.map((p) => p.year));
const years = Array.from({ length: TREND_YEARS }, (_, i) => latest - TREND_YEARS + 1 + i);

/** Count per type, with a bar per year over the last seven years. */
function Counts() {
  const types: [PubType, string][] = [
    ['journal', 'Journals'],
    ['conference', 'Conferences'],
    ['patent', 'Patents'],
    ['talk', 'Talks'],
  ];
  const perYear = (t: PubType) => years.map((y) => publications.filter((p) => p.type === t && p.year === y).length);
  const peak = Math.max(1, ...types.flatMap(([t]) => perYear(t)));
  return (
    <div>
      <dl className="grid grid-cols-4 border-t border-line-strong">
        {types.map(([type, label]) => {
          const bars = perYear(type);
          return (
            <div key={type} className="flex flex-col gap-2 pt-3.5">
              <dt className="kicker order-3 text-[10px]">{label}</dt>
              <dd className="readout order-1 text-[2rem] leading-none">{publications.filter((p) => p.type === type).length}</dd>
              <svg viewBox={`0 0 ${TREND_YEARS * 6} 16`} className="order-2 h-4 w-12" aria-hidden="true">
                {bars.map((n, i) => (
                  <rect key={i} x={i * 6} y={16 - Math.max(1, (n / peak) * 16)} width={4} height={Math.max(1, (n / peak) * 16)} fill={n ? 'var(--trace)' : 'var(--line-strong)'} />
                ))}
              </svg>
            </div>
          );
        })}
      </dl>
      <p className="kicker mt-3 text-[10px]">
        Bars: {years[0]}–{latest}
      </p>
    </div>
  );
}

export default function PublicationsPage() {
  return (
    <PageWrapper>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(publicationJsonLd) }} />
      <PageHero trail="Publications" title="Publications" lede="Peer-reviewed research in mm-wave, THz electronics, and machine-learning-driven IC design." aside={<Counts />} />
      <Shell className="pb-24">
        <PublicationBrowser />
      </Shell>
    </PageWrapper>
  );
}

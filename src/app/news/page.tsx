import PageHero from '@/components/PageHero';
import PageWrapper from '@/components/PageWrapper';
import Shell from '@/components/Shell';
import NewsChronicle from '@/components/news/NewsChronicle';
import { labNews } from '@/data/news';

function Tally() {
  const counts = [
    ['Awards', labNews.filter((n) => n.category === 'award').length],
    ['Defenses', labNews.filter((n) => n.category === 'defense').length],
    ['Papers', labNews.filter((n) => n.category === 'publication').length],
  ] as const;
  return (
    <dl className="grid grid-cols-3 border-t border-line-strong">
      {counts.map(([label, n]) => (
        <div key={label} className="flex flex-col gap-1.5 pt-3.5">
          <dt className="kicker order-2 text-[10px]">{label}</dt>
          <dd className="readout order-1 text-[2rem] leading-none">{n}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function NewsPage() {
  return (
    <PageWrapper>
      <PageHero trail="News" title="News & Highlights" lede="Latest achievements, publications, and milestones from the HIE Lab." aside={<Tally />} />
      <Shell className="pb-24">
        <NewsChronicle />
      </Shell>
    </PageWrapper>
  );
}

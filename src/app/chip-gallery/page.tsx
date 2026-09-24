import PageHero from '@/components/PageHero';
import PageWrapper from '@/components/PageWrapper';
import Shell from '@/components/Shell';
import ChipGallery from '@/components/chips/ChipGallery';
import { chipCategories, chips } from '@/data/chips';

function Specs() {
  const counts = [
    ['Dies', chips.length],
    ['Families', chipCategories.length],
    ['Processes', new Set(chips.map((c) => c.technology)).size],
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

export default function ChipGalleryPage() {
  return (
    <PageWrapper>
      <PageHero trail="Chip Gallery" title="Chip Gallery" lede="High-resolution die photographs of integrated circuits designed and fabricated by the HIE Lab." aside={<Specs />} />
      <Shell className="pb-24">
        <ChipGallery />
      </Shell>
    </PageWrapper>
  );
}

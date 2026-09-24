import PageHero from '@/components/PageHero';
import PageWrapper from '@/components/PageWrapper';
import Shell from '@/components/Shell';
import VideoFacade from '@/components/VideoFacade';
import { channel, tutorials, type Tutorial } from '@/data/tutorials';

function Channel() {
  return (
    <div className="border-t border-line-strong pt-4">
      <p className="text-[15px] font-semibold">{channel.name}</p>
      <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{channel.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a href={channel.subscribe} target="_blank" rel="noopener noreferrer" className="btn btn-marker min-h-10 px-4 text-[13px]">
          Subscribe to Channel
        </a>
        <a href={channel.visit} target="_blank" rel="noopener noreferrer" className="btn btn-ghost min-h-10 px-4 text-[13px]">
          Visit {channel.handle} <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  );
}

function TutorialSection({ tutorial, index }: { tutorial: Tutorial; index: number }) {
  const List = tutorial.steps ? 'ol' : 'ul';
  return (
    <section aria-labelledby={`tutorial-${index}`} className="grid gap-10 border-t border-line-strong pt-6 lg:grid-cols-12 lg:gap-14" data-reveal>
      <div className="lg:col-span-5">
        <p className="kicker flex items-center gap-3.5">
          <span className="text-marker-ink">{String(index + 1).padStart(2, '0')}</span>
          <span>{tutorial.kind}</span>
        </p>
        <h2 id={`tutorial-${index}`} className="display-3 mt-4">
          {tutorial.title}
        </h2>
        <p className="mt-4 text-[15.5px] leading-relaxed text-ink-2">{tutorial.summary}</p>
        <h3 className="kicker mt-8 text-[10.5px]">{tutorial.listTitle}</h3>
        <List className="mt-3 border-t border-line">
          {tutorial.items.map((item, i) => (
            <li key={item.term} className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-2 border-b border-line py-3 text-[14.5px] leading-relaxed">
              <span className="pt-0.5 font-mono text-[11px] text-marker-ink [font-stretch:87.5%]" aria-hidden="true">
                {tutorial.steps ? String(i + 1).padStart(2, '0') : '—'}
              </span>
              <span>
                <strong className="font-semibold text-ink">{item.term}</strong> <span className="text-ink-2">{item.text}</span>
              </span>
            </li>
          ))}
        </List>
      </div>
      <div className="lg:col-span-7 lg:pt-10">
        <VideoFacade id={tutorial.video.id} title={tutorial.video.title} />
      </div>
    </section>
  );
}

export default function MeasurementTutorialPage() {
  return (
    <PageWrapper>
      <PageHero trail="Tutorials" title="Measurement Tutorials" lede="Educational guides for VNA calibration, active circuit measurements, radar demos, and EDA workflows." aside={<Channel />} />
      <Shell className="flex flex-col gap-24 py-16 lg:py-24">
        {tutorials.map((t, i) => (
          <TutorialSection key={t.video.id} tutorial={t} index={i} />
        ))}
      </Shell>
    </PageWrapper>
  );
}

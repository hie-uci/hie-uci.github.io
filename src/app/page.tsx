import Link from 'next/link';
import Image from 'next/image';
import Shell from '@/components/Shell';
import SectionHead from '@/components/SectionHead';
import SpotlightCard from '@/components/SpotlightCard';
import ChipMarquee from '@/components/ChipMarquee';
import HeroSpectrum from '@/components/home/HeroSpectrum';
import { researchAreas, researchThemes } from '@/data/research';
import { publicationCounts } from '@/data/publications';
import { chips, siliconSpanGHz } from '@/data/chips';
import { phdStudents, undergradResearchers } from '@/data/team';
import { labNews, newsCategoryLabels, type NewsCategory } from '@/data/news';
import { formatFrequency } from '@/lib/spectrum';

const latestNews = labNews.slice(0, 6);

const venues = ['JSSC', 'ISSCC', 'NeurIPS', 'Nature Comm.', 'TMTT', 'RFIC'];
const moreVenues = ['ESSCIRC', 'TCAS', 'TCAD', 'Applied Physics Letters'];

const tutorials = [
  { title: '60 GHz Radar Antenna Pattern', id: 'GuXS8jPgpSQ' },
  { title: '24 GHz Radar Target Demo', id: 'jyqjmBx2frc' },
  { title: 'Wideband VCO Characterization', id: 'lKwzEgkpngI' },
  { title: 'HFSS Antenna PCB Integration', id: 'cpQM-97AvMA' },
];

const categoryTone: Record<NewsCategory, string> = {
  award: 'text-marker-ink',
  defense: 'text-trace-2',
  publication: 'text-accent-ink',
  conference: 'text-ink-2',
  milestone: 'text-ink-2',
};

function Stat({ value, label, detail, marker = false }: { value: number; label: string; detail: string; marker?: boolean }) {
  return (
    <div className="flex flex-col gap-2.5 bg-bg px-6 py-7">
      <span className={`text-[clamp(3.5rem,2.4rem+3vw,5.5rem)] font-extrabold leading-[0.9] tracking-[-0.045em] [font-stretch:112%] ${marker ? 'text-marker-ink' : ''}`}>
        {value}
      </span>
      <span className="text-[15px] font-semibold">{label}</span>
      <span className="kicker text-[10.5px] leading-relaxed">{detail}</span>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="dot-grid absolute inset-0" aria-hidden="true" />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-10 hidden h-[900px] w-[900px] text-trace opacity-[0.09] lg:block"
        viewBox="0 0 900 900"
        fill="none"
        stroke="currentColor"
      >
        {Array.from({ length: 13 }, (_, i) => (
          <circle key={`a${i}`} cx="420" cy="420" r={50 + i * 46} />
        ))}
        {Array.from({ length: 13 }, (_, i) => (
          <circle key={`b${i}`} cx="500" cy="420" r={50 + i * 46} />
        ))}
      </svg>
      <Shell className="relative pb-12 pt-[112px] sm:pt-[132px] xl:pt-[150px]">
        <HeroSpectrum />
      </Shell>
    </section>
  );
}

function About() {
  const papers = publicationCounts.journal + publicationCounts.conference;
  const researchers = phdStudents.length + undergradResearchers.length;
  return (
    <section className="py-24 lg:py-32">
      <Shell>
        <SectionHead
          index="01"
          label="About the lab"
          title="Designing the future of high-frequency electronics"
          intro="We design, implement, and test mm-wave and terahertz electronic circuits and systems, pushing the boundaries of what silicon can achieve."
        />
        <div className="hairline-grid mt-14 grid lg:grid-cols-12" data-reveal>
          <article className="group flex flex-col bg-bg lg:col-span-5">
            <div className="duotone aspect-[4/3] w-full lg:aspect-auto lg:h-[380px]">
              <Image src="/images/members/web/pi-aghasi.webp" alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="duotone-mono object-cover object-[center_22%]" />
              <Image src="/images/members/web/pi-aghasi.webp" alt="Hamidreza Aghasi" fill sizes="(min-width: 1024px) 40vw, 100vw" className="duotone-color object-cover object-[center_22%]" />
            </div>
            <div className="flex flex-1 flex-col gap-3.5 p-7 sm:p-8">
              <p className="kicker">Director</p>
              <h3 className="display-3">Hamidreza Aghasi</h3>
              <p className="text-[15px] text-ink-2">Associate Professor, EECS</p>
              <p className="mt-1 text-[17px] leading-relaxed text-ink-2">
                Building next-generation mm-wave and terahertz circuits that push silicon beyond its limits.
              </p>
              <p className="kicker text-[10.5px] leading-loose">Cornell PhD · NSF CAREER Award · IEEE Senior Member</p>
              <Link href="/team" className="link-arrow mt-auto pt-3">
                Meet the team <span className="arrow">→</span>
              </Link>
            </div>
          </article>
          <div className="grid grid-rows-[auto_1fr] gap-px bg-line lg:col-span-7">
            <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
              <Stat value={papers} label="Papers" detail={`${publicationCounts.journal} journal · ${publicationCounts.conference} conference`} />
              <Stat value={publicationCounts.talk} label="Invited talks" detail={`plus ${publicationCounts.patent} patents`} />
              <Stat value={chips.length} label="Fabricated chips" detail={`${formatFrequency(siliconSpanGHz[0])} to ${formatFrequency(siliconSpanGHz[1])}`} />
              <Stat value={researchers} label="Researchers" detail={`${phdStudents.length} PhD · ${undergradResearchers.length} undergraduate`} marker />
            </div>
            <div className="grid gap-px bg-line sm:grid-cols-2">
              {researchThemes.map((theme, i) => (
                <div key={theme.label} className="flex flex-col gap-2.5 bg-bg p-7">
                  <span className="font-mono text-[11px] text-marker-ink">{String.fromCharCode(65 + i)}</span>
                  <h3 className="text-xl font-semibold [font-stretch:106%]">{theme.label}</h3>
                  <p className="text-[15px] leading-relaxed text-ink-2">{theme.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Shell>
    </section>
  );
}

function Research() {
  return (
    <section className="border-t border-line bg-bg-raised py-24 lg:py-32">
      <Shell>
        <SectionHead index="02" label="Research" title="Five active thrusts" action={{ href: '/research', label: 'All research' }} />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-6">
          {researchAreas.map((area, i) => {
            const large = i < 2;
            return (
              <SpotlightCard
                key={area.title}
                as="article"
                className={`group flex flex-col overflow-hidden rounded-[4px] border border-line bg-bg transition-colors duration-300 hover:border-line-strong ${large ? 'lg:col-span-3' : 'lg:col-span-2'} ${i === 4 ? 'md:col-span-2 lg:col-span-2' : ''}`}
              >
                <div className={`relative overflow-hidden bg-surface-2 ${large ? 'aspect-[16/9]' : 'aspect-[16/10]'}`}>
                  <Image
                    src={area.image}
                    alt={area.imageAlt}
                    fill
                    sizes={large ? '(min-width: 1024px) 45vw, 100vw' : '(min-width: 1024px) 30vw, 100vw'}
                    className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.035]"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3.5 p-6 sm:p-7">
                  <div className="kicker flex justify-between gap-4 text-[10.5px]">
                    <span>
                      <span className="text-marker-ink">{String(area.projectId).padStart(2, '0')}</span> · {area.eyebrow}
                    </span>
                    <span className="text-ink-2 normal-case tracking-[0.06em]">{area.metric}</span>
                  </div>
                  <h3 className={`${large ? 'display-3' : 'text-[1.4rem] font-bold leading-tight tracking-[-0.02em] [font-stretch:104%]'}`}>{area.title}</h3>
                  <p className="text-[15px] leading-relaxed text-ink-2">{area.description}</p>
                  <Link
                    href={`/research#project-${area.projectId}`}
                    className="link-arrow mt-auto pt-2 text-sm after:absolute after:inset-0 after:content-['']"
                    aria-label={`Explore ${area.title}`}
                  >
                    Explore <span className="arrow">→</span>
                  </Link>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </Shell>
    </section>
  );
}

function Silicon() {
  return (
    <section id="fabricated-chips" className="border-t border-line py-24 lg:py-32">
      <Shell>
        <SectionHead
          index="03"
          label="Silicon"
          title="Our fabricated chips"
          action={{ href: '/chip-gallery', label: 'Full chip gallery' }}
        />
        <p className="lede mt-6 max-w-2xl">
          A selection of integrated circuits designed and fabricated by the HIE Lab, from mm-wave radars to THz transmitters.
        </p>
      </Shell>
      <div className="mt-12">
        <ChipMarquee />
      </div>
    </section>
  );
}

function Tutorials() {
  return (
    <section className="border-t border-line bg-bg-raised py-24 lg:py-32">
      <Shell>
        <SectionHead
          index="04"
          label="Resources"
          title="Measurements & design tutorials"
          action={{ href: '/measurement-tutorial', label: 'Watch all tutorials' }}
        />
        <p className="lede mt-6 max-w-2xl">
          Video guides covering VNA calibration, active circuit characterization, radar demos, and HFSS to PCB workflows.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tutorials.map((video, i) => (
            <Link key={video.id} href="/measurement-tutorial" className="group flex flex-col gap-4" data-reveal>
              <div className="relative aspect-video overflow-hidden rounded-[3px] border border-line bg-surface-2">
                <Image
                  src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw"
                  className="object-cover opacity-90 transition-[transform,opacity] duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04] group-hover:opacity-100"
                />
                <span className="absolute bottom-3 left-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(3,6,12,0.72)] text-white backdrop-blur" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 4.5v15l13-7.5z" />
                  </svg>
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[11px] text-ink-3">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[15px] font-semibold leading-snug transition-colors group-hover:text-accent-ink">{video.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </Shell>
    </section>
  );
}

function NewsAndVenues() {
  return (
    <section className="border-t border-line py-24 lg:py-32">
      <Shell className="grid gap-16 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <SectionHead index="05" label="News" action={{ href: '/news', label: 'All news' }} />
          <ul className="mt-6">
            {latestNews.map((item) => {
              const row = (
                <>
                  <span className="kicker text-[11px] normal-case tracking-[0.06em]">{item.date}</span>
                  <span className={`kicker text-[10.5px] ${categoryTone[item.category]}`}>{newsCategoryLabels[item.category]}</span>
                  <span className="text-[16px] leading-snug text-ink sm:text-[17px]">{item.title}</span>
                  <span className="hidden text-right font-mono text-ink-3 sm:block" aria-hidden="true">
                    {item.link ? '↗' : ''}
                  </span>
                </>
              );
              const cls = 'grid grid-cols-[88px_1fr] gap-x-4 gap-y-1.5 border-b border-line py-5 sm:grid-cols-[96px_118px_1fr_20px] sm:items-baseline';
              return (
                <li key={`${item.date}-${item.title}`} data-reveal>
                  {item.link ? (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className={`${cls} transition-colors hover:bg-surface-2/60`}>
                      {row}
                    </a>
                  ) : (
                    <div className={cls}>{row}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="lg:col-span-5">
          <SectionHead index="06" label="Published in" />
          <ul className="mt-6">
            {venues.map((venue) => (
              <li
                key={venue}
                className="border-b border-line py-2 text-[clamp(2rem,1.4rem+1.6vw,2.9rem)] font-bold leading-[1.1] tracking-[-0.02em] [font-stretch:118%]"
                data-reveal
              >
                {venue}
              </li>
            ))}
            <li className="border-b border-line py-3 text-lg text-ink-2 [font-stretch:110%]" data-reveal>
              {moreVenues.join(' · ')}
            </li>
          </ul>
          <p className="kicker mt-6 leading-loose">
            {publicationCounts.journal} journal · {publicationCounts.conference} conference · {publicationCounts.talk} invited talks · {publicationCounts.patent} patents
          </p>
          <Link href="/publications" className="link-arrow mt-6">
            Browse all publications <span className="arrow">→</span>
          </Link>
        </div>
      </Shell>
    </section>
  );
}

function Join() {
  return (
    <section className="dark border-t border-line bg-bg text-ink">
      <Shell className="grid gap-12 py-24 lg:grid-cols-12 lg:items-end lg:py-32">
        <div className="lg:col-span-8">
          <p className="kicker flex items-center gap-3.5">
            <span className="block h-0.5 w-7 bg-marker" aria-hidden="true" />
            Open positions
          </p>
          <h2 className="display-1 mt-6">
            Join the HIE <span className="accent-serif">Lab</span>
          </h2>
          <p className="lede mt-7 max-w-2xl">
            We are looking for passionate and talented researchers at all levels — PhD students, MS students, and undergraduate researchers — to push the boundaries of high-speed electronics.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
          <Link href="/available-positions" className="btn btn-marker">
            View Open Positions <span className="font-mono" aria-hidden="true">→</span>
          </Link>
          <Link href="/contact" className="btn btn-ghost">
            Contact Us
          </Link>
        </div>
      </Shell>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="bg-bg text-ink">
      <Hero />
      <About />
      <Research />
      <Silicon />
      <Tutorials />
      <NewsAndVenues />
      <Join />
    </main>
  );
}

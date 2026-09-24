import Image from 'next/image';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import PageWrapper from '@/components/PageWrapper';
import Shell from '@/components/Shell';
import FigureGallery from '@/components/research/FigureGallery';
import ResearchRail from '@/components/research/ResearchRail';
import { publications } from '@/data/publications';
import { researchAreas } from '@/data/research';
import { researchProjects, type ResearchProject } from '@/data/researchProjects';
import { searchPublications } from '@/lib/publicationSearch';
import { figureSize, isLeadVisual } from '@/lib/researchFigures';

const areaFor = (project: ResearchProject) => researchAreas.find((a) => a.projectId === project.id);

const railItems = researchProjects.map((p) => ({ id: `project-${p.id}`, label: areaFor(p)?.title ?? p.title }));

/** A tag links to a filtered publication list only when that filter finds something. */
function publicationHref(tag: string): string {
  return searchPublications(publications, tag).length > 0 ? `/publications/?q=${encodeURIComponent(tag)}` : '/publications/';
}

function Glance() {
  const figures = researchProjects.reduce((n, p) => n + p.galleryImages.length, 0);
  const years = researchProjects.flatMap((p) => p.publications.map((t) => Number(/\d{4}/.exec(t)?.[0]))).filter(Number.isFinite);
  const counts = [
    ['Thrusts', String(researchProjects.length)],
    ['Figures', String(figures)],
    ['Published', `${Math.min(...years)}–${String(Math.max(...years)).slice(2)}`],
  ] as const;
  return (
    <dl className="grid grid-cols-3 border-t border-line-strong">
      {counts.map(([label, value]) => (
        <div key={label} className="flex flex-col gap-1.5 pt-3.5">
          <dt className="kicker order-2 text-[10px]">{label}</dt>
          <dd className="readout order-1 text-[2rem] leading-none">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ProjectFacts({ project }: { project: ResearchProject }) {
  return (
    <aside className="lg:col-span-5 lg:pl-4">
      <h3 className="kicker text-[10.5px]">Applications</h3>
      <ul className="mt-3 border-t border-line">
        {project.applications.map((a) => (
          <li key={a} className="border-b border-line py-2.5 text-[15px]">
            {a}
          </li>
        ))}
      </ul>
      <h3 className="kicker mt-9 text-[10.5px]">Related publications</h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {project.publications.map((tag) => (
          <li key={tag}>
            <Link
              href={publicationHref(tag)}
              className="inline-flex items-center rounded-[3px] border border-line-strong px-2.5 py-1.5 font-mono text-[11.5px] text-ink-2 transition-colors [font-stretch:87.5%] hover:border-accent-ink hover:text-ink"
            >
              {tag}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function ProjectSection({ project, index }: { project: ResearchProject; index: number }) {
  const area = areaFor(project);
  const lead = area && isLeadVisual(area.image) ? area : undefined;
  const gallery = project.galleryImages.filter((g) => g.src !== lead?.image);
  const [w, h] = lead ? figureSize(lead.image) : [0, 0];
  const titleId = `project-${project.id}-title`;

  return (
    <section id={`project-${project.id}`} aria-labelledby={titleId} className="scroll-mt-32 border-t border-line-strong pt-6" data-reveal>
      <p className="kicker flex items-center gap-3.5">
        <span className="text-marker-ink">{String(index + 1).padStart(2, '0')}</span>
        <span>{area?.eyebrow ?? 'Research thrust'}</span>
        {area && <span className="ml-auto hidden text-ink-2 sm:inline">{area.metric}</span>}
      </p>
      <h2 id={titleId} className="mt-6 max-w-[24ch] text-[clamp(1.9rem,1.2rem+2vw,3.25rem)] font-[720] leading-[1.03] tracking-[-0.03em] [font-stretch:108%]">
        {project.title}
      </h2>
      <p className="accent-serif mt-4 text-[clamp(1.25rem,1.1rem+0.6vw,1.6rem)] leading-snug text-ink-2">{project.tagline}</p>

      {lead && (
        <figure className="mt-10 overflow-hidden rounded-[4px] border border-line bg-bg-raised">
          <Image src={lead.image} alt={lead.imageAlt} width={w} height={h} sizes="(min-width: 1280px) 68vw, 100vw" className="h-auto w-full" priority={index === 0} />
        </figure>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="space-y-5 text-[16.5px] leading-[1.75] text-ink-2 lg:col-span-7">
          {project.description.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>
        <ProjectFacts project={project} />
      </div>

      {gallery.length > 0 && (
        <div className="mt-12">
          <h3 className="kicker mb-4 text-[10.5px]">Figures</h3>
          <FigureGallery figures={gallery} project={project.id} projectTitle={project.title} />
        </div>
      )}
    </section>
  );
}

export default function ResearchPage() {
  return (
    <PageWrapper>
      <PageHero trail="Research" title="Research Projects" lede="Five interconnected research thrusts advancing the frontiers of mm-wave, THz, and AI-driven electronics." aside={<Glance />} />

      <Shell className="py-16 lg:py-24">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-16">
          <div className="hidden lg:block">
            <ResearchRail items={railItems} />
          </div>
          <div className="flex min-w-0 flex-col gap-28 lg:gap-36">
            {researchProjects.map((p, i) => (
              <ProjectSection key={p.id} project={p} index={i} />
            ))}
          </div>
        </div>

        <section className="mt-28 grid gap-8 border-t border-line-strong pt-8 lg:mt-36 lg:grid-cols-12" data-reveal>
          <div className="lg:col-span-7">
            <h2 className="display-2">Interested in Collaboration?</h2>
            <p className="lede mt-5 max-w-xl">We welcome research collaborations from academia and industry. If our work aligns with your interests, let&apos;s connect.</p>
          </div>
          <div className="flex flex-wrap items-end gap-3 lg:col-span-5 lg:justify-end">
            <Link href="/publications/" className="btn btn-primary">
              View Publications <span aria-hidden="true">→</span>
            </Link>
            <Link href="/contact/" className="btn btn-ghost">
              Contact Us
            </Link>
          </div>
        </section>
      </Shell>
    </PageWrapper>
  );
}

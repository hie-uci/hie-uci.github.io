import Link from 'next/link';
import PageHero from '@/components/PageHero';
import PageWrapper from '@/components/PageWrapper';
import Shell from '@/components/Shell';
import { contact } from '@/data/site';

interface Position {
  title: string;
  status: string;
  text: string;
  backgrounds: string[];
  materials: string[];
  emailSubject: string;
  applicationLink?: string;
}

const positions: Position[] = [
  {
    title: 'Postdoctoral Scholars',
    status: 'Actively recruiting',
    text: 'We welcome postdoctoral candidates whose research experience aligns with the laboratory’s high-frequency circuits, devices, and systems programs.',
    backgrounds: ['RF/mm-wave circuit design', 'Microwave theory', 'Solid-state device physics', 'Nonlinear dynamics'],
    materials: ['Cover letter', 'Curriculum vitae', 'Research statement', 'Contact information for 2–3 references'],
    emailSubject: 'HIE Lab postdoctoral scholar inquiry',
  },
  {
    title: 'Graduate Students',
    status: 'Prospective students welcome',
    text: 'Prospective M.S. and Ph.D. students should complete the official UCI graduate application and may also email the lab to introduce their interests and preparation.',
    backgrounds: ['Analog and RF circuit design', 'Microwave engineering', 'Electromagnetics and antennas', 'AI-assisted hardware design'],
    materials: ['Curriculum vitae', 'Unofficial transcripts', 'Brief summary of research interests'],
    emailSubject: 'Prospective HIE Lab graduate student',
    applicationLink: 'https://grad.uci.edu/admissions/applying-to-uci/',
  },
  {
    title: 'Undergraduate Researchers',
    status: 'UCI students welcome',
    text: 'UCI undergraduates interested in mm-wave circuits and related hardware research may contact the lab to discuss preparation and potential projects.',
    backgrounds: ['Circuit analysis and electronics', 'Signals and systems', 'Electromagnetics', 'Programming or numerical methods'],
    materials: ['Unofficial transcript', 'Short summary of research interests', 'Relevant coursework or project experience'],
    emailSubject: 'HIE Lab undergraduate research inquiry',
  },
];

function List({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <h3 className="kicker text-[10.5px]">{label}</h3>
      <ul className="mt-3 border-t border-line">
        {items.map((item) => (
          <li key={item} className="border-b border-line py-2.5 text-[15px]">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PositionSection({ position, index }: { position: Position; index: number }) {
  return (
    <section aria-labelledby={`position-${index}`} className="grid gap-8 border-t border-line-strong pt-6 lg:grid-cols-12 lg:gap-12" data-reveal>
      <div className="lg:col-span-4">
        <p className="kicker flex items-center gap-3.5">
          <span className="text-marker-ink">{String(index + 1).padStart(2, '0')}</span>
          <span className="text-marker-ink">{position.status}</span>
        </p>
        <h2 id={`position-${index}`} className="display-3 mt-4">
          {position.title}
        </h2>
      </div>
      <div className="lg:col-span-8">
        <p className="lede max-w-2xl">{position.text}</p>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <List label="Relevant backgrounds" items={position.backgrounds} />
          <List label="What to send" items={position.materials} />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={`mailto:${contact.email}?subject=${encodeURIComponent(position.emailSubject)}`} className="btn btn-primary">
            Email the lab <span aria-hidden="true">→</span>
          </a>
          {position.applicationLink && (
            <a href={position.applicationLink} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              UCI graduate application <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

export default function AvailablePositionsPage() {
  return (
    <PageWrapper>
      <PageHero
        trail="Positions"
        title="Available Positions"
        lede="Our laboratory always welcomes motivated and enthusiastic new members!"
        aside={<p className="kicker border-t border-line-strong pt-3.5 text-[10.5px]">Application information updated July 2026</p>}
      />
      <Shell className="flex flex-col gap-20 py-16 lg:gap-24 lg:py-24">
        <p className="max-w-3xl text-[clamp(1.25rem,1.1rem+0.5vw,1.5rem)] leading-relaxed text-ink-2">
          The HIE Lab at UC Irvine welcomes inquiries from motivated postdoctoral scholars, graduate students, and undergraduate researchers interested in advancing high-speed integrated electronics.
        </p>

        {positions.map((position, i) => (
          <PositionSection key={position.title} position={position} index={i} />
        ))}

        <section className="grid gap-8 border-t border-line-strong pt-8 lg:grid-cols-12" data-reveal>
          <div className="lg:col-span-7">
            <h2 className="display-2">Interested?</h2>
            <p className="lede mt-5">Reach out to Prof. Hamidreza Aghasi to discuss opportunities.</p>
          </div>
          <div className="flex flex-wrap items-end gap-3 lg:col-span-5 lg:justify-end">
            <a href={`mailto:${contact.email}`} className="btn btn-marker">
              Email {contact.email}
            </a>
            <Link href="/contact/" className="btn btn-ghost">
              Contact Page
            </Link>
          </div>
        </section>
      </Shell>
    </PageWrapper>
  );
}

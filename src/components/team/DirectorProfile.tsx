import type { ReactNode } from 'react';
import { director } from '@/data/team';
import Portrait from './Portrait';

interface Dated {
  what: string;
  when: string;
}

/** "Postdoctoral Fellow, University of Michigan (2017–2018)" splits into the entry and its date. */
function splitDate(entry: string): Dated {
  const match = /^(.*\S)\s*\(([^()]+)\)$/.exec(entry);
  return match ? { what: match[1], when: match[2] } : { what: entry, when: '' };
}

const firstYear = (when: string) => Number(/\d{4}/.exec(when)?.[0] ?? 0);

function CvBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-t border-line py-5">
      <h3 className="kicker text-[10.5px]">{label}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

/** CV rows with the date set right in mono, like a printed vita. `highlight` marks the newest. */
function DatedRows({ rows, highlight = false }: { rows: Dated[]; highlight?: boolean }) {
  return (
    <ul>
      {rows.map((row, i) => (
        <li key={row.what} className="flex items-baseline justify-between gap-5 border-b border-line/70 py-2 text-[15px] leading-snug last:border-b-0">
          <span>{row.what}</span>
          {row.when && <span className={`shrink-0 font-mono text-[12px] [font-stretch:87.5%] ${highlight && i === 0 ? 'text-marker-ink' : 'text-ink-3'}`}>{row.when}</span>}
        </li>
      ))}
    </ul>
  );
}

/** The director's vita: portrait, contact, and the CV set as two hairline columns. */
export default function DirectorProfile() {
  const name = director.name.replace(/^Prof\.\s*/, '');
  const education = director.education.split(/;\s*/).map(splitDate);
  const awards = director.achievements.map(splitDate).sort((a, b) => firstYear(b.when) - firstYear(a.when));
  const tel = `+1${director.phone.replace(/\D/g, '')}`;

  return (
    <section id="hamidreza-aghasi" aria-labelledby="director-name" className="grid scroll-mt-8 gap-10 lg:grid-cols-12 lg:gap-16" data-reveal>
      <figure className="group lg:col-span-5">
        <Portrait image={director.image} name={name} position="center 18%" sizes="(min-width: 1024px) 36vw, 100vw" className="aspect-[4/5] w-full" priority />
        <figcaption className="kicker mt-3 flex justify-between gap-4 text-[10.5px]">
          <span>Director</span>
          <span>EECS · UC Irvine</span>
        </figcaption>
      </figure>

      <div className="lg:col-span-7">
        <p className="kicker text-marker-ink">Director</p>
        <h2 id="director-name" className="display-2 mt-4">
          {name}
        </h2>
        <p className="mt-3 text-[18px] text-ink-2">{director.title}</p>
        <p className="mt-5 flex flex-wrap gap-x-7 gap-y-2 font-mono text-[13px] [font-stretch:87.5%]">
          <a href={`mailto:${director.email}`} className="link-inline">
            {director.email}
          </a>
          <a href={`tel:${tel}`} className="text-ink-2 transition-colors hover:text-ink">
            {director.phone}
          </a>
        </p>

        <div className="mt-10 grid gap-x-12 md:grid-cols-2">
          <div>
            <CvBlock label="Education">
              <DatedRows rows={education} />
            </CvBlock>
            <CvBlock label="Research focus">
              <p className="text-[15px] leading-relaxed">{director.expertise}</p>
            </CvBlock>
            <CvBlock label="Experience">
              <DatedRows rows={director.experience.map(splitDate)} />
            </CvBlock>
          </div>
          <div>
            <CvBlock label="Awards & honors">
              <DatedRows rows={awards} highlight />
            </CvBlock>
            <CvBlock label="Professional service">
              <DatedRows rows={director.service.map(splitDate)} />
            </CvBlock>
            <CvBlock label="Memberships">
              <ul className="flex flex-col gap-1.5 text-[15px]">
                {director.memberships.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </CvBlock>
          </div>
        </div>
      </div>
    </section>
  );
}

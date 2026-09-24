import Link from 'next/link';
import PageHero from '@/components/PageHero';
import PageWrapper from '@/components/PageWrapper';
import SectionHead from '@/components/SectionHead';
import Shell from '@/components/Shell';
import DirectorProfile from '@/components/team/DirectorProfile';
import { AlumniTable, AlumnusRow, ResearcherCard } from '@/components/team/Roster';
import { director, otherAlumni, phdAlumni, phdStudents, undergradResearchers } from '@/data/team';
import { serializeJsonLd, SITE_URL } from '@/lib/metadata';

const directorJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${SITE_URL}/team/#hamidreza-aghasi`,
  name: 'Hamidreza Aghasi',
  honorificPrefix: 'Prof.',
  image: `${SITE_URL}${director.image}`,
  jobTitle: director.title,
  email: director.email,
  telephone: director.phone,
  url: `${SITE_URL}/team/`,
  affiliation: {
    '@type': 'CollegeOrUniversity',
    name: 'University of California, Irvine',
    url: 'https://uci.edu',
  },
  memberOf: {
    '@id': `${SITE_URL}/#organization`,
  },
  knowsAbout: ['Millimeter-wave integrated circuits', 'Terahertz electronics', 'Radar systems', 'AI-driven circuit design'],
};

function Counts() {
  const counts = [
    ['Director', 1],
    ['PhD', phdStudents.length],
    ['Undergrad', undergradResearchers.length],
    ['Alumni', phdAlumni.length + otherAlumni.length],
  ] as const;
  return (
    <dl className="grid grid-cols-4 border-t border-line-strong">
      {counts.map(([label, n]) => (
        <div key={label} className="flex flex-col gap-1.5 pt-3.5">
          <dt className="kicker order-2 text-[10px]">{label}</dt>
          <dd className="readout order-1 text-[2rem] leading-none">{n}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Numbered label for the smaller sections, where a display title would shout. */
function SubHead({ index, id, children }: { index: string; id: string; children: string }) {
  return (
    <div className="border-t border-line-strong pt-5">
      <h2 id={id} className="kicker flex items-center gap-3.5">
        <span className="text-marker-ink">{index}</span>
        <span>{children}</span>
      </h2>
    </div>
  );
}

export default function TeamPage() {
  return (
    <PageWrapper>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(directorJsonLd) }} />
      <PageHero trail="Team" title="Our Team" lede="Meet the researchers driving innovation in high-frequency integrated electronics at UCI." aside={<Counts />} />

      <Shell className="flex flex-col gap-24 py-16 lg:gap-32 lg:py-24">
        <DirectorProfile />

        <section aria-labelledby="phd-heading">
          <SectionHead index="01" label="PhD students" title="Doctoral researchers" intro="Current doctoral researchers advancing the frontiers of integrated electronics." id="phd-heading" />
          <div className="mt-10 grid gap-px overflow-hidden rounded-[4px] border border-line bg-line md:grid-cols-2" data-reveal>
            {phdStudents.map((m, i) => (
              <ResearcherCard key={m.name} member={m} index={i} role="PhD student" />
            ))}
          </div>
        </section>

        <div className="grid gap-20 lg:grid-cols-12 lg:gap-16">
          <div className="flex flex-col gap-16 lg:col-span-5">
            <section aria-labelledby="undergrad-heading" data-reveal>
              <SubHead index="02" id="undergrad-heading">
                Undergraduate researchers
              </SubHead>
              <div className="mt-6 overflow-hidden rounded-[4px] border border-line">
                {undergradResearchers.map((m, i) => (
                  <ResearcherCard key={m.name} member={m} index={i} role="Undergraduate researcher" />
                ))}
              </div>
            </section>

            <section aria-labelledby="phd-alumni-heading" data-reveal>
              <SubHead index="03" id="phd-alumni-heading">
                PhD &amp; postdoc alumni
              </SubHead>
              <ul className="mt-4 divide-y divide-line">
                {phdAlumni.map((a) => (
                  <AlumnusRow key={a.name} alumnus={a} />
                ))}
              </ul>
            </section>
          </div>

          <section aria-labelledby="alumni-heading" className="lg:sticky lg:top-[132px] lg:col-span-7 lg:self-start" data-reveal>
            <SubHead index="04" id="alumni-heading">
              Other alumni
            </SubHead>
            <div className="mt-6 overflow-hidden rounded-[4px] border border-line bg-surface">
              <AlumniTable alumni={otherAlumni} />
            </div>
          </section>
        </div>

        <section className="flex flex-col gap-5 border-t border-line-strong pt-6 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="display-3">Interested in joining the lab?</p>
          <Link href="/available-positions/" className="link-arrow">
            See available positions <span className="arrow">→</span>
          </Link>
        </section>
      </Shell>
    </PageWrapper>
  );
}

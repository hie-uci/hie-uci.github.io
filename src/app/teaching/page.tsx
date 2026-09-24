import Image from 'next/image';
import PageHero from '@/components/PageHero';
import PageWrapper from '@/components/PageWrapper';
import Shell from '@/components/Shell';

interface Course {
  code: string;
  name: string;
  semesters: string;
  level: 'undergraduate' | 'graduate';
  note?: string;
}

const uciCourses: Course[] = [
  { code: 'EECS 70A', name: 'Network Analysis', semesters: 'Spring 2020–2025', level: 'undergraduate' },
  { code: 'EECS 270A', name: 'Advanced Analog Circuits', semesters: 'Fall 2020–2025', level: 'graduate' },
  { code: 'EECS 270AP', name: 'Advanced Analog Circuits M.Eng', semesters: 'Fall 2020', level: 'graduate' },
  { code: 'EECS 270E', name: 'mm-Wave and THz Circuits', semesters: 'Winter 2020–2025', level: 'graduate' },
  { code: 'EECS 298', name: 'mm-Wave and THz Circuits Special Topics', semesters: 'Fall 2019', level: 'graduate' },
];

const cornellCourses: Course[] = [{ code: 'ECE 5790', name: 'Advanced High-Speed and RF ICs', semesters: 'Spring 2014', level: 'graduate', note: 'Instructor' }];

const institutions = [
  { name: 'University of California, Irvine', role: 'Associate Professor, EECS Department', logo: '/images/teaching/uci-logo.png', logoAlt: 'UC Irvine logo', courses: uciCourses },
  { name: 'Cornell University', role: 'Instructor, ECE Department', logo: '/images/teaching/cornell-logo.png', logoAlt: 'Cornell University logo', courses: cornellCourses },
];

const allCourses = [...uciCourses, ...cornellCourses];
const firstYear = Math.min(...allCourses.map((c) => Number(/\d{4}/.exec(c.semesters)?.[0])));

function Summary() {
  const counts = [
    ['Courses', String(allCourses.length)],
    ['Graduate', String(allCourses.filter((c) => c.level === 'graduate').length)],
    ['Since', String(firstYear)],
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

/** A course register: code, title, level and terms, one row per course. */
function CourseTable({ courses }: { courses: Course[] }) {
  return (
    <table className="w-full border-collapse text-left">
      <thead className="max-md:sr-only">
        <tr className="kicker text-[10px]">
          <th scope="col" className="w-36 py-3 font-normal">
            Code
          </th>
          <th scope="col" className="py-3 font-normal">
            Course
          </th>
          <th scope="col" className="w-44 py-3 font-normal">
            Level
          </th>
          <th scope="col" className="w-48 py-3 text-right font-normal">
            Terms
          </th>
        </tr>
      </thead>
      <tbody>
        {courses.map((c) => (
          <tr key={c.code} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 border-t border-line py-4 md:table-row md:py-0">
            <td className="readout text-[14px] text-marker-ink md:py-4">{c.code}</td>
            <td className="col-span-2 row-start-2 text-[17px] font-semibold leading-snug md:py-4">{c.name}</td>
            <td className="kicker row-start-3 text-[10.5px] md:py-4">
              {c.level === 'graduate' ? 'Graduate' : 'Undergraduate'}
              {c.note && <span className="text-ink-2"> · {c.note}</span>}
            </td>
            <td className="col-start-2 row-start-1 text-right font-mono text-[12.5px] text-ink-2 [font-stretch:87.5%] md:py-4">{c.semesters}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function TeachingPage() {
  return (
    <PageWrapper>
      <PageHero trail="Teaching" title="Teaching" lede="Courses taught at UC Irvine and Cornell University." aside={<Summary />} />
      <Shell className="flex flex-col gap-20 py-16 lg:py-24">
        {institutions.map((inst, i) => (
          <section key={inst.name} aria-labelledby={`inst-${i}`} className="border-t border-line-strong pt-6" data-reveal>
            <div className="flex flex-wrap items-center gap-5">
              <span className="grid size-14 shrink-0 place-items-center rounded-[4px] bg-white p-2 ring-1 ring-line">
                <Image src={inst.logo} alt={inst.logoAlt} width={48} height={48} className="h-auto w-full object-contain" />
              </span>
              <div>
                <p className="kicker flex items-center gap-3.5">
                  <span className="text-marker-ink">{String(i + 1).padStart(2, '0')}</span>
                  <span>{inst.role}</span>
                </p>
                <h2 id={`inst-${i}`} className="display-3 mt-2">
                  {inst.name}
                </h2>
              </div>
            </div>
            <div className="mt-8">
              <CourseTable courses={inst.courses} />
            </div>
          </section>
        ))}
      </Shell>
    </PageWrapper>
  );
}

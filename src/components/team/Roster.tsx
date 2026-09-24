import type { Alumnus, Member } from '@/data/team';
import { personSlug } from '@/lib/searchIndex';
import Portrait from './Portrait';

/** "2020-2025" reads as a range: set it with an en dash. */
const range = (text: string) => text.replace(/(\d{4})-(\d{4})/, '$1–$2');

function ScholarLink({ href, name }: { href: string; name: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${name} on Google Scholar (opens in a new tab)`}
      className="group/link inline-flex items-center gap-2 font-mono text-[12px] text-ink transition-colors [font-stretch:87.5%] hover:text-accent-ink"
    >
      Google Scholar
      <span aria-hidden="true" className="text-marker-ink transition-transform duration-200 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5">
        ↗
      </span>
    </a>
  );
}

/**
 * One researcher on the masthead: a small duotone portrait (the sources are
 * 160–230 px wide, so they are never shown larger), name, focus and the full bio.
 * On phones the bio runs full width under the portrait row instead of in a narrow column.
 */
export function ResearcherCard({ member, index, role }: { member: Member; index: number; role: string }) {
  return (
    <article
      id={personSlug(member.name)}
      className="group relative grid scroll-mt-8 grid-cols-[88px_minmax(0,1fr)] content-start gap-x-5 gap-y-4 bg-surface p-5 sm:grid-cols-[148px_minmax(0,1fr)] sm:grid-rows-[auto_auto_1fr] sm:gap-x-7 sm:gap-y-3 sm:p-7"
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-trace transition-transform duration-500 ease-[var(--ease-signal)] group-focus-within:scale-x-100 group-hover:scale-x-100 group-target:scale-x-100 group-target:bg-marker"
      />
      <Portrait image={member.image} name={member.name} position={member.photoPosition} sizes="148px" className="aspect-[4/5] w-full self-start sm:row-span-3" />
      <div className="min-w-0 self-center sm:self-start">
        <p className="kicker flex items-center gap-3 text-[10.5px]">
          <span className="text-marker-ink">{String(index + 1).padStart(2, '0')}</span>
          <span>{role}</span>
        </p>
        <h3 className="mt-3 text-[1.3rem] font-bold leading-[1.15] tracking-[-0.015em] [font-stretch:106%]">{member.name}</h3>
        <p className="mt-2 text-[14px] font-semibold leading-snug text-accent-ink">{member.focus}</p>
      </div>
      <p className="col-span-2 text-[14px] leading-relaxed text-ink-2 sm:col-span-1 sm:col-start-2">{member.bio}</p>
      {member.scholar && (
        <p className="col-span-2 sm:col-span-1 sm:col-start-2 sm:self-end sm:pt-1">
          <ScholarLink href={member.scholar} name={member.name} />
        </p>
      )}
    </article>
  );
}

/** A PhD or postdoc alumnus: portrait, years, where they are now, and their bio. */
export function AlumnusRow({ alumnus }: { alumnus: Alumnus }) {
  return (
    <li id={personSlug(alumnus.name)} className="group grid scroll-mt-8 grid-cols-[76px_minmax(0,1fr)] gap-5 py-6 first:pt-2">
      <Portrait image={alumnus.image} name={alumnus.name} position={alumnus.photoPosition} sizes="76px" className="aspect-[4/5] w-full self-start" />
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h4 className="text-[18px] font-semibold leading-snug">{alumnus.name}</h4>
          <span className="font-mono text-[12px] text-ink-3 [font-stretch:87.5%]">{range(alumnus.detail)}</span>
        </div>
        {alumnus.now && <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-accent-ink [font-stretch:87.5%]">Now · {alumnus.now}</p>}
        {alumnus.bio && <p className="mt-2.5 text-[14px] leading-relaxed text-ink-2">{alumnus.bio}</p>}
        {alumnus.scholar && (
          <p className="mt-3">
            <ScholarLink href={alumnus.scholar} name={alumnus.name} />
          </p>
        )}
      </div>
    </li>
  );
}

/** Master's and undergraduate alumni as a register: name, degree, and where they went. */
export function AlumniTable({ alumni }: { alumni: Alumnus[] }) {
  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="kicker text-[10px]">
          <th scope="col" className="py-3 pl-5 font-normal">
            Name
          </th>
          <th scope="col" className="py-3 font-normal">
            Degree
          </th>
          <th scope="col" className="hidden py-3 pr-5 font-normal sm:table-cell">
            Now
          </th>
        </tr>
      </thead>
      <tbody>
        {alumni.map((a) => (
          <tr key={a.name} id={personSlug(a.name)} className="group scroll-mt-8 border-t border-line transition-colors hover:bg-surface-2/60 target:bg-marker/10">
            <td className="py-3 pl-5 pr-3">
              <span className="flex items-center gap-3.5">
                <Portrait image={a.image} name={a.name} position={a.photoPosition} sizes="36px" className="h-11 w-9 shrink-0" />
                <span className="flex min-w-0 flex-col">
                  <span className="text-[15px] font-semibold leading-snug">{a.name}</span>
                  {a.now && <span className="text-[13px] text-ink-2 sm:hidden">{a.now}</span>}
                </span>
              </span>
            </td>
            <td className="py-3 pr-3 align-middle font-mono text-[12px] text-ink-2 [font-stretch:87.5%]">{a.detail}</td>
            <td className="hidden py-3 pr-5 text-[14px] text-ink-2 sm:table-cell">{a.now ?? <span className="text-ink-3">—</span>}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

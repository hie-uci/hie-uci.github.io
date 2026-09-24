import Link from 'next/link';
import Image from 'next/image';
import SpectrumScale from '@/components/SpectrumScale';
import { contact, institutionLinks, PORTAL_URL } from '@/data/site';
import { chips, siliconSpanGHz } from '@/data/chips';
import { formatFrequency } from '@/lib/spectrum';

const columns: { title: string; links: { name: string; href: string; external?: boolean }[] }[] = [
  {
    title: 'The lab',
    links: [
      { name: 'Research', href: '/research' },
      { name: 'Publications', href: '/publications' },
      { name: 'Team', href: '/team' },
      { name: 'News', href: '/news' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'RF Toolbox', href: '/rf-toolbox' },
      { name: 'Measurements & Design', href: '/measurement-tutorial' },
      { name: 'Chip Gallery', href: '/chip-gallery' },
      { name: 'Teaching', href: '/teaching' },
    ],
  },
  {
    title: 'Join',
    links: [
      { name: 'Available Positions', href: '/available-positions' },
      { name: 'Contact', href: '/contact' },
      { name: 'Member Login', href: PORTAL_URL, external: true },
    ],
  },
];

/**
 * Always in the Dark Space scheme: the `dark` class re-scopes every token, so the
 * footer grounds the page in both themes.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="dark relative border-t border-line bg-bg text-ink" style={{ viewTransitionName: 'site-footer' }}>
      <div className="mx-auto max-w-[1600px] px-5 pb-10 pt-20 sm:px-8 lg:pt-28">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Image
              src="/images/logo/hie-logo-160.webp"
              alt="HIE Lab"
              width={160}
              height={147}
              className="mb-8 h-12 w-auto"
            />
            <p className="display-2 max-w-3xl">
              High-speed Integrated Electronics <span className="accent-serif text-ink-2">Laboratory</span>
            </p>
          </div>
          <address className="not-italic lg:col-span-4 lg:col-start-9 lg:pt-20">
            <p className="kicker mb-4">Contact</p>
            <p className="text-[15px] leading-relaxed text-ink-2">
              {contact.department}
              <br />
              {contact.university}
              <br />
              {contact.city}
            </p>
            <p className="mt-5 flex flex-col gap-1.5 font-mono text-[13px] [font-stretch:87.5%]">
              <a href={`mailto:${contact.email}`} className="link-inline w-fit">
                {contact.email}
              </a>
              <a href={contact.phoneHref} className="w-fit text-ink-2 hover:text-ink">
                {contact.phone}
              </a>
            </p>
          </address>
        </div>

        <div className="mt-20">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
            <p className="kicker">Our silicon</p>
            <p className="kicker normal-case tracking-[0.06em]">
              {chips.length} dies · {formatFrequency(siliconSpanGHz[0])} to {formatFrequency(siliconSpanGHz[1])}
            </p>
          </div>
          <SpectrumScale span={siliconSpanGHz} />
        </div>

        <div className="mt-16 grid grid-cols-2 gap-10 border-t border-line pt-12 sm:grid-cols-3 lg:grid-cols-12">
          {columns.map((column) => (
            <div key={column.title} className="lg:col-span-2">
              <p className="kicker mb-5">{column.title}</p>
              <ul className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.name}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[15px] text-ink-2 transition-colors hover:text-ink"
                      >
                        {link.name} <span className="font-mono text-ink-3" aria-hidden="true">↗</span>
                      </a>
                    ) : (
                      <Link href={link.href} className="text-[15px] text-ink-2 transition-colors hover:text-ink">
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="col-span-2 sm:col-span-3 lg:col-span-4 lg:col-start-9">
            <p className="kicker mb-5">Part of</p>
            <ul className="flex flex-col gap-3 text-[15px]">
              <li>
                <a href={institutionLinks.eecs} target="_blank" rel="noopener noreferrer" className="text-ink-2 transition-colors hover:text-ink">
                  Department of EECS <span className="font-mono text-ink-3" aria-hidden="true">↗</span>
                </a>
              </li>
              <li>
                <a href={institutionLinks.samueli} target="_blank" rel="noopener noreferrer" className="text-ink-2 transition-colors hover:text-ink">
                  Samueli School of Engineering <span className="font-mono text-ink-3" aria-hidden="true">↗</span>
                </a>
              </li>
              <li>
                <a href={institutionLinks.uci} target="_blank" rel="noopener noreferrer" className="text-ink-2 transition-colors hover:text-ink">
                  University of California, Irvine <span className="font-mono text-ink-3" aria-hidden="true">↗</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-line pt-6 font-mono text-[11px] text-ink-3 [font-stretch:87.5%] sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} HIE Lab, UC Irvine</p>
          <a href={institutionLinks.privacy} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}

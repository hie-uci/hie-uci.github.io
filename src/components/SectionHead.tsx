import type { ReactNode } from 'react';
import Link from 'next/link';

interface SectionHeadProps {
  /** Two-digit section number, e.g. "01". */
  index?: string;
  label: string;
  title?: ReactNode;
  /** Optional supporting paragraph set to the right of the title. */
  intro?: ReactNode;
  action?: { href: string; label: string; external?: boolean };
  as?: 'h2' | 'h3';
  id?: string;
  className?: string;
}

/**
 * Editorial section opening: a strong hairline, a numbered mono label, and a
 * left-aligned title. Replaces the old centred badge, title and gradient bar.
 */
export default function SectionHead({
  index,
  label,
  title,
  intro,
  action,
  as: Heading = 'h2',
  id,
  className = '',
}: SectionHeadProps) {
  return (
    <div className={`border-t border-line-strong pt-5 ${className}`} data-reveal>
      <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className={intro ? 'lg:col-span-7' : 'lg:col-span-9'}>
          <p className="kicker flex items-center gap-3.5">
            {index && <span className="text-marker-ink">{index}</span>}
            <span>{label}</span>
          </p>
          {title && (
            <Heading id={id} className="display-2 mt-5">
              {title}
            </Heading>
          )}
        </div>
        {intro && <div className="lede lg:col-span-5">{intro}</div>}
        {action && !intro && (
          <div className="lg:col-span-3 lg:justify-self-end">
            {action.external ? (
              <a href={action.href} target="_blank" rel="noopener noreferrer" className="link-arrow">
                {action.label} <span className="arrow">↗</span>
              </a>
            ) : (
              <Link href={action.href} className="link-arrow">
                {action.label} <span className="arrow">→</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

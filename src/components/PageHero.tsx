import type { ReactNode } from 'react';
import Link from 'next/link';
import Shell from '@/components/Shell';

interface PageHeroProps {
  /** Page name for the breadcrumb: HIE / <trail>. */
  trail: string;
  title: ReactNode;
  lede?: ReactNode;
  /** Right-hand column: counts, a search field, a note. */
  aside?: ReactNode;
  children?: ReactNode;
}

/** Subpage opening: breadcrumb kicker, a large left-aligned title, lede, and an aside. */
export default function PageHero({ trail, title, lede, aside, children }: PageHeroProps) {
  return (
    <header className="border-b border-line">
      <Shell className="pb-12 pt-14 sm:pt-20 lg:pb-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className={aside ? 'lg:col-span-8' : 'lg:col-span-10'}>
            <nav aria-label="Breadcrumb" className="kicker enter-fade flex items-center gap-2.5">
              <Link href="/" className="transition-colors hover:text-ink">
                HIE
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-ink" aria-current="page">
                {trail}
              </span>
            </nav>
            <h1 className="display-1 enter-rise mt-6">{title}</h1>
            {lede && <p className="lede enter-rise mt-7 max-w-2xl [animation-delay:80ms]">{lede}</p>}
          </div>
          {aside && <div className="enter-rise lg:col-span-4 [animation-delay:140ms]">{aside}</div>}
        </div>
        {children}
      </Shell>
    </header>
  );
}

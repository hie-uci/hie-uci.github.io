'use client';

import { useEffect, useState } from 'react';

interface RailItem {
  id: string;
  label: string;
}

/** Sticky contents for the five thrusts; the section nearest the reading line is marked. */
export default function ResearchRail({ items }: { items: RailItem[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const sections = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => el !== null);
    let frame = 0;
    // The active thrust is the last one whose top has crossed a reading line a third of the way down.
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.35;
      let current = sections[0]?.id;
      for (const section of sections) if (section.getBoundingClientRect().top <= line) current = section.id;
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, [items]);

  return (
    <nav aria-label="Research thrusts" className="sticky top-[132px]">
      <p className="kicker mb-4">Thrusts</p>
      <ol className="flex flex-col border-l border-line">
        {items.map((item, i) => {
          const current = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={current ? 'location' : undefined}
                className={`-ml-px flex gap-3 border-l-2 py-2.5 pl-4 text-[14px] leading-snug transition-colors ${current ? 'border-marker text-ink' : 'border-transparent text-ink-3 hover:text-ink'}`}
              >
                <span className="font-mono text-[11px] text-marker-ink [font-stretch:87.5%]">{String(i + 1).padStart(2, '0')}</span>
                <span>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

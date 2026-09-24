'use client';

import type { ElementType, PointerEvent, ReactNode } from 'react';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  id?: string;
}

/**
 * A card that carries a faint light under the pointer. The position is written
 * to CSS variables, so there is no React re-render per mouse move, and touch
 * input is ignored entirely.
 */
export default function SpotlightCard({ children, className = '', as: Tag = 'div', id }: SpotlightCardProps) {
  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  return (
    <Tag id={id} onPointerMove={onPointerMove} className={`spotlight ${className}`}>
      {children}
    </Tag>
  );
}

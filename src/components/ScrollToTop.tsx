'use client';

import { useEffect, useState } from 'react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 900);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0 })}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-6 right-6 z-40 inline-flex h-11 items-center gap-2 rounded-md border border-line-strong bg-surface/90 px-3.5 font-mono text-[11px] text-ink-2 backdrop-blur transition-[opacity,transform,border-color,color] duration-300 [font-stretch:87.5%] hover:border-ink-3 hover:text-ink ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <span aria-hidden="true">↑</span> Top
    </button>
  );
}

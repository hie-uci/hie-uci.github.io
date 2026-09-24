'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface LightboxItem {
  src: string;
  alt: string;
  title: string;
  meta?: string;
  /** Full-resolution original, linked for download or a new tab. */
  fullSrc?: string;
}

interface LightboxProps {
  items: LightboxItem[];
  /** Index of the open item, or null when closed. */
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

/**
 * Gallery lightbox for die photos: arrow keys step, Escape closes, a click on
 * the photo toggles a 2.4x magnifier that follows the pointer.
 */
export default function Lightbox({ items, index, onClose, onIndexChange }: LightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const [zoomFor, setZoomFor] = useState<number | null>(null);
  const [origin, setOrigin] = useState('50% 50%');
  const open = index !== null;
  const zoomed = open && zoomFor === index;

  const step = useCallback(
    (delta: number) => {
      if (index === null || items.length === 0) return;
      onIndexChange((index + delta + items.length) % items.length);
    },
    [index, items.length, onIndexChange],
  );

  // Opening and closing: focus into the dialog, lock page scroll, restore both after.
  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
      returnFocus.current?.focus?.();
    };
  }, [open]);

  // Keys re-bind whenever the index moves so the arrows always step from the current item.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, step]);

  if (!open || typeof document === 'undefined') return null;
  const item = items[index];
  if (!item) return null;

  const onPointerMove = (e: React.PointerEvent<HTMLImageElement>) => {
    if (!zoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
  };

  return createPortal(
    <div className="dark fixed inset-0 z-[95] flex flex-col text-ink" role="dialog" aria-modal="true" aria-label={item.title}>
      <div className="enter-fade absolute inset-0 bg-[rgba(3,6,12,0.94)] backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div className="relative flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <p className="kicker normal-case">
          {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
        </p>
        <div className="flex items-center gap-2">
          {item.fullSrc && (
            <a href={item.fullSrc} target="_blank" rel="noopener noreferrer" className="btn-icon px-3 font-mono text-[11px] [font-stretch:87.5%]">
              Original ↗
            </a>
          )}
          <button ref={closeRef} type="button" onClick={onClose} className="btn-icon" aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center gap-3 px-3 sm:px-6">
        {items.length > 1 && (
          <button type="button" onClick={() => step(-1)} className="btn-icon hidden shrink-0 bg-bg/60 font-mono sm:inline-flex" aria-label="Previous">
            ←
          </button>
        )}
        <div className="relative flex h-full max-h-[72vh] w-full max-w-6xl items-center justify-center overflow-hidden">
          {/* Full-resolution die photos: next/image would not add anything under a static export. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={item.src}
            src={item.src}
            alt={item.alt}
            onClick={() => setZoomFor(zoomed ? null : index)}
            onPointerMove={onPointerMove}
            className={`enter-fade max-h-[72vh] max-w-full select-none object-contain transition-transform duration-300 ease-[var(--ease-signal)] ${
              zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            style={{ transform: zoomed ? 'scale(2.4)' : 'none', transformOrigin: origin }}
            draggable={false}
          />
        </div>
        {items.length > 1 && (
          <button type="button" onClick={() => step(1)} className="btn-icon hidden shrink-0 bg-bg/60 font-mono sm:inline-flex" aria-label="Next">
            →
          </button>
        )}
      </div>

      <div className="relative flex items-end justify-between gap-6 px-5 pb-6 pt-4 sm:px-8">
        <div aria-live="polite">
          <p className="text-lg font-semibold [font-stretch:104%]">{item.title}</p>
          {item.meta && <p className="mt-1 font-mono text-[11px] text-ink-3 [font-stretch:87.5%]">{item.meta}</p>}
        </div>
        <div className="flex gap-2 sm:hidden">
          <button type="button" onClick={() => step(-1)} className="btn-icon font-mono" aria-label="Previous">
            ←
          </button>
          <button type="button" onClick={() => step(1)} className="btn-icon font-mono" aria-label="Next">
            →
          </button>
        </div>
        <p className="kicker hidden text-[10px] sm:block">Click the photo to magnify · ← → to browse</p>
      </div>
    </div>,
    document.body,
  );
}

"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Single toggle between Cleanroom (light) and Dark Space (dark). The icon shows
 * the theme you will switch to, and the label says so for screen readers.
 */
export default function ThemeSwitcher({ className = "" }: { className?: string }) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const { resolvedTheme, setTheme } = useTheme();

  // Reserve the space before hydration so the rail does not shift.
  if (!mounted) {
    return <span className={`inline-block h-8 w-8 ${className}`} aria-hidden="true" />;
  }

  const isDark = resolvedTheme !== "light";
  const next = isDark ? "light" : "dark";
  const label = isDark ? "Switch to Cleanroom light theme" : "Switch to Dark Space theme";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={label}
      title={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-line-strong text-ink-2 transition-colors hover:border-ink-3 hover:text-ink ${className}`}
    >
      {isDark ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}

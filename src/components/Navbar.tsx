'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useSpring } from 'framer-motion';
import { usePathname } from 'next/navigation';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import MotionToggle from '@/components/MotionToggle';
import { navLinks, PORTAL_URL, institutionLinks } from '@/data/site';
import { openCommandPalette, shortcutLabel } from '@/lib/commandPalette';

const noopSubscribe = () => () => {};

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function LockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname() ?? '/';
  const [scrolled, setScrolled] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  // The menu belongs to the page it was opened on; navigating closes it.
  const menuOpen = menuFor === pathname;
  const shortcut = useSyncExternalStore(noopSubscribe, shortcutLabel, () => '⌘K');

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuFor(null);
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  const solid = scrolled || menuOpen;

  return (
    <header
      className="fixed inset-x-0 top-0 z-50"
      style={{ viewTransitionName: 'site-header' }}
    >
      {/* Opaque when solid: the header's view-transition-name makes it a backdrop root,
          so a backdrop blur here would have nothing behind it to blur. */}
      <div
        className={`border-b transition-[background-color,border-color] duration-300 ${
          solid ? 'border-line bg-bg' : 'border-transparent bg-transparent'
        }`}
      >
        {/* Institutional rail: affiliation and utilities, off the navigation row. */}
        <div className="hidden border-b border-line xl:block">
          <div className="mx-auto flex h-10 max-w-[1600px] items-center justify-between px-8">
            <a
              href={institutionLinks.samueli}
              target="_blank"
              rel="noopener noreferrer"
              className="kicker text-[10.5px] transition-colors hover:text-ink"
            >
              UC Irvine <span className="px-1.5 text-marker-ink" aria-hidden="true">·</span> Samueli School of Engineering
            </a>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openCommandPalette()}
                className="inline-flex h-8 items-center gap-3 rounded-md border border-line-strong pl-3 pr-1 font-mono text-[11px] text-ink-2 transition-colors [font-stretch:87.5%] hover:border-ink-3 hover:text-ink"
              >
                <SearchIcon />
                Search the lab
                <kbd className="rounded bg-surface-2 px-1.5 py-0.5 text-[10.5px] text-ink-3">{shortcut}</kbd>
              </button>
              <MotionToggle />
              <ThemeSwitcher />
              <a
                href={PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-2 rounded-md bg-accent px-3 font-mono text-[11px] tracking-[0.08em] text-on-accent transition-colors [font-stretch:87.5%] hover:bg-accent-hover"
              >
                <LockIcon />
                MEMBER LOGIN
              </a>
            </div>
          </div>
        </div>

        {/* Primary bar: the lockup and the navigation, nothing competing. */}
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-6 px-5 sm:px-8">
          <Link href="/" aria-label="HIE Lab home" className="group flex shrink-0 items-center gap-3.5">
            <Image
              src="/images/logo/hie-logo-160.webp"
              alt=""
              width={160}
              height={147}
              priority
              className="h-10 w-auto"
            />
            <span className="hidden border-l border-line-strong pl-3.5 2xl:block">
              <span className="block text-[13px] font-bold leading-tight [font-stretch:112%]">HIE Lab</span>
              <span className="kicker block text-[9.5px] leading-tight">High-speed Integrated Electronics</span>
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center xl:flex">
            {navLinks.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative px-2.5 py-5 text-[13px] font-medium whitespace-nowrap transition-colors ${
                    active ? 'text-ink' : 'text-ink-2 hover:text-ink'
                  }`}
                >
                  {link.name}
                  {active && (
                    <motion.span
                      layoutId="nav-marker"
                      className="absolute inset-x-2.5 bottom-3.5 h-0.5 rounded-full bg-marker"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 xl:hidden">
            <button
              type="button"
              onClick={() => openCommandPalette()}
              aria-label="Search the lab"
              className="btn-icon h-11 w-11"
            >
              <SearchIcon />
            </button>
            <button
              type="button"
              onClick={() => setMenuFor(menuOpen ? null : pathname)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="btn-icon h-11 w-11"
            >
              <span className="relative block h-3 w-5" aria-hidden="true">
                <span className={`absolute left-0 top-0 h-px w-5 bg-ink transition-transform duration-300 ${menuOpen ? 'translate-y-1.5 rotate-45' : ''}`} />
                <span className={`absolute bottom-0 left-0 h-px w-5 bg-ink transition-transform duration-300 ${menuOpen ? '-translate-y-1.5 -rotate-45' : ''}`} />
              </span>
            </button>
          </div>
        </div>

        <motion.div
          aria-hidden="true"
          className="h-px origin-left bg-trace/70"
          style={{ scaleX: progress }}
        />
      </div>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="enter-fade fixed inset-x-0 bottom-0 top-16 overflow-y-auto border-t border-line bg-bg xl:hidden"
        >
          <nav aria-label="Mobile" className="mx-auto max-w-2xl px-5 pb-10 pt-4 sm:px-8">
            <ol className="divide-y divide-line">
              {navLinks.map((link, i) => {
                const active = isActive(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMenuFor(null)}
                      aria-current={active ? 'page' : undefined}
                      className="group flex items-baseline gap-5 py-4"
                    >
                      <span className={`font-mono text-[11px] [font-stretch:87.5%] ${active ? 'text-marker-ink' : 'text-ink-3'}`}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="flex flex-col gap-1">
                        <span className={`text-2xl font-bold tracking-[-0.02em] [font-stretch:110%] ${active ? 'text-ink' : 'text-ink-2 group-hover:text-ink'}`}>
                          {link.name}
                        </span>
                        <span className="text-sm text-ink-3">{link.description}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6">
              <a
                href={PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <LockIcon />
                Member Login
              </a>
              <MotionToggle />
              <ThemeSwitcher />
            </div>
            <a
              href={institutionLinks.samueli}
              target="_blank"
              rel="noopener noreferrer"
              className="kicker mt-6 block"
            >
              UC Irvine · Samueli School of Engineering
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Lock } from 'lucide-react';
import ThemeSwitcher from '@/components/ThemeSwitcher';

// The member portal is a separate application on its own domain, not a route of
// this static site. Sign-in is invitation-only; there is no public registration
// behind this link.
const PORTAL_URL = 'https://portal.ai4circuit.com';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Research', href: '/research' },
  { name: 'RF Toolbox', href: '/rf-toolbox' },
  { name: 'Measurements & Design', href: '/measurement-tutorial' },
  { name: 'Publications', href: '/publications' },
  { name: 'Team', href: '/team' },
  { name: 'Chip Gallery', href: '/chip-gallery' },
  { name: 'News', href: '/news' },
  { name: 'Teaching', href: '/teaching' },
  { name: 'Contact', href: '/contact' },
  { name: 'Positions', href: '/available-positions' },
];

// Two tiers. The rail is sized by its tallest child (the 40px theme control),
// not by eye: 44 + 64 = 108, and PageWrapper's lg:pt-28 clears it.
const RAIL_H = 44;
const BAR_H = 64;

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left"
        style={{ scaleX, background: 'linear-gradient(90deg, #0064a4, #ffd200, #528188)' }}
      />

      {/* glass-ios sets `position: relative`, and it collides with Tailwind's
          `fixed` at equal specificity -- whichever ships later in the stylesheet
          wins. It was winning, so the bar stopped being fixed the moment it
          gained the glass class and scrolled away for good. Keeping the two on
          separate elements removes the race instead of out-specifying it. */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
          isScrolled ? 'bg-white/90 dark:bg-[#0b1220]/93' : ''
        }`}
      >
        <div
          className={`transition-all duration-500 ${
            isScrolled ? 'glass-ios shadow-lg shadow-eng-blue/5 dark:shadow-none' : 'bg-transparent'
          }`}
        >
        {/* ---- Institutional rail. Affiliation and account live here, off the
             navigation row entirely. It recedes on scroll: the chrome goes, the
             navigation stays. ---- */}
        <div className="hidden border-b border-navy/10 bg-navy/[0.03] lg:block dark:border-white/10 dark:bg-white/[0.03]">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8"
               style={{ height: RAIL_H }}>
            <a
              href="https://engineering.uci.edu"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-navy/55 transition-colors hover:text-uci-blue dark:text-slate-400 dark:hover:text-blue-300"
            >
              <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-uci-blue text-[6px] font-bold leading-none text-white">
                UCI
              </span>
              UC Irvine
              <span className="text-uci-gold" aria-hidden="true">·</span>
              Samueli School of Engineering
            </a>

            <div className="flex items-center gap-2.5">
              <ThemeSwitcher />
              <a
                href={PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-uci-blue px-2.5 py-[3px] text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-uci-blue-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-uci-gold"
              >
                <Lock className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
                Member Login
              </a>
            </div>
          </div>
        </div>

        {/* ---- Primary bar: the logo and the navigation, nothing competing. ---- */}
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4" style={{ minHeight: BAR_H }}>
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="HIE Lab home"
              className="group flex shrink-0 items-center"
            >
              <Image
                src="/images/logo/hie-logo.png"
                alt="HIE Lab logo"
                width={1112}
                height={1020}
                className="h-10 w-auto object-contain transition-all duration-500 group-hover:opacity-90 lg:h-12 dark:saturate-150 dark:brightness-110 dark:drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]"
                priority
              />
            </Link>

            <div className="hidden items-center lg:flex">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={`relative px-2.5 py-2 text-[13px] font-medium whitespace-nowrap transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-uci-gold ${
                      active
                        ? 'text-uci-blue dark:text-blue-300'
                        : 'text-navy/70 hover:text-uci-blue dark:text-slate-300 dark:hover:text-blue-300'
                    }`}
                  >
                    {link.name}
                    {active && (
                      <motion.span
                        layoutId="activeNav"
                        className="absolute inset-x-2.5 -bottom-px h-[2px] rounded-full bg-uci-gold"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="flex shrink-0 items-center gap-3 lg:hidden">
              <ThemeSwitcher />
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                <div className="relative flex h-5 w-6 flex-col justify-between">
                  <span className={`h-0.5 w-full rounded-full bg-navy transition-all duration-300 dark:bg-gray-200 ${isMobileMenuOpen ? 'translate-y-[9px] rotate-45' : ''}`} />
                  <span className={`h-0.5 w-full rounded-full bg-navy transition-all duration-300 dark:bg-gray-200 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                  <span className={`h-0.5 w-full rounded-full bg-navy transition-all duration-300 dark:bg-gray-200 ${isMobileMenuOpen ? '-translate-y-[9px] -rotate-45' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-white/20 bg-white/90 shadow-xl backdrop-blur-2xl lg:hidden dark:border-white/5 dark:bg-slate-900/95"
            >
              <div className="space-y-1 px-4 py-4">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                        isActive(link.href)
                          ? 'border-l-2 border-uci-gold bg-uci-blue/10 text-uci-blue dark:text-blue-300'
                          : 'text-navy/70 hover:bg-uci-blue/5 hover:text-uci-blue dark:text-slate-300 dark:hover:text-blue-400'
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}

                <div className="mt-3 space-y-2 border-t border-gray-200 pt-3 dark:border-gray-700">
                  <a
                    href={PORTAL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg bg-uci-blue px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-uci-blue-dark"
                  >
                    <Lock className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Member Login
                  </a>
                  <a
                    href="https://engineering.uci.edu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-navy/55 dark:text-slate-400"
                  >
                    <span className="grid h-4 w-4 place-items-center rounded-full bg-uci-blue text-[7px] font-bold leading-none text-white">
                      UCI
                    </span>
                    UC Irvine · Samueli Engineering
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}

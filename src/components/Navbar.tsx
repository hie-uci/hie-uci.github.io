'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { usePathname } from 'next/navigation';
import ThemeSwitcher from '@/components/ThemeSwitcher';

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

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Scroll progress bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* SVG Filter for Logo Edge Clean-up in Dark Mode */}
      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }} aria-hidden="true">
        <filter id="clean-logo-edges">
          {/* Aggressive erosion to cut off the white halo */}
          <feMorphology operator="erode" radius="1.5" in="SourceGraphic" result="eroded" />
        </filter>
      </svg>

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] z-[60] origin-left"
        style={{
          scaleX,
          background: 'linear-gradient(90deg, #0064a4, #ffd200, #528188)',
        }}
      />

      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'glass-ios shadow-lg shadow-eng-blue/5 dark:shadow-none'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center group">
              <Image 
  src="/images/logo/hie-logo.png" 
  alt="HIE Lab logo" 
  width={240} 
  height={40} 
  className="h-10 sm:h-12 w-auto object-contain transition-all duration-500 group-hover:opacity-90 dark:saturate-150 dark:brightness-110 [filter:url(#clean-logo-edges)] dark:drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]" 
  priority
/>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive(link.href)
                      ? 'text-uci-blue bg-uci-blue/8'
                      : 'text-navy/70 dark:text-slate-300 hover:text-uci-blue dark:hover:text-blue-400 hover:bg-uci-blue/5'
                  }`}
                >
                  {link.name}
                  {/* Active indicator dot */}
                  {isActive(link.href) && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-gradient-to-r from-uci-blue to-uci-gold"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* UCI Badge & Theme */}
            <div className="hidden lg:flex items-center gap-4">
              <ThemeSwitcher />
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
              <a href="https://engineering.uci.edu" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-uci-blue/5 border border-uci-blue/10 dark:border-white/10 hover:bg-uci-blue/10 dark:hover:bg-white/5 transition-colors">
                <div className="w-5 h-5 rounded-full bg-uci-blue flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white">UCI</span>
                </div>
                <span className="text-xs font-medium text-uci-blue dark:text-blue-300">Engineering</span>
              </a>
            </div>

            {/* Mobile menu button & Theme */}
            <div className="lg:hidden flex items-center gap-3">
              <ThemeSwitcher />
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                <div className="w-6 h-5 relative flex flex-col justify-between">
                  <span
                    className={`w-full h-0.5 bg-navy dark:bg-gray-200 rounded-full transition-all duration-300 ${
                      isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                    }`}
                  />
                  <span
                    className={`w-full h-0.5 bg-navy dark:bg-gray-200 rounded-full transition-all duration-300 ${
                      isMobileMenuOpen ? 'opacity-0' : ''
                    }`}
                  />
                  <span
                    className={`w-full h-0.5 bg-navy dark:bg-gray-200 rounded-full transition-all duration-300 ${
                      isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden backdrop-blur-2xl bg-white/90 dark:bg-slate-900/95 border-t border-white/20 dark:border-white/5 shadow-xl"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive(link.href)
                          ? 'text-uci-blue bg-uci-blue/10 border-l-2 border-uci-blue'
                          : 'text-navy/70 dark:text-slate-300 hover:text-uci-blue dark:hover:text-blue-400 hover:bg-uci-blue/5'
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}

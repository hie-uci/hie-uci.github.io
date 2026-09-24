'use client';

import Link from 'next/link';

const quickLinks = [
  { name: 'Research', href: '/research' },
  { name: 'Publications', href: '/publications' },
  { name: 'Team', href: '/team' },
  { name: 'News', href: '/news' },
];

const moreLinks = [
  { name: 'Teaching', href: '/teaching' },
  { name: 'Chip Gallery', href: '/chip-gallery' },
  { name: 'Contact', href: '/contact' },
  { name: 'Available Positions', href: '/available-positions' },
];

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-eng-blue to-navy text-white overflow-hidden">
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-uci-blue via-uci-gold to-eecs-teal" />

      {/* Circuit pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="footer-circuit" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <circle cx="30" cy="30" r="1.5" fill="white" />
            <line x1="30" y1="0" x2="30" y2="28" stroke="white" strokeWidth="0.5" />
            <line x1="32" y1="30" x2="60" y2="30" stroke="white" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#footer-circuit)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Lab Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-uci-blue to-eecs-teal flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-base tracking-wider">HIE</span>
              </div>
              <div>
                <p className="font-bold text-white text-lg leading-tight">HIE Lab</p>
                <p className="text-xs text-white/60">UC Irvine</p>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed mb-4">
              High-speed Integrated Electronics Laboratory — Advancing mm-wave and terahertz circuit design for next-generation sensing, imaging, and communication systems.
            </p>
            <a href="https://engineering.uci.edu/dept/eecs" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-uci-gold/20 flex items-center justify-center">
                <span className="text-[8px] font-bold text-uci-gold">UCI</span>
              </div>
              <span className="text-xs text-white/50 hover:text-white/70 transition-colors">EECS Department</span>
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-uci-gold mb-4 tracking-wider uppercase">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-uci-gold transition-colors duration-200 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-eecs-teal" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More Links */}
          <div>
            <h3 className="text-sm font-semibold text-uci-gold mb-4 tracking-wider uppercase">
              More
            </h3>
            <ul className="space-y-2.5">
              {moreLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-uci-gold transition-colors duration-200 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-eecs-teal" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-uci-gold mb-4 tracking-wider uppercase">
              Contact
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-eecs-teal mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:haghasi@uci.edu" className="text-sm text-white/70 hover:text-uci-gold transition-colors">
                  haghasi@uci.edu
                </a>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-eecs-teal mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-sm text-white/70">(949) 824-8810</span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-eecs-teal mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-white/70">
                  University of California, Irvine<br />
                  <a href="https://engineering.uci.edu/dept/eecs" target="_blank" rel="noopener noreferrer" className="hover:text-uci-gold transition-colors">Dept. of EECS</a>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} HIE Lab, UC Irvine. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <a href="https://uci.edu/privacy/index.php" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">
              Privacy
            </a>
            <span>|</span>
            <a href="https://engineering.uci.edu" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">
              Samueli School of Engineering
            </a>
            <span>|</span>
            <a href="https://uci.edu" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">
              UC Irvine
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

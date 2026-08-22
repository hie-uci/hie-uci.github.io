'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const particles = [
  ['8%', '14%', '0s', '9s'],
  ['18%', '42%', '1.4s', '11s'],
  ['31%', '18%', '2.1s', '10s'],
  ['42%', '70%', '0.8s', '12s'],
  ['58%', '24%', '1.9s', '9.5s'],
  ['70%', '54%', '0.4s', '10.5s'],
  ['84%', '16%', '2.6s', '11.5s'],
  ['91%', '66%', '1.1s', '9.8s'],
  ['12%', '78%', '2.9s', '12.4s'],
  ['52%', '88%', '1.7s', '10.8s'],
];

const chipBackdrops = [
  {
    src: '/images/chips/individual/sheet1-01-pmcw-radar.png',
    className: 'left-[3%] top-[10%] w-44 -rotate-6 opacity-[0.12] dark:opacity-[0.16]',
  },
  {
    src: '/images/chips/individual/sheet1-06-174-232-ghz-sige-vco.png',
    className: 'right-[5%] top-[14%] w-40 rotate-12 opacity-[0.10] dark:opacity-[0.14]',
  },
  {
    src: '/images/chips/individual/sheet2-0.32-thz-sige-transmitter.png',
    className: 'left-[9%] top-[56%] w-48 rotate-6 opacity-[0.10] dark:opacity-[0.13]',
  },
  {
    src: '/images/chips/individual/sheet2-0.92-thz-sige-quadrupler.png',
    className: 'right-[9%] top-[58%] w-44 -rotate-10 opacity-[0.09] dark:opacity-[0.12]',
  },
  {
    src: '/images/chips/individual/sheet3-02-90-ghz-efficient-oscillator.png',
    className: 'left-[42%] top-[34%] w-36 rotate-3 opacity-[0.08] dark:opacity-[0.11]',
  },
];

export default function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`subpage-shell relative isolate min-h-screen overflow-hidden bg-slate-warm pt-20 text-foreground lg:pt-28 dark:bg-[#090e17] ${className}`}
    >
      {/* Oscilloscope Scanline Effect on Mount */}
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: [0, 1, 1], opacity: [0, 1, 0], y: ['-100%', '0%', '100%'] }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="fixed inset-0 z-[100] pointer-events-none bg-gradient-to-b from-transparent via-uci-blue/30 to-transparent"
        style={{ height: '2px' }}
      />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(0,100,164,0.12),transparent_34%),radial-gradient(circle_at_82%_12%,rgba(255,210,0,0.10),transparent_30%),radial-gradient(circle_at_72%_78%,rgba(82,129,136,0.14),transparent_38%)] dark:bg-[radial-gradient(circle_at_18%_18%,rgba(56,189,248,0.16),transparent_34%),radial-gradient(circle_at_82%_12%,rgba(255,210,0,0.08),transparent_30%),radial-gradient(circle_at_72%_78%,rgba(82,129,136,0.16),transparent_38%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,100,164,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,100,164,0.06)_1px,transparent_1px)] bg-[size:72px_72px] dark:bg-[linear-gradient(rgba(125,211,252,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.06)_1px,transparent_1px)]" />
        <div className="absolute inset-0 overflow-hidden">
          {chipBackdrops.map((chip) => (
            <motion.div
              key={chip.src}
              className={`subpage-chip absolute hidden sm:block ${chip.className}`}
              animate={{ y: [0, -12, 0], opacity: [0.08, 0.15, 0.08] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Image
                src={chip.src}
                alt=""
                width={220}
                height={180}
                className="h-auto w-full rounded-sm saturate-[0.9] dark:saturate-100"
                loading="lazy"
                unoptimized
              />
            </motion.div>
          ))}
        </div>
        <motion.div
          className="absolute left-[-12%] top-[24%] h-px w-[124%] bg-gradient-to-r from-transparent via-uci-blue/20 to-transparent dark:via-blue-300/20"
          animate={{ y: [0, 32, 0], opacity: [0.25, 0.65, 0.25] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute left-[-10%] top-[68%] h-px w-[120%] bg-gradient-to-r from-transparent via-uci-gold/25 to-transparent"
          animate={{ y: [0, -28, 0], opacity: [0.18, 0.52, 0.18] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        />
        {particles.map(([left, top, delay, duration]) => (
          <span
            key={`${left}-${top}`}
            className="subpage-particle absolute h-1.5 w-1.5 rounded-full bg-uci-blue/25 shadow-[0_0_16px_rgba(0,100,164,0.25)] dark:bg-blue-300/35 dark:shadow-[0_0_18px_rgba(125,211,252,0.35)]"
            style={{ left, top, animationDelay: delay, animationDuration: duration }}
          />
        ))}
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </motion.main>
  );
}

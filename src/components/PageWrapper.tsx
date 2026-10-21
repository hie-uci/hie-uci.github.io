'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

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
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(0,100,164,0.12),transparent_34%),radial-gradient(circle_at_82%_12%,rgba(255,210,0,0.10),transparent_30%),radial-gradient(circle_at_72%_78%,rgba(82,129,136,0.14),transparent_38%)] dark:bg-[radial-gradient(circle_at_18%_18%,rgba(56,189,248,0.16),transparent_34%),radial-gradient(circle_at_82%_12%,rgba(255,210,0,0.08),transparent_30%),radial-gradient(circle_at_72%_78%,rgba(82,129,136,0.16),transparent_38%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,100,164,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,100,164,0.06)_1px,transparent_1px)] bg-[size:72px_72px] dark:bg-[linear-gradient(rgba(125,211,252,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.06)_1px,transparent_1px)]" />
        <div className="absolute inset-0 overflow-hidden">
          {/* The lab's own dies, held still: a backdrop, not an animation. */}
          {chipBackdrops.map((chip) => (
            <div key={chip.src} className={`absolute hidden sm:block ${chip.className}`}>
              <Image
                src={chip.src}
                alt=""
                width={220}
                height={180}
                className="h-auto w-full rounded-sm saturate-[0.9] dark:saturate-100"
                loading="lazy"
                unoptimized
              />
            </div>
          ))}
        </div>
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </motion.main>
  );
}

'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import GradientMesh from '@/components/GradientMesh';
import WaveformDivider from '@/components/WaveformDivider';
import SectionHeader from "@/components/SectionHeader";
import ChipMarquee from '@/components/ChipMarquee';
import ResearchVisual from '@/components/ResearchVisual';
import { labNews } from '@/data/news';
import NewsPanel from '@/components/NewsPanel';
import { HERO_DIE_DIR, HERO_DIES } from '@/components/home/heroDies';
import RadarLiveLayer from '@/components/home/RadarLiveLayer';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { useMotionMode } from '@/lib/useMotionMode';

const HeroDieField = dynamic(() => import('@/components/home/HeroDieField'), { ssr: false });

/* ──────────────────────────── helpers ──────────────────────────── */


const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ──────────────────────────── data ──────────────────────────── */

type ResearchArea = {
  title: string;
  description: string;
  iconVariant: 'radar' | 'thz' | 'siggen' | 'ai' | 'device';
  projectId: number;
  gradient: string;
  eyebrow: string;
  metric: string;
};

const researchAreas: ResearchArea[] = [
  {
    title: 'Multi-Band mm-Wave Radars',
    description: 'FMCW and PMCW radar architectures that resolve range, angle, motion, and micro-motion through coherent target returns.',
    iconVariant: 'radar',
    projectId: 1,
    gradient: 'from-[#0064a4]/95 via-[#00386d]/85 to-[#203043]/95',
    eyebrow: 'Coherent Sensing',
    metric: 'FMCW + PMCW',
  },
  {
    title: 'Sub-THz & THz Power Generation',
    description: 'Breaking transistor frequency limits with Volterra-Weiner theory-based design methodology across MOSFET, BJT, HBT, and HEMT.',
    iconVariant: 'thz',
    projectId: 2,
    gradient: 'from-[#203043]/95 via-[#0064a4]/75 to-[#528188]/90',
    eyebrow: 'Beyond fmax',
    metric: '0.32–0.92 THz',
  },
  {
    title: 'Wideband Signal Generation',
    description: 'Novel oscillator structures overcoming phase-noise degradation for mm-wave and THz communications and sensing.',
    iconVariant: 'siggen',
    projectId: 3,
    gradient: 'from-[#00386d]/95 via-[#0064a4]/80 to-[#528188]/90',
    eyebrow: 'Low Phase Noise',
    metric: 'Wide tuning',
  },
  {
    title: 'AI-Driven Analog/RF Design',
    description: 'Layout-aware ML pipelines, graph-based predictors, and attention-guided beam control for radar and circuit synthesis.',
    iconVariant: 'ai',
    projectId: 4,
    gradient: 'from-[#0064a4]/90 via-[#203043]/90 to-[#528188]/85',
    eyebrow: 'ML + Hardware',
    metric: 'Layout-aware',
  },
  {
    title: 'Emerging Device Technologies',
    description: 'All-spin-logic smart detector cells and Janus 2D material tunneling FETs with sub-60 mV/dec switching.',
    iconVariant: 'device',
    projectId: 5,
    gradient: 'from-[#528188]/95 via-[#00386d]/75 to-[#203043]/95',
    eyebrow: 'Device Physics',
    metric: 'Sub-60 mV/dec',
  },
];

const latestNewsItems = labNews.slice(0, 7);

const venues = ['JSSC', 'ISSCC', 'NeurIPS', 'Nature Comm.', 'RFIC', 'ESSCIRC', 'TCAS'];

interface Tutorial {
  id: string;
  /** Section id of the full write-up on /measurement-tutorial. */
  anchor: string;
  title: string;
  note: string;
  /** Running time from the video page. */
  length: string;
  /** Filmed upright on a phone; YouTube pillarboxes it inside a 16:9 thumbnail. */
  portrait: boolean;
  /** Grid cell: portrait clips flank the two landscape ones from lg up. */
  placement: string;
}

const PORTRAIT_CELL = 'aspect-[9/16] lg:aspect-auto lg:row-span-2';
const LANDSCAPE_CELL = 'col-span-2 aspect-video lg:col-span-1 lg:col-start-2';

// DOM order puts the two upright clips side by side on phones.
const tutorials: Tutorial[] = [
  {
    id: 'GuXS8jPgpSQ',
    anchor: 'antenna-pattern',
    title: '60 GHz radar antenna pattern',
    note: 'Our 49–63 GHz FMCW radar transceiver on a rotary stage, measured against a V‑band horn.',
    length: '0:20',
    portrait: true,
    placement: `${PORTRAIT_CELL} lg:col-start-1 lg:row-start-1`,
  },
  {
    id: 'lKwzEgkpngI',
    anchor: 'vco',
    title: 'Wideband VCO, 3.1–4.66 GHz',
    note: 'Tuning range, phase noise and output power on a spectrum analyzer.',
    length: '2:19',
    portrait: true,
    placement: `${PORTRAIT_CELL} lg:col-start-3 lg:row-start-1`,
  },
  {
    id: 'jyqjmBx2frc',
    anchor: 'radar-demo',
    title: '24 GHz radar target demo',
    note: 'A XenP202TT module tracking a corner reflector in range and angle.',
    length: '0:15',
    portrait: false,
    placement: `${LANDSCAPE_CELL} lg:row-start-1`,
  },
  {
    id: 'cpQM-97AvMA',
    anchor: 'hfss-kicad',
    title: 'HFSS antenna to KiCad',
    note: 'From an HFSS layout to a KiCad footprint and Gerber files.',
    length: '9:03',
    portrait: false,
    placement: `${LANDSCAPE_CELL} lg:row-start-2`,
  },
];

/* ──────────────────────────── component ──────────────────────────── */

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const wideScreen = useMediaQuery('(min-width: 640px)');
  const motionMode = useMotionMode();
  const [dieFieldShown, setDieFieldShown] = useState(false);
  const [liveCard, setLiveCard] = useState<number | null>(null);
  const pct = (v?: number) => (v === undefined ? undefined : `${v}%`);

  return (
    <main className="overflow-hidden bg-background text-foreground transition-colors duration-500 relative">
      
      {/* Dot grid (static; the hero's motion now lives in the 3D die field) */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(rgba(0,100,164,0.16)_1.2px,transparent_1.8px)] bg-[size:55px_55px] dark:bg-[radial-gradient(rgba(56,189,248,0.38)_1.2px,transparent_1.8px)]" />
      
      {/* Glowing Orbs for visionOS Glassmorphism Refraction */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-normal dark:mix-blend-screen opacity-60 dark:opacity-50 animate-pulse" style={{ animationDuration: '8s', background: 'radial-gradient(circle, var(--color-uci-blue) 0%, transparent 70%)' }} />
         <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-normal dark:mix-blend-screen opacity-50 dark:opacity-40 animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s', background: 'radial-gradient(circle, var(--color-eecs-teal) 0%, transparent 70%)' }} />
         <div className="absolute top-[40%] left-[60%] w-[40vw] h-[40vw] rounded-full mix-blend-normal dark:mix-blend-screen opacity-40 dark:opacity-30 animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s', background: 'radial-gradient(circle, var(--color-uci-gold) 0%, transparent 70%)' }} />
      </div>

      {/* ═══════ HERO ═══════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background layers */}
        <GradientMesh />

        {/* Chip die photos: flat mosaic first, replaced by the 3D field once it is drawn */}
        <div aria-hidden="true" className={`absolute inset-0 z-[1] pointer-events-none overflow-hidden transition-opacity duration-1000 ${dieFieldShown ? 'opacity-0' : 'opacity-100'}`}>
          {HERO_DIES.map((die) => (
            <Image
              key={die.file}
              src={HERO_DIE_DIR + die.file}
              alt=""
              width={die.width}
              height={die.width}
              className="absolute"
              style={{ top: pct(die.top), bottom: pct(die.bottom), left: pct(die.left), right: pct(die.right), height: 'auto', opacity: die.opacity, filter: `blur(${die.blurPx}px)`, transform: `rotate(${die.rotateDeg}deg)` }}
            />
          ))}
        </div>
        {wideScreen && motionMode === 'full' && (
          <div aria-hidden="true" className="absolute inset-0 z-[1] pointer-events-none">
            <HeroDieField onShown={() => setDieFieldShown(true)} />
          </div>
        )}

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-20 pointer-events-none"
        >
          {/* HIE Prominent Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="flex justify-center mb-6 pointer-events-auto"
          >
            <Image
              src="/images/logo/hie-logo.png"
              alt="HIE Lab Logo"
              width={120}
              height={40}
              className="object-contain dark:drop-shadow-[0_0_20px_rgba(56,189,248,0.2)]"
              priority
            />
          </motion.div>

          {/* UCI Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass-ios mb-8 pointer-events-auto"
          >
            <a href="https://engineering.uci.edu/dept/eecs" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-eng-blue dark:text-blue-300 hover:text-uci-blue transition-colors">UC Irvine EECS</a>
            <div className="w-1.5 h-1.5 rounded-full bg-uci-gold" />
            <a href="https://engineering.uci.edu" target="_blank" rel="noopener noreferrer" className="text-sm text-eecs-teal dark:text-teal-400 hover:text-uci-blue transition-colors">Samueli School of Engineering</a>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.04em] leading-[1.1] mb-6"
          >
            <span className="gradient-text">High-speed Integrated</span>
            <br />
            <span className="gradient-text">Electronics Laboratory</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-lg sm:text-xl text-slate-900 dark:text-slate-200 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Pioneering mm-wave and terahertz electronic circuits and systems
            for next-generation sensing, imaging, and communications.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4 pointer-events-auto"
          >
            <Link href="/research" className="btn btn-lg btn-primary">
              Explore Research
            </Link>
            <Link href="/available-positions" className="btn btn-lg btn-outline backdrop-blur-md">
              Join Our Team
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 pointer-events-none"
        >
          <span className="text-xs text-gray-400 tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-5 h-8 rounded-full border-2 border-gray-400 dark:border-gray-600 flex items-start justify-center p-1"
          >
            <motion.div className="w-1 h-2 rounded-full bg-uci-blue" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════ ABOUT ═══════ */}
      <section className="relative py-24 lg:py-32 bg-background relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Designing the Future of High-Frequency Electronics"
            subtitle="We design, implement, and test mm-wave and terahertz electronic circuits and systems, pushing the boundaries of what silicon can achieve."
          />

          <div className="mt-16 grid lg:grid-cols-5 gap-10 items-start">
            {/* PI Spotlight */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-2"
            >
              <div className="relative p-6 rounded-2xl bg-gradient-to-br from-eng-blue to-navy dark:from-slate-800 dark:to-slate-900 text-white overflow-hidden border border-white/10">
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                      <Image
                        src="/images/members/pi-aghasi.jpeg"
                        alt="Prof. Hamidreza Aghasi"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Prof. Hamidreza Aghasi</h3>
                      <p className="text-sm text-white/70">Associate Professor, EECS</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm text-white/80 leading-relaxed">
                    <p className="leading-relaxed">Building next-generation mm-wave and terahertz circuits that push silicon beyond its limits.</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {['Cornell PhD', 'NSF CAREER Award', 'IEEE Senior Member', '40+ Publications'].map((tag) => (
                        <span key={tag} className="px-2.5 py-1 rounded-md text-xs border border-white/20 font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Research themes */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={stagger}
              className="lg:col-span-3 grid sm:grid-cols-2 rounded-2xl glass-ios"
            >
              {[
                {
                  icon: (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12h4l3-9 4 18 3-9h4" />
                    </svg>
                  ),
                  label: 'mm-Wave & THz Circuits',
                  desc: 'Signal generation beyond transistor limits',
                },
                {
                  icon: (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 5V3M12 21v-2M5 12H3M21 12h-2" />
                      <path d="M7.05 7.05 5.64 5.64M18.36 18.36l-1.41-1.41M7.05 16.95l-1.41 1.41M18.36 5.64l-1.41 1.41" />
                    </svg>
                  ),
                  label: 'Radar & Sensing',
                  desc: 'Vital signs, imaging, chemical detection',
                },
                {
                  icon: (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5V11h3a3 3 0 0 1 3 3v1.5a2.5 2.5 0 0 1-5 0V14H9v1.5a2.5 2.5 0 0 1-5 0V14a3 3 0 0 1 3-3h3V9.5A4 4 0 0 1 12 2z" />
                      <circle cx="12" cy="19.5" r="2.5" />
                      <path d="M12 17v-3" />
                    </svg>
                  ),
                  label: 'AI + Circuit Design',
                  desc: 'ML-driven layout-aware synthesis',
                },
                {
                  icon: (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="4" width="16" height="16" rx="2" />
                      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ),
                  label: 'Emerging Devices',
                  desc: 'Spin-logic, 2D materials, tunneling FETs',
                },
              ].map((theme, i) => (
                <motion.div
                  key={theme.label}
                  variants={fadeUp}
                  custom={i}
                  className={`p-6 border-panel-line ${i > 0 ? 'border-t' : ''} ${i === 1 ? 'sm:border-t-0' : ''} ${i % 2 === 1 ? 'sm:border-l' : ''}`}
                >
                  <div className="text-uci-blue dark:text-blue-400 mb-3">
                    {theme.icon}
                  </div>
                  <h3 className="font-semibold text-eng-blue dark:text-gray-100 mb-1">{theme.label}</h3>
                  <p className="text-sm text-slate-900 dark:text-slate-200">{theme.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ SILICON SHOWCASE ═══════ */}
      <section id="fabricated-chips" className="relative scroll-mt-24 overflow-hidden py-20 lg:py-24 bg-background z-10 border-t border-gray-200 dark:border-gray-800">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(0,100,164,0.08),transparent_32%),radial-gradient(circle_at_82%_64%,rgba(82,129,136,0.10),transparent_34%),linear-gradient(180deg,rgba(248,249,252,0.35),rgba(255,255,255,0.80))] dark:bg-[radial-gradient(circle_at_18%_18%,rgba(56,189,248,0.10),transparent_34%),radial-gradient(circle_at_82%_64%,rgba(255,210,0,0.07),transparent_32%),linear-gradient(180deg,rgba(9,14,23,0.72),rgba(9,14,23,0.96))]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,100,164,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,100,164,0.05)_1px,transparent_1px)] bg-[size:64px_64px] opacity-70 dark:bg-[linear-gradient(rgba(125,211,252,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.07)_1px,transparent_1px)] dark:opacity-45" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Our Fabricated Chips"
            subtitle="A selection of integrated circuits designed and fabricated by the HIE Lab -- from mm-wave radars to THz transmitters."
          />
          <div className="mt-10 rounded-[28px] border border-uci-blue/10 bg-white/45 p-2 shadow-[0_18px_54px_rgba(0,56,109,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/30 dark:shadow-[0_0_55px_rgba(56,189,248,0.08)] sm:p-3">
            <ChipMarquee />
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center mt-8"
          >
            <Link href="/chip-gallery" className="link-more">
              View full chip gallery
            </Link>
          </motion.div>
        </div>
      </section>

      <WaveformDivider color="blue" />

      {/* ═══════ TUTORIALS PREVIEW ═══════ */}
      <section className="relative scroll-mt-24 py-20 lg:py-24 bg-background z-10">
        <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,100,164,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,100,164,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Measurements & Design Tutorials"
            subtitle="Videos recorded at our bench: an antenna pattern sweep, a radar target demo, a VCO measurement, and an HFSS-to-KiCad walkthrough."
          />
          {/* Each clip keeps its own shape: the two filmed upright on a phone stand
              upright either side of the two landscape ones, instead of being
              pillarboxed into identical 16:9 cards. */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-[2fr_3fr_2fr] lg:grid-rows-2"
          >
            {tutorials.map((video) => (
              <Link
                key={video.id}
                href={`/measurement-tutorial#${video.anchor}`}
                className={`group relative block overflow-hidden rounded-xl bg-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-uci-blue-light ${video.placement}`}
              >
                <Image
                  src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                  alt=""
                  fill
                  sizes={video.portrait ? '(min-width: 1024px) 28vw, 50vw' : '(min-width: 1024px) 42vw, 100vw'}
                  className="object-cover transition-[filter] duration-300 group-hover:brightness-110"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded bg-black/70 px-2 py-1 text-xs font-medium tabular-nums text-white">
                  <svg aria-hidden="true" className="h-2.5 w-2.5" viewBox="0 0 10 10" fill="currentColor"><path d="M2 1v8l7-4z" /></svg>
                  <span className="sr-only">Video, </span>
                  {video.length}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <h3 className="font-semibold leading-snug text-white [text-wrap:balance] group-hover:underline group-hover:decoration-white/50 group-hover:underline-offset-4">
                    {video.title}
                  </h3>
                  {/* An upright tile is too narrow on a phone for more than its title. */}
                  <p className={`mt-1.5 text-sm leading-snug text-white/75 [text-wrap:pretty] ${video.portrait ? 'hidden sm:block' : ''}`}>
                    {video.note}
                  </p>
                </div>
              </Link>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-10"
          >
            <Link href="/measurement-tutorial" className="link-more">
              Watch full tutorials
            </Link>
          </motion.div>
        </div>
      </section>

      <WaveformDivider color="teal" />

      {/* ═══════ RESEARCH HIGHLIGHTS ═══════ */}
      <section id="research-highlights" className="relative scroll-mt-24 py-24 lg:py-32 bg-slate-warm dark:bg-transparent z-10 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-70 dark:opacity-40">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,100,164,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,100,164,0.08)_1px,transparent_1px)] bg-[size:72px_72px]" />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,210,0,0.10)_42%,transparent_68%)]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Research Highlights"
            subtitle="Five active research thrusts spanning circuit innovation, system design, and computational intelligence."
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-6 gap-6 mt-12"
          >
            {researchAreas.map((area, i) => (
              <motion.div
                key={area.title}
                variants={fadeUp}
                custom={i}
                onHoverStart={() => setLiveCard(i)}
                onHoverEnd={() => setLiveCard((c) => (c === i ? null : c))}
                onFocus={() => setLiveCard(i)}
                onBlur={() => setLiveCard((c) => (c === i ? null : c))}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border border-panel-line bg-white/90 backdrop-blur-xl transition-colors duration-300 dark:bg-slate-950/75 hover:border-uci-blue/40 dark:hover:border-blue-300/30 ${
                  i < 2 ? 'lg:col-span-3' : 'lg:col-span-2'
                } ${
                  i === 4 ? 'md:col-span-2 lg:col-span-2' : ''
                }`}
              >
                <div className="relative h-60 overflow-hidden border-b border-slate-200/80 bg-slate-50 dark:border-white/10 dark:bg-slate-900/80">
                  <ResearchVisual variant={area.iconVariant} />
                  {area.iconVariant === 'radar' && <RadarLiveLayer active={liveCard === i} />}
                </div>

                <div className="relative flex flex-1 flex-col p-6">
                  <p className="mb-2 text-sm font-semibold text-uci-blue dark:text-sky-300">{area.metric}</p>
                  <h3 className="mb-2 text-xl font-bold text-eng-blue transition-colors duration-300 [text-wrap:pretty] group-hover:text-uci-blue dark:text-gray-100 dark:group-hover:text-blue-300">
                    {area.title}
                  </h3>
                  <p className="mb-5 text-sm leading-relaxed text-slate-800 dark:text-slate-200">{area.description}</p>
                  <Link
                    href={`/research#project-${area.projectId}`}
                    aria-label={`Explore ${area.title}`}
                    className="link-more mt-auto w-fit"
                  >
                    Explore {area.eyebrow}
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ LATEST NEWS ═══════ */}
      <section className="relative py-24 lg:py-32 bg-background z-10 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Latest News"
            subtitle="Recent highlights and achievements from the HIE Lab."
          />

          {/* One panel, one row per item: the date is a column, not a box inside a box. */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <NewsPanel items={latestNewsItems} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center mt-10"
          >
            <Link href="/news" className="link-more">
              View all news
            </Link>
          </motion.div>
        </div>
      </section>

      <WaveformDivider color="gold" />

      {/* ═══════ PUBLICATIONS HIGHLIGHT ═══════ */}
      <section className="relative py-24 lg:py-32 bg-slate-warm dark:bg-transparent z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,100,164,0.04),transparent_60%)] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeader
            title="Impactful Research Output"
            subtitle="Our work is published in the most prestigious venues in electronics and computer science."
          />

          {/* Venue names as type, in their own casing (NeurIPS, not NEURIPS). */}
          <motion.ul
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6 }}
            className="mt-12 mb-12 flex flex-wrap items-baseline justify-center gap-x-10 gap-y-4"
          >
            {venues.map((venue) => (
              <li key={venue} className="text-xl font-semibold tracking-tight text-eng-blue/75 sm:text-2xl dark:text-slate-300">
                {venue}
              </li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/publications" className="btn btn-outline">
              Browse All Publications
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════ JOIN US CTA ═══════ */}
      <section className="relative py-24 lg:py-32 bg-gradient-to-br from-eng-blue via-navy to-eng-blue overflow-hidden z-10">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full -translate-x-1/2 -translate-y-1/2" style={{ background: 'radial-gradient(circle, rgba(0,100,164,0.2) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full translate-x-1/3 translate-y-1/3" style={{ background: 'radial-gradient(circle, rgba(255,210,0,0.1) 0%, transparent 70%)' }} />
        </div>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%">
            <pattern id="cta-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#cta-grid)" />
          </svg>
        </div>

        {/* Floating chip die photos — decorative CTA background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image
            src="/images/chips/individual/sheet1-04-49-63-ghz-fmcw-radar.png"
            alt=""
            width={240}
            height={240}
            unoptimized
            className="absolute top-[8%] left-[3%] opacity-[0.07] blur-sm rotate-[-10deg]"
          />
          <Image
            src="/images/chips/individual/sheet2-0.92-thz-sige-quadrupler.png"
            alt=""
            width={220}
            height={220}
            unoptimized
            className="absolute bottom-[6%] right-[4%] opacity-[0.06] blur-sm rotate-[8deg]"
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
              Join the HIE Lab
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              We are looking for passionate and talented researchers at all levels, from
              PhD and MS students to undergraduates, to push the boundaries of high-speed
              electronics.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/available-positions" className="btn btn-lg btn-gold">
                View Open Positions
              </Link>
              <Link href="/contact" className="btn btn-lg btn-on-dark">
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
// Triggering deployment v2

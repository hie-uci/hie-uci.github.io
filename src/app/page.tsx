'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import GradientMesh from '@/components/GradientMesh';
import AnimatedResearchIcon from '@/components/AnimatedResearchIcon';
import WaveformDivider from '@/components/WaveformDivider';
import SectionHeader from "@/components/SectionHeader";
import ChipMarquee from '@/components/ChipMarquee';
import FluidPlasmaBackground from '@/components/FluidPlasmaBackground';
import ResearchVisual from '@/components/ResearchVisual';
import MagneticWrapper from '@/components/MagneticWrapper';

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
  gradient: string;
  eyebrow: string;
  metric: string;
};

const researchAreas: ResearchArea[] = [
  {
    title: 'Multi-Band mm-Wave Radars',
    description: 'Phase-frequency-locked radar architectures for vital signs monitoring, human-robot interaction, and 3D defect detection.',
    iconVariant: 'radar',
    gradient: 'from-[#0064a4]/95 via-[#00386d]/85 to-[#203043]/95',
    eyebrow: 'Coherent Sensing',
    metric: '23-232 GHz',
  },
  {
    title: 'Sub-THz & THz Power Generation',
    description: 'Breaking transistor frequency limits with Volterra-Weiner theory-based design methodology across MOSFET, BJT, HBT, and HEMT.',
    iconVariant: 'thz',
    gradient: 'from-[#203043]/95 via-[#0064a4]/75 to-[#528188]/90',
    eyebrow: 'Beyond fmax',
    metric: '0.32-0.92 THz',
  },
  {
    title: 'Wideband Signal Generation',
    description: 'Novel oscillator structures overcoming phase-noise degradation for mm-wave and THz communications and sensing.',
    iconVariant: 'siggen',
    gradient: 'from-[#00386d]/95 via-[#0064a4]/80 to-[#528188]/90',
    eyebrow: 'Low Phase Noise',
    metric: 'Wide tuning',
  },
  {
    title: 'AI-Driven Analog/RF Design',
    description: 'Layout-aware ML pipelines, graph-based predictors, and attention-guided beam control for radar and circuit synthesis.',
    iconVariant: 'ai',
    gradient: 'from-[#0064a4]/90 via-[#203043]/90 to-[#528188]/85',
    eyebrow: 'ML + Hardware',
    metric: 'Layout-aware',
  },
  {
    title: 'Emerging Device Technologies',
    description: 'All-spin-logic smart detector cells and Janus 2D material tunneling FETs with sub-60 mV/dec switching.',
    iconVariant: 'device',
    gradient: 'from-[#528188]/95 via-[#00386d]/75 to-[#203043]/95',
    eyebrow: 'Device Physics',
    metric: 'Sub-60 mV/dec',
  },
];

const newsItems = [
  { date: 'Oct 2025', text: "Hedayat's RWW paper selected as finalist for best student paper award.", tag: 'Award' },
  { date: 'Sep 2025', text: 'Xuyang successfully defends his PhD dissertation. Congratulations, Dr. Liu!', tag: 'Milestone' },
  { date: 'Sep 2025', text: 'IEEE Radar Conference paper by Allen and Xuyang nominated in top 5 for best student paper.', tag: 'Award' },
  { date: 'Sep 2025', text: 'Mahdi presents two articles at IEEE APS 2025. Congratulations, Mahdi!', tag: 'Publication' },
  { date: 'Apr 2025', text: 'FALCON accepted to NeurIPS 2025 — bridging AI and analog circuit design.', tag: 'Publication' },
  { date: 'Mar 2025', text: "Xuyang's IEEE JSSC paper on phase-locked stepped-chirp radar transceiver is published.", tag: 'Publication' },
  { date: 'Feb 2025', text: 'Sub-THz Communication Systems paper appears in Nature Communications Engineering.', tag: 'Publication' },
];

const venues = ['JSSC', 'ISSCC', 'NeurIPS', 'Nature Comm.', 'RFIC', 'ESSCIRC', 'TCAS'];

/* ──────────────────────────── component ──────────────────────────── */

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  return (
    <main className="overflow-hidden bg-background text-foreground transition-colors duration-500 relative">
      
      {/* Dynamic Background Rendering */}
      <FluidPlasmaBackground className="z-0" />
      
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

        {/* Floating chip die photos — decorative background mosaic */}
        <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
          {/* Top-left cluster */}
          <Image src="/images/chips/individual/sheet1-01-pmcw-radar.png" alt="" width={240} height={240} 
            className="absolute top-[6%] left-[3%] opacity-[0.16] blur-[0.5px] rotate-[-8deg]" />
          <Image src="/images/chips/individual/sheet1-05-3.1-4.7-ghz-class-d-vco.png" alt="" width={160} height={160} 
            className="absolute top-[22%] left-[12%] opacity-[0.12] blur-[1px] rotate-[5deg]" />

          {/* Top-right cluster */}
          <Image src="/images/chips/individual/sheet1-06-174-232-ghz-sige-vco.png" alt="" width={200} height={200} 
            className="absolute top-[4%] right-[6%] opacity-[0.15] blur-[0.5px] rotate-[12deg]" />
          <Image src="/images/chips/individual/sheet2-01-23-27-and-69-81-ghz-mimo-fmcw-radar.png" alt="" width={170} height={170} 
            className="absolute top-[18%] right-[18%] opacity-[0.11] blur-[1px] rotate-[-4deg]" />

          {/* Middle-left */}
          <Image src="/images/chips/individual/sheet1-03-110-143-ghz-pa-in-65nm-cmos.png" alt="" width={190} height={190} 
            className="absolute top-[42%] left-[2%] opacity-[0.14] blur-[0.5px] rotate-[3deg]" />
          <Image src="/images/chips/individual/sheet3-02-90-ghz-efficient-oscillator.png" alt="" width={140} height={140} 
            className="absolute top-[55%] left-[14%] opacity-[0.10] blur-[1.5px] rotate-[-10deg]" />

          {/* Middle-right */}
          <Image src="/images/chips/individual/sheet1-02-low-noise-76-82-ghz-vco.png" alt="" width={210} height={210} 
            className="absolute top-[38%] right-[3%] opacity-[0.16] blur-[0.5px] rotate-[-5deg]" />
          <Image src="/images/chips/individual/sheet2-4-channel-tia-for-mems-pnt.png" alt="" width={150} height={150} 
            className="absolute top-[52%] right-[16%] opacity-[0.11] blur-[1px] rotate-[7deg]" />

          {/* Bottom-left */}
          <Image src="/images/chips/individual/sheet2-0.48-thz-frequency-doubler.png" alt="" width={180} height={180} 
            className="absolute bottom-[18%] left-[6%] opacity-[0.13] blur-[1px] rotate-[9deg]" />

          {/* Bottom-right cluster */}
          <Image src="/images/chips/individual/sheet2-0.32-thz-sige-transmitter.png" alt="" width={260} height={260} 
            className="absolute bottom-[8%] right-[5%] opacity-[0.18] blur-[0.3px] rotate-[6deg]" />
          <Image src="/images/chips/individual/sheet1-04-49-63-ghz-fmcw-radar.png" alt="" width={150} height={150} 
            className="absolute bottom-[25%] right-[22%] opacity-[0.10] blur-[1.5px] rotate-[-12deg]" />

          {/* Center-bottom accent */}
          <Image src="/images/chips/individual/sheet2-02-monostatic-50-60-ghz-fmcw-radar.png" alt="" width={170} height={170} 
            className="absolute bottom-[12%] left-[38%] opacity-[0.09] blur-[1.5px] rotate-[3deg]" />
          <Image src="/images/chips/individual/sheet2-0.92-thz-sige-quadrupler.png" alt="" width={130} height={130} 
            className="absolute bottom-[30%] left-[28%] opacity-[0.08] blur-[2px] rotate-[-6deg]" />
        </div>

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
            <MagneticWrapper strength={0.4}>
              <Link
                href="/research"
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-uci-blue to-eng-blue text-white font-semibold rounded-xl shadow-lg shadow-uci-blue/25 hover:shadow-xl hover:shadow-uci-blue/30 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5"
              >
                Explore Research
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </MagneticWrapper>
            <MagneticWrapper strength={0.4}>
              <Link
                href="/contact#positions"
                className="group inline-flex items-center gap-2 px-7 py-3.5 glass-ios text-foreground font-semibold rounded-xl transition-transform duration-300 hover:-translate-y-0.5"
              >
                Join Our Team
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </Link>
            </MagneticWrapper>
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
            badge="About the Lab"
            title="Designing the Future of High-Frequency Electronics"
            subtitle="We design, implement, and test mm-wave and terahertz electronic circuits and systems -- pushing the boundaries of what silicon can achieve."
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
              <div className="relative p-6 rounded-2xl bg-gradient-to-br from-eng-blue to-navy dark:from-slate-800 dark:to-slate-900 text-white overflow-hidden shadow-xl border border-white/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-uci-gold/20 to-transparent rounded-bl-full" />
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
                      <p className="text-sm text-white/70">Assistant Professor, EECS</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm text-white/80 leading-relaxed">
                    <p className="leading-relaxed">Building next-generation mm-wave and terahertz circuits that push silicon beyond its limits.</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {['Cornell PhD', 'NSF CAREER Award', 'IEEE Senior Member', '40+ Publications'].map((tag) => (
                        <span key={tag} className="px-3 py-1 rounded-full text-xs bg-white/10 border border-white/15 font-medium">
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
              className="lg:col-span-3 grid sm:grid-cols-2 gap-4"
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
                  className="group p-5 rounded-xl glass-ios hover:border-uci-blue/30 hover:shadow-lg hover:shadow-uci-blue/10 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-uci-blue/10 to-eecs-teal/10 flex items-center justify-center text-uci-blue dark:text-blue-400 mb-3 group-hover:from-uci-blue/20 group-hover:to-eecs-teal/20 transition-colors">
                    {theme.icon}
                  </div>
                  <h4 className="font-semibold text-eng-blue dark:text-gray-100 mb-1">{theme.label}</h4>
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
            badge="Silicon Showcase"
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
            <Link
              href="/chip-gallery"
              className="inline-flex items-center gap-2 text-sm font-medium text-uci-blue dark:text-blue-400 hover:text-eng-blue dark:hover:text-blue-300 transition-colors animated-underline"
            >
              View full chip gallery
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
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
            badge="Resources"
            title="Measurements & Design Tutorials"
            subtitle="Explore our video guides covering VNA calibration, active circuit characterization, radar demos, and HFSS to PCB workflows."
          />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { title: "60GHz Radar Antenna Pattern", img: "GuXS8jPgpSQ" },
              { title: "24GHz Radar Target Demo", img: "jyqjmBx2frc" },
              { title: "Wideband VCO Characterization", img: "lKwzEgkpngI" },
              { title: "HFSS Antenna PCB Integration", img: "cpQM-97AvMA" }
            ].map((video, idx) => (
               <Link key={idx} href="/measurement-tutorial" className="group relative rounded-2xl overflow-hidden glass-ios border border-white/40 dark:border-white/10 hover:shadow-lg hover:border-uci-blue/30 transition-all duration-300">
                  <div className="aspect-video bg-slate-200 dark:bg-slate-800 relative">
                     <Image 
                       src={`https://img.youtube.com/vi/${video.img}/maxresdefault.jpg`} 
                       alt={video.title}
                       fill
                       className="object-cover group-hover:scale-105 transition-transform duration-500" 
                     />
                     <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                        <svg className="w-12 h-12 text-white/80 group-hover:text-white group-hover:scale-110 transition-all duration-300 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                     </div>
                  </div>
                  <div className="p-4">
                     <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-uci-blue transition-colors">{video.title}</h4>
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
            <Link
              href="/measurement-tutorial"
              className="inline-flex items-center gap-2 text-sm font-medium text-uci-blue dark:text-blue-400 hover:text-eng-blue transition-colors animated-underline"
            >
              Watch full tutorials
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
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
            badge="Research"
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
                whileHover={{
                  y: -10,
                }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative flex min-h-[460px] flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(0,56,109,0.10)] backdrop-blur-xl transition-[transform,box-shadow,border-color] duration-500 dark:border-white/10 dark:bg-slate-950/70 dark:shadow-[0_18px_60px_rgba(0,0,0,0.30)] hover:border-uci-blue/35 hover:shadow-[0_24px_70px_rgba(0,100,164,0.18)] ${
                  i < 2 ? 'lg:col-span-3' : 'lg:col-span-2'
                } ${
                  i === 4 ? 'md:col-span-2 lg:col-span-2' : ''
                }`}
              >
                {/* Number badge */}
                <div className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/35 bg-white/20 text-xs font-bold text-white/90 shadow-sm backdrop-blur-md">
                  {String(i + 1).padStart(2, '0')}
                </div>

                <div className={`relative h-56 overflow-hidden border-b border-white/50 bg-gradient-to-br ${area.gradient} dark:border-white/10`}>
                  <ResearchVisual variant={area.iconVariant} />

                  <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/25 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/90 backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-uci-gold shadow-[0_0_10px_rgba(255,210,0,0.8)]" />
                    {area.eyebrow}
                  </div>

                  <div aria-hidden="true" className="absolute bottom-4 right-4 z-10 flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white/90 shadow-2xl backdrop-blur-md transition-transform duration-500 group-hover:scale-105">
                    <AnimatedResearchIcon variant={area.iconVariant} className="h-9 w-9 text-white drop-shadow-lg" />
                  </div>

                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white/45 to-transparent" style={{ animation: 'scan-line 2s ease-in-out infinite' }} />
                  </div>
                </div>

                <div className="relative flex flex-1 flex-col p-6">
                  <div className="mb-4 inline-flex w-fit items-center rounded-md border border-uci-blue/10 bg-uci-blue/5 px-2.5 py-1 text-xs font-semibold text-uci-blue dark:border-blue-300/15 dark:bg-blue-300/10 dark:text-blue-200">
                    {area.metric}
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-eng-blue transition-colors duration-300 [text-wrap:pretty] group-hover:text-uci-blue dark:text-gray-100 dark:group-hover:text-blue-300">
                    {area.title}
                  </h3>
                  <p className="mb-5 text-sm leading-relaxed text-slate-800 dark:text-slate-200">{area.description}</p>
                  <Link
                    href="/research"
                    aria-label={`Learn more about ${area.title}`}
                    className="mt-auto inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-uci-blue transition-[color,transform] duration-300 hover:translate-x-0.5 hover:text-eng-blue dark:text-blue-300 dark:hover:text-blue-200"
                  >
                    Learn more
                    <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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
            badge="News"
            title="Latest News"
            subtitle="Recent highlights and achievements from the HIE Lab."
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="max-w-3xl mx-auto space-y-4"
          >
            {newsItems.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="group flex gap-5 p-5 rounded-xl glass-ios hover:border-uci-blue/20 transition-all duration-300"
              >
                <div className="shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-uci-blue/5 to-eecs-teal/5 border border-uci-blue/10 dark:border-white/5">
                  <span className="text-[11px] font-bold text-uci-blue dark:text-blue-400 uppercase leading-tight">{item.date.split(' ')[0]}</span>
                  <span className="text-xs text-slate-800 dark:text-slate-300">{item.date.split(' ')[1]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      item.tag === 'Award'
                        ? 'bg-uci-gold/15 text-yellow-700 dark:text-yellow-500'
                        : item.tag === 'Milestone'
                        ? 'bg-eecs-teal/10 text-eecs-teal dark:text-teal-400'
                        : 'bg-uci-blue/10 text-uci-blue dark:text-blue-400'
                    }`}>
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-sm text-slate-950 dark:text-slate-100 leading-relaxed">{item.text}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center mt-10"
          >
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm font-medium text-uci-blue dark:text-blue-400 hover:text-eng-blue transition-colors animated-underline"
            >
              View all news
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
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
            badge="Publications"
            title="Impactful Research Output"
            subtitle="Our work is published in the most prestigious venues in electronics and computer science."
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="mt-12 flex flex-wrap items-center justify-center gap-3 mb-10"
          >
            {venues.map((venue, i) => (
              <motion.span
                key={venue}
                variants={fadeUp}
                custom={i}
                className="px-5 py-2.5 rounded-xl glass-ios text-sm font-bold text-eng-blue dark:text-slate-200 tracking-wide uppercase hover:text-uci-blue dark:hover:text-blue-400 hover:border-uci-blue/30 transition-all duration-400 cursor-default"
                style={{ letterSpacing: '0.08em' }}
              >
                {venue}
              </motion.span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link
              href="/publications"
              className="inline-flex items-center gap-2 px-6 py-3 glass-ios text-foreground font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              Browse All Publications
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
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
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-white/10 text-white/80 border border-white/15 mb-6">
              Open Positions
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
              Join the HIE Lab
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
              We are looking for passionate and talented researchers at all levels --
              PhD students, MS students, and undergraduate researchers -- to push the
              boundaries of high-speed electronics.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact#positions"
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-uci-gold text-eng-blue font-bold rounded-xl shadow-lg shadow-uci-gold/20 hover:shadow-xl hover:shadow-uci-gold/30 transition-all duration-300 hover:-translate-y-0.5 hover:glow-gold"
              >
                View Open Positions
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/10 transition-all duration-300"
              >
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

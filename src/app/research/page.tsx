'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import PageWrapper from '@/components/PageWrapper';
import SectionHeader from '@/components/SectionHeader';
import CircuitBackground from '@/components/CircuitBackground';
import WaveformDivider from '@/components/WaveformDivider';
import AnimatedResearchIcon from '@/components/AnimatedResearchIcon';

/* ──────────────────────────── animation variants ──────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ──────────────────────────── project data ──────────────────────────── */

interface ProjectImage {
  src: string;
  alt: string;
  videoSrc?: string;
  posterSrc?: string;
}

interface Project {
  id: number;
  title: string;
  tagline: string;
  description: string[];
  applications: string[];
  publications: string[];
  color: string;
  icon: React.ReactNode;
  iconVariant: 'radar' | 'thz' | 'siggen' | 'ai' | 'device';
  galleryImages: ProjectImage[];
}

const projects: Project[] = [
  {
    id: 1,
    title: 'Multi-Band Millimeter-Wave Radars',
    tagline: 'Coherent FMCW and PMCW radar for sensing and imaging',
    description: [
      'The internet-driven communication networks revolutionized human access to information during the past three decades. Building on advances in communication, security, and sensing technologies, cyber-physical systems are now poised to transform machine-to-machine and human-to-machine interactions. Realization of local-area sensing networks for such infrastructures requires tight integration of sensing, computation, control, and networking within physical entities. Emerging applications\u2014such as high-precision vital signs monitoring, human-robot interaction, chemical sensing, and 3D defect detection\u2014demand massive networks of portable miniaturized sensors capable of resolving range, angular, and cross-range dimensions with high fidelity.',
      'To address these challenges, our research explores stepped-chirp and multi-band FMCW radars for precise range and angle sensing, together with Doppler-assisted PMCW architectures for motion and micro-motion measurement. In every case, the measurement is a closed physical loop: the transmitter illuminates a target, the target scatters part of that energy back, and coherent receive channels recover range, angle, and motion from the returned signal. These scalable radar front ends enable fine-resolution imaging and adaptive sensing across centimeter-to-meter ranges while maintaining compactness and energy efficiency.',
    ],
    applications: [
      'Intelligent factory',
      'Vital signs monitoring',
      'High precision imaging',
      'Human-robot interaction',
      'Chemical sensing',
      'Infrastructure deformation',
      '3D defect detection',
    ],
    publications: ['RFIC 2026', 'TMTT 2026', 'JSSC 2025', 'TCAS-I 2024', 'ESSCIRC 2023', 'RFIC 2022', 'IEEE Comm. Mag. 2020'],
    color: 'from-uci-blue to-eecs-teal',
    iconVariant: 'radar',
    galleryImages: [
      {
        src: '/images/research/visuals/research-radar-target-interaction-v3.webp',
        alt: 'HIE millimeter-wave radar illuminating static and moving targets with reflected signals returning to the receive channels',
      },
      { src: '/images/research/radar-5.png', alt: 'Radar App1' },
      { src: '/images/research/radar_precise_applications.png', alt: 'Radar App2' },
      { src: '/images/research/radar_DB_MIMO_setup.png', alt: 'Radar Meas Setup' },
      { src: '/images/research/radar_angular_resolution.png', alt: 'Radar Angular Resolution' },
      { src: '/images/research/radar_DAPMCW.png', alt: 'Radar Chip3' },
      { src: '/images/research/radar_DB_MIMO.png', alt: 'Radar Chip2' },
      { src: '/images/research/radar-1.png', alt: 'Radar Chip1' },
    ],
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        <circle cx="32" cy="32" r="8" stroke="currentColor" strokeWidth="2" />
        <circle cx="32" cy="32" r="15" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
        <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="1" strokeDasharray="5 4" />
        <circle cx="32" cy="32" r="29" stroke="currentColor" strokeWidth="0.75" strokeDasharray="6 5" opacity="0.5" />
        <line x1="32" y1="2" x2="32" y2="10" stroke="currentColor" strokeWidth="1.5" />
        <line x1="32" y1="54" x2="32" y2="62" stroke="currentColor" strokeWidth="1.5" />
        <line x1="2" y1="32" x2="10" y2="32" stroke="currentColor" strokeWidth="1.5" />
        <line x1="54" y1="32" x2="62" y2="32" stroke="currentColor" strokeWidth="1.5" />
        <line x1="10" y1="10" x2="16" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <line x1="48" y1="48" x2="54" y2="54" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <line x1="54" y1="10" x2="48" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <line x1="10" y1="54" x2="16" y2="48" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <circle cx="32" cy="32" r="3" fill="currentColor" opacity="0.8" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Sub-THz and THz Efficient Power Generation',
    tagline: 'Signal generation beyond transistor frequency limits',
    description: [
      'There are growing applications in the mm-wave and sub-mm-wave frequency ranges due to smaller wavelengths compared to radio frequencies, plethora of water-absorption bands, and larger available bandwidth of data transmission. Integrated solutions have become the desired platforms to realize systems at these frequencies thanks to their high yield and low cost. Signal generation beyond the fmax of transistors, relies on the generation of high power harmonic signals. Due to the limited efficiency of harmonic signals, high power generation remains a challenge.',
      'By finding the major nonlinear mechanisms of power generation in transistors, we propose a large-signal model and a design methodology based on the Volterra-Weiner theory to optimize the desired nonlinear behavior of a transistor or of any nonlinear element. The combination of arbitrary passive networks and the nonlinear element are formulated to find the optimum circuit configuration to achieve desired performance. The proposed systematic model extraction, which is not limited to any particular transistor type, can be exploited to capture the nonlinear behavior of MOSFET, BJT, HBT, HEMT, MESFET, HFET, or other transistor types.',
    ],
    applications: [
      'THz imaging systems',
      'Spectroscopy',
      'High-frequency communications',
      'Security screening',
    ],
    publications: ['JSSC 2026', 'RWW 2026', 'APR 2020', 'TAP 2022', 'APS 2021', 'JSSC 2017', 'JSSC 2016', 'ESSCIRC 2016', 'ISSCC 2015'],
    color: 'from-eng-blue to-uci-blue',
    iconVariant: 'thz',
    galleryImages: [
      { src: '/images/research/thz-1.jpg', alt: 'THz power generation circuit' },
      { src: '/images/research/thz-2.jpg', alt: 'THz harmonic analysis' },
      { src: '/images/research/thz-3.jpg', alt: 'THz measurement setup' },
      { src: '/images/research/thz-4.png', alt: 'THz output spectrum' },
      { src: '/images/research/thz-5.png', alt: 'THz chip micrograph' },
      { src: '/images/research/thz-6.png', alt: 'THz performance comparison' },
    ],
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        <path d="M8 48 L18 16 L28 48 L38 16 L48 48 L56 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="4" y1="32" x2="60" y2="32" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.4" />
        <line x1="4" y1="16" x2="60" y2="16" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.2" />
        <line x1="4" y1="48" x2="60" y2="48" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.2" />
        <circle cx="8" cy="48" r="2.5" fill="currentColor" opacity="0.5" />
        <circle cx="28" cy="48" r="2.5" fill="currentColor" opacity="0.5" />
        <circle cx="48" cy="48" r="2.5" fill="currentColor" opacity="0.5" />
        <circle cx="18" cy="16" r="2.5" fill="currentColor" opacity="0.5" />
        <circle cx="38" cy="16" r="2.5" fill="currentColor" opacity="0.5" />
        <path d="M56 24 L60 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <path d="M56 24 L60 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Efficient Wideband and Low Phase Noise Signal Generation at mm-wave Frequencies',
    tagline: 'Novel oscillator structures for mm-wave and THz applications',
    description: [
      'One of the challenges of signal generation at high frequency is the degradation of oscillatory waveform in terms of purity and tuning capability. The loss associated with passive components increase by going to mm-wave and terahertz frequencies which directly impacts the phase-noise of the oscillators. On the other hand, the tuning components such as varactors need to exhibit both a high quality factor and a large variation of the capacitance which is not feasible as they become comparable with the device parasitic capacitors.',
      'By implementing novel oscillator structures which resolve the phase-noise and tuning-range limitation of mm-wave and terahertz oscillators, emerging applications such as high frequency communication circuits, sensing, and imaging are enabled.',
    ],
    applications: [
      'High-frequency communications',
      'Sensing',
      'Imaging',
    ],
    publications: ['JSSC 2025', 'TCAS2 2024', 'TCAS1 2023', 'SSCL 2018', 'TMTT 2019', 'RFIC 2022', 'MWTL 2025'],
    color: 'from-eecs-teal to-uci-blue',
    iconVariant: 'siggen',
    galleryImages: [
      { src: '/images/research/siggen-1.png', alt: 'Signal generation overview' },
      { src: '/images/research/siggen-2.png', alt: 'Signal generation circuit topology' },
      { src: '/images/research/siggen-3.png', alt: 'Oscillator phase noise performance' },
      { src: '/images/research/siggen-4.png', alt: 'Wideband tuning range results' },
      { src: '/images/research/siggen-5.png', alt: 'Signal generation chip photo' },
      { src: '/images/research/siggen-6.png', alt: 'Signal generation measurement 6' },
      { src: '/images/research/siggen-7.png', alt: 'Signal generation measurement 7' },
      { src: '/images/research/siggen-8.png', alt: 'Signal generation measurement 8' },
      { src: '/images/research/siggen-9.png', alt: 'Signal generation measurement 9' },
      { src: '/images/research/siggen-10.png', alt: 'Signal generation measurement 10' },
      { src: '/images/research/siggen-11.png', alt: 'Signal generation measurement 11' },
      { src: '/images/research/siggen-12.png', alt: 'Signal generation measurement 12' },
      { src: '/images/research/siggen-13.png', alt: 'Signal generation measurement 13' },
    ],
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        <path d="M4 32 Q12 12 22 32 Q32 52 42 32 Q48 20 54 32 Q58 38 62 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="0.75" strokeDasharray="4 3" opacity="0.3" />
        <circle cx="42" cy="32" r="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="42" cy="32" r="1.5" fill="currentColor" opacity="0.6" />
        <line x1="32" y1="6" x2="32" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <line x1="32" y1="52" x2="32" y2="58" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <path d="M8 22 L12 22" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        <path d="M8 42 L12 42" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        <path d="M52 22 L56 22" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        <path d="M52 42 L56 42" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      </svg>
    ),
  },
  {
    id: 4,
    title: 'AI-Driven Analog/RF Design and Sensing Systems',
    tagline: 'Machine learning meets circuit synthesis and radar sensing',
    description: [
      'Artificial intelligence is used both to design analog/RF systems and to operate sensing front-ends efficiently. On the design side, we develop a layout-aware ML pipeline that links specification \u2192 topology \u2192 sized circuit with physical constraints, using graph-based predictors and inverse design to generate DRC-compliant solutions that account for post-layout parasitics.',
      'On the sensing side, we build attention-guided beam control that prioritizes regions of interest for FMCW/reflectarray radars, adaptively steering direction and beamwidth to reduce redundant scans while preserving angular resolution. Unifying these threads, AI acts as an end-to-end enabler\u2014from rapid design-space exploration and layout-constrained synthesis to closed-loop beam adaptation in deployment\u2014improving turnaround time, robustness to process/layout variation, and scene-aware sensing performance across mm-wave and sub-THz regimes.',
    ],
    applications: [
      'Layout-aware circuit synthesis',
      'DRC-compliant inverse design',
      'Attention-guided beam control',
      'Design-space exploration',
    ],
    publications: ['NeurIPS 2025', 'RadarConf 2025', 'NeurIPS Workshop 2024', 'ICML 2023'],
    color: 'from-uci-blue to-eng-blue',
    iconVariant: 'ai',
    galleryImages: [
      {
        src: '/images/research/ai-beam-control-poster.jpg',
        videoSrc: '/images/research/ai-beam-control.mp4',
        posterSrc: '/images/research/ai-beam-control-poster.jpg',
        alt: 'AI-driven beam control animation',
      },
      { src: '/images/research/ai-combined-figs.jpg', alt: 'AI circuit design combined figures' },
      {
        src: '/images/research/ai-animation-poster.jpg',
        videoSrc: '/images/research/ai-animation.mp4',
        posterSrc: '/images/research/ai-animation-poster.jpg',
        alt: 'AI design flow animation',
      },
    ],
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        <rect x="8" y="8" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <rect x="40" y="8" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <rect x="8" y="40" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <rect x="40" y="40" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <line x1="24" y1="16" x2="40" y2="16" stroke="currentColor" strokeWidth="1.5" />
        <line x1="24" y1="48" x2="40" y2="48" stroke="currentColor" strokeWidth="1.5" />
        <line x1="16" y1="24" x2="16" y2="40" stroke="currentColor" strokeWidth="1.5" />
        <line x1="48" y1="24" x2="48" y2="40" stroke="currentColor" strokeWidth="1.5" />
        <line x1="24" y1="24" x2="40" y2="40" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />
        <line x1="40" y1="24" x2="24" y2="40" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />
        <circle cx="32" cy="32" r="5" fill="currentColor" opacity="0.15" />
        <circle cx="32" cy="32" r="2.5" fill="currentColor" opacity="0.6" />
        <circle cx="16" cy="16" r="2" fill="currentColor" opacity="0.4" />
        <circle cx="48" cy="16" r="2" fill="currentColor" opacity="0.4" />
        <circle cx="16" cy="48" r="2" fill="currentColor" opacity="0.4" />
        <circle cx="48" cy="48" r="2" fill="currentColor" opacity="0.4" />
      </svg>
    ),
  },
  {
    id: 5,
    title: 'Emerging Device Technologies',
    tagline: 'All-spin-logic and Janus 2D material devices',
    description: [
      'Our research targets viable alternatives to CMOS for next-generation computing and ultra-low-power operation by advancing two complementary device frontiers: (i) all-spin-logic \u201csmart detector cells\u201d that tightly merge memory and computation to enable non-Boolean pattern recognition with instant-on behavior and microwatt-class power, and (ii) steep-slope tunneling FETs built on Janus 2D materials (PtSSe) that demonstrate sub-60 mV/dec switching, Ion/Ioff >10\u2078, and THz-scale operating speed\u2014together pointing to energy-aware, compact architectures that leverage spin transport, quantum tunneling, and atomically engineered channels to move beyond CMOS.',
    ],
    applications: [
      'All-spin-logic smart detectors',
      'Janus 2D material tunneling FETs',
      'Sub-60 mV/dec switching',
      'Non-Boolean pattern recognition',
    ],
    publications: ['TNANO 2016', 'TNANO 2025'],
    color: 'from-navy to-eecs-teal',
    iconVariant: 'device',
    galleryImages: [
      { src: '/images/research/device-1.jpg', alt: 'Emerging device overview' },
      { src: '/images/research/device-2.jpg', alt: 'Spin-logic device simulation' },
      { src: '/images/research/device-3.png', alt: 'Janus 2D material structure' },
      { src: '/images/research/device-4.png', alt: 'Tunneling FET characteristics' },
      { src: '/images/research/device-5.png', alt: 'Device performance benchmarks' },
    ],
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        <circle cx="32" cy="32" r="12" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="32" cy="32" r="4" fill="currentColor" opacity="0.6" />
        <ellipse cx="32" cy="32" rx="28" ry="14" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" opacity="0.35" />
        <ellipse cx="32" cy="32" rx="14" ry="28" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" opacity="0.35" />
        <ellipse cx="32" cy="32" rx="28" ry="14" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.15" transform="rotate(45 32 32)" />
        <ellipse cx="32" cy="32" rx="28" ry="14" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.15" transform="rotate(-45 32 32)" />
        <circle cx="32" cy="4" r="3" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
        <circle cx="32" cy="60" r="3" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
        <circle cx="4" cy="32" r="3" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
        <circle cx="60" cy="32" r="3" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
        <circle cx="32" cy="4" r="1" fill="currentColor" opacity="0.5" />
        <circle cx="32" cy="60" r="1" fill="currentColor" opacity="0.5" />
        <circle cx="4" cy="32" r="1" fill="currentColor" opacity="0.5" />
        <circle cx="60" cy="32" r="1" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
];

/* ──────────────────────────── project card component ──────────────────────────── */

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.div
      id={`project-${project.id}`}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative scroll-mt-24"
    >
      {/* Connecting line between projects */}
      {index < projects.length - 1 && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full w-px h-16 bg-gradient-to-b from-gray-200 to-transparent hidden lg:block" />
      )}

      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-uci-blue/8 transition-all duration-500 overflow-hidden group">
        {/* Gradient header with animated icon */}
        <div className={`relative bg-gradient-to-r ${project.color} px-6 sm:px-8 py-6 flex items-center gap-5`}>
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

          {/* Animated icon */}
          <div className="relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 p-3 shadow-lg">
            <AnimatedResearchIcon variant={project.iconVariant} className="text-white w-full h-full" />
          </div>

          {/* Title area */}
          <div className="relative flex-1 min-w-0">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/15 text-white/90 border border-white/20 mb-2">
              Project {project.id}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
              {project.title}
            </h3>
            <p className="text-sm text-white/70 mt-1 italic">{project.tagline}</p>
          </div>
        </div>

        {/* Card body — all content displayed directly */}
        <div className="px-6 sm:px-8 py-6">
          {project.description.map((p, i) => (
            <p key={i} className="text-sm text-gray-600 leading-relaxed mb-4">{p}</p>
          ))}

          {/* Applications */}
          <div className="mb-5">
            <h4 className="text-xs font-bold text-eng-blue uppercase tracking-wider mb-2">Applications</h4>
            <div className="flex flex-wrap gap-2">
              {project.applications.map((app) => (
                <span key={app} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-warm text-gray-600 border border-gray-100">
                  {app}
                </span>
              ))}
            </div>
          </div>

          {/* Publications */}
          <div className="mb-5">
            <h4 className="text-xs font-bold text-eng-blue uppercase tracking-wider mb-2">Related Publications</h4>
            <div className="flex flex-wrap gap-2">
              {project.publications.map((pub) => (
                <Link
                  key={pub}
                  href="/publications"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-uci-blue/5 text-uci-blue border border-uci-blue/10 hover:bg-uci-blue/10 transition-colors"
                >
                  {pub}
                </Link>
              ))}
            </div>
          </div>

          {/* Image Gallery */}
          {project.galleryImages.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-eng-blue uppercase tracking-wider mb-3">Gallery</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {project.galleryImages.map((img, imgIdx) => (
                  <div
                    key={imgIdx}
                    className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-sm border border-gray-100 group/img bg-slate-warm"
                  >
                    {img.videoSrc ? (
                      <video
                        className="h-full w-full object-cover transition-transform duration-300 group-hover/img:scale-110"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        poster={img.posterSrc ?? img.src}
                        aria-label={img.alt}
                      >
                        <source src={img.videoSrc} type="video/mp4" />
                      </video>
                    ) : (
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        className="object-cover transition-transform duration-300 group-hover/img:scale-110"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────── page component ──────────────────────────── */

export default function ResearchPage() {
  return (
    <PageWrapper>
      {/* ═══════ HERO BANNER ═══════ */}
      <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-br from-eng-blue via-navy to-eng-blue">
        <CircuitBackground className="opacity-10" density={35} variant="thz-waves" interactive={false} />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-uci-blue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-eecs-teal/8 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-white/10 text-white/80 border border-white/15 mb-6">
              HIE Lab Research
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-4">
              Research Projects
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
              Five interconnected research thrusts advancing the frontiers of mm-wave, THz, and AI-driven electronics.
            </p>
          </motion.div>

          {/* Quick jump links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            {projects.map((p) => (
              <a
                key={p.id}
                href={`#project-${p.id}`}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 bg-white/5 border border-white/10 hover:bg-white/15 hover:text-white transition-all duration-200"
              >
                {p.title.split(' ').slice(0, 3).join(' ')}
              </a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ OVERVIEW STATS ═══════ */}
      <section className="relative py-16 bg-white/35 border-b border-uci-blue/10 backdrop-blur-sm dark:bg-transparent dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-5 gap-6"
          >
            {projects.map((p, i) => (
              <motion.a
                key={p.id}
                href={`#project-${p.id}`}
                variants={fadeUp}
                custom={i}
                className="group text-center p-4 rounded-xl hover:bg-white/55 dark:hover:bg-white/5 transition-colors"
              >
                <div className={`w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br ${p.color} text-white/80 p-2.5 shadow-sm group-hover:shadow-md transition-shadow`}>
                  {p.icon}
                </div>
                <p className="text-xs font-semibold text-eng-blue group-hover:text-uci-blue transition-colors leading-tight">
                  {p.title.length > 30 ? p.title.split(' ').slice(0, 3).join(' ') + '...' : p.title}
                </p>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>

      <WaveformDivider color="teal" />

      {/* ═══════ PROJECT SECTIONS ═══════ */}
      <section className="relative py-24 lg:py-32 bg-white/20 backdrop-blur-[2px] dark:bg-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Our Focus Areas"
            title="Research in Detail"
            subtitle="Explore each of our five research thrusts, from fundamental device physics to AI-powered circuit design."
          />

          <div className="mt-16 space-y-20 lg:space-y-28">
            {projects.map((project, index) => (
              <div key={project.id} id={`project-${project.id}`} className="scroll-mt-28">
                <ProjectCard project={project} index={index} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ COLLABORATION CTA ═══════ */}
      <section className="relative py-20 lg:py-24 bg-gradient-to-br from-eng-blue via-navy to-eng-blue overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,100,164,0.1) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,210,0,0.05) 0%, transparent 70%)' }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Interested in Collaboration?
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
              We welcome research collaborations from academia and industry. If our work aligns with your interests, let&apos;s connect.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/publications"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-eng-blue font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                View Publications
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
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
    </PageWrapper>
  );
}

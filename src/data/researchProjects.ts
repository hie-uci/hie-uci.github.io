// The five research thrusts as they appear on /research. The description,
// application and publication text is verbatim from the lab's original site;
// edit it only when the lab changes the source text.

import type { ResearchVariant } from './research';

export interface ResearchFigure {
  src: string;
  alt: string;
  /** Looping MP4 shown in place of the still, with `src` as its poster. */
  videoSrc?: string;
  posterSrc?: string;
}

export interface ResearchProject {
  id: number;
  title: string;
  tagline: string;
  description: string[];
  applications: string[];
  publications: string[];
  variant: ResearchVariant;
  galleryImages: ResearchFigure[];
}

export const researchProjects: ResearchProject[] = [
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
    variant: 'radar',
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
    variant: 'thz',
    galleryImages: [
      { src: '/images/research/thz-1.jpg', alt: 'THz power generation circuit' },
      { src: '/images/research/thz-2.jpg', alt: 'THz harmonic analysis' },
      { src: '/images/research/thz-3.jpg', alt: 'THz measurement setup' },
      { src: '/images/research/thz-4.png', alt: 'THz output spectrum' },
      { src: '/images/research/thz-5.png', alt: 'THz chip micrograph' },
      { src: '/images/research/thz-6.png', alt: 'THz performance comparison' },
    ],
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
    variant: 'siggen',
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
    variant: 'ai',
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
    variant: 'device',
    galleryImages: [
      { src: '/images/research/device-1.jpg', alt: 'Emerging device overview' },
      { src: '/images/research/device-2.jpg', alt: 'Spin-logic device simulation' },
      { src: '/images/research/device-3.png', alt: 'Janus 2D material structure' },
      { src: '/images/research/device-4.png', alt: 'Tunneling FET characteristics' },
      { src: '/images/research/device-5.png', alt: 'Device performance benchmarks' },
    ],
  },
];

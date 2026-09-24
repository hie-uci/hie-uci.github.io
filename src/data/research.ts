// Homepage summaries of the five research thrusts. The long-form text on
// /research stays verbatim from the lab's original site and lives on that page.

export type ResearchVariant = 'radar' | 'thz' | 'siggen' | 'ai' | 'device';

export interface ResearchArea {
  title: string;
  description: string;
  variant: ResearchVariant;
  projectId: number;
  eyebrow: string;
  metric: string;
  image: string;
  imageAlt: string;
}

export const researchAreas: ResearchArea[] = [
  {
    title: 'Multi-Band mm-Wave Radars',
    description: 'FMCW and PMCW radar architectures that resolve range, angle, motion, and micro-motion through coherent target returns.',
    variant: 'radar',
    projectId: 1,
    eyebrow: 'Coherent Sensing',
    metric: 'FMCW + PMCW',
    image: '/images/research/visuals/research-radar-target-interaction-v3.webp',
    imageAlt: 'HIE millimeter-wave radar transmitting toward static and moving targets and receiving their coherent reflected signals',
  },
  {
    title: 'Sub-THz & THz Power Generation',
    description: 'Breaking transistor frequency limits with Volterra-Weiner theory-based design methodology across MOSFET, BJT, HBT, and HEMT.',
    variant: 'thz',
    projectId: 2,
    eyebrow: 'Beyond fmax',
    metric: '0.32–0.92 THz',
    image: '/images/research/visuals/research-thz-harmonic-power.webp',
    imageAlt: 'Scientific visualization of nonlinear 0.92 THz power generation using the actual HIE Lab SiGe quadrupler die',
  },
  {
    title: 'Wideband Signal Generation',
    description: 'Novel oscillator structures overcoming phase-noise degradation for mm-wave and THz communications and sensing.',
    variant: 'siggen',
    projectId: 3,
    eyebrow: 'Low Phase Noise',
    metric: 'Wide tuning',
    image: '/images/research/visuals/research-signal-generation-concept-v2.webp',
    imageAlt: 'Scientific visualization of coupled resonant paths producing a tunable low-phase-noise millimeter-wave carrier',
  },
  {
    title: 'AI-Driven Analog/RF Design',
    description: 'Layout-aware ML pipelines, graph-based predictors, and attention-guided beam control for radar and circuit synthesis.',
    variant: 'ai',
    projectId: 4,
    eyebrow: 'ML + Hardware',
    metric: 'Layout-aware',
    image: '/images/research/visuals/research-ai-falcon.webp',
    imageAlt: 'Scientific visualization of graph-neural-network reasoning producing a layout-aware analog RF circuit',
  },
  {
    title: 'Emerging Device Technologies',
    description: 'All-spin-logic smart detector cells and Janus 2D material tunneling FETs with sub-60 mV/dec switching.',
    variant: 'device',
    projectId: 5,
    eyebrow: 'Device Physics',
    metric: 'Sub-60 mV/dec',
    image: '/images/research/device-3.png',
    imageAlt: 'Original HIE Lab visualization of a dual-gate Janus PtSSe tunneling transistor',
  },
];

export const researchThemes = [
  { label: 'mm-Wave & THz Circuits', desc: 'Signal generation beyond transistor limits' },
  { label: 'Radar & Sensing', desc: 'Vital signs, imaging, chemical detection' },
  { label: 'AI + Circuit Design', desc: 'ML-driven layout-aware synthesis' },
  { label: 'Emerging Devices', desc: 'Spin-logic, 2D materials, tunneling FETs' },
];

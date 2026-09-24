// Registry of RF Toolbox instruments. The toolbox page renders from it, the
// category rail counts from it, and the site search indexes it.

import type { RFModelLevel } from '@/components/RFModelBadge';

export type RFCategoryId =
  | 'system_link'
  | 'radar_sensing'
  | 'antennas_matching'
  | 'pcb_design'
  | 'active_ic'
  | 's_parameter_tools'
  | 'fundamentals_refs';

export interface RFCategory {
  id: RFCategoryId;
  name: string;
  desc: string;
}

export interface RFTool {
  /** Stable anchor id: /rf-toolbox/?category=<category>#<id> */
  id: string;
  name: string;
  category: RFCategoryId;
  summary: string;
  model: RFModelLevel;
  /** What the model assumes; shown under the tool's title. */
  modelDetail: string;
  /** A live 3D or animated stage accompanies the calculator. */
  stage?: '3d' | 'animated';
  keywords: string[];
}

export const rfCategories: RFCategory[] = [
  { id: 'system_link', name: 'System & Link Budget', desc: 'Cascade analysis, loop filters, and system-level calculations.' },
  { id: 'radar_sensing', name: 'Radar & Sensing', desc: 'FMCW, Doppler shift, and Radar Range Equation.' },
  { id: 'antennas_matching', name: 'Antennas & Matching', desc: 'Patch antenna synthesis and automated impedance matching.' },
  { id: 'pcb_design', name: 'PCB & Transmission Lines', desc: 'Board-level trace design, substrates, and via parasitics.' },
  { id: 'active_ic', name: 'Active Circuits / IC', desc: 'Phase noise, thermal noise, and linearity conversions.' },
  { id: 's_parameter_tools', name: 'S-Parameter Analysis', desc: 'Touchstone (.sNp) file parsing, charting, and network extraction.' },
  { id: 'fundamentals_refs', name: 'Fundamentals & Quick Refs', desc: 'Power conversions, VSWR, waveguides, and frequency bands.' },
];

export const rfTools: RFTool[] = [
  { id: 'cascade-builder', name: 'System Cascade Chain Builder', category: 'system_link', model: 'closed-form', modelDetail: 'Friis noise and cascaded IP3 for matched stages; a loaded .s2p drives the stage gain from S21.', stage: 'animated', summary: 'Drag-and-drop block diagram for cascaded gain, noise figure and OIP3/IIP3, with a live level diagram.', keywords: ['cascade', 'friis', 'noise figure', 'nf', 'gain', 'ip3', 'iip3', 'oip3', 'block diagram', 'receiver chain'] },
  { id: 'receiver-budget', name: 'Receiver Link Budget', category: 'system_link', model: 'closed-form', modelDetail: 'Standard 290 K noise and third-order SFDR assumptions.', summary: 'Gain and noise figure requirements across an RF receiver front-end, with MDS and SFDR.', keywords: ['link budget', 'mds', 'sfdr', 'sensitivity', 'receiver', 'dynamic range'] },
  { id: 'pll-loop-filter', name: 'PLL Loop Filter Synthesis', category: 'system_link', model: 'closed-form', modelDetail: 'Ideal Type-II second-order charge-pump PLL synthesis.', summary: 'Second-order passive charge-pump loop filter with explicit bandwidth and phase-margin assumptions.', keywords: ['pll', 'loop filter', 'charge pump', 'phase margin', 'synthesizer', 'bandwidth'] },

  { id: 'radar-range', name: 'Radar Range & Free-Space Path Loss', category: 'radar_sensing', model: 'closed-form', modelDetail: 'Classical monostatic free-space radar equation with aggregate loss.', summary: 'Monostatic radar range equation and free-space path loss.', keywords: ['radar range', 'fspl', 'path loss', 'rcs', 'radar equation'] },
  { id: 'fmcw', name: 'FMCW Radar Parameters', category: 'radar_sensing', model: 'closed-form', modelDetail: 'Ideal linear chirp and stationary-target beat-frequency limit.', stage: 'animated', summary: 'Range resolution, chirp slope and IF-limited range, with an animated chirp scope.', keywords: ['fmcw', 'chirp', 'range resolution', 'beat frequency', 'if bandwidth', 'mmwave radar'] },
  { id: 'doppler', name: 'Doppler Shift', category: 'radar_sensing', model: 'closed-form', modelDetail: 'Monostatic narrowband radial-motion approximation.', summary: 'Doppler frequency for a target moving toward or away from the radar.', keywords: ['doppler', 'velocity', 'radial speed'] },

  { id: 'impedance-matching', name: 'L-Network Impedance Matching', category: 'antennas_matching', model: 'identity', modelDetail: 'Ideal lossless single-frequency lumped-network synthesis.', summary: 'Ideal L-network topologies between complex source and load impedances.', keywords: ['matching', 'l-network', 'impedance', 'conjugate match', 'smith'] },
  { id: 'smith-chart', name: 'Interactive Smith Chart', category: 'antennas_matching', model: 'identity', modelDetail: 'Exact bilinear map between normalized impedance and reflection coefficient.', summary: 'Build matching networks by dragging along constant resistance and conductance circles.', keywords: ['smith chart', 'reflection coefficient', 'gamma', 'matching', 'admittance'] },
  { id: 'patch-antenna', name: 'Microstrip Patch Antenna', category: 'antennas_matching', model: 'closed-form', modelDetail: 'First-order rectangular-patch/cavity synthesis; verify with full-wave EM.', stage: '3d', summary: 'First-order rectangular patch synthesis, drawn to scale with its fringing fields.', keywords: ['patch antenna', 'microstrip antenna', 'directivity', 'antenna synthesis'] },
  { id: 'phased-array', name: 'Phased Array Beam Lab', category: 'antennas_matching', model: 'closed-form', modelDetail: 'Uniform-grid narrowband array factor times an ideal element pattern; not a realized radiation pattern.', stage: '3d', summary: 'Planar array factor in 3D with beam steering, tapers, grating lobes and pattern cuts.', keywords: ['phased array', 'array factor', 'beam steering', 'beamforming', 'grating lobe', 'hpbw', 'sidelobe', 'ula', 'ura'] },

  { id: 'microstrip', name: 'Microstrip Line', category: 'pcb_design', model: 'closed-form', modelDetail: 'Hammerstad–Jensen with thickness correction and Kirschning–Jansen dispersion.', stage: '3d', summary: 'Hammerstad–Jensen impedance with Kirschning–Jansen dispersion and a live field view.', keywords: ['microstrip', 'characteristic impedance', 'z0', 'trace width', 'effective permittivity', 'pcb'] },
  { id: 'stripline', name: 'Stripline', category: 'pcb_design', model: 'closed-form', modelDetail: 'Centered symmetric stripline with infinite planes and homogeneous dielectric.', stage: '3d', summary: 'Symmetric stripline impedance between two ground planes.', keywords: ['stripline', 'impedance', 'z0', 'pcb', 'buried trace'] },
  { id: 'cpw', name: 'Coplanar Waveguide', category: 'pcb_design', model: 'closed-form', modelDetail: 'Ideal unbacked CPW conformal-mapping model.', stage: '3d', summary: 'Unbacked coplanar waveguide impedance by conformal mapping.', keywords: ['cpw', 'coplanar waveguide', 'impedance', 'gap', 'slot'] },
  { id: 'pcb-via', name: 'PCB Via Parasitics', category: 'pcb_design', model: 'closed-form', modelDetail: 'Lumped via L/C estimates; distributed behavior requires 3D EM.', summary: 'Through-hole via inductance and capacitance from the Goldfarb model.', keywords: ['via', 'inductance', 'capacitance', 'goldfarb', 'pcb'] },

  { id: 'phase-noise', name: 'Phase Noise to Jitter', category: 'active_ic', model: 'closed-form', modelDetail: 'Spot jitter density only; integrated RMS jitter needs the full phase-noise spectrum.', summary: 'Translate a spot phase-noise value into spot timing-jitter density.', keywords: ['phase noise', 'jitter', 'oscillator', 'clock', 'dbc/hz'] },
  { id: 'linearity', name: 'Linearity Rule of Thumb', category: 'active_ic', model: 'rule-of-thumb', modelDetail: 'Cubic memoryless-model heuristic; not a device identity.', summary: 'Estimate OIP3 from OP1dB and the reverse.', keywords: ['p1db', 'ip3', 'oip3', 'linearity', 'compression'] },
  { id: 'thermal-noise', name: 'Thermal Noise Floor', category: 'active_ic', model: 'identity', modelDetail: 'Johnson–Nyquist available noise power for a matched resistor at temperature T.', summary: 'kTB noise floor for a bandwidth and temperature.', keywords: ['ktb', 'thermal noise', 'noise floor', 'dbm/hz', 'boltzmann'] },

  { id: 's-parameters', name: 'S-Parameter Analysis Hub', category: 's_parameter_tools', model: 'identity', modelDetail: 'Exact conversions of the uploaded network data; equivalent models are first-order.', summary: 'Parse Touchstone v1/v2 files up to 12 ports; plot, convert and check stability in the browser.', keywords: ['s-parameters', 'touchstone', 's2p', 'snp', 'stability', 'group delay', 'tdr', 'mixed mode'] },

  { id: 'db-power', name: 'Power & dB Conversions', category: 'fundamentals_refs', model: 'identity', modelDetail: 'Unit conversion referenced to 1 mW and 1 W.', summary: 'dBm, watts, volts and dB ratios.', keywords: ['dbm', 'watts', 'db', 'power conversion', 'dbw'] },
  { id: 'vswr', name: 'VSWR & Return Loss', category: 'fundamentals_refs', model: 'identity', modelDetail: 'Lossless single-interface power-wave identities.', summary: 'VSWR, return loss, reflection coefficient and mismatch loss.', keywords: ['vswr', 'return loss', 'reflection coefficient', 'mismatch'] },
  { id: 'skin-depth', name: 'Skin Depth & Surface Resistance', category: 'fundamentals_refs', model: 'closed-form', modelDetail: 'Good-conductor approximation with μr=1 and bulk resistivity.', summary: 'Conductor skin depth and surface resistance versus frequency.', keywords: ['skin depth', 'surface resistance', 'conductor loss'] },
  { id: 'waveguide', name: 'Rectangular Waveguide TE₁₀', category: 'fundamentals_refs', model: 'identity', modelDetail: 'Ideal PEC, homogeneous-fill rectangular-waveguide TE10 cutoff.', stage: '3d', summary: 'TE10 cutoff and guide wavelength, with the mode field in 3D.', keywords: ['waveguide', 'te10', 'cutoff', 'wr-10', 'wr-90', 'guide wavelength'] },
];

export function toolsIn(category: RFCategoryId): RFTool[] {
  return rfTools.filter((tool) => tool.category === category);
}

export function toolHref(tool: RFTool): string {
  return `/rf-toolbox/?category=${tool.category}#${tool.id}`;
}

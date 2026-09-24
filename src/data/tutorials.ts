// Measurement tutorial videos. Text is verbatim from the lab's tutorial page.

export interface TutorialItem {
  term: string;
  text: string;
}

export interface Tutorial {
  kind: string;
  title: string;
  summary: string;
  listTitle: string;
  items: TutorialItem[];
  /** The list is a sequence of steps rather than a checklist. */
  steps?: boolean;
  video: { id: string; title: string };
}

export const channel = {
  name: 'RF/mmWave Video Collection',
  description: 'A curated collection of educational videos spanning high-frequency hardware measurements.',
  subscribe: 'https://www.youtube.com/@xuyangliu3768?sub_confirmation=1',
  visit: 'https://www.youtube.com/@xuyangliu3768',
  handle: '@xuyangliu3768',
};

export const tutorials: Tutorial[] = [
  {
    kind: 'Antenna Characterization',
    title: '60GHz Radar Antenna Pattern Measurement',
    summary: 'This demonstration shows the measurement of an antenna radiation pattern for a 60GHz phase-locked FMCW radar transceiver (ESSCIRC & JSSC published).',
    listTitle: 'Test Setup & Equipment',
    items: [
      { term: 'Device Under Test (DUT):', text: '49-63 GHz FMCW Radar Transceiver with packaged antennas.' },
      { term: 'Reference Antenna:', text: 'Horn antenna calibrated for V-band.' },
      { term: 'Mechanical Stage:', text: 'High-precision rotary stage for angle sweeping.' },
      { term: 'Instrumentation:', text: 'Spectrum Analyzer with V-band harmonic mixer for power detection.' },
    ],
    video: { id: 'GuXS8jPgpSQ', title: '60GHz Radar' },
  },
  {
    kind: 'System-Level Testing',
    title: 'ICLEGEND MICRO XenP202TT 24GHz Radar Demo',
    summary: 'A real-world performance demonstration of a 24GHz radar module tracking physical targets. This showcases how raw RF signals are processed into actionable tracking data in real-time.',
    listTitle: 'Measurement Objectives',
    items: [
      { term: 'Target Emulation:', text: 'Using a metallic corner reflector to provide a reliable, high RCS (Radar Cross Section) target.' },
      { term: 'Distance Resolution:', text: 'Verifying the range accuracy extracted from the FMCW beat frequency (IF).' },
      { term: '1D Angle Measurement:', text: 'Evaluating the Field of View (FOV) and Angle of Arrival (AoA) estimation using RX antenna arrays.' },
    ],
    video: { id: 'jyqjmBx2frc', title: '24GHz Radar Demo' },
  },
  {
    kind: 'Active Circuits',
    title: '3.1GHz - 4.66GHz VCO Measurement',
    summary:
      'Validating the performance of a wideband Voltage-Controlled Oscillator (VCO) intended for a TCAS-I paper submission. This type of measurement is critical for characterizing the purity of the local oscillator (LO) signal, verifying both phase noise and output power under room temperature conditions.',
    listTitle: 'Key Parameters Extracted',
    items: [
      { term: 'Tuning Range:', text: 'Sweeping the control voltage (Vtune) to verify the 3.1 - 4.66 GHz coverage.' },
      { term: 'Phase Noise:', text: 'Measured typically at a 1MHz offset from the carrier to determine oscillator spectral purity.' },
      { term: 'Output Power:', text: 'Ensuring sufficient LO drive strength across the entire tuning band.' },
    ],
    video: { id: 'lKwzEgkpngI', title: 'VCO Measurement' },
  },
  {
    kind: 'Antenna PCB Integration',
    title: 'Export HFSS Antenna Design to KiCad',
    summary: 'A crucial step in hardware realization: taking a validated 3D electromagnetic antenna simulation and integrating it onto a PCB structure. This bridges the gap between EM physics and physical PCB fabrication.',
    listTitle: 'Integration Timeline',
    steps: true,
    items: [
      { term: 'HFSS Export:', text: 'Exporting the 2D layout geometry (usually DXF or GDSII format).' },
      { term: 'KiCad Import:', text: 'Importing the geometry to create a custom Footprint matching the exact EM simulation dimensions.' },
      { term: 'Gerber Generation:', text: 'Generating the standardized RS-274X Gerber and Drill files required by PCB fabs (e.g., JLCPCB, PCBWay).' },
    ],
    video: { id: 'cpQM-97AvMA', title: 'HFSS to KiCad' },
  },
];

'use client';

import PageWrapper from '@/components/PageWrapper';
import SectionHeader from '@/components/SectionHeader';
import { MonitorPlay } from 'lucide-react';

interface Entry {
  term: string;
  text: string;
}

interface TutorialModule {
  /** Anchor the Home page's video tiles link to. */
  id: string;
  label: string;
  title: string;
  body: string;
  listTitle: string;
  entries: Entry[];
  /** The entries are steps in order, so they are numbered. */
  ordered?: boolean;
  video: { id: string; portrait: boolean };
}

const modules: TutorialModule[] = [
  {
    id: 'antenna-pattern',
    label: 'Antenna characterization',
    title: '60GHz Radar Antenna Pattern Measurement',
    body: 'This demonstration shows the measurement of an antenna radiation pattern for a 60GHz phase-locked FMCW radar transceiver (ESSCIRC & JSSC published).',
    listTitle: 'Test Setup & Equipment',
    entries: [
      { term: 'Device Under Test (DUT)', text: '49-63 GHz FMCW Radar Transceiver with packaged antennas.' },
      { term: 'Reference Antenna', text: 'Horn antenna calibrated for V-band.' },
      { term: 'Mechanical Stage', text: 'High-precision rotary stage for angle sweeping.' },
      { term: 'Instrumentation', text: 'Spectrum Analyzer with V-band harmonic mixer for power detection.' },
    ],
    video: { id: 'GuXS8jPgpSQ', portrait: true },
  },
  {
    id: 'radar-demo',
    label: 'System-level testing',
    title: 'ICLEGEND MICRO XenP202TT 24GHz Radar Demo',
    body: 'A real-world performance demonstration of a 24GHz radar module tracking physical targets. This showcases how raw RF signals are processed into actionable tracking data in real-time.',
    listTitle: 'Measurement Objectives',
    entries: [
      { term: 'Target Emulation', text: 'Using a metallic corner reflector to provide a reliable, high RCS (Radar Cross Section) target.' },
      { term: 'Distance Resolution', text: 'Verifying the range accuracy extracted from the FMCW beat frequency (IF).' },
      { term: '1D Angle Measurement', text: 'Evaluating the Field of View (FOV) and Angle of Arrival (AoA) estimation using RX antenna arrays.' },
    ],
    video: { id: 'jyqjmBx2frc', portrait: false },
  },
  {
    id: 'vco',
    label: 'Active circuits',
    title: '3.1GHz - 4.66GHz VCO Measurement',
    body: 'Validating the performance of a wideband Voltage-Controlled Oscillator (VCO) intended for a TCAS-I paper submission. This type of measurement is critical for characterizing the purity of the local oscillator (LO) signal, verifying both phase noise and output power under room temperature conditions.',
    listTitle: 'Key Parameters Extracted',
    entries: [
      { term: 'Tuning Range', text: 'Sweeping the control voltage (Vtune) to verify the 3.1 - 4.66 GHz coverage.' },
      { term: 'Phase Noise', text: 'Measured typically at a 1MHz offset from the carrier to determine oscillator spectral purity.' },
      { term: 'Output Power', text: 'Ensuring sufficient LO drive strength across the entire tuning band.' },
    ],
    video: { id: 'lKwzEgkpngI', portrait: true },
  },
  {
    id: 'hfss-kicad',
    label: 'Antenna PCB integration',
    title: 'Export HFSS Antenna Design to KiCad',
    body: 'A crucial step in hardware realization: taking a validated 3D electromagnetic antenna simulation and integrating it onto a PCB structure. This bridges the gap between EM physics and physical PCB fabrication.',
    listTitle: 'Integration Timeline',
    entries: [
      { term: 'HFSS Export', text: 'Exporting the 2D layout geometry (usually DXF or GDSII format).' },
      { term: 'KiCad Import', text: 'Importing the geometry to create a custom Footprint matching the exact EM simulation dimensions.' },
      { term: 'Gerber Generation', text: 'Generating the standardized RS-274X Gerber and Drill files required by PCB fabs (e.g., JLCPCB, PCBWay).' },
    ],
    ordered: true,
    video: { id: 'cpQM-97AvMA', portrait: false },
  },
];

/** The module's facts as a two-column sheet; numbered when they are steps. */
function EntryList({ entries, ordered = false }: { entries: Entry[]; ordered?: boolean }) {
  if (ordered) {
    return (
      <ol className="mt-3 divide-y divide-panel-line border-y border-panel-line text-sm">
        {entries.map((entry, i) => (
          <li key={entry.term} className="grid grid-cols-[1.75rem_1fr] gap-x-3 py-2.5">
            <span className="font-semibold tabular-nums text-uci-blue dark:text-sky-300">{i + 1}</span>
            <p className="text-slate-600 dark:text-slate-400">
              <span className="font-medium text-slate-900 dark:text-slate-100">{entry.term}:</span> {entry.text}
            </p>
          </li>
        ))}
      </ol>
    );
  }
  return (
    <dl className="mt-3 divide-y divide-panel-line border-y border-panel-line text-sm">
      {entries.map(entry => (
        <div key={entry.term} className="grid gap-x-4 gap-y-0.5 py-2.5 sm:grid-cols-[11rem_1fr]">
          <dt className="font-medium text-slate-900 dark:text-slate-100">{entry.term}</dt>
          <dd className="text-slate-600 dark:text-slate-400">{entry.text}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Text beside its video; upright phone clips get an upright player instead of a pillarboxed one. */
function Module({ tutorial: m, videoLeft }: { tutorial: TutorialModule; videoLeft: boolean }) {
  const columns = m.video.portrait
    ? videoLeft ? 'lg:grid-cols-[300px_minmax(0,1fr)]' : 'lg:grid-cols-[minmax(0,1fr)_300px]'
    : 'lg:grid-cols-2';
  return (
    <div id={m.id} className="scroll-mt-32 glass-ios rounded-3xl p-6 sm:p-10">
      <div className={`grid gap-10 items-center ${columns}`}>
        <div className={videoLeft ? 'lg:order-2' : ''}>
          <p className="text-sm font-semibold text-uci-blue dark:text-sky-300">{m.label}</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-800 dark:text-slate-200">{m.title}</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{m.body}</p>
          <h3 className="mt-6 font-semibold text-sm text-slate-800 dark:text-slate-200">{m.listTitle}</h3>
          <EntryList entries={m.entries} ordered={m.ordered} />
        </div>
        <div className={`${videoLeft ? 'lg:order-1' : ''} ${m.video.portrait ? 'mx-auto w-full max-w-[300px]' : 'w-full'}`}>
          <div className={`relative overflow-hidden rounded-xl border border-slate-200 bg-black dark:border-slate-800 ${m.video.portrait ? 'aspect-[9/16]' : 'aspect-video'}`}>
            <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube.com/embed/${m.video.id}`} title={m.title} allowFullScreen></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MeasurementTutorialPage() {
  return (
    <PageWrapper>
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 bg-background min-h-screen z-10 overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,100,164,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,100,164,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            as="h1"
            title="Measurement Tutorials"
            subtitle="Educational guides for VNA calibration, active circuit measurements, radar demos, and EDA workflows."
          />

          <div className="mt-12 space-y-12">

            {/* Channel Banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 rounded-2xl p-6 glass-ios">
              <div>
                <h2 className="text-2xl font-bold text-eng-blue dark:text-blue-300 mb-2">RF/mmWave Video Collection</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  A curated collection of educational videos spanning high-frequency hardware measurements.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <a href="https://www.youtube.com/@xuyangliu3768?sub_confirmation=1" target="_blank" rel="noopener noreferrer" className="btn px-5 py-2.5 text-sm bg-red-600 hover:bg-red-700 text-on-accent">
                  <MonitorPlay className="w-5 h-5" />
                  Subscribe to Channel
                </a>
                <a href="https://www.youtube.com/@xuyangliu3768" target="_blank" rel="noopener noreferrer" className="btn btn-outline px-5 py-2.5 text-sm">
                  Visit @xuyangliu3768
                </a>
              </div>
            </div>

            {modules.map((m, i) => (
              <Module key={m.id} tutorial={m} videoLeft={i % 2 === 1} />
            ))}

          </div>
        </div>
      </section>
    </PageWrapper>
  );
}

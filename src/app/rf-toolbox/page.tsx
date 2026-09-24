'use client';

import React, { useEffect, useState } from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import { vswrTable, dielectricsTable, waveguideTable, freqBandsTable } from './data';
import PageWrapper from '@/components/PageWrapper';
import SectionHeader from '@/components/SectionHeader';
import { VSWRCalculator, DBCalculator, MicrostripCalculator, WaveguideCalculator, StriplineCalculator, CPWCalculator, SkinDepthCalculator, PCBViaCalculator, RadarRangeCalculator, FMCWRadarCalculator, DopplerCalculator, PhaseNoiseCalculator, LinearityCalculator, ThermalNoiseCalculator } from '@/components/Calculators';
import { ImpedanceMatchingCalculator, ReceiverCascadeCalculator, PatchAntennaCalculator, PhasedArrayCalculator, PLLCalculator } from '@/components/AdvancedCalculators';
import { InteractiveSmithChart } from '@/components/InteractiveSmithChart';
import SystemCascadeBuilder from '@/components/SystemCascadeBuilder';
import SParameterViewer from '@/components/SParameterViewer';
import { RFModelBadge, RFModelLevel } from '@/components/RFModelBadge';

const CATEGORIES = [
  { id: 'system_link', name: 'System & Link Budget', desc: 'Cascade analysis, loop filters, and system-level calculations.' },
  { id: 'radar_sensing', name: 'Radar & Sensing', desc: 'FMCW, Doppler shift, and Radar Range Equation.' },
  { id: 'antennas_matching', name: 'Antennas & Matching', desc: 'Patch antenna synthesis and automated impedance matching.' },
  { id: 'pcb_design', name: 'PCB & Transmission Lines', desc: 'Board-level trace design, substrates, and via parasitics.' },
  { id: 'active_ic', name: 'Active Circuits / IC', desc: 'Phase noise, thermal noise, and linearity conversions.' },
  { id: 's_parameter_tools', name: 'S-Parameter Analysis', desc: 'Touchstone (.sNp) file parsing, charting, and network extraction.' },
  { id: 'fundamentals_refs', name: 'Fundamentals & Quick Refs', desc: 'Power conversions, VSWR, waveguides, and frequency bands.' },
];

const RF_TOOLBOX_MODEL_REVISION = '2026.07-r2';
const SOURCE_REVISION = process.env.NEXT_PUBLIC_GIT_SHA?.slice(0, 8) ?? 'local';

export default function RFToolboxPage() {
  const [activeTab, setActiveTab] = useState(CATEGORIES[0].id);

  useEffect(() => {
    const readCategory = () => {
      const params = new URLSearchParams(window.location.search);
      const requested = params.get('category') ?? window.location.hash.replace(/^#/, '');
      if (CATEGORIES.some(category => category.id === requested)) setActiveTab(requested);
    };
    readCategory();
    window.addEventListener('popstate', readCategory);
    window.addEventListener('hashchange', readCategory);
    return () => {
      window.removeEventListener('popstate', readCategory);
      window.removeEventListener('hashchange', readCategory);
    };
  }, []);

  const selectCategory = (categoryId: string) => {
    setActiveTab(categoryId);
    const url = new URL(window.location.href);
    url.searchParams.set('category', categoryId);
    url.hash = '';
    window.history.pushState({}, '', url);
  };

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
            badge="Engineering Resources"
            title="RF & Microwave Toolbox"
            subtitle="Professional calculators and reference formulas for high-frequency hardware design."
          />
          <div className="mt-4 flex justify-center">
            <span className="rounded-full border border-uci-blue/20 bg-uci-blue/5 px-3 py-1 text-[11px] font-mono text-slate-600 dark:text-slate-400">
              RF model {RF_TOOLBOX_MODEL_REVISION} · source {SOURCE_REVISION}
            </span>
          </div>

          <div className="mt-12 flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <aside className="w-full lg:w-64 shrink-0">
              <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 sticky top-24">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => selectCategory(cat.id)}
                    aria-pressed={activeTab === cat.id}
                    className={`whitespace-nowrap text-left px-5 py-3 rounded-xl transition-all duration-300 ${
                      activeTab === cat.id
                        ? 'bg-uci-blue text-white shadow-md shadow-uci-blue/20 translate-x-1'
                        : 'bg-white/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-uci-blue'
                    }`}
                  >
                    <div className="font-bold text-sm">{cat.name}</div>
                    <div className={`text-xs mt-1 whitespace-normal leading-relaxed ${activeTab === cat.id ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>{cat.desc}</div>
                  </button>
                ))}
              </nav>
            </aside>

            {/* Content Area */}
            <div className="flex-1 min-w-0 glass-ios rounded-3xl p-6 sm:p-10 border border-white/40 dark:border-white/10">
              {activeTab === 'system_link' && <SystemLinkSection />}
              {activeTab === 'radar_sensing' && <RadarSensingSection />}
              {activeTab === 'antennas_matching' && <AntennasMatchingSection />}
              {activeTab === 'pcb_design' && <PCBDesignSection />}
              {activeTab === 'active_ic' && <ActiveICSection />}
              {activeTab === 's_parameter_tools' && <SParameterSection />}
              {activeTab === 'fundamentals_refs' && <FundamentalsSection />}
            </div>
          </div>
          <aside className="mt-8 rounded-2xl border border-slate-200 bg-white/60 p-5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
            <h2 className="mb-2 text-sm font-bold text-eng-blue dark:text-blue-300">Model provenance & engineering use</h2>
            <p>Every calculator is labeled as an identity, closed-form approximation, rule of thumb, or simulation-dependent model. Results are design aids, not sign-off data. Principal references include the <a className="text-uci-blue underline" href="https://qucs.sourceforge.net/tech/node75.html" target="_blank" rel="noreferrer">Hammerstad–Jensen / Kirschning–Jansen equations</a>, the official <a className="text-uci-blue underline" href="https://ibis.org/touchstone_ver2.0/touchstone_ver2_0.pdf" target="_blank" rel="noreferrer">Touchstone 2.0 specification</a>, <a className="text-uci-blue underline" href="https://www.rogerscorp.com/advanced-electronics-solutions/ro4000-series-laminates/ro4003c-laminates" target="_blank" rel="noreferrer">Rogers laminate data</a>, and <a className="text-uci-blue underline" href="https://www.itu.int/en/ITU-R/study-groups/rcpm/Pages/wrc-27-studies.aspx" target="_blank" rel="noreferrer">ITU-R WRC-27 study material</a>. Validate substrate properties, reference planes, calibration, PVT, layout discontinuities, and EM behavior for the actual hardware.</p>
          </aside>
        </div>
      </section>
    </PageWrapper>
  );
}

/* ──────────────────────────── SECTIONS ──────────────────────────── */

function SystemLinkSection() {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-2xl font-bold text-eng-blue dark:text-blue-300 mb-2">System Cascade Chain Builder</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Interactive drag-and-drop block diagram for cascade Gain, Noise Figure, and OIP3/IIP3 analysis.</p>
        <SystemCascadeBuilder />
      </div>

      <div>
        <h3 className="text-2xl font-bold text-eng-blue dark:text-blue-300 mb-2">Receiver Link Budget</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Evaluate detailed gain and noise figure requirements across an RF receiver front-end.</p>
        <ReceiverCascadeCalculator />
      </div>

      <div>
        <h3 className="text-2xl font-bold text-eng-blue dark:text-blue-300 mb-2">PLL Loop Filter Synthesis</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Estimate 2nd order passive charge-pump PLL loop filters with explicit bandwidth and phase-margin assumptions.</p>
        <PLLCalculator />
      </div>
    </div>
  );
}

function RadarSensingSection() {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-2xl font-bold text-eng-blue dark:text-blue-300 mb-2">Radar Range & Link Budget</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Calculate monostatic radar range and free space path loss (FSPL).</p>
        <RadarRangeCalculator />
      </div>

      <div>
        <h3 className="text-2xl font-bold text-eng-blue dark:text-blue-300 mb-2">FMCW & CW Radar Toolset</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Determine range resolution, IF-limited range, and Doppler shifts for mmWave sensors.</p>
        <FMCWRadarCalculator />
        <DopplerCalculator />
      </div>
    </div>
  );
}

function ActiveICSection() {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-2xl font-bold text-eng-blue dark:text-blue-300 mb-2">Oscillator & Synthesizer Tools</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Translate phase noise specifications into timing jitter for high-frequency clocks.</p>
        <PhaseNoiseCalculator />
      </div>

      <div>
        <h3 className="text-2xl font-bold text-eng-blue dark:text-blue-300 mb-2">Amplifier & General IC Limits</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Estimate linearity parameters and calculate absolute thermal noise limits for integrated circuits.</p>
        <LinearityCalculator />
        <ThermalNoiseCalculator />
      </div>
    </div>
  );
}

function AntennasMatchingSection() {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-2xl font-bold text-eng-blue dark:text-blue-300 mb-2">Automated Impedance Matching</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Synthesize ideal L-Network topologies between complex source and load impedances.</p>
        <ImpedanceMatchingCalculator />
      </div>

      <div>
        <h3 className="text-2xl font-bold text-eng-blue dark:text-blue-300 mb-2">Interactive Drag-and-Drop Smith Chart</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Visually build matching networks by dragging nodes along constant resistance and conductance circles.</p>
        <InteractiveSmithChart />
      </div>

      <div>
        <h3 className="text-2xl font-bold text-eng-blue dark:text-blue-300 mb-2">Phased Array & Antenna Synthesis</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Calculate optimal physical dimensions for patch antennas and visualize array factor patterns.</p>
        <PatchAntennaCalculator />
        <PhasedArrayCalculator />
      </div>
    </div>
  );
}

function PCBDesignSection() {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-2xl font-bold text-eng-blue dark:text-blue-300 mb-2">Transmission Line Calculators</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Interactive 3D trace impedance and substrate calculators using empirical conformal mapping models.</p>
        <MicrostripCalculator />
        <StriplineCalculator />
        <CPWCalculator />
      </div>

      <div>
        <h3 className="text-2xl font-bold text-eng-blue dark:text-blue-300 mb-2">PCB Via Parasitics</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Calculate inductance and capacitance of through-hole vias using the Goldfarb model.</p>
        <PCBViaCalculator />
      </div>

      <DielectricSection />
      <CoaxSection />
    </div>
  );
}

function FundamentalsSection() {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-2xl font-bold text-eng-blue dark:text-blue-300 mb-2">Quick Calculators</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Daily utilities for power conversions, standing wave ratios, and component constraints.</p>
        <DBCalculator />
        <VSWRCalculator />
        <SkinDepthCalculator />
      </div>

      <div>
        <h3 className="text-2xl font-bold text-eng-blue dark:text-blue-300 mb-6 flex items-center gap-3">
          Reflection & Mismatch Formulas
        </h3>
        <div className="grid sm:grid-cols-2 gap-6">
          <FormulaCard title="Reflection Coefficient (Γ)">
            <BlockMath math="\Gamma = \frac{Z_L - Z_0}{Z_L + Z_0}" />
          </FormulaCard>
          <FormulaCard title="Voltage Standing Wave Ratio (VSWR)">
            <BlockMath math="VSWR = \frac{1 + |\Gamma|}{1 - |\Gamma|}" />
          </FormulaCard>
          <FormulaCard title="Return Loss (RL)">
            <BlockMath math="RL (dB) = -20 \log_{10} |\Gamma|" />
          </FormulaCard>
          <FormulaCard title="Mismatch Loss (ML)">
            <BlockMath math="ML (dB) = -10 \log_{10} \left( 1 - |\Gamma|^2 \right)" />
          </FormulaCard>
          <FormulaCard title="Total Mismatch Loss (Both Ends)" note="Power-wave mismatch factor for the stated common reference plane; ΓS and ΓL are complex and the phase in the denominator matters.">
            <BlockMath math="ML = -10 \log_{10} \left[ \frac{(1 - |\Gamma_S|^2)(1 - |\Gamma_L|^2)}{|1 - \Gamma_S \Gamma_L|^2} \right]" />
          </FormulaCard>
          <FormulaCard title="Wavelength & Phase" note="Homogeneous, isotropic, nondispersive medium; phase is shown in degrees with f in Hz and delay in seconds.">
            <BlockMath math="\lambda = \frac{c}{f \sqrt{\epsilon_r \mu_r}}, \quad \phi[{}^\circ] = -360^\circ f[\mathrm{Hz}] T_D[\mathrm{s}]" />
          </FormulaCard>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-eng-blue dark:text-blue-300 mb-2">Waveguide Tools</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Cutoff frequency calculators and standard reference tables for rectangular waveguides.</p>
        <WaveguideCalculator />
      </div>
      
      <WaveguideSection />

      <div>
        <h3 className="text-2xl font-bold text-eng-blue dark:text-blue-300 mb-6 flex items-center gap-3">
          Component Reactance Formulas
        </h3>
        <div className="grid sm:grid-cols-2 gap-6">
          <FormulaCard title="Parallel Plate Capacitance">
            <BlockMath math="C_{pp} = \frac{A \epsilon_r \epsilon_0}{h}" />
          </FormulaCard>
          <FormulaCard title="Equivalent Parallel Capacitance" note="Valid for positive capacitive susceptance B under the e^{jωt} convention.">
            <BlockMath math="Y=G+jB, \quad C_p = \frac{B}{\omega}" />
          </FormulaCard>
          <FormulaCard title="Inductive Reactance (X_L)">
            <BlockMath math="X_L = 2\pi f L = 6.28 \cdot f_{GHz} \cdot L_{nH}" />
          </FormulaCard>
          <FormulaCard title="Capacitive Reactance (X_C)">
            <BlockMath math="|X_C| = \frac{1}{2\pi f C} \approx \frac{159.155}{f_{GHz} \cdot C_{pF}}\ \Omega" />
          </FormulaCard>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-eng-blue dark:text-blue-300 mb-6 flex items-center gap-3">
          Attenuator Formulas
        </h3>
        <div className="grid sm:grid-cols-2 gap-6">
          <FormulaCard title="Attenuator Power Dissipation">
            <BlockMath math="P_d = P_{in} \left( 1 - 10^{\frac{-dB}{10}} \right)" />
          </FormulaCard>
          <FormulaCard title="T-Pad Attenuator (N = 10^{dB/10})">
            <BlockMath math="R_1 = Z \frac{\sqrt{N}-1}{\sqrt{N}+1}, \ R_3 = \frac{2Z\sqrt{N}}{N-1}" />
          </FormulaCard>
        </div>
      </div>

      <VSWRSection />
      <BandsSection />
    </div>
  );
}

function SParameterSection() {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <h3 className="text-2xl font-bold text-eng-blue dark:text-blue-300">S-Parameter (.sNp) Analysis Hub</h3>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 text-xs font-medium text-green-700 dark:text-green-400 self-start">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
            100% Client-Side (No Data Collected)
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Upload supported Touchstone v1/v2 full-matrix S-parameter files (up to 12 ports) to plot and extract Y/Z parameters, group delay, Rollett stability metrics, and first-order equivalent models. Unsupported matrix formats and parameter types are rejected explicitly.</p>
        <p className="text-xs text-slate-500 dark:text-slate-500 mb-6 italic">Privacy Note: This tool processes your .sNp files entirely within your web browser. We do not upload, collect, or store any of your measurement or simulation data on our servers.</p>
        <SParameterViewer />
      </div>
    </div>
  );
}

/* ──────────────────────────── HELPER SECTIONS ──────────────────────────── */

function CoaxSection() {
  return (
    <div>
      <h3 className="text-2xl font-bold text-eng-blue dark:text-blue-300 mb-6">Coaxial Line Formulas</h3>
      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        <FormulaCard title="Characteristic Impedance (Z₀)">
          <BlockMath math="Z_0 \approx \frac{59.959}{\sqrt{\epsilon_r}} \ln\left(\frac{b}{a}\right)" />
        </FormulaCard>
        <FormulaCard title="Approx. First Higher-Order-Mode Cutoff" level="closed-form">
          <BlockMath math="f_c = \frac{c}{\pi (a + b) \sqrt{\mu_r \epsilon_r}}" />
        </FormulaCard>
        <FormulaCard title="Capacitance per Unit Length (C)">
          <BlockMath math="C = \frac{2 \pi \epsilon_0 \epsilon_r}{\ln(b/a)}" />
        </FormulaCard>
        <FormulaCard title="Inductance per Unit Length (L)">
          <BlockMath math="L = \frac{\mu_0 \mu_r}{2 \pi} \ln\left(\frac{b}{a}\right)" />
        </FormulaCard>
      </div>
      <div className="bg-white/60 dark:bg-slate-900/60 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 text-sm">
        <p><strong>a:</strong> Inner conductor outer radius (m)</p>
        <p><strong>b:</strong> Outer conductor inner radius (m)</p>
        <p><strong>ε_r:</strong> Relative permittivity of the dielectric</p>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">The TEM mode has no cutoff. The displayed cutoff is a common approximation for the lowest higher-order coaxial mode; exact modal cutoff depends on the conductor-radius ratio and should be solved numerically for precision work.</p>
      </div>
    </div>
  );
}

function VSWRSection() {
  return (
    <div>
      <h3 className="text-2xl font-bold text-eng-blue dark:text-blue-300 mb-6">VSWR & Power Transmission Table</h3>
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-slate-900/80 text-gray-900 dark:text-gray-100 font-semibold">
            <tr>
              <th className="px-6 py-4">VSWR</th>
              <th className="px-6 py-4">Return Loss (dB)</th>
              <th className="px-6 py-4">Trans. Loss (dB)</th>
              <th className="px-6 py-4">Refl. Coeff (Γ)</th>
              <th className="px-6 py-4">Trans. Power (%)</th>
              <th className="px-6 py-4">Refl. Power (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white/40 dark:bg-slate-950/40">
            {vswrTable.map((row, i) => (
              <tr key={i} className="hover:bg-white/80 dark:hover:bg-slate-900 transition-colors">
                <td className="px-6 py-3 font-medium text-uci-blue dark:text-blue-400">{row.vswr}</td>
                <td className="px-6 py-3">{row.rl}</td>
                <td className="px-6 py-3">{row.transLoss}</td>
                <td className="px-6 py-3">{row.reflCoeff}</td>
                <td className="px-6 py-3">{row.transPower}</td>
                <td className="px-6 py-3 text-red-600 dark:text-red-400">{row.reflPower}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WaveguideSection() {
  return (
    <div>
      <h3 className="text-2xl font-bold text-eng-blue dark:text-blue-300 mb-6">Standard Rectangular Waveguides Table</h3>
      <div className="mb-6 bg-uci-blue/5 border border-uci-blue/20 rounded-xl p-5">
        <h4 className="font-semibold text-eng-blue dark:text-blue-300 mb-2">Cutoff Frequencies (TE10 Mode)</h4>
        <BlockMath math="f_c = \frac{c}{2a} \approx \frac{149.9}{a} \text{ GHz (for a in mm)}" />
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-slate-900/80 text-gray-900 dark:text-gray-100 font-semibold">
            <tr>
              <th className="px-6 py-4">GB/T Model</th>
              <th className="px-6 py-4">EIA (WR)</th>
              <th className="px-6 py-4">Frequency (GHz)</th>
              <th className="px-6 py-4">Width a (mm)</th>
              <th className="px-6 py-4">Height b (mm)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white/40 dark:bg-slate-950/40">
            {waveguideTable.map((row, i) => (
              <tr key={i} className="hover:bg-white/80 dark:hover:bg-slate-900 transition-colors">
                <td className="px-6 py-3">{row.gb}</td>
                <td className="px-6 py-3 font-medium text-eecs-teal">{row.wr}</td>
                <td className="px-6 py-3">{row.freq}</td>
                <td className="px-6 py-3">{row.a}</td>
                <td className="px-6 py-3">{row.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DielectricSection() {
  return (
    <div>
      <h3 className="text-2xl font-bold text-eng-blue dark:text-blue-300 mb-6">Common Substrate Materials</h3>
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-slate-900/80 text-gray-900 dark:text-gray-100 font-semibold">
            <tr>
              <th className="px-6 py-4">Material / Product</th>
              <th className="px-6 py-4">Dielectric Const (εr)</th>
              <th className="px-6 py-4">Loss Tangent (tan δ)</th>
              <th className="px-6 py-4">Common Thicknesses</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white/40 dark:bg-slate-950/40">
            {dielectricsTable.map((row, i) => (
              <tr key={i} className="hover:bg-white/80 dark:hover:bg-slate-900 transition-colors">
                <td className="px-6 py-3 font-medium">{row.name}</td>
                <td className="px-6 py-3 text-uci-blue dark:text-blue-400">{row.er}</td>
                <td className="px-6 py-3 text-eecs-teal">{row.tand}</td>
                <td className="px-6 py-3 text-gray-600 dark:text-gray-400">{row.thickness}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Table values are representative process/specification Dk values, while calculator presets use typical design Dk where published. Dk is method- and frequency-dependent; always use the laminate vendor&apos;s value appropriate to the intended field solver and stackup.</p>
    </div>
  );
}

function BandsSection() {
  return (
    <div>
      <h3 className="text-2xl font-bold text-eng-blue dark:text-blue-300 mb-6">Frequency Bands & Applications</h3>
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-slate-900/80 text-gray-900 dark:text-gray-100 font-semibold">
            <tr>
              <th className="px-6 py-4">Band Name</th>
              <th className="px-6 py-4">Frequency Range</th>
              <th className="px-6 py-4">Wavelength</th>
              <th className="px-6 py-4">Typical Applications</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white/40 dark:bg-slate-950/40">
            {freqBandsTable.map((row, i) => (
              <tr key={i} className="hover:bg-white/80 dark:hover:bg-slate-900 transition-colors">
                <td className="px-6 py-3 font-medium text-uci-blue dark:text-blue-400">{row.band}</td>
                <td className="px-6 py-3 font-mono">{row.freq}</td>
                <td className="px-6 py-3 text-gray-600 dark:text-gray-400">{row.wavelength}</td>
                <td className="px-6 py-3">{row.applications}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">“FR3” has no single globally allocated 7.125–15.35 GHz block. The entries below identify separate WRC-27 study ranges and label them as study candidates, not existing mobile allocations. “Sub-THz” and “THz” overlap near 0.3 THz in common engineering usage.</p>
    </div>
  );
}

/* ──────────────────────────── HELPERS ──────────────────────────── */

function FormulaCard({ title, children, level = 'identity', note }: { title: string; children: React.ReactNode; level?: RFModelLevel; note?: string }) {
  return (
    <div className="bg-white/70 dark:bg-slate-900/70 rounded-2xl p-6 border border-white/50 dark:border-white/10 shadow-sm hover:shadow-md hover:border-uci-blue/30 transition-all duration-300">
      <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4 tracking-wide uppercase">{title}</h4>
      <RFModelBadge level={level} />
      <div className="flex justify-center items-center text-lg overflow-x-auto py-2">
        {children}
      </div>
      {note && <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{note}</p>}
    </div>
  );
}

'use client';

import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import SectionHeader from '@/components/SectionHeader';
import { 
  CheckCircle2, 
  Settings2, 
  Activity, 
  ArrowRight,
  MonitorPlay,
  Cpu,
  Layers,
  FileCode2,
  Crosshair,
  RadioTower,
  LineChart
} from 'lucide-react';

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
            badge="Video Resources"
            title="Measurement Tutorials"
            subtitle="Educational guides for VNA calibration, active circuit measurements, radar demos, and EDA workflows."
          />

          <div className="mt-12 space-y-12">
            
            {/* Channel Banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-uci-blue/5 border border-uci-blue/20 rounded-2xl p-6 glass-ios">
              <div>
                <h3 className="text-2xl font-bold text-eng-blue dark:text-blue-300 mb-2">RF/mmWave Video Collection</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  A curated collection of educational videos spanning high-frequency hardware measurements.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <a href="https://www.youtube.com/@xuyangliu3768?sub_confirmation=1" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-300">
                  <MonitorPlay className="w-5 h-5" />
                  Subscribe to Channel
                </a>
                <a href="https://www.youtube.com/@xuyangliu3768" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-semibold rounded-xl shadow-sm transition-all duration-300">
                  Visit @xuyangliu3768
                </a>
              </div>
            </div>

            {/* Module 1: 60GHz Radar Antenna Pattern */}
            <div className="glass-ios rounded-3xl p-6 sm:p-10 border border-white/40 dark:border-white/10">
              <div className="grid lg:grid-cols-2 gap-10 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-uci-blue/10 text-uci-blue dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                    <RadioTower className="w-4 h-4" /> Antenna Characterization
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    60GHz Radar Antenna Pattern Measurement
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                    This demonstration shows the measurement of an antenna radiation pattern for a 60GHz phase-locked FMCW radar transceiver (ESSCIRC & JSSC published).
                  </p>
                  
                  <div className="bg-white/50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                      <Settings2 className="w-4 h-4 text-uci-blue" />
                      Test Setup & Equipment
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span><strong>Device Under Test (DUT):</strong> 49-63 GHz FMCW Radar Transceiver with packaged antennas.</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span><strong>Reference Antenna:</strong> Horn antenna calibrated for V-band.</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span><strong>Mechanical Stage:</strong> High-precision rotary stage for angle sweeping.</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span><strong>Instrumentation:</strong> Spectrum Analyzer with V-band harmonic mixer for power detection.</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
                  <iframe className="absolute inset-0 w-full h-full" src="https://www.youtube.com/embed/GuXS8jPgpSQ" title="60GHz Radar" allowFullScreen></iframe>
                </div>
              </div>
            </div>

            {/* Module 2: 24GHz Radar Demo */}
            <div className="glass-ios rounded-3xl p-6 sm:p-10 border border-white/40 dark:border-white/10">
              <div className="grid lg:grid-cols-2 gap-10 items-center">
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 lg:order-1 order-2">
                  <iframe className="absolute inset-0 w-full h-full" src="https://www.youtube.com/embed/jyqjmBx2frc" title="24GHz Radar Demo" allowFullScreen></iframe>
                </div>
                <div className="space-y-6 lg:order-2 order-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-eecs-teal/10 text-eecs-teal text-xs font-bold uppercase tracking-wider">
                    <Crosshair className="w-4 h-4" /> System-Level Testing
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    ICLEGEND MICRO XenP202TT 24GHz Radar Demo
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                    A real-world performance demonstration of a 24GHz radar module tracking physical targets. This showcases how raw RF signals are processed into actionable tracking data in real-time.
                  </p>
                  
                  <div className="bg-white/50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-eecs-teal" />
                      Measurement Objectives
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span><strong>Target Emulation:</strong> Using a metallic corner reflector to provide a reliable, high RCS (Radar Cross Section) target.</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span><strong>Distance Resolution:</strong> Verifying the range accuracy extracted from the FMCW beat frequency (IF).</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span><strong>1D Angle Measurement:</strong> Evaluating the Field of View (FOV) and Angle of Arrival (AoA) estimation using RX antenna arrays.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Module 3: VCO Measurement */}
            <div className="glass-ios rounded-3xl p-6 sm:p-10 border border-white/40 dark:border-white/10">
              <div className="grid lg:grid-cols-2 gap-10 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
                    <LineChart className="w-4 h-4" /> Active Circuits
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    3.1GHz - 4.66GHz VCO Measurement
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                    Validating the performance of a wideband Voltage-Controlled Oscillator (VCO) intended for a TCAS-I paper submission. This type of measurement is critical for characterizing the purity of the local oscillator (LO) signal, verifying both phase noise and output power under room temperature conditions.
                  </p>
                  
                  <div className="bg-white/50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-purple-500" />
                      Key Parameters Extracted
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span><strong>Tuning Range:</strong> Sweeping the control voltage (Vtune) to verify the 3.1 - 4.66 GHz coverage.</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span><strong>Phase Noise:</strong> Measured typically at a 1MHz offset from the carrier to determine oscillator spectral purity.</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span><strong>Output Power:</strong> Ensuring sufficient LO drive strength across the entire tuning band.</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
                  <iframe className="absolute inset-0 w-full h-full" src="https://www.youtube.com/embed/lKwzEgkpngI" title="VCO Measurement" allowFullScreen></iframe>
                </div>
              </div>
            </div>

            {/* Module 4: Antenna PCB Integration */}
            <div className="glass-ios rounded-3xl p-6 sm:p-10 border border-white/40 dark:border-white/10">
              <div className="grid lg:grid-cols-2 gap-10 items-center">
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 lg:order-1 order-2">
                  <iframe className="absolute inset-0 w-full h-full" src="https://www.youtube.com/embed/cpQM-97AvMA" title="HFSS to KiCad" allowFullScreen></iframe>
                </div>
                <div className="space-y-6 lg:order-2 order-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500 text-xs font-bold uppercase tracking-wider">
                    <Layers className="w-4 h-4" /> Antenna PCB Integration
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    Export HFSS Antenna Design to KiCad
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                    A crucial step in hardware realization: taking a validated 3D electromagnetic antenna simulation and integrating it onto a PCB structure. This bridges the gap between EM physics and physical PCB fabrication.
                  </p>
                  
                  <div className="bg-white/50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                      <FileCode2 className="w-4 h-4 text-amber-500" />
                      Integration Timeline
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-400 shrink-0">1</div>
                        <div className="flex-1 text-sm text-slate-700 dark:text-slate-300"><strong>HFSS Export:</strong> Exporting the 2D layout geometry (usually DXF or GDSII format).</div>
                      </div>
                      <div className="flex items-center justify-start pl-3"><ArrowRight className="w-4 h-4 text-slate-400 rotate-90" /></div>
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-400 shrink-0">2</div>
                        <div className="flex-1 text-sm text-slate-700 dark:text-slate-300"><strong>KiCad Import:</strong> Importing the geometry to create a custom Footprint matching the exact EM simulation dimensions.</div>
                      </div>
                      <div className="flex items-center justify-start pl-3"><ArrowRight className="w-4 h-4 text-slate-400 rotate-90" /></div>
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-uci-blue/20 text-uci-blue dark:text-blue-400 flex items-center justify-center text-sm font-bold shrink-0">3</div>
                        <div className="flex-1 text-sm text-slate-700 dark:text-slate-300"><strong>Gerber Generation:</strong> Generating the standardized RS-274X Gerber and Drill files required by PCB fabs (e.g., JLCPCB, PCBWay).</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </PageWrapper>
  );
}

'use client';

import React, { useEffect, useMemo, useState, type ComponentType } from 'react';
import dynamic from 'next/dynamic';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import { vswrTable, dielectricsTable, waveguideTable, freqBandsTable } from './data';
import PageWrapper from '@/components/PageWrapper';
import PageHero from '@/components/PageHero';
import Shell from '@/components/Shell';
import ToolModule from '@/components/rf/ToolModule';
import { RFModelBadge, type RFModelLevel } from '@/components/RFModelBadge';
import {
  VSWRCalculator,
  DBCalculator,
  MicrostripCalculator,
  WaveguideCalculator,
  StriplineCalculator,
  CPWCalculator,
  SkinDepthCalculator,
  PCBViaCalculator,
  RadarRangeCalculator,
  DopplerCalculator,
  PhaseNoiseCalculator,
  LinearityCalculator,
  ThermalNoiseCalculator,
} from '@/components/Calculators';
import { ImpedanceMatchingCalculator, ReceiverCascadeCalculator, PatchAntennaCalculator, PLLCalculator } from '@/components/AdvancedCalculators';
import { InteractiveSmithChart } from '@/components/InteractiveSmithChart';
import FmcwScope from '@/components/rf/fmcw/FmcwScope';
import { rfCategories, rfTools, toolsIn, type RFCategoryId, type RFTool } from '@/data/rfTools';
import { normalize } from '@/lib/searchIndex';

const loadingPanel = () => <div className="h-[420px] animate-pulse rounded-[4px] bg-surface-2/40" aria-hidden="true" />;

// The heaviest instruments load their libraries (XYFlow, Recharts, three.js) on demand.
const SystemCascadeBuilder = dynamic(() => import('@/components/SystemCascadeBuilder'), { ssr: false, loading: loadingPanel });
const SParameterViewer = dynamic(() => import('@/components/SParameterViewer'), { ssr: false, loading: loadingPanel });
const PhasedArrayLab = dynamic(() => import('@/components/rf/PhasedArrayLab'), { ssr: false, loading: loadingPanel });

function SParameterHub() {
  return (
    <div className="flex flex-col gap-5">
      <p className="inline-flex w-fit items-center gap-2 rounded-[3px] border border-trace-2/45 px-2.5 py-1.5 font-mono text-[11px] text-trace-2 [font-stretch:87.5%]">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        100% client-side · no data collected
      </p>
      <p className="max-w-3xl text-[15px] leading-relaxed text-ink-2">
        Upload supported Touchstone v1/v2 full-matrix S-parameter files (up to 12 ports) to plot and extract Y/Z parameters, group delay, Rollett stability metrics, and first-order equivalent models. Unsupported matrix formats and parameter types are rejected explicitly.
      </p>
      <p className="text-xs italic text-ink-3">
        Privacy note: this tool processes your .sNp files entirely within your web browser. We do not upload, collect, or store any of your measurement or simulation data on our servers.
      </p>
      <SParameterViewer />
    </div>
  );
}

const TOOL_COMPONENTS: Record<string, ComponentType> = {
  'cascade-builder': SystemCascadeBuilder,
  'receiver-budget': ReceiverCascadeCalculator,
  'pll-loop-filter': PLLCalculator,
  'radar-range': RadarRangeCalculator,
  fmcw: FmcwScope,
  doppler: DopplerCalculator,
  'impedance-matching': ImpedanceMatchingCalculator,
  'smith-chart': InteractiveSmithChart,
  'patch-antenna': PatchAntennaCalculator,
  'phased-array': PhasedArrayLab,
  microstrip: MicrostripCalculator,
  stripline: StriplineCalculator,
  cpw: CPWCalculator,
  'pcb-via': PCBViaCalculator,
  'phase-noise': PhaseNoiseCalculator,
  linearity: LinearityCalculator,
  'thermal-noise': ThermalNoiseCalculator,
  's-parameters': SParameterHub,
  'db-power': DBCalculator,
  vswr: VSWRCalculator,
  'skin-depth': SkinDepthCalculator,
  waveguide: WaveguideCalculator,
};

const RF_TOOLBOX_MODEL_REVISION = '2026.07-r2';
const SOURCE_REVISION = process.env.NEXT_PUBLIC_GIT_SHA?.slice(0, 8) ?? 'local';
const FORMULA_COUNT = 16;

function matches(tool: RFTool, query: string) {
  const tokens = normalize(query).split(' ').filter(Boolean);
  const hay = normalize([tool.name, tool.summary, tool.keywords.join(' ')].join(' '));
  return tokens.every((t) => hay.includes(t));
}

/* ──────────────────────────── page ──────────────────────────── */

export default function RFToolboxPage() {
  const [active, setActive] = useState<RFCategoryId>(rfCategories[0].id);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const readCategory = () => {
      const params = new URLSearchParams(window.location.search);
      const requested = params.get('category') ?? '';
      const fromHash = rfTools.find((t) => t.id === window.location.hash.replace(/^#/, ''))?.category;
      const next = rfCategories.find((c) => c.id === requested)?.id ?? fromHash;
      if (next) setActive(next);
    };
    readCategory();
    window.addEventListener('popstate', readCategory);
    window.addEventListener('hashchange', readCategory);
    return () => {
      window.removeEventListener('popstate', readCategory);
      window.removeEventListener('hashchange', readCategory);
    };
  }, []);

  // A deep link to a tool (#tool-id) lands on it once its category has rendered.
  useEffect(() => {
    const id = window.location.hash.replace(/^#/, '');
    if (!id) return;
    const timer = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }), 60);
    return () => window.clearTimeout(timer);
  }, [active]);

  const selectCategory = (id: RFCategoryId, toolId?: string) => {
    setActive(id);
    setQuery('');
    const url = new URL(window.location.href);
    url.searchParams.set('category', id);
    url.hash = toolId ?? '';
    window.history.pushState({}, '', url);
    if (toolId) window.setTimeout(() => document.getElementById(toolId)?.scrollIntoView({ block: 'start' }), 60);
    else document.getElementById('bench')?.scrollIntoView({ block: 'start' });
  };

  const results = useMemo(() => (query.trim() ? rfTools.filter((t) => matches(t, query)) : null), [query]);

  return (
    <PageWrapper>
      <PageHero
        trail="RF Toolbox"
        title={
          <>
            RF &amp; Microwave <span className="accent-serif text-ink-2">Toolbox</span>
          </>
        }
        lede="Professional calculators and reference formulas for high-frequency hardware design."
        aside={<ToolFinder query={query} onQuery={setQuery} />}
      />

      <Shell id="bench" className="py-10 lg:py-14">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-12">
          <CategoryRail active={active} onSelect={selectCategory} />
          <div className="flex min-w-0 flex-col gap-8">
            {results ? <SearchResults results={results} query={query} onPick={selectCategory} /> : <CategoryView id={active} />}
          </div>
        </div>
        <Provenance />
      </Shell>
    </PageWrapper>
  );
}

function ToolFinder({ query, onQuery }: { query: string; onQuery: (q: string) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <label htmlFor="tool-finder" className="field-label">
          Find a tool
        </label>
        <div className="relative">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            id="tool-finder"
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="microstrip, noise figure, FMCW…"
            className="field-input h-[52px] pl-10 font-sans text-[15px] [font-stretch:100%]"
          />
        </div>
      </div>
      <dl className="grid grid-cols-3 border-t border-line">
        {[
          [String(rfTools.length), 'Tools'],
          [String(FORMULA_COUNT), 'Formulas'],
          ['0 B', 'Uploaded'],
        ].map(([value, label]) => (
          <div key={label} className="flex flex-col gap-1 pt-3">
            <dt className="order-2 kicker text-[10px]">{label}</dt>
            <dd className="order-1 readout text-[1.35rem]">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function CategoryRail({ active, onSelect }: { active: RFCategoryId; onSelect: (id: RFCategoryId, toolId?: string) => void }) {
  return (
    <nav aria-label="Tool categories" className="min-w-0 lg:sticky lg:top-[132px] lg:self-start">
      <p className="kicker mb-3 hidden px-3 lg:block">Categories</p>
      <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 lg:pb-0">
        {rfCategories.map((cat) => {
          const isActive = cat.id === active;
          const tools = toolsIn(cat.id);
          return (
            <li key={cat.id} className="shrink-0">
              <button
                type="button"
                onClick={() => onSelect(cat.id)}
                aria-current={isActive ? 'true' : undefined}
                className={`flex min-h-11 w-full items-center justify-between gap-4 whitespace-nowrap rounded-md px-3 text-left text-sm transition-colors lg:whitespace-normal ${
                  isActive ? 'bg-surface-2 font-semibold text-ink' : 'border border-line text-ink-2 hover:text-ink lg:border-transparent'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  {isActive && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-marker" aria-hidden="true" />}
                  {cat.name}
                </span>
                <span className="font-mono text-[11px] text-ink-3">{tools.length}</span>
              </button>
              {isActive && (
                <ul className="hidden flex-col py-1.5 pl-[26px] lg:flex">
                  {tools.map((tool) => (
                    <li key={tool.id}>
                      <a
                        href={`#${tool.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          onSelect(cat.id, tool.id);
                        }}
                        className="flex min-h-8 items-center gap-2 text-[13px] text-ink-3 transition-colors hover:text-ink"
                      >
                        {tool.name}
                        {tool.stage === '3d' && <span className="font-mono text-[9.5px] text-marker-ink">3D</span>}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-6 hidden border-t border-line px-3 pt-4 font-mono text-[10.5px] leading-relaxed text-ink-3 [font-stretch:87.5%] lg:block">
        RF model {RF_TOOLBOX_MODEL_REVISION}
        <br />
        source {SOURCE_REVISION}
      </p>
    </nav>
  );
}

function SearchResults({ results, query, onPick }: { results: RFTool[]; query: string; onPick: (id: RFCategoryId, toolId: string) => void }) {
  if (results.length === 0) {
    return (
      <div className="panel p-10 text-center">
        <p className="text-lg">No tool matches “{query}”.</p>
        <p className="mt-2 text-sm text-ink-3">Try a quantity such as impedance, noise figure or beamwidth.</p>
      </div>
    );
  }
  return (
    <div>
      <p className="kicker mb-4">
        {results.length} {results.length === 1 ? 'tool' : 'tools'} for “{query}”
      </p>
      <ul className="hairline-grid grid sm:grid-cols-2">
        {results.map((tool) => (
          <li key={tool.id} className="bg-surface">
            <button type="button" onClick={() => onPick(tool.category, tool.id)} className="group flex h-full w-full flex-col gap-3 p-6 text-left transition-colors hover:bg-surface-2/50">
              <span className="kicker text-[10px]">{rfCategories.find((c) => c.id === tool.category)?.name}</span>
              <span className="text-lg font-semibold [font-stretch:106%]">{tool.name}</span>
              <span className="text-sm leading-relaxed text-ink-2">{tool.summary}</span>
              <span className="mt-auto flex items-center gap-2 pt-1">
                <RFModelBadge level={tool.model} detail={tool.modelDetail} />
                {tool.stage && <span className="font-mono text-[10px] text-marker-ink">{tool.stage === '3d' ? '3D' : 'LIVE'}</span>}
                <span className="ml-auto font-mono text-marker-ink transition-transform group-hover:translate-x-1" aria-hidden="true">
                  →
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CategoryView({ id }: { id: RFCategoryId }) {
  const tools = toolsIn(id);
  const category = rfCategories.find((c) => c.id === id);
  return (
    <>
      <header className="flex flex-col gap-2">
        <p className="kicker">Category</p>
        <h2 className="display-3">{category?.name}</h2>
        <p className="text-[15px] text-ink-2">{category?.desc}</p>
      </header>
      {tools.map((tool, i) => {
        const Tool = TOOL_COMPONENTS[tool.id];
        return (
          <ToolModule key={tool.id} tool={tool} position={i + 1} count={tools.length}>
            {Tool ? <Tool /> : <p className="text-sm text-ink-3">This tool is not available.</p>}
          </ToolModule>
        );
      })}
      {id === 'pcb_design' && (
        <>
          <DielectricSection />
          <CoaxSection />
        </>
      )}
      {id === 'fundamentals_refs' && <FundamentalsReference />}
    </>
  );
}

function Provenance() {
  return (
    <aside className="mt-14 grid gap-4 border-t border-line pt-8 text-sm text-ink-3 lg:grid-cols-12">
      <h2 className="kicker lg:col-span-3">Model provenance &amp; engineering use</h2>
      <p className="leading-relaxed lg:col-span-9">
        Every calculator is labeled as an identity, closed-form approximation, rule of thumb, or simulation-dependent model. Results are design aids, not sign-off data. Principal references include the{' '}
        <a className="link-inline" href="https://qucs.sourceforge.net/tech/node75.html" target="_blank" rel="noreferrer">
          Hammerstad–Jensen / Kirschning–Jansen equations
        </a>
        , the official{' '}
        <a className="link-inline" href="https://ibis.org/touchstone_ver2.0/touchstone_ver2_0.pdf" target="_blank" rel="noreferrer">
          Touchstone 2.0 specification
        </a>
        ,{' '}
        <a className="link-inline" href="https://www.rogerscorp.com/advanced-electronics-solutions/ro4000-series-laminates/ro4003c-laminates" target="_blank" rel="noreferrer">
          Rogers laminate data
        </a>
        , and{' '}
        <a className="link-inline" href="https://www.itu.int/en/ITU-R/study-groups/rcpm/Pages/wrc-27-studies.aspx" target="_blank" rel="noreferrer">
          ITU-R WRC-27 study material
        </a>
        . Validate substrate properties, reference planes, calibration, PVT, layout discontinuities, and EM behavior for the actual hardware.
      </p>
    </aside>
  );
}

/* ──────────────────────────── reference material ──────────────────────────── */

function ReferenceBlock({ title, children, note }: { title: string; children: React.ReactNode; note?: React.ReactNode }) {
  return (
    <section className="rounded-[4px] border border-line bg-surface">
      <header className="border-b border-line px-5 py-4 sm:px-7">
        <p className="kicker text-[10.5px]">Reference</p>
        <h2 className="mt-1.5 text-xl font-bold tracking-[-0.01em] [font-stretch:106%]">{title}</h2>
      </header>
      <div className="px-5 py-6 sm:px-7">{children}</div>
      {note && <p className="border-t border-line px-5 py-4 text-xs leading-relaxed text-ink-3 sm:px-7">{note}</p>}
    </section>
  );
}

function FormulaGrid({ children }: { children: React.ReactNode }) {
  return <div className="hairline-grid grid sm:grid-cols-2">{children}</div>;
}

function FormulaCard({ title, children, level = 'identity', note }: { title: string; children: React.ReactNode; level?: RFModelLevel; note?: string }) {
  return (
    <div className="flex flex-col gap-3 bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="kicker text-[10.5px] text-ink-2">{title}</h3>
        <RFModelBadge level={level} />
      </div>
      <div className="flex items-center justify-center overflow-x-auto py-2 text-lg">{children}</div>
      {note && <p className="text-xs leading-relaxed text-ink-3">{note}</p>}
    </div>
  );
}

function DataTable({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-[4px] border border-line">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-2/60">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="whitespace-nowrap px-5 py-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-ink-3 [font-stretch:87.5%]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((cells, i) => (
            <tr key={i} className="transition-colors hover:bg-surface-2/40">
              {cells.map((c, j) => (
                <td key={j} className={`px-5 py-3 ${j === 0 ? 'font-medium text-ink' : 'text-ink-2'} ${typeof c === 'string' && /^[\d.,∞±\-–\s"]+$/.test(c) ? 'readout' : ''}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CoaxSection() {
  return (
    <ReferenceBlock
      title="Coaxial line formulas"
      note="a: inner conductor outer radius (m); b: outer conductor inner radius (m); εr: relative permittivity of the dielectric. The TEM mode has no cutoff. The displayed cutoff is a common approximation for the lowest higher-order coaxial mode; exact modal cutoff depends on the conductor-radius ratio and should be solved numerically for precision work."
    >
      <FormulaGrid>
        <FormulaCard title="Characteristic impedance (Z₀)">
          <BlockMath math="Z_0 \approx \frac{59.959}{\sqrt{\epsilon_r}} \ln\left(\frac{b}{a}\right)" />
        </FormulaCard>
        <FormulaCard title="Approx. first higher-order-mode cutoff" level="closed-form">
          <BlockMath math="f_c = \frac{c}{\pi (a + b) \sqrt{\mu_r \epsilon_r}}" />
        </FormulaCard>
        <FormulaCard title="Capacitance per unit length (C)">
          <BlockMath math="C = \frac{2 \pi \epsilon_0 \epsilon_r}{\ln(b/a)}" />
        </FormulaCard>
        <FormulaCard title="Inductance per unit length (L)">
          <BlockMath math="L = \frac{\mu_0 \mu_r}{2 \pi} \ln\left(\frac{b}{a}\right)" />
        </FormulaCard>
      </FormulaGrid>
    </ReferenceBlock>
  );
}

function DielectricSection() {
  return (
    <ReferenceBlock
      title="Common substrate materials"
      note="Table values are representative process/specification Dk values, while calculator presets use typical design Dk where published. Dk is method- and frequency-dependent; always use the laminate vendor's value appropriate to the intended field solver and stackup."
    >
      <DataTable head={['Material / product', 'Dielectric const (εr)', 'Loss tangent (tan δ)', 'Common thicknesses']} rows={dielectricsTable.map((r) => [r.name, r.er, r.tand, r.thickness])} />
    </ReferenceBlock>
  );
}

function FundamentalsReference() {
  return (
    <>
      <ReferenceBlock title="Reflection & mismatch formulas">
        <FormulaGrid>
          <FormulaCard title="Reflection coefficient (Γ)">
            <BlockMath math="\Gamma = \frac{Z_L - Z_0}{Z_L + Z_0}" />
          </FormulaCard>
          <FormulaCard title="Voltage standing wave ratio (VSWR)">
            <BlockMath math="VSWR = \frac{1 + |\Gamma|}{1 - |\Gamma|}" />
          </FormulaCard>
          <FormulaCard title="Return loss (RL)">
            <BlockMath math="RL (dB) = -20 \log_{10} |\Gamma|" />
          </FormulaCard>
          <FormulaCard title="Mismatch loss (ML)">
            <BlockMath math="ML (dB) = -10 \log_{10} \left( 1 - |\Gamma|^2 \right)" />
          </FormulaCard>
          <FormulaCard title="Total mismatch loss (both ends)" note="Power-wave mismatch factor for the stated common reference plane; ΓS and ΓL are complex and the phase in the denominator matters.">
            <BlockMath math="ML = -10 \log_{10} \left[ \frac{(1 - |\Gamma_S|^2)(1 - |\Gamma_L|^2)}{|1 - \Gamma_S \Gamma_L|^2} \right]" />
          </FormulaCard>
          <FormulaCard title="Wavelength & phase" note="Homogeneous, isotropic, nondispersive medium; phase is shown in degrees with f in Hz and delay in seconds.">
            <BlockMath math="\lambda = \frac{c}{f \sqrt{\epsilon_r \mu_r}}, \quad \phi[{}^\circ] = -360^\circ f[\mathrm{Hz}] T_D[\mathrm{s}]" />
          </FormulaCard>
        </FormulaGrid>
      </ReferenceBlock>

      <ReferenceBlock title="Standard rectangular waveguides">
        <div className="mb-5 rounded-[4px] border border-line bg-surface-2/40 p-4">
          <p className="kicker mb-1 text-[10.5px]">Cutoff frequency, TE₁₀ mode</p>
          <BlockMath math="f_c = \frac{c}{2a} \approx \frac{149.9}{a} \text{ GHz (for a in mm)}" />
        </div>
        <DataTable head={['GB/T model', 'EIA (WR)', 'Frequency (GHz)', 'Width a (mm)', 'Height b (mm)']} rows={waveguideTable.map((r) => [r.gb, r.wr, r.freq, r.a, r.b])} />
      </ReferenceBlock>

      <ReferenceBlock title="Component reactance formulas">
        <FormulaGrid>
          <FormulaCard title="Parallel plate capacitance">
            <BlockMath math="C_{pp} = \frac{A \epsilon_r \epsilon_0}{h}" />
          </FormulaCard>
          <FormulaCard title="Equivalent parallel capacitance" note="Valid for positive capacitive susceptance B under the e^{jωt} convention.">
            <BlockMath math="Y=G+jB, \quad C_p = \frac{B}{\omega}" />
          </FormulaCard>
          <FormulaCard title="Inductive reactance (X_L)">
            <BlockMath math="X_L = 2\pi f L = 6.28 \cdot f_{GHz} \cdot L_{nH}" />
          </FormulaCard>
          <FormulaCard title="Capacitive reactance (X_C)">
            <BlockMath math="|X_C| = \frac{1}{2\pi f C} \approx \frac{159.155}{f_{GHz} \cdot C_{pF}}\ \Omega" />
          </FormulaCard>
        </FormulaGrid>
      </ReferenceBlock>

      <ReferenceBlock title="Attenuator formulas">
        <FormulaGrid>
          <FormulaCard title="Attenuator power dissipation">
            <BlockMath math="P_d = P_{in} \left( 1 - 10^{\frac{-dB}{10}} \right)" />
          </FormulaCard>
          <FormulaCard title="T-pad attenuator (N = 10^{dB/10})">
            <BlockMath math="R_1 = Z \frac{\sqrt{N}-1}{\sqrt{N}+1}, \ R_3 = \frac{2Z\sqrt{N}}{N-1}" />
          </FormulaCard>
        </FormulaGrid>
      </ReferenceBlock>

      <ReferenceBlock title="VSWR & power transmission">
        <DataTable
          head={['VSWR', 'Return loss (dB)', 'Trans. loss (dB)', 'Refl. coeff (Γ)', 'Trans. power (%)', 'Refl. power (%)']}
          rows={vswrTable.map((r) => [r.vswr, r.rl, r.transLoss, r.reflCoeff, r.transPower, r.reflPower])}
        />
      </ReferenceBlock>

      <ReferenceBlock
        title="Frequency bands & applications"
        note="“FR3” has no single globally allocated 7.125–15.35 GHz block. The entries below identify separate WRC-27 study ranges and label them as study candidates, not existing mobile allocations. “Sub-THz” and “THz” overlap near 0.3 THz in common engineering usage."
      >
        <DataTable head={['Band name', 'Frequency range', 'Wavelength', 'Typical applications']} rows={freqBandsTable.map((r) => [r.band, r.freq, r.wavelength, r.applications])} />
      </ReferenceBlock>
    </>
  );
}

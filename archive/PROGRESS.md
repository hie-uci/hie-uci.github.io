# HIE Lab Website - Progress Update

## Date: May 17, 2026

### 1. Logo Redesign & Optimization
- **New Laboratory Logo:** Replaced the legacy circular logo with a modern, rectangular, typography-focused design ("HIE") featuring a prominent golden "I" surrounded by high-frequency wave graphics. 
- **Auto-Cropping Script:** Created and utilized a Python `PIL` script to automatically detect and crop the transparent bounding box of the AI-generated logo, removing excess padding to ensure maximum visibility in UI components.
- **Favicon Generation:** Wrote a Python script to convert the rectangular logo into a square, transparent, and padded `favicon.ico` (multi-resolution), completely replacing the default Next.js/Vercel black triangle in the browser tab.

### 2. Homepage Hero Redesign
- **Prominent Display:** Removed the squished logo from the small inline UCI badge. Instead, introduced a standalone, prominent display of the new HIE logo directly above the main title to serve as the core brand focal point (sized at `120x40`).
- **Badge Simplification:** Simplified the "UCI EECS / Samueli School of Engineering" badge to pure text to avoid crowding and improve visual hierarchy.
- **Navbar Visibility Fix:** Removed aggressive SVG filters (`#clean-logo-edges`) from the Navbar logo component. This filter was causing the transparent PNG to vanish in light/day mode. The new logo now renders perfectly across both light and dark themes.

---

## Date: April 28, 2026

### 1. Physics-Based Interactive Backgrounds
- Replaced the generic particle/circuit backgrounds with a custom **Fluid Plasma Physics Engine** (`FluidPlasmaBackground.tsx`).
- **Dark Mode (Night):** Renders high-energy, glowing plasma nodes with a strong electromagnetic repulsion effect when the mouse interacts with the grid.
- **Light Mode (Day):** Renders a clean, subtle water-like plasma grid (opacity reduced to 15%) with wider spacing. It functions like an elegant, interactive watermark without cluttering the cleanroom aesthetic.
- The physics engine simulates an electromagnetic field with mouse repulsion force, ambient wind/RF field wave propagation, and spring-based restoring forces.

### 2. Apple visionOS / iOS 18 "Liquid Glassmorphism" UI
- Upgraded all glass panels (`.glass-ios` in `globals.css`) from basic blurring to the latest Apple design standards.
- Increased backdrop blur to `40px` and saturation to `200%`.
- Replaced flat borders with 3D specular highlight gradients (light top-left, dark bottom-right) to simulate physical glass thickness.
- Implemented multi-layered inner and outer drop shadows to elevate the cards.
- Integrated a micro-level SVG fractal noise overlay using `mix-blend-mode: overlay` to give the glass a realistic frosted texture.

### 3. Dark Mode Integration & Text Contrast Fixes
- Added a permanent **Theme Switcher** to the main `Navbar` (sun/moon icon) allowing seamless toggling between "Cleanroom" (Light) and "Dark Space" (Dark) modes.
- **Critical Tailwind v4 Fix:** Resolved an underlying framework conflict where Tailwind v4 ignored the manual theme toggle in favor of the macOS system settings (causing "white text on white background" bugs). Implemented `@custom-variant dark (&:where(.dark, .dark *));` in `globals.css` to manually override the dark mode trigger.
- **Text Contrast Audit:** Swept through the entire homepage, converting all low-contrast gray text (`text-gray-500`, `text-slate-600`) on glass panels to high-contrast slate colors (`text-slate-900` for light mode, `text-slate-200` for dark mode) to ensure perfect readability against the vibrant underlying light refractions.

### 4. Refraction Orbs (Mesh Gradients)
- Placed massive, slow-pulsing background background mesh gradients (UCI Blue, EECS Teal, UCI Gold) at the absolute bottom layer (`z-0`) of the page.
- These orbs interact with the new Liquid Glass cards, causing beautiful, dynamic color refractions and edge highlights as the user scrolls, perfectly simulating premium physical materials.

---

## Date: May 11, 2026

### 1. iOS Safari Performance & Crash Fixes
- **Issue resolved:** Heavy `blur-[]` classes applied to massive DOM elements were exhausting WebKit GPU memory limits, causing total white-screen crashes on iOS devices.
- **Fix:** Swapped computationally expensive backdrop/background blurs with hardware-accelerated `radial-gradient` backgrounds. This achieves the exact same glowing/frosted visual aesthetic with near-zero performance cost on mobile.
- Added viewport height fallbacks (`min-height: 100vh` preceding `100dvh`) to ensure compatibility with older iOS Safari versions.
- Fixed a silent event listener memory leak in `FluidPlasmaBackground.tsx`.

### 2. Deep-Tech "RF Toolbox" Ecosystem Integration
- Built a highly structured, dedicated **RF Toolbox** page to serve as a world-class reference hub for the mmWave engineering community.
- Replaced static PNG formula sheets with beautiful, selectable native HTML math rendered via `KaTeX`.
- Added categorized tabs to streamline engineering workflows: **PCB & Transmission Lines**, **Antennas & Matching**, **System & Fundamentals**, and **Components & Waveguides**.

### 3. Complete Port of Private Swift Algorithms to Web
Deeply extracted and translated the algorithms from the lab's proprietary Swift `RFCalculationEngine` into interactive React components:
- **Impedance Matching Synthesizer:** Computes ideal High-Pass and Low-Pass L-Network topologies dynamically based on complex Source and Load impedances.
- **Custom Interactive Smith Chart:** Built a pure SVG React Smith Chart component that plots Source, Load, and intermediate tracking paths (Trajectories) in real-time.
- **Phased Array Synthesis:** Calculates HPBW, Grating Lobe conditions, and generates a dynamic SVG `PolarPlot` of the array factor radiation pattern.
- **Microstrip Patch Antenna:** Synthesizes width, length, and resonant edge impedance utilizing rigorous Hammerstad and Balanis radiation models.
- **Transmission Lines & Vias:** Features dynamic 3D isometric CSS-based previews of Microstrip, Stripline, and CPW structures. Implements the Goldfarb model for PCB through-hole via parasitics. Includes shared standard substrate presets (Rogers RO4350B, RO4003C, etc.).
- **System Cascade (Receiver):** Analyzes Thermal Noise Floor, SFDR, and total Sensitivity based on system IIP3, NF, and Bandwidth.

---

## 🔮 Future Directions & Handoff (State Saved)

The current platform is incredibly solid, but there is immense potential to grow the **RF Toolbox** into the absolute gold-standard web suite for RF/mmWave engineers globally. 

### ✅ Recently Completed (Session 2 - Advanced Engine & System Analysis)
- **Interactive Drag-and-Drop Smith Chart Matching 🎯:** Upgraded the toolbox with an interactive canvas. Users can literally "drag" a node along constant resistance/conductance circles. The math maps SVG screen coordinates back to $\Gamma$ and $Z/Y$, instantly outputting the exact series/shunt L or C value required to make that move in real-time.
- **Analytic Complex-to-Complex L-Network Engine:** Replaced the legacy "absorption method" with exact, analytic polynomial roots for matching arbitrary $Z_L$ to $Z_S^*$. This eliminates previous "no solution" errors caused by highly reactive parasitics at mmWave frequencies.
- **System Cascade Chain Builder (Block Diagram Tool) ⛓️:** Expanded the Receiver Calculator into a visual drag-and-drop block diagram (powered by `@xyflow/react`). Users can drop blocks (LNA, Mixer, Filter, PA) with Gain, NF, and OIP3. The engine automatically cascades the formulas (Friis equation for Noise Figure, cascade IP3 formulas) and displays the total system performance dynamically based on edge connections.
- **Advanced S-Parameter (.sNp) Analysis Hub 📊:** Built a robust, independent tab to upload and parse Touchstone `.sNp` files (up to 12 ports). Added `Recharts Brush` for deep frequency zooming. Extractable metrics now include:
  - *System:* Magnitude/Phase, VSWR, Group Delay (with strict phase unwrapping), Rollett's Stability Factor ($K$).
  - *Impedance:* Conversion to full Y-Parameters and Z-Parameters.
  - *Components:* Inductance ($L$), Capacitance ($C$), Quality Factor ($Q$), Equivalent Series Resistance (ESR), and Parallel Resistance ($R_p$).
  - *Mixed-Mode:* Orthogonal matrix transformation for 4-port networks ($S_{dd}$, $S_{cc}$, $S_{cd}$, $S_{dc}$).
- **High-Frequency Dispersion Modeling:** Integrated the rigorous Kirschning and Jansen (1982) dispersion model into the Microstrip Calculator for exact $\epsilon_{eff}(f)$ and $Z_0(f)$ calculation >10 GHz. Added explicit mmWave inaccuracy warnings to lumped Via models.

---

### ✅ Recently Completed (Session 3 - Tool Synergy & System Analysis)
- **Swept-Frequency Cascade Simulation (Tool Synergy) ⛓️+📊:** Upgraded the `SystemCascadeBuilder` to allow users to drag and drop `.s2p` files directly onto RF blocks. Linked the `sParameterEngine` to the Cascade Engine to iterate across frequency points, applying the Friis and IP3 formulas per frequency bin, and rendering a swept-frequency bode plot.
- **S-Parameter Trajectories on the Interactive Smith Chart 🎯+📊:** Added a "Smith Chart" view mode in the S-Parameter Viewer to plot complex $S_{11}$ and $S_{22}$ arrays directly onto the SVG Smith Chart as continuous frequency trajectories, mimicking VNA behavior.
- **Time-Domain Reflectometry (TDR) via IFFT (SI/PI Feature) ⏱️:** Added a "Time Domain" tab to the S-Parameter Hub using Inverse Fast Fourier Transform (IFFT) to convert frequency-domain $S_{11}$ data into a time-domain impulse/step response, calculating the impedance profile $Z(t)$.
- **PLL & Synthesizer Calculator 📻:** Added a loop filter design tool to calculate 2nd order passive loop filter components (C1, C2, R2) based on phase margin, loop bandwidth, VCO $K_{vco}$, and charge pump current.

---

## Date: May 12, 2026 (Session 4)

### 1. Dedicated "Measurements & Design" Educational Suite
- **Standalone Portal:** Extracted the tutorial content into a premium, dedicated page (`/measurement-tutorial`) to separate educational video resources from the calculation tools.
- **Content-First Redesign:** Analyzed 4 key laboratory videos (60GHz Radar, 24GHz Radar, VCO Performance, HFSS-to-PCB) and built custom-tailored UI modules for each.
- **Antenna PCB Integration Workflow:** Documented the exact 3-step physical integration timeline: *HFSS Export (DXF/GDS) -> KiCad Import (Footprint) -> Gerber Generation*.
- **Verified Measurement Metadata:** Cross-referenced transcripts and visual frames to ensure 100% accuracy in descriptions (e.g., specifying TCAS-I submission context for VCO measurements and standard-gain horn setups for 60GHz radar).
- **Channel Growth Integration:** Added a permanent, high-conversion YouTube subscription banner for the `@xuyangliu3768` channel.

### 2. Homepage Visibility & Resource Preview
- **Dynamic Resources Grid:** Integrated a 4-column "Measurements & Design Tutorials" preview section on the Home page, located strategically below the Silicon Showcase.
- **Interactive Thumbnails:** Implemented high-resolution YouTube thumbnail fetching with custom hover-scale effects and play-icon overlays using Framer Motion.
- **Smooth Navigation:** Connected the homepage preview directly to the new tutorial suite for a seamless user journey.

### 3. CI/CD Architecture Standardized (The "Final Fix")
- **Cleanroom Linting:** Systematically resolved all 40+ ESLint and TypeScript errors across the codebase. Replaced unsafe `any` types with robust interfaces (`LMatchSolution`, `RFBlockNodeData`, etc.), escaped JSX entities, and fixed React effect dependency arrays.
- **Modern Workflow Migration:** Replaced the legacy cross-repo push script with the **Official GitHub Actions for Pages** workflow.
- **Zero-Friction Deployment (gh-pages):** Isolated the static build artifacts on a dedicated `gh-pages` branch. This preserves the `main` branch as a pure source-code repository while ensuring the live site at https://hie.eng.uci.edu/ is always synced with the latest build.

---

## Date: May 13, 2026 (Session 5)

### 1. Website Redesign & Codebase Audit
- **README & AGENTS.md Refresh:** Re-wrote project documentation to reflect the latest tech stack (Matter.js, Recharts, XYFlow, KaTeX) and the dual-repo GitHub Pages deployment workflow.
- **YouTube UI Enhancement:** Upgraded the mobile layout for tutorial videos and optimized Next.js `<Image>` usage, fixing ESLint warnings. Improved the frosted glass styling (`backdrop-blur-2xl`) on the mobile navigation menu for better legibility against complex plasma backgrounds.
- **Smith Chart UX:** Added a one-click "Clear All" functionality to the Interactive Smith Chart to improve user reset flow.

### 2. RF Toolbox Information Architecture (IA) Restructuring
- **7-Category Expansion:** Reorganized the toolsets to better align with professional RF engineering workflows: *System & Link Budget*, *Radar & Sensing*, *Antennas & Matching*, *PCB & Transmission Lines*, *Active Circuits / IC*, *S-Parameter Analysis*, and *Fundamentals & Quick Refs*.

### 3. New Advanced Calculators Developed
- **Radar & Sensing:** Added FMCW Radar calculators (Range Resolution, Max Unambiguous Range), Doppler Shift estimators, and a full Monostatic Radar Range Equation (RRE) / Free Space Path Loss (FSPL) calculator.
- **Active Circuits / IC:** Integrated tools to convert Spot Phase Noise to Timing Jitter, estimate Linearity (P1dB to OIP3), and calculate Thermal Noise Floor limits (kTB).
- **2026 Spectrum Updates:** Updated the frequency bands reference table to include the newly allocated 6G Upper Mid-Band (FR3) spectrum (7.125-15.35 GHz).
- **Privacy Assurance:** Added a visible "100% Client-Side" privacy disclaimer to the S-Parameter Hub to assure engineers that sensitive `.sNp` files are not collected or uploaded to any server.

---

## 🔮 Future Directions & Handoff (State Saved)

The **HIE Lab Website** is now not just a showcase, but a functional engineering platform and educational hub.
1. **Tutorial Expansion:** Adding a new category for "Probe Station Basics" and "Cryogenic Measurement Setups".
2. **Active Device Synthesis:** Biasing networks and transistor stability analysis circles.
3. **Advanced TDR Features:** Spatial distance conversion based on substrate $T_{pd}$ (Time of Propagation Delay).

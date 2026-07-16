# Homepage Research Visual System

This document records how the homepage research images were derived from HIE Lab papers. The goal is not to illustrate a paper page literally. Each image translates one paper's central mechanism into a realistic scientific scene that can be understood before the visitor reads the caption.

## Shared visual language

- Start from a real paper: identify the physical object, the mechanism, and the measured outcome.
- Keep the chip, device, antenna, or layout as the visual anchor.
- Use electromagnetic fields, particles, or graph paths only as an explanatory layer.
- Use a near-black graphite environment, cyan-blue as the primary signal color, and restrained UCI gold as the secondary signal color.
- Keep important content inside the middle 70–75% so the same asset survives wide and narrow card crops.
- If a fabricated HIE Lab tape-out micrograph exists, preserve that exact die as a locked image-edit target; never synthesize a replacement chip or substitute a generic PCB.
- Do not generate paper pages, charts, labels, fake measurements, logos, people, or generic sci-fi circuitry.
- Treat every asset as a conceptual scientific visualization, not as a measurement photograph.

## Reusable prompt template

```text
Use case: stylized-concept
Asset type: homepage research-card image for a university <field> laboratory
Primary request: Create a technically grounded, realistic scientific visualization inspired by <paper title or contribution>. Show <physical anchor>. Visualize <core mechanism> using <restrained explanatory layer>. Convey <scientific outcome> without using a schematic, graph, or text.
Scene/backdrop: near-black graphite laboratory environment with subtle depth and clean negative space
Style/medium: premium photorealistic scientific product visualization, believable materials, top-tier university research website quality
Composition/framing: wide landscape, <camera angle>, all essential content inside the middle 70–75% for responsive crops
Lighting/mood: precise cinematic lighting, cyan-blue dominant with restrained UCI-gold accents
Materials/textures: <paper-specific materials>
Constraints: scientifically plausible; no labels; no text; no numbers; no logos; no watermark; no charts; no paper figure; no UI; no people
Avoid: neon cyberpunk, fantasy circuitry, generic motherboard, colorful clutter, flat infographic
```

## 1. Multi-Band mm-Wave Radars

Representative paper: X. Liu et al., “A CMOS 49–63-GHz Phase-Locked Stepped-Chirp FMCW Radar Transceiver,” IEEE JSSC, 2025. DOI: <https://doi.org/10.1109/JSSC.2025.3556649>

Paper-to-image translation:

- Physical anchor: a realistic HIE-style radar PCB based on the laboratory's own radar hardware.
- Antenna topology: four compact RX series-fed patch columns and two more widely spaced TX series-fed patch columns at the PCB radiating edge.
- Physical interaction: gold outgoing illumination must travel from TX to real targets, while cyan scattered returns must visibly travel back to RX.
- Sensing modes: a static corner reflector represents FMCW range and angle sensing; a small motor-driven vibrating metal target represents PMCW Doppler and micro-motion sensing.
- Avoided misrepresentation: no board-only composition, one-way beam, upright antenna screens, generic motherboard, automotive-ad scene, or other company's hardware.

```text
Use the supplied HIE radar PCB as the hardware identity anchor. Preserve one flat dark-navy RF board with four compact RX series-fed patch columns and two separated TX series-fed patch columns, then rotate the board so its radiating edge faces the targets. Place the board in the left foreground of a photorealistic dark optical-table scene. In the right half, place two real targets at different ranges and angles: one stationary aluminum corner reflector and one compact motor-driven vibrating metal disk. Show restrained coherent UCI-gold wavefronts leaving TX and reaching both targets, then clearly show cyan scattered wavefronts returning from each target to RX, forming unmistakable round-trip sensing loops. Add a precise restrained localization halo at the stationary reflector and a subtle Doppler or micro-vibration trail around the moving disk. Keep the hardware and interaction legible at homepage-card size. No charts, dashboard UI, point-cloud cage, vehicle, generic PCB, vendor logo, giant target, one-way beam, text, numbers, or watermark.
```

Final asset: `public/images/research/visuals/research-radar-target-interaction-v3.webp`

## 2. Sub-THz and THz Power Generation

Representative paper: H. R. Aghasi, A. Cathelin, and E. Afshari, “A 0.92 THz SiGe Power Radiator Based on a Nonlinear Harmonic Generation Theory,” IEEE JSSC, 2017. Paper: <https://ieeexplore.ieee.org/document/7819530>

Paper-to-image translation:

- Physical anchor: the actual HIE Lab 0.92 THz SiGe quadrupler tape-out die.
- Core mechanism: nonlinear harmonic generation and frequency multiplication beyond the transistor's conventional operating limit.
- Outcome: a low-frequency drive entering the real chip and a concentrated 0.92 THz harmonic leaving it.

```text
Precise-object edit using the supplied HIE Lab 0.92 THz SiGe quadrupler tape-out photograph as the immutable subject. Preserve the die outline, bond pads, metal traces, component geometry, material texture, proportions, orientation, and all visible fabrication details exactly; do not redesign, replace, beautify, or invent any part of the chip. Isolate the real die on a near-black graphite laboratory surface. Add only a restrained cyan low-frequency waveform entering the real input path from the left and a tighter UCI-gold high-frequency waveform leaving the real output path on the right, expressing nonlinear frequency quadrupling. Keep the edit photorealistic and understated, with the original tape-out die clearly dominant. No PCB, package, probe station, labels, text, numbers, logos, watermark, charts, UI, people, generic circuitry, invented components, or sci-fi effects.
```

Final asset: `public/images/research/visuals/research-thz-harmonic-power.webp`

## 3. Wideband Signal Generation

Representative paper: B. Moradi, X. Liu, and H. Aghasi, “A 76–82 GHz VCO in 65 nm CMOS With 189.3 dBc/Hz PN FOM and −0.6 dBm Harmonic Power for mm-Wave FMCW Applications,” IEEE TCAS-I, 2024. DOI: <https://doi.org/10.1109/TCSI.2023.3324608>

Paper-to-image translation:

- Physical anchor: two coupled octagonal resonant paths derived from the paper's differential and common-mode topology, rather than a literal die photograph.
- Core mechanism: the fundamental follows the inner differential path while the second harmonic follows the outer common-mode path; their alignment shapes waveform purity and tuning behavior.
- Outcome: successive tuning states converge into a clean, coherent millimeter-wave carrier with very little phase-noise halo.

```text
Use the supplied differential/common-mode oscillator path figure only as a structural topology reference. Do not reproduce its white schematic, labels, arrows, symbols, or typography. Create two precisely coupled octagonal resonant structures from realistic copper-gold RF metal on a dark silicon pedestal. A restrained cyan fundamental current follows the inner differential path, while a restrained UCI-gold second-harmonic current follows the outer common-mode path; make the two electromagnetic fields visibly phase-aligned at the central coupling region. Show three subtle translucent successive tuning states with slightly different wavelengths as ghosted time slices, converging into one exceptionally clean coherent millimeter-wave carrier with almost no diffuse phase-noise halo. Use a 16:9 low three-quarter macro composition in a near-black graphite environment. No die photograph, PCB, circuit diagram, labels, text, numbers, logos, graphs, spectrum analyzer, generic motherboard, or sci-fi effects.
```

Final asset: `public/images/research/visuals/research-signal-generation-concept-v2.webp`

## 4. AI-Driven Analog/RF Design

Representative paper: A. Mehradfar et al., “FALCON: An ML Framework for Fully Automated Layout-Constrained Analog Circuit Design,” NeurIPS, 2025. Preprint: <https://arxiv.org/abs/2505.21923>

Paper-to-image translation:

- Physical anchor: RF components and a physically credible integrated-circuit layout.
- Core mechanism: target specifications drive topology selection and an edge-centric graph neural network; gradient reasoning includes a differentiable layout cost.
- Outcome: a layout-aware circuit design produced from target performance.

```text
Create a realistic scientific visualization inspired by FALCON, an end-to-end machine-learning framework for layout-constrained analog and RF circuit design. On the left, represent target circuit specifications as a small cluster of clean luminous control markers with no text. In the center, build a three-dimensional edge-centric graph neural network whose nodes are recognizable RF components—transistors, capacitors, and inductors—connected by precise cyan and gold paths. The graph should visually optimize and collapse into a physically credible 22 nm RF integrated-circuit layout on the right, including octagonal spiral inductors, symmetric device placement, design-rule-aware spacing, and routed metal. A subtle gradient flow should connect specification, graph reasoning, and finished layout in one continuous scene. No labels, text, numbers, logos, watermark, paper figure, cartoon brain, humanoid robot, dashboard UI, or people. Avoid generic AI faces, Matrix code, blockchain aesthetics, and flat infographics.
```

Final asset: `public/images/research/visuals/research-ai-falcon.webp`

## 5. Emerging Device Technologies

Representative paper: M. Berahman and H. Aghasi, “Tunneling Field Effect Transistors Based on Janus Monolayer PtSSe,” IEEE Transactions on Nanotechnology, 2025. DOI: <https://doi.org/10.1109/TNANO.2025.3589902>

Paper-to-image translation:

- Physical anchor: dual-gate transistor with an atomically thin asymmetric PtSSe channel.
- Core mechanism: gate-controlled band-to-band tunneling through a Janus monolayer.
- Outcome: steep, low-voltage switching represented by a narrow controlled electron stream.

No generative redraw is used for this card. The original HIE Lab device visualization is retained pixel-for-pixel because its source, drain, dual-gate stack, and Janus channel already communicate the research clearly. The homepage applies only a subtle cool, darker CSS color grade plus the shared card vignette; this changes presentation without changing device geometry.

Final asset: `public/images/research/device-3.png`

# archive/

Frozen historical material. Nothing here is linked from an active document, and
nothing here should be trusted as current.

| File | What it is | Superseded by |
|---|---|---|
| `PROGRESS.md` | Design-change log, Feb–May 2026 — logo redesign, physics backgrounds, glassmorphism pass, RF Toolbox build-out. Last entry 2026-05-17. | `../STATE.md` for current state; `git log` for change history |
| `components/` | Pre-redesign React components, frozen 2026-09-24 when the Signal & Silicon redesign stopped using them: the physics canvas backgrounds (`FluidPlasmaBackground`, `ParticleField`, `FallingChipsBackground`, `WaveInterferenceBackground`, `GradientMesh`), `MagneticWrapper`, `ResearchVisual`, `PolarPlot`, `CircuitBackground`, `WaveformDivider`, `AnimatedResearchIcon`, the centred `SectionHeader`, the 2D `PhasedArrayCalculator` and the form-only `FMCWRadarCalculator`. Excluded from the build, lint and type-check. | `src/components/rf/PhasedArrayLab.tsx` and `src/components/rf/fmcw/FmcwScope.tsx` for the two calculators; `docs/DESIGN.md` for the current visual system |
| `legacy-utilities.css` | The `.glass`, `.glass-ios`, `.gradient-text`, `.card-hover`, `.section-divider` and `.animated-underline` classes, removed from `src/app/globals.css` on 2026-09-24 once nothing used them. | The token utilities in `src/app/globals.css` |

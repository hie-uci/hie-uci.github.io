# archive/

Frozen historical material. Nothing here is linked from an active document, and
nothing here should be trusted as current.

| File | What it is | Superseded by |
|---|---|---|
| `PROGRESS.md` | Design-change log, Feb–May 2026 — logo redesign, physics backgrounds, glassmorphism pass, RF Toolbox build-out. Last entry 2026-05-17. | `../STATE.md` for current state; `git log` for change history |
| `components/` | React components frozen 2026-09-24 when the RF Toolbox gained its 3D and animated tools: the 2D `PhasedArrayCalculator` with its `PolarPlot`, and the form-only `FMCWRadarCalculator`. Excluded from the build, lint and type-check. | `src/components/rf/PhasedArrayLab.tsx` and `src/components/rf/fmcw/FmcwScope.tsx` |
| `components/FluidPlasmaBackground.tsx` | The Home page's full-screen, mouse-reactive particle canvas, retired 2026-09-24: it redrew every frame with no off-screen pause and no reduced-motion check. | `src/components/home/HeroDieField.tsx` for the hero's motion, and a static dot grid in `src/app/page.tsx` |
| `components/MagneticWrapper.tsx` | The hover wrapper that pulled the Home hero's two buttons toward the pointer, retired 2026-10-21 with the buttons' gradient, glow and lift. | The shared `.btn` styles in `src/app/globals.css` |
| `components/GradientMesh.tsx` | Three drifting UCI-colour orbs behind the Home hero, retired 2026-10-21: the page's static colour washes already tint the hero, and perpetual drift read as template decoration. | The static washes in `src/app/page.tsx` |
| `components/AnimatedResearchIcon.tsx` | Animated line icons for the five research thrusts, shown in tinted tiles on Home's research cards and the Research page's project headers; retired 2026-10-21 with those tiles. | Nothing: the cards lead with their images and titles |

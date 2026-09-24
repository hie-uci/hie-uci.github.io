# HANDOFF — 2026-09-24

## Current state

- Deployed on `main` (`3a227d4`): six buttons that showed eng-blue text on a coloured fill
  in light mode now use `text-on-accent` — the RF Toolbox's active category, the
  S-parameter upload button and its three view toggles, and the tutorials page's
  Subscribe button. Verified on all four Pages CDN nodes and by a light + dark contrast
  scan of every route on the live site; dark mode renders pixel-identical to before.
- The RF Toolbox audits from earlier today stand as recorded in `STATE.md`.
- A brainstorm of 3D / animated visuals for the Home page and every subpage was given in
  the session. Nothing is built yet.

## Important context

- The maintainer prefers the existing style: new visuals go into existing slots (the
  hero's die photos, the research card images, the contact map placeholder), and every
  visual change is previewed locally before it is deployed.
- Physics visuals follow the RF Toolbox rule: computed from a named model, or labelled
  illustrative.
- Reuse the RF Toolbox 3D kit — `src/components/rf/three/stageRuntime.ts`,
  `ThreeCanvas.tsx`, `palette.ts`: lazy loading, render on demand, off-screen pause,
  reduced motion, theme colours.
- Performance debts to settle before adding 3D: `FluidPlasmaBackground` (Home) runs its
  canvas loop continuously, with no off-screen pause or reduced-motion check; the
  tutorials page loads four YouTube iframes eagerly (branch `redesign/signal-and-silicon`
  has a click-to-load `VideoFacade`); framer-motion loops ignore reduced motion.

## Next steps

- [ ] The maintainer picks which 3D ideas to prototype. Candidates: a Home hero die field
      (the 14 blurred die photos in real depth, replacing FluidPlasma); research card
      scenes (radar first on `fmcw.ts`, a reflectarray beam on `arrayPattern.ts`); one
      shared WebGL hero field replacing the 2D `CircuitBackground` on the eight subpage
      heroes; a 3D die-on-probe-station view in the chip lightbox; a globe of invited
      talks and alumni destinations; a 60 GHz antenna-pattern turntable on the tutorials
      page.
- [ ] Optional: the Smith Chart toggle is white on emerald-600, 3.65:1 in both themes.
- [ ] Still open from before: three alumni photos look swapped against the names, and
      most PhD portraits are low resolution.

## Decisions made

- The six buttons moved to `text-on-accent` instead of the hero rule being narrowed.
  Exempting elements that carry their own `bg-*` class would also exempt hero ghost
  buttons (`hover:bg-white/10 text-white`), which would then turn white on the light
  glass hero.
- The emerald Smith Chart toggle was left alone: its contrast is the same in both themes
  and the hero rule does not cause it, so changing it is a visual change to preview.

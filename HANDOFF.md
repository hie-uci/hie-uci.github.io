# HANDOFF — 2026-09-24

## Current state

- Deployed on `main` today, each verified on all four Pages CDN nodes:
  - `3a227d4` — six buttons that showed eng-blue text on a coloured fill in light mode now
    use `text-on-accent` (RF Toolbox active category, the S-parameter upload button and
    view toggles, the tutorials page's Subscribe button).
  - `9706223` — Home 3D: the hero's 13 die photos as slabs in depth with pointer parallax,
    drift and an occasional ring; the radar card's photo stays its cover and a live FMCW
    scene fades in on hover (lab's 49–63 GHz die, corner reflector, sphere on a linear
    stage, readouts from `fmcw.ts`). Checked in a real browser on the live site: the 3D
    layers draw, no failed requests, no console errors.
- `FluidPlasmaBackground` no longer runs on Home (a static dot grid replaced it) and was
  moved to `archive/components/`.
- Gates green: lint, typecheck, 80 tests, build.

## Important context

- The maintainer prefers the existing style: new visuals go into existing slots, and
  every visual change is previewed before it is deployed. What worked today: a local
  branch, screenshots, and the dev server's URL; the maintainer then said "deploy".
- Physics visuals follow the RF Toolbox rule: computed from a named model, or labelled
  illustrative (the radar caption states the example chirp and the slowed waves).
- New 3D pieces reuse `src/components/rf/three/stageRuntime.ts` and `ThreeCanvas.tsx`;
  decorative ones pass `requireGpu` — on a software WebGL context this page runs at
  0.3 fps. Screenshot 3D with default headless Chrome (it uses the GPU); forcing
  SwiftShader makes the page look broken when it is not.

## Next steps

- [ ] Candidates from the brainstorm, not yet picked: the other research cards
      (reflectarray beam on `arrayPattern.ts` next); the radar scene on the research
      page; one shared WebGL hero field for the eight subpage heroes (replacing the 2D,
      hard-coded-colour `CircuitBackground`); a 3D die-on-probe-station view in the chip
      lightbox; a globe of invited talks and alumni destinations; a 60 GHz
      antenna-pattern turntable on the tutorials page (after click-to-load videos).
- [ ] Optional: the Smith Chart toggle is white on emerald-600, 3.65:1 in both themes.
- [ ] Still open: three alumni photos look swapped against the names, and most PhD
      portraits are low resolution.

## Decisions made

- The light-mode buttons moved to `text-on-accent` rather than narrowing the hero rule,
  which would also exempt hero ghost buttons (`hover:bg-white/10 text-white`).
- The radar card's second target is a sphere, not the photo's plate: a sphere echoes the
  same from every angle, so the scene stays physically consistent as it moves.
- The hero keeps the flat mosaic's layout: each die sits at the depth its old blur
  implied and at its old on-screen size, and far dies keep a baked-in blur.

# HANDOFF — 2026-09-24

## Current state

- The **"Signal & Silicon" redesign is live** on https://hie.eng.uci.edu since 2026-09-24.
  `main` was fast-forwarded from `redesign/signal-and-silicon`; CI passed and the new
  HTML, CSS, scripts and images return 200 from all four Pages CDN nodes.
- Every page is redesigned. The RF Toolbox gained a 3D phased-array lab, animated
  microstrip/stripline/patch/waveguide stages, a cascade builder with a level diagram
  and noise/linearity budgets, and an animated FMCW chirp scope.
- Content moved out of the page files into `src/data/` (verbatim; research and
  publications were checked field by field with the TypeScript parser).
- Gates green: lint, typecheck, 75 tests, build (17 static routes). On the live site,
  deep links (`?q=`, `?chip=`, `#person`) and client-side navigation were checked.

## Important context

- Every push to `main` deploys. After a deploy, follow the CDN check in `STATE.md`.
- Design rules, tokens and measured contrast: `docs/DESIGN.md`. Where content lives:
  `STATE.md` → "Site map".
- After adding or replacing any image, run `python3 scripts/make-image-derivatives.py`.
- Dev server: a `globals.css` edit saved together with a component edit can be skipped;
  save the CSS again on its own.
- The design canvas used to plan this work is a private artifact in the maintainer's
  Claude account; it is not referenced from this public repo.

## Next steps

- [ ] Collect feedback from the lab on the live redesign.
- [ ] Get PhD portraits at 800 px or more; today's are 160–230 px, so they stay small.
- [ ] Check the three alumni photos whose file names look swapped (listed in `STATE.md`).
- [ ] Optional: drop the unused `@heroicons/react` and `matter-js` dependencies.
- [ ] Optional: one sentence and an outbound link to `ai4circuit.com` on the research page.

## Decisions made

- Dark Space is the default theme; Cleanroom is the light theme. Both are token-driven.
- The header is opaque: its view-transition name makes a backdrop blur impossible.
- Portraits are shown at about 150 px because of their source resolution. Real faces are
  never AI-upscaled.
- Research figures are never cropped; they sit on white plates and open in the lightbox.
- Filters live in the URL through a small suspended component, so the static HTML still
  carries every entry.
- The director is labelled "Director", not "Principal Investigator".
- Superseded components and CSS utilities moved to `archive/`, not deleted.

# HANDOFF — 2026-09-24

## Current state

- The site keeps its pre-redesign look (restored earlier today with a revert commit).
- The RF Toolbox now carries the tools ported from the redesign branch, restyled to the
  current look: phased-array beam lab, FMCW chirp scope, cascade level diagram and
  budgets, and three.js stages in the microstrip, stripline, CPW, patch and waveguide
  calculators. Merged to `main` from `feature/rf-tools-port` and deployed on approval.
- Gates: lint, typecheck, 68 tests, build.

## Important context

- The maintainer wants the overall UI unchanged, every toolbox formula real and checked,
  and every illustrative element labelled as such. `STATE.md` → "RF Toolbox models"
  lists what was verified and the four model errors that were fixed.
- The audit scripts (numpy/scipy re-implementations and a 2D finite-difference field
  solver) are kept outside the repo; the unit tests carry their reference values.
- Switching between this branch line and `redesign/signal-and-silicon` leaves stale CSS
  in `.next/dev`; move it aside and restart the dev server.

## Next steps

- [ ] Audit the remaining toolbox calculators (listed under "Open" in `STATE.md`).
- [ ] Fix the dark-on-blue active sidebar title in light mode, if the maintainer wants it.
- [ ] Still open from before: three alumni photos look swapped against the names, and
      most PhD portraits are low resolution.

## Decisions made

- Tool chrome maps the redesign's token names to the site palette in `globals.css`
  instead of rewriting every component, so the tools and the site share one palette.
- Layouts use container queries: the toolbox content column is only about 540–800 px.
- Model fixes follow the named references (Balanis ch. 14, Simons ch. 2) rather than
  keeping the old numbers; each fix has a unit test that fails on the old formula.

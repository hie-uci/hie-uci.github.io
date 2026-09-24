# HANDOFF — 2026-09-24

## Current state

- Deployed on `main`: the RF Toolbox tools ported from the redesign, and two model audits
  that between them cover every calculator and reference table, with new visuals — a 3D
  via, a 3D skin-depth view and an animated VSWR standing wave. Gates green: lint,
  typecheck, 80 tests, build.
- Fixes in the second audit: linearity offset (OIP3 = OP1dB + 10.64 dB), via inductance
  (Goldfarb–Pucel instead of the +1 rule), S-parameter TDR step, L-match Smith path along
  real arcs, VSWR table, WR-19/WR-15 names, GaAs loss tangent. Details in `STATE.md` →
  "RF Toolbox models".

## Important context

- The maintainer wants every formula real and checked, illustrative parts labelled, and
  visual changes previewed before deploying.
- The smaller calculators' formulas now live in `src/lib/rfCalculators.ts` with tests; the
  components only format and lay out.
- The audit scripts (numpy/scipy re-implementations, a cubic-amplifier simulation, a
  Neumann integral for via inductance, a 2D field solver) are kept outside the repo.

## Next steps

- [ ] Fix the dark-on-blue active sidebar title in light mode, if the maintainer wants it.
- [ ] Still open from before: three alumni photos look swapped against the names, and
      most PhD portraits are low resolution.

## Decisions made

- The via keeps the Johnson–Graham capacitance, labelled empirical, because no
  closed-form physics model covers pad-to-plane capacitance for an arbitrary stack.
- The VSWR visual is a 2D animated plot rather than 3D: the Vmax / Vmin ratio and the
  λ/2 period read better on axes.
- Each fix has a unit test that fails on the old formula.

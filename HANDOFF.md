# HANDOFF — 2026-09-24

## Current state

- The live site is back to its pre-redesign style. The working tree matches commit
  `624388b` exactly, restored with a revert commit on `main` (no history rewritten).
- Gates as before the redesign: lint, typecheck, 29 tests, build.

## Important context

- A complete redesign was built, deployed and reverted today because the maintainer does
  not like its look. It is kept on branch `redesign/signal-and-silicon` and in the
  history of `main`.
- Parts of it are independent of the look and could be ported into the current style if
  wanted: RF Toolbox 3D stages and the FMCW chirp scope, the cascade level diagram and
  budgets, ⌘K site search, publication search with shareable links, deep links to single
  chips, and WebP copies of the heavy research figures.
- Show screenshots or a local preview before deploying any future visual change.

## Next steps

- [ ] Only if the maintainer asks: port chosen features from the redesign branch in the
      current style.
- [ ] Three alumni photos look swapped against the names: Mengjie (Kaylee) Xie uses
      `alumni-annika.png`, Kelly Aung Lu uses `alumni-kaylee.jpg`, Annika Ageles Del
      Rosario uses `alumni-kelly.jpg`.
- [ ] Most PhD portraits are only 160–230 px wide; better photos would help.

## Decisions made

- Reverted with `git revert` rather than a force-push; the repository is public and its
  history stays intact.

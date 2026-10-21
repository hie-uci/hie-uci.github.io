# HANDOFF — 2026-10-21

## Current state

- Branch `design/fewer-boxes`, three local commits on top of `main` (`20d8de0`), **not
  pushed, not deployed**:
  - `3196ae1` — buttons (shared `.btn` styles), section headers without the caps pill and
    gradient bar, a plainer `.glass-ios`, Home news and the News page as one panel of rows
    (`NewsPanel`), Home videos in their real shapes, tutorials page spec lists. Approved.
  - `4da3c35` — second pass: navbar, subpage backdrop, footer, Home hero (solid title),
    chip strip, Team, Publications (citation-style rows per year), Research, Contact,
    Positions, Teaching, Chip Gallery (keyboard-openable photos, Escape closes).
  - `bbddb1b` — ten chip-application line drawings beside Home's section headings,
    `src/components/home/vignettes/` (shared `frame.tsx`: clock, `Vignette`, `Flanked`).
  - The typography commit after it: Montserrat (UCI's primary face) for headings, the system
    face for text, semibold headings with near-normal tracking, balanced display headings,
    one section rhythm on Home, a fixed 704 px heading column between the drawings. It also
    fixes fonts that never applied (see STATE "Known gotchas").
- Gates green on the branch: lint, typecheck, 80 tests, build; two-theme contrast scan
  shows only the known Smith Chart toggle; no console errors on Home.

## Important context

- The maintainer called the site's boxes and buttons "AI"-looking but wants the existing
  style kept: palette, glass panels, centred headings, chip backgrounds, hero.
- They want more animation, not less: application animations go in the margins beside
  headings (xl and up), never in the main content, each captioned "Illustration, <chip>".
- Every visual change is previewed first (screenshots plus the dev server); deploy only
  when the maintainer says so, then merge to `main` and `git push origin main`.
- UCI's brand (verified on brand.uci.edu): UCI Blue `#255799`, UCI Gold `#fecc07`,
  Montserrat primary, Arial for academic web body. The site still uses `#0064a4` /
  `#ffd200` and Geist; a preview was shown, no decision yet.

## Next steps

- [ ] Get the maintainer's word on deploying the branch (all three commits, or the first
      two first).
- [ ] Their decision on UCI colours and Montserrat.
- [ ] Pre-existing, found this session: Team and Publications heroes stay dark in light
      mode (JSON-LD `<script>` is the first child); Allen Huang's bio starts "received the
      B.S."; the tutorials subtitle mentions VNA calibration videos that do not exist;
      three alumni photos may be swapped.
- [ ] `STATE.md` is over 15 KB: the RF Toolbox audit table could move to its own doc.

## Decisions made

- Lists are lists: news, publications, alumni, courses and contact details are rows in
  one panel, not a stack of cards. Category is a coloured dot with its name.
- Media keep their real shape: phone-shot clips stand upright on Home and on the
  tutorials page instead of being pillarboxed.
- Vignettes render on the client only and stop when off screen; under reduced motion
  they hold a representative still.
- Physics in the vignettes uses named models where one exists (radar phase x = λφ/4π,
  `elementPattern` cos^q, beam influence line, real water lines at 557 and 752 GHz);
  everything else is marked as illustration.

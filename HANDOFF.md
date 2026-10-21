# HANDOFF — 2026-10-21

## Current state

- The design pass is live on https://hie.eng.uci.edu. Branch `design/fewer-boxes` (six
  commits) was fast-forwarded into `main` and deployed at `5e64327` on 2026-10-21; this
  docs commit follows it. All four GitHub Pages edge IPs served the new build, every CSS,
  JS and font file it references returned 200, and the live Home page loads Montserrat,
  shows all ten drawings and logs no console errors.
- What shipped: shared `.btn` button styles; section headers without the caps pill and
  gradient bar; a plainer `.glass-ios`; news, publications, alumni, courses and contact
  details as rows in one panel; Home videos in their real shapes; navbar, footer and
  subpage backdrop without the template effects; ten chip-application line drawings
  beside five Home headings; Montserrat headings over system-face text; and the font
  wiring that never applied (see STATE "Known gotchas").
- Gates green: lint, typecheck, 80 tests, build. The maintainer closed this round after
  the deploy.

## Important context

- The maintainer called the site's boxes and buttons "AI"-looking but wants the existing
  style kept: palette, glass panels, centred headings, chip backgrounds, hero.
- They want more animation, not less: application animations go in the margins beside
  headings (xl and up), never in the main content, each captioned "Illustration, <chip>".
- Every visual change is previewed first (screenshots plus the dev server); deploy only
  on the maintainer's word.
- Push as the `hie-uci` GitHub account (STATE "Deployment"); another active account gets a
  403.

## Next steps

- [ ] UCI's official colours (`#255799` / `#fecc07`): previewed, no decision.
- [ ] Pre-existing, found this round: Team and Publications heroes stay dark in light
      mode (JSON-LD `<script>` is the first child); Allen Huang's bio starts "received the
      B.S."; the tutorials subtitle mentions VNA calibration videos that do not exist;
      three alumni photos may be swapped.
- [ ] The Smith Chart toggle is white on emerald-600, 3.65:1 (preview a darker green).
- [ ] `STATE.md` is about 17 KB, over the 15 KB soft limit: the RF Toolbox audit table
      could move to its own doc (offered, not done).

## Decisions made

- Lists are lists: news, publications, alumni, courses and contact details are rows in
  one panel, not a stack of cards. Category is a coloured dot with its name.
- Media keep their real shape: phone-shot clips stand upright on Home and on the
  tutorials page instead of being pillarboxed.
- Headings use Montserrat, UCI's primary typeface; running text stays in the system UI
  face, and long paper titles stay in the text face.
- Vignettes render on the client only and stop when off screen; under reduced motion
  they hold a representative still.
- Physics in the vignettes uses named models where one exists (radar phase x = λφ/4π,
  `elementPattern` cos^q, beam influence line, real water lines at 557 and 752 GHz);
  everything else is marked as illustration.

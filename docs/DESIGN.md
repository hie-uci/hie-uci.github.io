# Signal & Silicon — the HIE Lab design system

The site should read like the lab's own instruments and papers: precise, quiet, and
confident. It is built from four rules.

1. **Type does the work.** Hierarchy comes from size, width and weight of one family,
   not from boxes, badges or colour.
2. **Hairlines, not shadows.** Structure is drawn with 1 px lines and grids. No glass,
   no drop shadows, no gradient cards.
3. **Real artifacts only.** Die photos, measured figures, portraits and working
   instruments. No stock art, no decorative icons standing in for content.
4. **Motion explains.** Things move when the movement carries information (a sweep, a
   field, a travelling wave). Every animation stops when the visitor asks for less motion.

Tokens live at the top of `src/app/globals.css`; this file explains how to use them.

---

## Themes and colour

Two themes share one vocabulary. **Dark Space** is the default; **Cleanroom** is the light
theme. Components use tokens only, so a component written once works in both.

| Token | Role | Cleanroom | Dark Space |
|---|---|---|---|
| `--bg` | page | `#f6f7f9` | `#060a12` |
| `--surface` / `--bg-raised` | cards, plots | `#ffffff` | `#0b1322` / `#0a1120` |
| `--ink` / `--ink-2` / `--ink-3` | text, three steps | `#0b1b2e` / `#3a4a5e` / `#5b6b80` | `#f2f5fa` / `#b7c2d3` / `#8a96ab` |
| `--line` / `--line-strong` | hairlines | ink at 12 % / 24 % | blue-grey at 14 % / 28 % |
| `--accent` / `--accent-ink` | actions / interactive text | `#0064a4` UCI Blue | `#0064a4` / `#38bdf8` |
| `--trace` / `--trace-2` | plotted signals | `#0064a4` / `#3d6b72` | `#38bdf8` / `#7fb3ba` |
| `--marker` / `--marker-ink` | UCI Gold, as fill / as text | `#ffd200` / `#8a6a00` | `#ffd200` / `#ffd200` |
| `--alert` | errors, out-of-range values | `#b0421f` | `#f28b6a` |
| `--series-1…8` | categorical chart colours | see stylesheet | see stylesheet |

**Gold is one marker per view.** It marks the single thing that matters most in a view:
the active navigation item, the tightest headroom on a level diagram, the newest award.
If two things are gold, neither is.

**Data gets the series colours**, assigned in a fixed order (chain order, category order)
so the same thing keeps its colour across a canvas, its legend and its budget bars.

**Errors use `--alert`**, never the series red, so an error never reads as a data series.

### Measured contrast (WCAG 2.2)

Computed from the token values above. Body text needs 4.5:1; UI marks and large text 3:1.

| Pair | Cleanroom | Dark Space |
|---|---|---|
| `ink` on `bg` / `surface` | 16.18 / 17.35 | 18.13 / 17.00 |
| `ink-2` on `bg` / `surface` | 8.44 / 9.05 | 11.01 / 10.32 |
| `ink-3` on `bg` / `surface` | 5.08 / 5.44 | 6.63 / 6.22 |
| `accent-ink` on `bg` / `surface` | 5.83 / 6.25 | 9.25 / 8.67 |
| `marker-ink` on `bg` / `surface` | 4.73 / 5.07 | 13.65 / 12.80 |
| `alert` on `bg` / `surface` | 5.37 / 5.76 | 8.19 / 7.68 |
| `trace-2` on `bg` / `surface` | 5.53 / 5.92 | 8.55 / 8.01 |
| white on `accent` (primary button) | 6.25 | 6.25 |
| `on-marker` on `marker` (gold button) | 8.10 | 13.65 |
| `series-1…8` on `surface` (lowest) | 4.04 | 7.68 |

Re-run the numbers whenever a token changes; a new token is not done until it has a row.

---

## Type

Three families, loaded with `next/font` in `src/app/layout.tsx`:

| Family | Variable | Use |
|---|---|---|
| **Mona Sans** (variable width) | `--font-sans` | everything by default; display sizes widen with `font-stretch` |
| **Instrument Serif** | `--font-serif` | a single italic phrase per view: the word *Laboratory*, a thrust's tagline |
| **Martian Mono** (variable width) | `--font-mono` | numbers, units, labels, code, instrument readouts |

| Utility | For |
|---|---|
| `display-hero`, `display-1`, `display-2`, `display-3` | page and section titles, wide and heavy |
| `lede` | the paragraph under a title |
| `kicker` | small mono uppercase labels: section numbers, field names, categories |
| `readout` | tabular mono numbers, as on an instrument |
| `accent-serif` | the one italic serif phrase |
| `math-var` | Greek letters and variables inside mono labels (τ, f_b, ΔR). Martian Mono has no Greek, and its fallback draws τ like a capital T. |

Numbers that are compared (counts, results, years) are always `readout`. Units sit next to
the number at a smaller size, and never wrap on their own.

---

## Layout

- **`Shell`** (`src/components/Shell.tsx`) is the page column: 1600 px max, 20/32/48 px gutters.
- **`PageHero`** opens every subpage: a breadcrumb (`HIE / Page`), a `display-1` title, a
  lede, and an optional aside. The aside is usually a row of three or four `readout`
  counts over a strong hairline.
- **`SectionHead`** opens a major section: a strong hairline, a numbered mono label
  (`01 · PhD students`), a `display-2` title and an optional intro on the right.
  Smaller sections use just the numbered label as their heading.
- **Hairline grids.** Cards sit in a grid with `gap-px` over a `bg-line` background, so the
  gaps become 1 px rules (`hairline-grid` does this in one class).
- **Corner ticks** (`ticks`, `ticks-marker`) frame an instrument or a specimen: tool
  modules, die-photo plates, the positions callout. The targeted module lights its ticks gold.
- **Sticky bars.** A filter bar under the header sticks at `top-[66px]` (`xl:top-[107px]`);
  year labels in long lists stick just below it.

---

## Imagery

- **Portraits** are duotone (ink shadows over a pale ground) and turn to colour on hover,
  focus or touch — see `Portrait` in `src/components/team/`. Most member photos are only
  160–230 px wide, so they are never shown larger than about 150 px. Ask for new photos
  at 800 px or more before designing anything that shows them bigger.
- **Die photos** sit on white plates with corner ticks in both themes; their own margins
  are white. The lightbox shows the lossless original.
- **Research figures** are diagrams and plots, so they are never cropped: they sit whole
  on white plates in a column layout and open in the lightbox.
- **Web copies.** `scripts/make-image-derivatives.py` writes the WebP copies the pages use
  (chips at 1200 and 480 px, portraits at 640 px, research figures at 1400 px) and records
  the research figure sizes in `src/data/researchFigureSizes.json`. Re-run it after adding
  or replacing any image. Originals are never modified.
- **Videos** load only when played (`VideoFacade`), from `youtube-nocookie.com`.

---

## Motion

- `html[data-motion]` is `full` or `reduced`, set before first paint by an inline script
  from the visitor's saved choice or their system setting. The header toggle changes it.
  `useMotionMode()` reads it in components; framer-motion follows it through `MotionConfig`.
- Under `reduced`, CSS animations finish instantly, 3D stages render a still frame, the
  FMCW sweep cursor hides and videos do not autoplay.
- Section reveals use CSS scroll-driven animation (`data-reveal`); page changes use React
  view transitions. Both are progressive enhancement: without support, content simply shows.
- New motion needs a reason a reader would give: "it shows the wave travelling", not
  "it feels alive".

---

## Components worth knowing

| Component | Where | Notes |
|---|---|---|
| `PageHero`, `SectionHead`, `Shell` | `src/components/` | page skeleton |
| `Portrait` | `src/components/team/` | duotone portrait from `src/data/team.ts` |
| `Lightbox` | `src/components/Lightbox.tsx` | gallery viewer: arrows, Escape, 2.4× magnifier, link to original |
| `Stepper`, `Slider`, `Segmented`, `Readout` | `src/components/rf/controls.tsx` | instrument controls shared by every RF tool |
| `ToolModule` | `src/components/rf/` | frame, badges and copy-link for an RF tool |
| 3D stages | `src/components/rf/three/` | three.js on demand: pause off-screen, dispose on unmount |
| `CascadeLineup`, `FmcwScope` | `src/components/rf/` | hand-drawn SVG instruments sized from their container |
| `CommandPalette` | `src/components/` | ⌘K / Ctrl K / `/` search over `src/lib/searchIndex.ts` |
| `VideoFacade` | `src/components/` | click-to-load YouTube player |

### Patterns

- **URL-synced filters.** Publications (`?q=`, `?type=`) and the chip gallery (`?chip=`)
  read the URL in a tiny component inside its own `Suspense` boundary, so the static HTML
  still carries the full list, and write back with `history.replaceState`. Copy that
  pattern for any new filterable list.
- **Year-grouped lists** (publications, news): a strong hairline per year, the year as a
  large sticky `readout`, entries divided by hairlines.
- **Numbered sections** (research thrusts, positions, tutorials): `01` in gold mono, a
  kicker, a title, then two columns of text and facts.

---

## Things this system does not do

- Glass panels, gradient headers, drop shadows, blurred orbs, rainbow icon tiles.
- Colour-coded "pill" tags for every attribute. A category is a quiet kicker with, at
  most, one small coloured mark.
- Centred page titles over dark gradient banners.
- Icons as decoration. An icon earns its place by being a real symbol (a schematic glyph,
  a play button, an external-link arrow).
- Greek letters in the mono font without `math-var`.

# STATE — HIE Lab public website

Last updated: 2026-09-24

> **2026-09-24: a full visual redesign was deployed and then reverted the same day** at
> the maintainer's request; they prefer the existing style. The site's tree is identical
> to commit `624388b` again. The redesign is preserved on branch
> `redesign/signal-and-silicon` and in `main`'s history (commits `44473c3` to `8e00916`),
> so individual features can be brought back later. **Preview any visual change with the
> maintainer before deploying it.**
>
> **Later on 2026-09-24 the redesign's RF Toolbox tools were ported into the current
> look** — 3D stages, phased-array beam lab, FMCW chirp scope, cascade level diagram and
> budgets — with a formula audit that fixed four pre-existing model errors (see "RF
> Toolbox models"). The maintainer approved screenshots first; the work was merged to
> `main` from branch `feature/rf-tools-port` and deployed the same day.

## What this is

`hie.eng.uci.edu` — the lab's public face. A **pure static Next.js export**, built by
GitHub Actions and served by GitHub Pages.

**This repository has no backend.** No API routes, no authentication, no database, no
server-side anything. Every file under `out/` is a publicly fetchable asset. That is a
deliberate property, not a gap — see "Boundaries" below.

| | |
|---|---|
| Repo | `hie-uci/hie-uci.github.io` — **public, and stays public** |
| Live | https://hie.eng.uci.edu (custom domain via `public/CNAME`) |
| Deploy | `git push origin main` — nothing else |
| Stack | Next.js 16.2 · React 19.2 · Tailwind v4 · TypeScript 5.9 |
| Export | `output: "export"`, `trailingSlash: true`, `images.unoptimized: true` |

## Boundaries — what does NOT live here

The member portal, the lab tools and the AI-for-Circuit project site are a **separate
application, in a separate private repository**. Nothing about them is in this repo, and
nothing about them should be added to it — including their infrastructure. This
repository is public; the portal's is not, and the asymmetry is deliberate.

| | this repo | the portal project |
|---|---|---|
| Visibility | **public** | private |
| Serves | `hie.eng.uci.edu` — the public lab site | `portal.ai4circuit.com` and the AI-for-Circuit project site |
| Holds | pages, images, RF toolbox | login, task board, booking, internal library, simulation demo |

Its working directory is checked out alongside this one; the maintainer's own notes have
the path. It is deliberately not written down here.

**Two standing rules:**

1. **No AI-for-Circuit demo content on this site.** Not the simulation demo, not a
   results page, not an embed. AI for Circuit is one of the lab's projects and has its
   own site at `ai4circuit.com`, served by the portal application. If it should be
   mentioned here at all, it is a sentence and an outbound link on the research page —
   never a feature of this site. (Verified absent 2026-08-24: the only portal reference
   in the whole tree is the constant below.)
2. **The only touchpoint is one constant.** `src/components/Navbar.tsx:14` —
   `const PORTAL_URL = 'https://portal.ai4circuit.com'` — rendered as the "Member Login"
   link in both the desktop rail and the mobile menu. Anything more coupled than an
   `<a href>` belongs in the portal, because a portal outage must never be able to take
   the lab's public face down with it.

Backend work — accounts, documents, simulation, `ai4circuit.com` copy — is done by
opening the portal project, whose own `STATE.md` / `HANDOFF.md` are the authority for it.
`git push` in the wrong repo reports "Everything up-to-date" and means it, about the
other repo.

## Deployment

`git push origin main` is the whole procedure. `.github/workflows/deploy.yml` then runs
**lint → typecheck → test → build → deploy-pages** (~70 s).

`origin` and `pages` are two names for the **same** repository
(`hie-uci/hie-uci.github.io`). There is no two-remote dance and no force-push; the old
`HIE-Lab-Website` mirror is private and no longer part of the deploy path.

`out/` is **not** tracked — CI builds it. A red gate means the site silently does not
update, so run the gates locally first:

```bash
npm run lint && npm run typecheck && npm test   # or: npm run validate (adds build)
```

## Site map

Twelve routes, each a directory under `src/app/` with its own `layout.tsx` for metadata:

`/` · `/research` · `/research-projects` · `/rf-toolbox` · `/measurement-tutorial` ·
`/publications` · `/team` · `/chip-gallery` · `/news` · `/teaching` · `/contact` ·
`/available-positions`

Plus `robots.ts` and `sitemap.ts` (generated at build).

**Content is data arrays inside the page files**, not a CMS. To edit:

| Content | Where |
|---|---|
| Homepage news / research areas | `src/app/page.tsx` → `newsItems`, `researchAreas` |
| Publications | `src/app/publications/page.tsx` → `publications` |
| News timeline | `src/app/news/page.tsx` → `newsItems` |
| Team | `src/app/team/page.tsx` → `phdStudents`, alumni, … |
| RF Toolbox | `src/app/rf-toolbox/data.ts`, `src/components/Calculators.tsx` |
| Videos | `src/app/measurement-tutorial/page.tsx` |

## Code

- `src/components/` — Navbar (two-tier, fixed), Footer, ThemeSwitcher
  (next-themes, dark/light), several canvas/physics backgrounds
  (`FluidPlasmaBackground`, `FallingChipsBackground` via Matter.js, `ParticleField`),
  and the RF visualisation set (`SmithChart`, `InteractiveSmithChart`,
  `SParameterViewer`, `SystemCascadeBuilder` on XYFlow).
- `src/components/rf/` — the RF Toolbox instruments: `controls.tsx`,
  `PhasedArrayLab`, `CascadeLineup`, `fmcw/` (chirp scope) and `three/` (three.js stages
  for microstrip, stripline, CPW, patch, waveguide and the array pattern; loaded lazily,
  rendered on demand, paused off-screen, still under `prefers-reduced-motion`). They read
  the instrument tokens (`--ink`, `--trace`, `--line`, …) defined in `globals.css` with
  the site palette, and size themselves with container queries because the toolbox
  content column is narrower than the viewport.
- `src/lib/` — the only tested code: `cascadeMath.ts`, `rfMath.ts`,
  `sParameterEngine.ts`, `arrayPattern.ts`, `fmcw.ts`, `patchAntenna.ts` (each with a
  `.test.ts`), plus the client hooks `useElementWidth.ts`, `useMediaQuery.ts`,
  `useMotionMode.ts`, and `basePath.ts` and `metadata.ts`.
- `public/images/` — 21 member photos, 40 research images, 5 composite chip images,
  15 individual die photos, 1 logo.

## Quality gates — green as of 2026-09-24

| | |
|---|---|
| `npm run lint` | clean |
| `npm run typecheck` | clean — `tsc --noEmit`, no `ignoreBuildErrors` escape hatch any more |
| `npm test` | **68 tests, 0 fail** (node:test over `src/lib/*.test.ts`) |

## RF Toolbox models (audited 2026-09-24)

The ported tools and the calculators they sit in were cross-checked against independent
implementations of the textbook formulas (numpy/scipy) and, for the transmission lines, a
2D finite-difference Laplace solve of each cross-section. The scripts are kept outside
this repo; the unit tests carry the reference values and say where each came from.

| Tool | Model | Status |
|---|---|---|
| Phased array | planar array factor × cos^q θ element; D = 4πU_max/∫U dΩ | D within 0.01 dB of exact/numeric references |
| | peak sidelobe | **fixed**: was the φ-cut sidelobe (up to 16 dB optimistic); now a whole-pattern (u, v) search |
| | grating lobes | **fixed**: was the worst case 1/(1+sin θ₀); now the exact lattice check with φ₀ |
| FMCW | ΔR = c/2B, S = B/Tc, R_max = f_IF·c/2S, f_b = S·2R/c, rect/Hann responses | exact |
| Cascade | Friis NF, 1/IIP3 = Σ G/IIP3ᵢ, kT₀B·F·G, SFDR = ⅔(IIP3 − N_in) | exact |
| Waveguide | TE₁₀ f_c = c/2a, λg, evanescent α | exact |
| Microstrip / stripline | Hammerstad–Jensen + Kirschning–Jansen / Cohn–Pozar | field solve agrees to 0.2 % |
| CPW | Simons finite-substrate conformal map | **fixed**: k₁ used tanh(πS/8h); now sinh(πS/4h)/sinh(π(S+2W)/4h), exact K(k)/K(k′) (was 4–5 % off in Z₀) |
| Patch | Balanis ch. 14 TL model; Rin = 1/(2(G₁+G₁₂)); two-slot directivity | **fixed**: Rin used the wide-slot asymptote and no G₁₂ (≈40 % low); directivity integral lacked sin²θ |

What is illustrative rather than computed is stated in each tool's note: T-line field
lines are sketches, the travelling waves and every animation are slowed down, the array's
element grid size and travelling rings are decorative, the FMCW magnifier states its zoom.

## Known gotchas

- **Deploy is one push.** Any instruction to `git push pages main --force` is stale;
  both remotes are the same repo. Force-pushing a public repo is a way to lose history
  for nothing.
- **Static export means no server.** `output: "export"` — API routes, server actions,
  middleware and dynamic rendering all fail the build or silently do nothing. If a
  feature needs a server, it is portal work and belongs in the other repository.
- **`<Image>` needs the export rules.** `images.unoptimized` is global; GIFs still want
  an explicit `unoptimized` prop, and the chip lightbox uses `unoptimized` +
  `quality={100}` for full resolution.
- **The logo needs its real dimensions.** `width={922} height={137}` plus
  `object-contain` and `w-auto`; anything else squashes it.
- **Changed a source image and nothing changed?** Delete the `.next/` cache directory,
  then **restart** the dev server — it does not recover on its own.
- **Previewing `out/` locally**: serve it and append a query string (`?v=2`). The
  browser caches `index.html` hard enough to hand you a stale build to debug.
- **Never commit secrets, credentials, local filesystem paths, or anything describing
  private infrastructure.** This repo is public and stays public — making it private
  would take `hie.eng.uci.edu` offline, since free-plan GitHub Pages will not serve from
  a private repository. There is no undo: a push is a publication, and scrubbing a file
  afterwards does not remove it from the history anyone already cloned.
- **Right after a deploy the site can render unstyled for up to 10 minutes.** GitHub
  Pages' CDN (Fastly) is not updated atomically: a browser can fetch the new `index.html`
  while its edge node still lacks the new hashed `_next/static/chunks/*.css`, and the
  resulting 404 is cached with `max-age=600` on that node (query strings do not bust it).
  Seen 2026-08-28 — one node served a cached 404 while the other three served the file.
  Fix: `gh run rerun <run-id>` on the deploy workflow — a fresh Pages deployment purges the
  CDN. Do not declare a deploy done until the CSS referenced by the live HTML returns 200
  from every `dig +short hie.eng.uci.edu` IP (`curl --resolve hie.eng.uci.edu:443:<ip>`).
- **`.claude/settings.local.json` is not tracked**, and should not be re-added. It
  accumulates machine-local permission entries, including absolute paths to other
  checkouts.

## Open

- [ ] `AGENTS.md`'s "Content Data Locations" duplicates the table above — one of the two
      should point at the other rather than drifting separately.
- [ ] Continued expansion of the RF Toolbox and the measurement video resources
      (the only feature work that was outstanding as of May 2026).
- [ ] Audit the toolbox calculators the 2026-09-24 pass did not cover (VSWR, dB, skin
      depth, via, radar range, Doppler, phase noise, linearity, thermal noise, L-match,
      Smith chart, receiver cascade, PLL, S-parameter viewer) the same way.
- [ ] On the RF Toolbox the active sidebar button's title is dark blue on blue in light
      mode: the subpage hero rule recolours every `.text-white` inside the page's first
      section. Pre-existing; a one-line fix.

Superseded history lives in `archive/PROGRESS.md` (design-change log, Feb–May 2026) and
is not linked from anywhere active.

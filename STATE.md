# STATE — HIE Lab public website

Last updated: 2026-09-24

> **The "Signal & Silicon" redesign went live on 2026-09-24**, fast-forwarded to `main`
> from branch `redesign/signal-and-silicon` (deploy run 36034590711, verified on all four
> Pages CDN nodes). Design rules: `docs/DESIGN.md`.

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
2. **The only touchpoint is one constant.** `PORTAL_URL` in `src/data/site.ts`
   (`'https://portal.ai4circuit.com'`) — rendered as the "Member Login" link in both the desktop rail and the mobile menu. Anything more coupled than an
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

**Content is data modules under `src/data/`**, not a CMS. Pages, the homepage and the
⌘K site search all read the same module, so one edit lands everywhere:

| Content | Where |
|---|---|
| Publications, talks, patents | `src/data/publications.ts` |
| News | `src/data/news.ts` (the homepage shows the first six) |
| Team, alumni, director CV | `src/data/team.ts` |
| Die photos | `src/data/chips.ts` |
| Research: homepage summaries / full text | `src/data/research.ts` / `src/data/researchProjects.ts` (verbatim from the original site) |
| RF Toolbox catalogue | `src/data/rfTools.ts`; calculators in `src/components/Calculators.tsx`, `AdvancedCalculators.tsx` and `src/components/rf/` |
| Measurement videos | `src/data/tutorials.ts` |
| Navigation, contact details, portal URL | `src/data/site.ts` |

After adding or replacing any image, run `python3 scripts/make-image-derivatives.py`: the
pages use its WebP copies, and the research page reads the sizes it writes to
`src/data/researchFigureSizes.json`.

## Code

- `src/components/` — the shell (`Navbar`, `Footer`, `CommandPalette`, `ThemeSwitcher`,
  `MotionToggle`), page skeleton (`PageHero`, `SectionHead`, `Shell`), `Lightbox`, and
  per-page folders: `home/`, `team/`, `research/`, `publications/`, `chips/`, `news/`,
  `contact/`. The RF Toolbox lives in `rf/`: shared controls, `ToolModule`, the three.js
  stages in `rf/three/`, the cascade lineup and the FMCW scope in `rf/fmcw/`.
- `src/lib/` — tested logic: `cascadeMath`, `rfMath`, `sParameterEngine`, `arrayPattern`,
  `fmcw`, `spectrum`, `searchIndex`, `publicationSearch` (each with a `.test.ts`), plus
  small hooks (`useMotionMode`, `useMediaQuery`, `useElementWidth`) and `metadata.ts`.
- `archive/` — superseded code and CSS, excluded from the build, lint and type-check.

## Quality gates — green, 2026-09-24 (deployed)

| | |
|---|---|
| `npm run lint` | clean |
| `npm run typecheck` | clean — `tsc --noEmit`, no `ignoreBuildErrors` escape hatch |
| `npm test` | **75 tests, 0 fail** (node:test over `src/lib/*.test.ts`) |
| `npm run build` | 17 static routes; deep links (`?q=`, `?chip=`, `#person`) checked on the export |

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
- **The header is opaque on purpose.** It carries `view-transition-name`, which makes it a
  backdrop root, so a `backdrop-filter` inside it has nothing behind it to blur and page
  text shows through a translucent background.
- **Dev server: a CSS edit saved in the same instant as a component edit can be skipped.**
  Turbopack then keeps serving the old stylesheet. Save `globals.css` again on its own.
- **Member photos are small** (most PhD portraits are 160–230 px wide). They are shown at
  about 150 px; showing them larger needs new photos, not upscaling.
- **`.claude/settings.local.json` is not tracked**, and should not be re-added. It
  accumulates machine-local permission entries, including absolute paths to other
  checkouts.

## Open

- [ ] Higher-resolution portraits (800 px or more) for the PhD students.
- [ ] Check three alumni photos, whose file names look swapped against the names:
      Mengjie (Kaylee) Xie uses `alumni-annika.png`, Kelly Aung Lu uses `alumni-kaylee.jpg`,
      Annika Ageles Del Rosario uses `alumni-kelly.jpg`.
- [ ] `@heroicons/react` and `matter-js` are no longer imported; they can be removed from
      `package.json`.
- [ ] One sentence and an outbound link to `ai4circuit.com` on the research page (a link,
      not demo content).

Superseded history lives in `archive/PROGRESS.md` (design-change log, Feb–May 2026) and
is not linked from anywhere active.

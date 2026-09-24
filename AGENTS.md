# AGENTS.md — HIE Lab Website Project Guide

> **This file is for AI agents (Hermes, Claude, Copilot, Cursor, etc.) working on this project.**
> It holds the stable rules: what this repo is, what it is not, and how to deploy it.
>
> **For current state — what exists today, what is open, what is green — read `STATE.md`.**
> This file changes when the workflow changes; `STATE.md` changes every session.

---

## Scope — read this before writing any code

This repo is the **public lab website only**: `hie.eng.uci.edu`, a pure static export
with **no backend of any kind** (no API routes, no auth, no database, no server actions).

The member portal, the lab tools and the AI-for-Circuit project site are a **different
application, in a different and private repository**, serving `portal.ai4circuit.com`.
None of it is here. Its location and infrastructure are deliberately not recorded in
this repo, which is public.

Two standing rules:

1. **Do not add AI-for-Circuit demo content to this site.** Not the simulation demo, not
   a results view, not an embed. It has its own site, served by the portal app. At most,
   a sentence and an outbound link.
2. **The only coupling to the portal is one constant** — `PORTAL_URL` in
   `src/components/Navbar.tsx`, rendered as the "Member Login" link. Anything more
   coupled than an `<a href>` belongs in the portal, so that a portal outage can never
   take the lab's public face down with it.

If a requested feature needs a server, it is portal work. Open the other folder.

---

## Quick Reference

| Item | Value |
|------|-------|
| Live URL | https://hie.eng.uci.edu |
| Repo | https://github.com/hie-uci/hie-uci.github.io — **public** |
| GitHub org | `hie-uci` |
| Sibling project | the member portal — separate, private, not in this repo |
| PI | Prof. Hamidreza Aghasi (haghasi@uci.edu) |
| Built by | Allen Huang (Yilun Huang), PhD student |

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Rendering:** Static Export (`output: "export"` in next.config.ts)
- **React:** 19.2.3
- **Styling:** Tailwind CSS 4 (via @tailwindcss/postcss)
- **Animations:** Framer Motion 12, Matter.js (Physics)
- **Visualization:** Recharts, XYFlow (Node Builder)
- **Mathematics:** KaTeX (react-katex)
- **Theming:** next-themes (Dark/Light mode support)
- **Language:** TypeScript 5
- **Icons:** @heroicons/react 2, lucide-react
- **Hosting:** GitHub Pages (free, no server needed)
- **CI/CD:** GitHub Actions (auto-deploy on push to `main`)

---

## Architecture

```
src/
├── app/                          # Next.js App Router (file-based routing)
│   ├── layout.tsx                # Root layout: Navbar + Footer + ScrollToTop
│   ├── page.tsx                  # HOMEPAGE — Hero, About, Chips, Research, News, Publications
│   ├── globals.css               # Global styles, Tailwind theme, custom animations
│   ├── research/page.tsx         # Research highlights (5 thrust areas)
│   ├── research-projects/page.tsx# Detailed views for specific research projects
│   ├── publications/page.tsx     # Publications with search + filter tabs
│   ├── team/page.tsx             # PI, PhD students, undergrads, alumni
│   ├── chip-gallery/page.tsx     # Full chip photo gallery with lightbox
│   ├── news/page.tsx             # Lab news items with timeline + filter
│   ├── teaching/page.tsx         # Courses taught by Prof. Aghasi
│   ├── rf-toolbox/page.tsx       # Interactive RF calculators and node-based cascade builder
│   ├── measurement-tutorial/page.tsx # Video resources and lab measurement guides
│   ├── contact/page.tsx          # Contact form + lab info
│   └── available-positions/page.tsx  # Open positions
│
├── components/                   # Reusable UI components
│   ├── Navbar.tsx                # Sticky nav: active page indicator + scroll progress bar
│   ├── ThemeSwitcher.tsx         # Dark/Light mode toggle button
│   ├── Footer.tsx                # Multi-column footer with links
│   ├── ChipMarquee.tsx           # Two-row auto-scrolling chip gallery with lightbox
│   ├── Lightbox.tsx              # Click-to-zoom image viewer (ESC to close)
│   ├── ParticleField.tsx         # Canvas-based particle network (Hero background)
│   ├── FluidPlasmaBackground.tsx # Fluid dynamic background animation
│   ├── FallingChipsBackground.tsx# Matter.js physics-based falling chips
│   ├── SystemCascadeBuilder.tsx  # XYFlow-based visual RF cascade node builder
│   ├── InteractiveSmithChart.tsx # SVG-based interactive Smith Chart
│   ├── AdvancedCalculators.tsx   # Complex RF formulas with KaTeX rendering
│   └── ...                       # Many other components (cards, headers, layouts)
│
└── lib/
    ├── cascadeMath.ts            # Mathematical logic for system cascade RF calculations
    └── sParameterEngine.ts       # Logic for handling S-parameters
```

---

## Key Configuration

### next.config.ts
```typescript
const nextConfig: NextConfig = {
  output: "export",        // Static HTML export (no server needed)
  trailingSlash: true,
  images: {
    unoptimized: true,     // Required for GitHub Pages (no image optimization API)
  },
};
```

There is **no** `typescript.ignoreBuildErrors` escape hatch any more — type errors fail
the build, which is the point. Do not add it back to get a build through.

### Deployment Workflow (.github/workflows/deploy.yml)
- Triggers on push to `main`
- Runs `npm ci` → **lint → typecheck → test** → `npm run build` → uploads `out/` to Pages
- Custom domain (`hie.eng.uci.edu`) is managed via `public/CNAME`
- `out/` is **not** tracked in git; CI builds it

---

## Content Data Locations

| Content | File | How to Update |
|---------|------|---------------|
| Homepage news | `src/app/page.tsx` → `newsItems` array | Add `{ date, text, tag }` objects |
| Research areas | `src/app/page.tsx` → `researchAreas` array | Add objects with title, description, iconVariant, gradient |
| Publications | `src/app/publications/page.tsx` → `publications` array | Add `{ authors, title, venue, year, type, link }` |
| News timeline | `src/app/news/page.tsx` → `newsItems` array | Add `{ date, month, year, title, category }` |
| Team members | `src/app/team/page.tsx` → `phdStudents`, etc. | Add Member/Alumnus objects |
| RF Toolbox | `src/app/rf-toolbox/data.ts` & `src/components/Calculators.tsx` | Modify calculator logic or data arrays |
| Videos | `src/app/measurement-tutorial/page.tsx` | Add iframe / YouTube links |

---

## How to Deploy

**`git push origin main`. That is the whole procedure.**

`origin` and `pages` are two remote names pointing at the **same** repository,
`hie-uci/hie-uci.github.io`. Pushing to either one deploys; pushing to both does nothing
extra.

> **Stale instruction, do not follow it:** older versions of this file said `origin` was
> a separate `HIE-Lab-Website` source repo and that you must also
> `git push pages main --force`. That two-remote dance no longer applies, and
> force-pushing a public repo destroys history for no benefit. If you see that
> instruction anywhere, it is out of date.

```bash
# Local development
npm run dev                # → http://localhost:3000

# Gates — run these before pushing. A red gate means the site silently does not update.
npm run lint && npm run typecheck && npm test
npm run validate           # the same, plus a production build

# Preview the static output (append a query string; index.html caches hard)
npx serve out              # → http://localhost:3000/?v=2

# Deploy
git add -A
git commit -m "your message"
git push origin main       # CI: lint → typecheck → test → build → Pages, ~70 s
```

**Never commit secrets, credentials, local filesystem paths, or details of private
infrastructure.** This repo is public and stays public — making it private would take
`hie.eng.uci.edu` offline, because free-plan GitHub Pages will not serve from a private
repository. A push is a publication and there is no undo; removing a file later does not
remove it from history.

---

## Common Pitfalls

1. **Next.js <Image> with Static Export:** Always use `unoptimized` prop or global config for `<Image>`, otherwise build will fail for GitHub Pages.
2. **Build fails?** — Run `npm run lint` and `npm run build` locally first.
3. **Changes not showing?** — GitHub Actions takes ~45 seconds. Check the Actions tab on `hie-uci.github.io`.
4. **Dark Mode:** Use `dark:` variants in Tailwind for all new components. The project uses `next-themes`.
5. **Interactive Math:** Use `react-katex` for formula rendering.

---

*Last updated: 2026-08-24 — see `STATE.md` for current state.*
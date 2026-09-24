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
   `src/data/site.ts`, rendered as the "Member Login" link. Anything more
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

- **Framework:** Next.js 16 (App Router), static export (`output: "export"`)
- **React:** 19.2, with React view transitions (`experimental.viewTransition`)
- **Styling:** Tailwind CSS 4 over the design tokens in `src/app/globals.css`
- **Design system:** "Signal & Silicon" — rules, tokens and measured contrast in `docs/DESIGN.md`
- **Fonts:** Mona Sans, Instrument Serif, Martian Mono (`next/font`)
- **3D:** three.js (on-demand rendering, see `src/components/rf/three/`)
- **Animation:** CSS first; framer-motion for the header marker and the motion setting
- **Visualization:** Recharts, XYFlow (cascade builder), hand-drawn SVG instruments
- **Mathematics:** KaTeX (react-katex)
- **Theming:** next-themes (Dark Space default, Cleanroom light)
- **Language:** TypeScript 5
- **Icons:** lucide-react, sparingly
- **Hosting:** GitHub Pages (free, no server needed)
- **CI/CD:** GitHub Actions (auto-deploy on push to `main`)

---

## Architecture

```
src/
├── app/                   # one folder per route, each with page.tsx + layout.tsx (metadata)
│   ├── layout.tsx         # fonts, motion boot script, Navbar, view transition, Footer, ⌘K search
│   ├── globals.css        # design tokens, utilities, component classes
│   └── …                  # /, research, rf-toolbox, team, publications, chip-gallery,
│                          # news, teaching, contact, available-positions, measurement-tutorial
├── components/            # shell, page skeleton, Lightbox, and one folder per page area:
│   ├── home/ team/ research/ publications/ chips/ news/ contact/
│   └── rf/                # RF Toolbox: controls, ToolModule, three/ (3D stages), fmcw/
├── data/                  # all content: publications, news, team, chips, research, tools, site
├── lib/                   # tested math and search (*.test.ts beside each module), hooks
└── types/
archive/                   # superseded code, excluded from build, lint and type-check
scripts/make-image-derivatives.py   # WebP copies of chips, portraits and research figures
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

Content lives in `src/data/`. The table of which file holds what is kept in one place,
`STATE.md` → "Site map", so it cannot drift. After changing any image, run
`python3 scripts/make-image-derivatives.py`.

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
4. **Colour:** Use the design tokens (`bg-surface`, `text-ink`, `border-line`, …). They switch with the theme, so new code needs no `dark:` colour variants. Rules and contrast figures: `docs/DESIGN.md`.
5. **Interactive Math:** Use `react-katex` for formula rendering.

---

*Last updated: 2026-09-24 — see `STATE.md` for current state.*
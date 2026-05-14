# AGENTS.md — HIE Lab Website Project Guide

> **This file is for AI agents (Hermes, Claude, Copilot, Cursor, etc.) working on this project.**
> Read this file first to understand the project state, architecture, and conventions.

---

## Project Status (as of May 2026)

**Status:** ✅ LIVE — deployed and serving at https://hie.eng.uci.edu

**Pending:** Continued expansion of the RF Toolbox and measurement video resources.

---

## Quick Reference

| Item | Value |
|------|-------|
| Project path | `/Users/allenhuang/Desktop/Allen_main/HIE_webcite` |
| GitHub org | `hie-uci` (account: allenh12@uci.edu) |
| Live URL | https://hie.eng.uci.edu |
| Main repo | https://github.com/hie-uci/hie-uci.github.io |
| Backup repo | https://github.com/hie-uci/HIE-Lab-Website |
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
  typescript: {
    ignoreBuildErrors: true,
  }
};
```

### Deployment Workflow (.github/workflows/deploy.yml)
- Triggers on push to `main`
- Runs `npm ci` → `npm run build` → uploads `out/` to GitHub Pages
- Custom domain (`hie.eng.uci.edu`) is managed via `public/CNAME`

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

🚨 **CRITICAL DEPLOYMENT WARNING (origin vs pages)** 🚨
This local project is connected to TWO remote repositories:
1. `origin` -> `HIE-Lab-Website` (Stores the source code)
2. `pages` -> `hie-uci.github.io` (The actual LIVE website that triggers the deployment Action)

To deploy changes to the live site, you **MUST** push to the `pages` remote.

```bash
# Local development
npm run dev          # → http://localhost:3000

# Build & test locally
npm run build
npx serve out        # → http://localhost:3000

# Deploy (MUST run BOTH commands to update source AND live site)
npm run build
git add -A
git commit -m "your message"
git push origin main   # 1. Saves source code to HIE-Lab-Website repo
git push pages main --force # 2. 🚨 CRITICAL: Triggers build + deploy to live hie.eng.uci.edu
```

---

## Common Pitfalls

1. **Next.js <Image> with Static Export:** Always use `unoptimized` prop or global config for `<Image>`, otherwise build will fail for GitHub Pages.
2. **Build fails?** — Run `npm run lint` and `npm run build` locally first.
3. **Changes not showing?** — GitHub Actions takes ~45 seconds. Check the Actions tab on `hie-uci.github.io`.
4. **Dark Mode:** Use `dark:` variants in Tailwind for all new components. The project uses `next-themes`.
5. **Interactive Math:** Use `react-katex` for formula rendering.

---

*Last updated: May 2026*
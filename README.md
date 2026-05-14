# HIE Lab Website

**High-speed Integrated Electronics Laboratory — UC Irvine**

🌐 **Live site:** [https://hie.eng.uci.edu](https://hie.eng.uci.edu)

📧 **Contact:** Prof. Hamidreza Aghasi (haghasi@uci.edu)

---

## About

This is the official website for the HIE Lab at UC Irvine, led by Prof. Hamidreza Aghasi. The lab specializes in mm-wave and terahertz integrated circuit design, AI-driven analog design, and emerging device technologies.

The site is built as a modern, static Next.js application, featuring dynamic animations, an interactive RF toolbox, dark mode support, and rich visual components.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npx serve out
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Static Export) |
| UI | React 19 + TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion 12, Matter.js (Physics) |
| Visualization | Recharts, XYFlow (Node Builder) |
| Mathematics | KaTeX |
| Theming | next-themes (Dark/Light Mode) |
| Icons | Lucide React, Heroicons |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions |

---

## Project Structure

```
src/
├── app/                    # Pages (file-based routing)
│   ├── page.tsx           # Homepage
│   ├── research/          # Research highlights
│   ├── research-projects/ # Detailed research projects
│   ├── publications/      # Publications with search & filter
│   ├── team/              # Team members
│   ├── chip-gallery/      # Chip photo gallery
│   ├── news/              # Lab news timeline
│   ├── teaching/          # Courses
│   ├── rf-toolbox/        # Interactive RF tools, calculators, and builders
│   ├── measurement-tutorial/ # Lab measurement guides
│   ├── contact/           # Contact info
│   └── available-positions/  # Open positions
├── components/            # Reusable UI components
│   ├── Navbar.tsx         # Navigation with active indicator
│   ├── ThemeSwitcher.tsx  # Dark/Light mode toggle
│   ├── ChipMarquee.tsx    # Chip gallery with lightbox
│   ├── SystemCascadeBuilder.tsx # Node-based RF cascade builder
│   ├── InteractiveSmithChart.tsx # Interactive Smith Chart visualizer
│   ├── AdvancedCalculators.tsx # RF calculations and formulas
│   ├── FluidPlasmaBackground.tsx # Advanced animated backgrounds
│   ├── FallingChipsBackground.tsx # Physics-based chip animations
│   └── ...                # Many other components (cards, headers, layouts)
public/
└── images/                # Static images (chips, members, research, logos)
```

---

## How to Update Content

### Add a publication
Edit `src/app/publications/page.tsx`, add to the `publications` array:
```typescript
{ authors: 'A, B, C', title: 'Paper Title', venue: 'IEEE JSSC', year: 2026, type: 'journal', link: 'https://...' }
```

### Add news
Edit `src/app/page.tsx` (homepage) and/or `src/app/news/page.tsx` (full timeline).

### Add a team member
Edit `src/app/team/page.tsx`, add to `phdStudents`, `undergradResearchers`, or alumni arrays.

### Add chip photos
Place images in `public/images/chips/individual/`, then add paths to `ChipMarquee.tsx` and `chip-gallery/page.tsx`.

### Update RF Toolbox / Calculators
Edit the components in `src/components/` (e.g., `Calculators.tsx`, `AdvancedCalculators.tsx`) or data in `src/app/rf-toolbox/data.ts`.

---

## Deployment

Deployment is managed via GitHub Actions to GitHub Pages. The custom domain `hie.eng.uci.edu` is configured via `public/CNAME`.

🚨 **CRITICAL DEPLOYMENT WARNING:** This project uses two remotes: `origin` (source) and `pages` (live site).

```bash
# Deploy changes (requires pushing to both remotes)
npm run build
git add .
git commit -m "update"
git push origin main       # Saves source code
git push pages main --force # Triggers deployment to GitHub Pages
```
> Note: For pushing to `pages`, you might need `git push pages main:main --force`.

---

## Design & Features

- 🌗 **Dark Mode / Light Mode Support**
- 🎨 UCI brand colors (navy blue, gold, teal) integrated with modern styling
- ✨ Interactive Physics & Animations: Particle fields, fluid plasmas, falling chips (Matter.js)
- 🧰 **RF Toolbox**: Advanced RF calculators, interactive Smith Charts, node-based system cascade builders
- 📊 Interactive Data: Recharts-based polar plots and S-Parameter viewers
- 🃏 Glass morphism UI elements with refined hover effects
- 📱 Fully responsive (mobile, tablet, desktop)
- ⚡ Static export — extremely fast loading

---

## For AI Agents

See [AGENTS.md](./AGENTS.md) for detailed project guide, architecture, conventions, and further development instructions.

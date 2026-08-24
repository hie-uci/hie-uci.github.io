# HANDOFF — 2026-08-24

## Current state

No code changed. This session was documentation and boundary-setting for the **public
lab website only**.

- `STATE.md` — **new.** Current state, deploy chain, site map, gotchas, and an explicit
  statement of what does *not* live in this repo.
- `AGENTS.md` — corrected. Its deployment section was **wrong and dangerous**: it
  described `origin` and `pages` as two different repositories and told the reader to
  `git push pages main --force`. They are the same repo (`hie-uci/hie-uci.github.io`)
  and have been for a while. It also documented a `typescript.ignoreBuildErrors` escape
  hatch that is no longer in `next.config.ts`.
- `PROGRESS.md` → `archive/PROGRESS.md`. It was a design-change log last touched
  2026-05-17 and read as current.

Gates green as of today: lint clean, typecheck clean, **29 tests / 7 suites**.

## Important context

**This repo has no backend and is not getting one.** It is a pure static export; API
routes, server actions and middleware cannot work here. The member portal, the lab tools
and the AI-for-Circuit project site are a separate application in a separate **private**
repository. Its path and infrastructure are deliberately not recorded here — this repo
is public.

**Two standing rules, now written into `STATE.md` and `AGENTS.md`:**

1. **No AI-for-Circuit demo content on this site.** Verified absent today. At most a
   sentence and an outbound link.
2. **The only coupling to the portal is `PORTAL_URL` in `Navbar.tsx`** — the "Member
   Login" link. Anything more coupled than an `<a href>` belongs in the portal, so a
   portal outage cannot take the lab's public face down.

**Deploy is `git push origin main`.** CI runs lint → typecheck → test → build → Pages,
about 70 seconds. A red gate means the site silently does not update.

## Next steps

Nothing is in flight here. Open items, none urgent:

- [ ] `.playwright-mcp/` is untracked scratch output — gitignore it or remove it.
- [ ] `AGENTS.md`'s "Content Data Locations" table duplicates the one in `STATE.md`;
      one should point at the other rather than drifting.
- [ ] The portal side wants **a link from this site to `ai4circuit.com`** — Search
      Console still reports `Referring page: None detected`, and it is the biggest
      remaining SEO lever. One sentence and an outbound link on the research page. This
      is a link, not demo content, and does not conflict with rule 1 above.
- [ ] RF Toolbox and measurement video expansion (outstanding since May 2026).

## Decisions made

- **`STATE.md` + `HANDOFF.md` are the two files that answer "where are we" and "how do
  I pick this up".** `AGENTS.md` keeps only stable rules and now says so at the top.
- **Archive, never delete** — `PROGRESS.md` moved rather than removed, with
  `archive/README.md` saying what superseded it.
- **The boundary between the two repos is written down in both**, because the confusion
  it prevents has already happened twice: a previous session did portal work with its
  shell in this directory, and `git push` reported "Everything up-to-date" about the
  other repo.

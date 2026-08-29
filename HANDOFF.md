# HANDOFF — 2026-08-28

## Current state

No site content changed relative to 2026-08-24. This session only added a deploy gotcha
to `STATE.md`.

Gates green: lint clean, typecheck clean, 29 tests / 7 suites, build OK.

## Important context

- **Deploy verification now has a real rule** (`STATE.md` → Known gotchas): after
  `git push`, GitHub Pages' CDN can serve a cached 404 for the new hashed CSS for up to
  10 minutes on some nodes, which renders the whole site unstyled. Observed today.
  A deploy is done only when the CSS referenced by the live HTML returns 200 from every
  `dig +short hie.eng.uci.edu` IP; if a node is stuck, `gh run rerun <run-id>` purges it.
- Boundaries unchanged: no backend, no portal content, only the `PORTAL_URL` link.

## Next steps

- [ ] `AGENTS.md`'s "Content Data Locations" table duplicates `STATE.md`'s; one should
      point at the other.
- [ ] One sentence + outbound link to `ai4circuit.com` on the research page (SEO lever
      for the portal side; a link, not demo content).
- [ ] RF Toolbox and measurement video expansion (outstanding since May 2026).

## Decisions made

- Recorded the CDN-cache gotcha in `STATE.md`; it is about the deploy pipeline.

# SESSION LOG

Brief continuity notes to recover context between terminal sessions.

## 2026-02-09

- What changed:
  - Simplified `DESIGN.md` into a minimal quick-fill profile.
  - Simplified `src/styles.css` to a compact token-based starter theme.
  - Strengthened git governance rules in `AGENTS.md` and `agents/git.md`:
    - no commit/push without explicit user approval
    - explicit commit/PR descriptions
    - mandatory ticket id in commit subject when `BACKLOG.md` exists
    - atomic commits for large tickets


## 2026-02-10

- What changed:
  - Built and refined a full project backlog in `BACKLOG.md`:
    - converted to one ticket per phase (`FPN-001` to `FPN-015`)
    - removed time estimates, status, priority, and date columns
    - added top table navigation links to each ticket section
    - added `Finalizado` tracking column with visual checks
    - removed `## Notes` section as requested
  - Added branch/PR workflow rules to keep `main` always stable.
  - Added PR template for consistent self-review and ticket traceability.
  - Installed and validated CLI tooling:
    - GitHub CLI (`gh`) installed and authenticated
    - Vercel CLI (`vercel`) installed, authenticated, project linked, and `vercel dev` verified by user on `localhost:3000`
  - Created and then removed temporary docs (`VERCEL.md`, `GITHUB.md`) after user moved content to Obsidian.
  - Committed approved changes incrementally.

## 2026-02-11

- What changed:
  - Completed and stabilized header/navbar implementation for desktop + responsive:
    - sticky behavior by scroll on desktop
    - sticky-first mobile/tablet header with hamburger menu
    - ticker interactions (rotation, pause, links)
    - naming cleanup and component split for navbar subparts
  - Centralized mock data into `src/app/mocks` and introduced `MockNewsService` to consume mocks from pages/layout.
  - Refactored footer data to centralized mocks and validated responsive behavior.
  - Added broad automated coverage for header and footer:
    - unit tests for navbar/footer subcomponents and container behaviors
    - e2e flows for desktop/mobile navigation and interactions
    - visual snapshot coverage for header (desktop/tablet/mobile, open/closed states) and footer (desktop/mobile)
  - Updated `BACKLOG.md` (FPN-003) with completed tasks from this session.
  - Updated `AGENTS.md` with new rules:
    - interfaces in individual files under `interfaces` (with scoped local exception)
    - icons as SVG components in `src/app/components/icons`



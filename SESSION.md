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

## 2026-02-12

- What changed:
  - Reworked hero carousel section to match editorial layout reference:
    - converted `app-news-carousel` from 3-card grid into a single hero slide with image overlay text
    - added inline carousel controls and dot navigation on hero
    - added right-side `En directo` panel for `Ultima hora` style headlines inside the same carousel section
    - kept anchor compatibility by preserving `id=\"breaking-news\"` in the right panel
  - Updated home page composition to feed breaking items directly into `app-news-carousel` and remove duplicate standalone breaking block.
  - Updated carousel unit tests to validate hero title rotation (manual and timed).
- Files touched:
  - `src/app/components/news/news-carousel.component.ts`
  - `src/app/pages/home/home-page.component.ts`
  - `src/app/components/news/news-carousel.component.spec.ts`
  - `SESSION.md`
- Verification performed:
  - `pnpm run lint` (pass)
  - `pnpm test` (pass)
- Next pending step (if any):
  - Review spacing/typography details in-browser against target screenshot and fine-tune visual parity.

## 2026-02-12 (continued)

- What changed:
  - Finalized homepage editorial mockup for `FPN-003` with iterative UI refinements:
    - hero carousel polish (overlay contrast, height tuning, controls/icons, text clamping)
    - breaking-news polish (spacing/separators, live badge pulse, CTA behavior/accessibility contrast)
    - section blocks and CTA link polish (`Ver más` + arrow icon alignment)
    - most-read redesign and rename to `app-most-read-news`, including right-column width alignment and 10 items
    - news-card consolidation to selected variant and typography/spacing adjustments
  - Added/updated SVG icon components in `src/app/components/icons` for carousel/CTA/most-read actions.
  - Expanded automated test coverage for homepage:
    - new unit tests for `current-news-block`, `section-block`, `most-read-news`, and `home-page`
    - e2e checks for homepage structure/styles/layout consistency
    - responsive visual snapshots (desktop and mobile) for homepage content
  - Added architecture guidance in `AGENTS.md` for when to create per-component folders.
  - Opened PR with GitHub CLI and merged changes into `main`.


## 2026-02-13

- What changed:
  - Completed ticket `FPN-004` for section-page UX and behavior:
    - implemented collapsible filters panel with `Mostrar/Ocultar filtros` button
    - added local Tabler SVG icon component (`filter`) and integrated it in the toggle button
    - finalized filters layout with source selection, sort options, and bulk actions (`SELECCIONAR TODO` / `QUITAR TODO`)
    - ensured filters are hidden when the section has no news and preserved centered empty/error state behavior
  - Expanded automated coverage for filters and section-page interactions:
    - stronger unit tests for `section-filters` events and UI states
    - additional section-page tests for filter toggle/empty outcomes
    - new e2e flow for section filters behavior
  - Updated backlog scope for `FPN-004`:
    - removed pending task `Anadir bloque secundario de apoyo editorial`
    - marked detail navigation task as completed
  - Opened PR `#2`, refined it to concise summary format, and merged to `main`.
  - Synced local `main` with remote after merge.

## 2026-02-16

- What changed:
  - Completed ticket `FPN-005` and merged PR `#3` to `main`.
  - Built the article detail page with editorial two-column layout and responsive behavior:
    - main article content in the center
    - right sidebar with `breaking-news` and `most-read-news` on desktop only
  - Added new article components and supporting icons:
    - `article-content`, `article-metadata`, `article-preview-cta`, `article-locked-preview`, `article-not-found`
    - `icon-external-link`, `icon-exclamation-circle`
  - Implemented mobile/desktop metadata behavior:
    - mobile date format `DD-MM-YY`
    - centered metadata labels on mobile and left-aligned on desktop
  - Added fallback handling for missing article fields, including image fallback to `/images/no-image.jpg`.
  - Extended unit tests for article page and new components, including responsive and fallback scenarios.
  - Updated `BACKLOG.md` to mark `FPN-005` completed and keep task list aligned with delivered scope.
  - Synced local `main` with remote and removed local branch `feat/fpn-005-news-page`.

## 2026-02-17

- What changed:
  - Completed ticket `FPN-007` and opened PR `#5` (`feat/fpn-007-vercel-rss-functions`), then merged it to `main`.
  - Implemented and hardened RSS API endpoints:
    - `GET /api/sources` and `GET /api/news` with filtering, pagination, parsing, warnings, and cache headers.
    - Correct handling of per-feed section mapping to avoid wrong section attribution.
    - Correct error behavior for catalog failures (`500`) and `no-store` cache policy for non-2xx responses.
  - Improved parser robustness:
    - support for XML attributes with single quotes and double quotes
    - CDATA extraction when wrapped by whitespace/newlines
  - Expanded test coverage with endpoint contract tests for `/api/news`:
    - filters, warnings, cache headers, catalog errors
    - shared feed key mapping scenarios to avoid section overwrite issues
  - Separated catalog concerns:
    - kept `docs/rss-sources.md` for manual validation and health-check script
    - introduced `data/rss-sources.json` as typed runtime source for API
    - added `RssSourceRecord` and adapted catalog utilities to consume typed records
  - Updated `BACKLOG.md`:
    - marked FPN-007 tasks as completed
    - added explicit tasks for the catalog split/json migration
    - reordered and expanded FPN-008 tasks for Angular API integration (`signals` + `shareReplay` strategy)
  - Synced local `main` with `origin/main` after merge.

## 2026-02-18

- What changed:
  - Completed ticket `FPN-008` end-to-end (Angular integration with real API) and closed all remaining backlog subtasks.
  - Replaced mock data flow in UI with real API consumption:
    - homepage connected to `/api/news`
    - section page connected by `slug` with typed filters (`source`, `q`, `page`, `limit`)
    - article detail connected to aggregated dataset with fallback fetch by `id` when missing
  - Implemented typed frontend data layer:
    - `SourcesService` and `NewsService` with strict adapters and runtime validation
    - request cache with `shareReplay` and explicit TTLs
    - cache invalidation APIs (`clear`, `invalidateBySection`, `forceRefresh`)
    - extracted service/store interfaces into dedicated interface files
  - Added state stores with Angular signals:
    - `SourcesStore`: `loading`, `data`, `error`, reusable initial load + refresh
    - `NewsStore`: `loading`, `data`, `error`, `warnings`, `lastUpdated`, manual refresh
  - Defined and integrated UI state matrix (`loading`, `empty`, `error total`, `error parcial`) for home/section/detail.
  - Integrated global HTTP error handling:
    - added typed `AppHttpError`
    - added interceptor and shared user-facing error mapping utilities
    - aligned store/article fallback error behavior
  - Improved section UX and data behavior:
    - removed hard API max limit and raised frontend feed request limit
    - added progressive reveal in section lists (`24` initial + `12` per click)
    - updated CTA styling/text (`Ver m�s noticias`) with eye icon and spacing adjustments
  - Improved image resilience and feed compatibility:
    - image proxy endpoint `api/image`
    - fallback image handling in cards/content
    - parser support to derive YouTube thumbnails from video links
  - Removed legacy mock dependencies after API integration:
    - removed `MockNewsService` and unused news mocks
    - moved locked preview patterns to constants
    - removed `footer.mock` and inlined static footer data in component
  - Expanded and stabilized test coverage:
    - service/store unit tests for cache hit, cache miss, TTL, invalidation, `forceRefresh`
    - store state tests for `loading`/`error`/`success`
    - integration tests for home/section/article pages with mocked HTTP API responses
    - interceptor/error-mapper tests
  - Documentation and backlog alignment:
    - created `docs/cache-and-ui-states.md` (English) with cache strategy + UI state criteria
    - updated `BACKLOG.md` to mark `FPN-008` completed and backfilled missing completed improvements
  - Created multiple atomic commits across feature, refactor, test, and docs scopes, all tied to `FPN-008`.

## 2026-02-19

- What changed:
  - Added `.nvmrc` with Node `22` to standardize local runtime for `vercel dev` on Windows.
  - Added `engines.node` in `package.json` as `>=22 <23` to align the project with Node 22 LTS.

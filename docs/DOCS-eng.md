# Front Page News - English Documentation

## Index

- [1. Overview](#1-overview)
- [2. Product Goals](#2-product-goals)
- [3. Main User Flows](#3-main-user-flows)
- [4. Pages and Navigation](#4-pages-and-navigation)
- [5. Core UI Building Blocks](#5-core-ui-building-blocks)
- [6. Data and Filtering Model](#6-data-and-filtering-model)
- [7. Responsive Behavior](#7-responsive-behavior)
- [8. Architecture](#8-architecture)
- [9. Project Structure](#9-project-structure)
- [10. Data Acquisition Pipeline](#10-data-acquisition-pipeline)
- [11. Cache and Persistence Layers](#11-cache-and-persistence-layers)
- [12. Vercel Runtime](#12-vercel-runtime)
- [13. Common Libraries and Tools](#13-common-libraries-and-tools)
- [14. Quality and Testing](#14-quality-and-testing)
- [15. Additional Reading](#15-additional-reading)

## 1. Overview

Front Page News is an Angular application that aggregates RSS and Atom feeds from Spanish publishers and turns them into an editorial-style reading product. The app is designed around quick scanning, reliable first paint, and clean routing across sections, publishers, and search.

The product does not try to scrape or reproduce full articles. It uses feed metadata, presents a structured preview experience, and sends the final read to the publisher website.

## 2. Product Goals

- Show current news from multiple publishers in one place.
- Make navigation possible by section, source, and search term.
- Keep the UI usable even when fresh network requests are slow.
- Hide feed and caching complexity behind a simple reading experience.
- Preserve source attribution and outbound reading.

## 3. Main User Flows

### Home flow

1. The user lands on `/`.
2. The app hydrates content from the fastest valid layer.
3. The home page renders featured news, breaking headlines, most-read items, mixed editorial blocks, and the source directory.
4. The user can open the quick-view modal or navigate deeper.

### Section flow

1. The user opens `/seccion/:slug`.
2. The page loads news for that section.
3. The user can filter by source and change sort direction.
4. Preferences are kept locally for the next visit.

### Source flow

1. The user clicks a publisher name anywhere in the UI.
2. The app routes to `/fuente/:slug`.
3. The page resolves the source, loads its news, and exposes section filters scoped to that publisher.

### Search flow

1. The user clicks the navbar search icon.
2. A responsive modal opens instead of navigating immediately.
3. The query is validated before route navigation.
4. If results exist, the app routes to `/buscar?q=...`.
5. If results do not exist, the modal shows inline feedback and the user stays on the current page.

## 4. Pages and Navigation

| Route | Role |
| --- | --- |
| `/` | Editorial home page |
| `/seccion/:slug` | Section page |
| `/fuente/:slug` | Source page |
| `/buscar?q=...` | Search results page |
| `/aviso-legal` | Legal notice |
| `/privacidad` | Privacy page |
| `/cookies` | Cookies page |

Navigation has three main axes:

- section-based navigation
- source-based navigation
- query-based search navigation

## 5. Core UI Building Blocks

The app is composed of a small set of reusable, high-impact UI pieces:

- `app-navbar`
  - main header, sticky header, section links, search trigger, ticker
- `app-news-carousel`
  - hero editorial surface for the home page
- `app-breaking-news`
  - fast-scanning list of current headlines
- `app-most-read-news`
  - ranked discovery block
- `app-news-card`
  - reusable story card used across views
- `app-news-quick-view-modal`
  - contextual preview before outbound reading
- `app-section-filters`
  - source filtering on section pages
- `app-source-section-filters`
  - section filtering on source pages
- `app-news-refresh-indicator`
  - non-blocking feedback for stale data and background refreshes

## 6. Data and Filtering Model

The app works with normalized content rather than raw feed payloads.

### Main filtering dimensions

- `section`
- `source`
- `search query`
- `sort direction`

### Where filtering happens

- Section pages filter a section result set by source.
- Source pages filter a source result set by section.
- Search pages filter search results by source.
- API requests can already be scoped by section, source ids, article id, query, page, and limit.

### Why this matters

This split keeps expensive filtering close to the right layer:

- the API reduces the dataset when possible
- the frontend applies view-specific refinement and persistence

## 7. Responsive Behavior

Responsive behavior is part of the product design, not an afterthought.

- The navbar has desktop and sticky/mobile variants.
- The search interaction becomes a centered modal that works on both large and small screens.
- Grid-based news layouts collapse progressively across breakpoints.
- Quick-view modals, filters, and buttons are designed to remain usable on mobile.
- Large editorial blocks preserve hierarchy on desktop while staying readable on smaller viewports.

## 8. Architecture

```mermaid
flowchart LR
    U[User] --> A[Angular app]
    A --> NS[NewsStore]
    A --> SS[SourcesStore]
    NS --> API[/api/news]
    SS --> SRC[/api/sources]
    API --> B[(Vercel Blob)]
    API --> F[Live RSS and Atom feeds]
    A --> IDB[(IndexedDB)]
```

### Frontend

- Angular standalone components
- signal-based state
- Tailwind CSS
- route-driven pages

### Backend

- Vercel Functions
- feed parsing and aggregation in `server/`
- snapshot reads and writes through Vercel Blob

### Shared model

- typed contracts reused across browser and server
- normalized request keys for caching and snapshots

## 9. Project Structure

```text
api/                  Vercel serverless entry points
data/                 runtime source catalog
docs/                 language-specific documentation
public/               static assets
server/               feed parsing, aggregation, snapshots, cron logic
shared/               contracts and helpers shared across layers
src/app/components/   UI building blocks
src/app/pages/        route-level pages
src/app/services/     frontend data services
src/app/stores/       signal-based state stores
src/app/utils/        formatting, routing, filtering helpers
src/lib/              browser-side shared helpers
```

### Important frontend folders

| Folder | Purpose |
| --- | --- |
| `src/app/components` | Reusable UI units |
| `src/app/pages` | Route-level screens |
| `src/app/services` | API-facing orchestration and browser persistence access |
| `src/app/stores` | View state and freshness state |
| `src/app/lib` | Request keys, adapters, snapshot cache helpers |
| `src/app/utils` | Route, label, filtering, and formatting helpers |

## 10. Data Acquisition Pipeline

The data path is intentionally layered:

1. A page requests content through a store.
2. The store asks a frontend service for the query.
3. The service tries fast hydration layers.
4. If needed, the service calls `/api/news` or `/api/sources`.
5. The API tries a persisted snapshot first.
6. If no valid snapshot exists, the API aggregates live feeds.
7. The payload is normalized and returned to the frontend.

This design keeps the UI stable while still converging toward fresh data.

## 11. Cache and Persistence Layers

### Browser memory

- short-lived fast reuse inside the current session

### IndexedDB

- persisted browser-side hydration
- useful for repeat visits
- non-critical optimization: failures must not break rendering

### Vercel Blob snapshots

- pre-generated or previously persisted payloads
- improve first paint for common routes

### Stale-while-revalidate

- stale but renderable content stays visible
- fresh data can replace it in the background
- the UI uses non-blocking feedback instead of destructive resets

## 12. Vercel Runtime

The application is deployed as a combined frontend and serverless backend on Vercel.

### Main runtime endpoints

- `/api/news`
- `/api/sources`
- `/api/image`
- `/api/cron/regenerate-snapshots`

### What Vercel is doing here

- hosts the Angular app
- executes serverless API routes
- runs the protected snapshot cron
- stores persisted snapshots in Vercel Blob

For a deeper explanation, see [eng/vercel-runtime.md](./eng/vercel-runtime.md).

## 13. Common Libraries and Tools

- `@angular/*`
  - application framework and router
- `rxjs`
  - async streams in services and server interactions
- `@vercel/blob`
  - persisted snapshot storage
- `tailwindcss`
  - UI styling
- `vitest` and Angular test runner
  - unit and integration-style testing
- `@playwright/test`
  - end-to-end flows

## 14. Quality and Testing

The repository treats validation as part of the feature lifecycle.

Main validation commands:

```bash
pnpm run lint
pnpm test
pnpm test:e2e
```

The test suite covers:

- frontend components and routes
- stores and services
- API handlers
- RSS parsing and normalization
- snapshot behavior
- end-to-end flows such as search, source pages, filters, and modal interactions

## 15. Additional Reading

- [English architecture guide](./eng/architecture.md)
- [English Vercel runtime guide](./eng/vercel-runtime.md)
- [English cache and UI state guide](./eng/cache-and-ui-states.md)
- [English product scope](./eng/product-scope.md)
- [English RSS normalization](./eng/rss-normalization.md)
- [English RSS sources catalog notes](./eng/rss-sources.md)
- [English snapshot runbook](./eng/snapshot-operations-runbook.md)

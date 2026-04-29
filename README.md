# Front Page News

<p align="center">
  <img src="public/images/front-page-news-logo.png" alt="Front Page News logo" width="320" />
</p>

<p align="center">
  A modern news portal that aggregates RSS and Atom feeds from Spanish publishers into a fast editorial-style reading experience.
</p>

<p align="center">
  <a href="https://front-page-news.vercel.app/">Live Demo</a>
</p>

## 📚 Index

- [Overview](#-overview)
- [What Users Can Do](#-what-users-can-do)
- [Typical User Flow](#-typical-user-flow)
- [Main Features](#-main-features)
- [Newspaper Sources](#-newspaper-sources)
- [Product and Technical Scope](#-product-and-technical-scope)
- [Architecture](#-architecture)
- [Snapshot and Cache Strategy](#-snapshot-and-cache-strategy)
- [Cron Regeneration Model](#-cron-regeneration-model)
- [Why This Project Is Interesting](#-why-this-project-is-interesting)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Local Development](#-local-development)
- [Quality Commands](#-quality-commands)
- [Operational Notes](#-operational-notes)
- [Additional Documentation](#-additional-documentation)

## 📰 Overview

Front Page News is a personal Angular project built to explore a production-like news experience with real aggregation constraints:

- multiple external RSS/Atom sources.
- heterogeneous feed quality.
- first-visit performance on a serverless deployment.
- resilient client hydration without blocking the UI.
- a newspaper-style interface with home and section views.

The application does not replicate full articles. It aggregates metadata from publisher feeds, lets users scan headlines quickly, opens a preview modal with key context, and routes the final read to the original newspaper URL.

## ✨ What Users Can Do

- Browse a curated home page with featured stories, breaking news, mixed editorial blocks, most-read ranking, and source directory.
- Open section pages such as `actualidad`, `economia`, `internacional`, or `tecnologia`.
- Filter section results by source and sort them by date.
- Open a quick preview modal before visiting the publisher site.
- Land on the site with usable content from persisted snapshots instead of waiting on cold live aggregation.
- Keep reading while the app refreshes in the background and receive a non-blocking banner when fresher content arrives.

## 🔄 Typical User Flow

1. A user opens the home page or a section page.
2. The app tries to hydrate visible content from the fastest available cache layer.
3. If cached content is stale but still renderable, it is shown immediately.
4. A background refresh requests fresher data from `/api/news`.
5. If the refresh returns different content, the UI keeps the current view stable and shows a fresh-update notice.
6. The user can open a preview modal and then continue to the original article on the publisher website.

This flow was a major project goal: avoid empty or fragile first loads while still converging to fresh data quickly.

## 🚀 Main Features

- Editorial home page with reusable standalone Angular components.
- Section-based navigation with filterable source selection.
- Quick-view modal focused on headline context and outbound publisher navigation.
- RSS normalization layer to map inconsistent external feeds into stable internal contracts.
- Snapshot-backed first paint using Vercel Blob.
- IndexedDB persistence for repeat visits on the same device.
- Stale-while-revalidate behavior in the Angular stores.
- Background refresh indicator and dismissible "new content available" banner.
- Protected cron regeneration for base snapshots.
- Full lint, unit, and end-to-end validation workflow.

## 🗞️ Newspaper Sources

The project aggregates feeds from a broad mix of Spanish publishers and specialist outlets, including:

- `ABC`.
- `AS`.
- `El Confidencial`.
- `El Correo`.
- `El Diario.es`.
- `El Español`.
- `El Mundo`.
- `El País`.
- `El Periódico Mediterráneo`.
- `EsDiario`.
- `Expansión`.
- `La Vanguardia`.
- `La Voz de Galicia`.
- `Libertad Digital`.
- `MARCA`.
- `OkDiario`.

These sources are mapped into shared internal contracts and then grouped across sections such as `actualidad`, `ciencia`, `cultura`, `deportes`, `economia`, `espana`, `internacional`, `opinion`, `sociedad`, and `tecnologia`.

## 🧩 Product and Technical Scope

Front Page News focuses on metadata aggregation, not article scraping.

- Headlines, summaries, authors, media, publication dates, section labels, and canonical URLs are extracted from feeds.
- Full publisher article bodies are not reproduced.
- Attribution remains visible and each story links back to the original source.

The project is intentionally shaped around real feed volatility and graceful degradation instead of assuming ideal upstream data quality.

## 🏗️ Architecture

### Frontend

- Angular 21 with standalone components.
- TypeScript strict mode.
- Tailwind CSS.
- Signal-based stores for news and sources.
- Page-level UI state matrix for loading, empty, partial-warning, and error behavior.

### Backend and platform

- Vercel Functions for `/api/news`, `/api/sources`, `/api/image`, and cron regeneration.
- Vercel Blob for persisted snapshot storage.
- Shared snapshot key and response utilities across browser and server.
- Server-side in-memory request cache and in-flight deduplication.

### Testing

- Angular test runner for unit and integration-style component tests.
- Playwright for end-to-end flows.
- Regression coverage around RSS parsing, API handlers, snapshot hydration, and cron regeneration.

## ⚡ Snapshot and Cache Strategy

The app resolves news through four layers, in this order:

1. in-memory cache in `NewsService`.
2. persisted client cache in IndexedDB.
3. persisted remote snapshot in Vercel Blob.
4. fresh request to `/api/news`.

Why this matters:

- first visits can render from a pre-generated snapshot.
- repeat visits can hydrate from device-local persistence.
- stale content can remain visible while revalidation happens behind the scenes.
- persistence failures do not break rendering, because the app falls back to the next layer.

Current freshness policy:

- remote snapshots become stale after 15 minutes.
- remote snapshots expire after 36 hours.
- IndexedDB persistence is capped to 12 hours even if the remote snapshot lives longer.
- in-memory cache keeps hot results for short-lived reuse.

## ⏱️ Cron Regeneration Model

To improve first-load reliability on Vercel Hobby constraints, the project pre-generates a base snapshot inventory through a protected cron endpoint:

- endpoint: `/api/cron/regenerate-snapshots`.
- schedule: `0 5 * * *` in `vercel.json`.
- current regeneration set:
  - home snapshot.
  - 10 section snapshots.
  - 1 sources snapshot.

The cron path is protected with a bearer secret and writes snapshots into Vercel Blob using a write token.

The regeneration pipeline also includes quality gates:

- empty payloads are not persisted.
- degraded snapshots can be skipped when blocking feed warnings are detected.
- result payloads report persisted keys, skipped keys, durations, and warning context.

This work was expanded to reuse shared feed batches across section regeneration, reduce redundant fetch work, and improve observability during partial failures.

## 💡 Why This Project Is Interesting

This is not just a UI exercise. It combines:

- real-world feed normalization.
- browser and server cache coordination.
- hydration and stale-state UX.
- serverless runtime constraints.
- protected cron jobs.
- resilient degradation when persistence or upstream feeds fail.

That makes it a stronger production-style learning project than a simple feed reader that only fetches live data on page load.

## 🛠️ Tech Stack

- Angular 21.
- TypeScript.
- Tailwind CSS.
- Vercel Functions.
- Vercel Blob.
- pnpm.
- ESLint.
- Prettier.
- Playwright.

## 📁 Project Structure

```text
api/       Vercel serverless endpoints
docs/      product, cache, RSS, and runbook documentation
server/    feed parsing, payload building, snapshot, and cron logic
src/       Angular application
public/    static assets such as logos and fallback images
```

## 🧪 Local Development

Requirements:

- Node.js 22.
- pnpm.
- Vercel CLI authenticated locally.

Install dependencies:

```bash
pnpm install
```

Run the application through Vercel:

```bash
vercel dev
```

Open:

```text
http://localhost:3000/
```

## ✅ Quality Commands

Lint and typecheck:

```bash
pnpm run lint
```

Unit tests:

```bash
pnpm test -- --watch=false
```

End-to-end tests:

```bash
pnpm test:e2e
```

RSS catalog health check:

```bash
pnpm rss:check
```

## 📌 Operational Notes

- Snapshot persistence is an optimization layer, not a rendering dependency.
- If IndexedDB fails, the app continues with Blob or live network data.
- If Blob reads fail, the app falls back to live aggregation.
- If fresh network requests fail and there is still renderable cached data, the UI keeps the visible content instead of collapsing into a hard loading state.
- After deployment changes to environment variables in Vercel, a new deployment is required for the runtime to pick them up.

## 📎 Additional Documentation

- [docs/product-scope.md](docs/product-scope.md)
- [docs/cache-and-ui-states.md](docs/cache-and-ui-states.md)
- [docs/snapshot-operations-runbook.md](docs/snapshot-operations-runbook.md)
- [docs/rss-normalization.md](docs/rss-normalization.md)
- [docs/rss-sources.md](docs/rss-sources.md)

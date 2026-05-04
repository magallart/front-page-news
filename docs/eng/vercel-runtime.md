# Vercel Runtime and Data Pipeline

This document explains how Front Page News runs on Vercel and how data moves from publishers to the UI.

## Deployment model

The project is a single Vercel deployment that serves:

- the Angular frontend
- serverless API routes
- scheduled snapshot regeneration

## Main Vercel endpoints

| Path | Responsibility |
| --- | --- |
| `/api/news` | Returns aggregated or hydrated news payloads |
| `/api/sources` | Returns the source and section catalog |
| `/api/image` | Safely proxies external images |
| `/api/cron/regenerate-snapshots` | Rebuilds base snapshots |

## End-to-end data path

```mermaid
flowchart TD
    FE[Angular page] --> API[/api/news]
    API --> SNAP[Vercel Blob snapshot]
    API --> LIVE[Live RSS and Atom feeds]
    LIVE --> PARSE[Normalization and dedupe]
    PARSE --> RESP[News response]
    RESP --> FE
```

## How `/api/news` gets data

### 1. Try snapshot-backed delivery

For common requests, the API can serve a persisted snapshot first when it is still valid enough to use.

### 2. Fall back to live aggregation

If no valid snapshot exists, the API fetches feeds from the configured source catalog and aggregates them.

### 3. Normalize and dedupe

Live feed items are normalized into a stable internal contract, then deduplicated and sorted.

### 4. Filter and paginate

The response can be scoped by:

- article id
- section
- source ids
- search query
- page
- limit

This keeps each page from having to work with a larger dataset than necessary.

## How `/api/sources` works

`/api/sources` exposes the source catalog used by the frontend:

- source identity
- base publisher URL
- feed URL
- supported sections

This endpoint supports source navigation, source directories, and source-aware filters.

## Image proxy role

The image proxy exists because publisher image URLs are external and not always friendly to direct browser usage.

The proxy adds:

- safer fetch behavior
- centralized control
- more consistent frontend consumption

## Cron model

`vercel.json` schedules a daily regeneration:

```json
{
  "crons": [
    {
      "path": "/api/cron/regenerate-snapshots",
      "schedule": "0 5 * * *"
    }
  ]
}
```

The cron focuses on base routes such as:

- home
- base sections
- source catalog

It does not try to precompute every possible query or filter combination.

## Why Vercel Blob matters

Blob snapshots reduce cold-path work for common views. That matters because:

- live feed aggregation is slower than serving a stored payload
- upstream sources may be inconsistent
- serverless runtimes benefit from avoiding unnecessary recomputation

## Operational constraints

The Vercel runtime has to balance:

- cold starts
- function time budgets
- upstream feed latency
- partial failure tolerance

The product design accepts that perfect freshness is not always worth a worse first render.

## Related documents

- [architecture.md](./architecture.md)
- [cache-and-ui-states.md](./cache-and-ui-states.md)
- [snapshot-operations-runbook.md](./snapshot-operations-runbook.md)

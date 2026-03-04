# Client Cache and UI State Strategy

## Purpose

This document explains the current client-side cache strategy and the UI state criteria used by the Angular app when consuming `/api/news` and `/api/sources`.

Scope:
- `NewsService` and `SourcesService` cache behavior.
- Invalidation APIs and default behavior.
- UI state rules for Home and Section pages, plus quick-view modal behavior.

## Client Cache Strategy

### `NewsService` (`/api/news`)

- Cache key: normalized request URL + query params.
- Shared response per key: requests with the same key reuse one shared observable (`shareReplay(1)`).
- TTL: `60_000 ms` (60 seconds).
- Storage: in-memory map keyed by request signature.
- On request error: failed entry is removed from cache.

Public invalidation APIs:
- `clear()`
  - Removes all cached entries.
- `invalidateBySection(sectionSlug)`
  - Removes only entries whose normalized section matches `sectionSlug`.
- `getNews(query, { forceRefresh: true })`
  - Removes only the specific query key before issuing a new request.

Default behavior:
- `forceRefresh` default is `false`.
- If a cached entry exists and is not expired, it is reused.
- If a cached entry exists but expired, it is removed and fetched again.

### `SourcesService` (`/api/sources`)

- Cache key: single endpoint response (`/api/sources`).
- Shared response: one cached observable (`shareReplay(1)`).
- TTL: `300_000 ms` (5 minutes).
- Storage: single in-memory cache slot.
- On request error: cache is cleared.

Public invalidation APIs:
- `clear()`
  - Removes cached sources response.
- `getSources({ forceRefresh: true })`
  - Clears cache and fetches again.

Default behavior:
- `forceRefresh` default is `false`.
- Reuse cached response while TTL is valid.
- Refresh automatically when TTL expires.

## Server Cache Context

The API layer uses cache headers (`s-maxage` + `stale-while-revalidate`).
This is complementary to client memory cache:
- Client cache reduces duplicate calls inside one app session.
- Edge/server cache reduces upstream RSS cost and latency.

## UI State Criteria

UI states are resolved with page-level rules based on:
- `loading`
- `error`
- `warnings`
- content availability (`itemCount` or `hasItem`)

Supported page states:
- `loading`
- `empty`
- `error_total`
- `error_partial`
- `success`

### Home Page

Inputs:
- `loading` from `NewsStore`
- `error` from `NewsStore`
- `warnings[]` from `NewsStore`
- `itemCount` from adapted home items

Rules:
- `loading` when request is in progress.
- `error_total` when there is an error and no items.
- `empty` when no error and no items.
- `error_partial` when there are items and warnings or recoverable issues.
- `success` when items exist and there is no blocking issue.

### Section Page

Inputs:
- `loading` from `NewsStore`
- `error` from `NewsStore`
- `warnings[]` from `NewsStore`
- filtered `itemCount`

Rules:
- `loading` while the section query is pending.
- `error_total` when request fails and there are no items to render.
- `empty` when request succeeds but no results match section/filters.
- `error_partial` when results exist but warnings indicate partial feed failures.
- `success` when results render normally.

### Quick View Modal

Inputs:
- selected article signal on Home/Section (`NewsItem | null`)

Rules:
- `closed` when no article is selected.
- `open` when an article is selected.
- The modal does not run an independent API fetch or fallback-by-id flow.
- Error/loading matrix is owned by the parent page state (Home or Section).

## Manual Refresh and Invalidation Guidance

Recommended usage:
- Use `refresh()` in stores for user-driven reloads.
- Use `forceRefresh` when freshness is prioritized over cache reuse.
- Use `invalidateBySection` after section-scoped changes.
- Use `clear()` only for broad invalidation events.

## Maintenance Notes

- Keep TTL values centralized and explicit.
- Prefer deterministic cache keys based on normalized params.
- Preserve strict response adapters to avoid caching malformed payloads.
- Update this document whenever TTLs, invalidation APIs, or UI state rules change.

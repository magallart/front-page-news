# Cache, Hydration, and UI State Strategy

This document describes how Front Page News keeps the interface fast and stable even when upstream feeds are slow or inconsistent.

## Cache layers

The news flow resolves content through these layers, in order:

1. in-memory cache in the browser
2. persisted browser cache in IndexedDB
3. persisted remote snapshot in Vercel Blob
4. fresh server request

The sources flow is simpler and mainly uses in-memory reuse plus `/api/sources`.

## Why multiple layers exist

- memory improves fast route-to-route reuse
- IndexedDB improves repeat visits on the same device
- Blob snapshots improve first paint for common routes
- live requests still provide convergence toward fresh data

## Freshness model

- cached content can be fresh
- cached content can be stale but still renderable
- missing or expired content falls through to the next layer

The important rule is: renderable content should usually stay visible while revalidation happens in the background.

## UI implications

The UI does not treat stale data as a hard error.

Instead, it can show:

- visible stale content
- background refresh indicators
- non-blocking freshness notices

Skeletons are reserved for cases where no renderable data exists at all.

## IndexedDB role

IndexedDB is a resilience layer, not a hard dependency.

- read failures should degrade gracefully
- write failures should not block rendering
- expired records should be ignored

## Snapshot role

Blob snapshots are useful for:

- home page
- common section routes
- source catalog

They are especially valuable in a serverless deployment because they reduce the need to rebuild every response from live feeds on first contact.

## Related documents

- [architecture.md](./architecture.md)
- [vercel-runtime.md](./vercel-runtime.md)
- [snapshot-operations-runbook.md](./snapshot-operations-runbook.md)

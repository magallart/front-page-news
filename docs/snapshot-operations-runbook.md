# Snapshot Operations Runbook

## Purpose

This runbook covers the operational path for the snapshot system used by Front Page News:

- public snapshot reads from Vercel Blob
- protected cron-based snapshot regeneration
- client hydration from IndexedDB and Blob

Use it when snapshot freshness, hydration, or regeneration behavior looks wrong in local or production environments.

## Required Environment Variables

### Public read path

- `SNAPSHOT_BLOB_BASE_URL`
  - public base URL for persisted snapshot files
  - consumed by:
    - `server/lib/blob-snapshot-reader.ts`
    - `src/app/services/remote-news-snapshot.service.ts`

### Server write path

- `BLOB_READ_WRITE_TOKEN`
  - required by `server/lib/blob-snapshot-writer.ts`
  - if missing, cron regeneration degrades to a noop writer

### Cron protection

- `CRON_SECRET`
  - required by `api/cron/regenerate-snapshots.ts`
  - requests without `Authorization: Bearer <CRON_SECRET>` return `401`

### Optional diagnostics

- `NEWS_PERF_LOGS=1`
  - enables cache/perf logs in `/api/news`

## Expected Snapshot Inventory

Base cron regeneration should produce:

- 1 home snapshot
- 10 base section snapshots
- 1 sources snapshot

Current expected total:

- 12 attempted snapshots
- 1 sources snapshot always persisted when regeneration succeeds
- news snapshots persisted only when payload quality passes the persistence gate

## Fast Checks

### 1. Confirm deployed API health

```bash
curl -i https://<app>/api/sources
curl -i "https://<app>/api/news?page=1&limit=20"
curl -i "https://<app>/api/news?section=actualidad&page=1&limit=20"
```

### 2. Regenerate snapshots manually

```bash
curl -i \
  -H "Authorization: Bearer <CRON_SECRET>" \
  https://<app>/api/cron/regenerate-snapshots
```

Expected success shape:

- `200 OK`
- `ok: true`
- `keys`
- `totalSnapshots`
- `durationMs`

### 3. Validate a known snapshot URL directly

Example:

```bash
curl -i "https://<blob-base-url>/snapshots/news%3Aid%3D-%3Asection%3Dactualidad%3Asource%3D-%3Aq%3D-%3Apage%3D1%3Alimit%3D300.json"
```

## Failure Signatures and Meaning

### No snapshot hydration, but live API still works

Likely causes:

- `SNAPSHOT_BLOB_BASE_URL` missing or wrong
- snapshot file missing in Blob
- snapshot file malformed or incompatible with parser
- IndexedDB unavailable in the browser

Expected degradation:

- UI should still render from live network data
- stale/fresh indicators may not appear until later visits

### Cron returns `500 Cron secret is not configured`

Cause:

- `CRON_SECRET` missing in the deployment environment

### Cron returns `401 Unauthorized`

Cause:

- wrong bearer token

### Cron returns `200` but few snapshot keys are written

Likely causes:

- feed warnings hit the persistence blocklist
- generated payloads are empty
- only `sources:default` was safe to persist

Check:

- Vercel function logs for `api/cron/regenerate-snapshots`
- RSS source health with:

```bash
pnpm rss:check
```

### Snapshot reads return `null` silently

This is expected for:

- `404` snapshot object not found
- non-OK Blob response
- malformed snapshot JSON
- fetch/network failure while reading Blob

The system is designed to fall back without breaking rendering.

## Hobby Plan Limitations

- Cron provides base regeneration, not continuous intraday freshness.
- Blob snapshots improve first paint only when they already exist.
- The first cold visit with no Blob snapshot still depends on live aggregation.
- Filters, search queries, and arbitrary source combinations are not prewarmed by cron.

## Local Verification

Run the full validation baseline before merging snapshot changes:

```bash
pnpm run lint
pnpm test -- --watch=false
pnpm test:e2e
```

If debugging feed freshness or snapshot quality:

```bash
pnpm rss:check
```

## Escalation Path

1. Verify env vars.
2. Verify direct snapshot URL.
3. Verify cron response and Vercel logs.
4. Verify `/api/news` live behavior without relying on snapshots.
5. Re-run `pnpm rss:check` to distinguish feed quality issues from snapshot plumbing issues.

# Snapshot Operations Runbook

This runbook is the quick operational reference for the snapshot system.

## What the snapshot system covers

- public snapshot reads from Vercel Blob
- protected cron-based regeneration
- browser hydration from IndexedDB and Blob-backed payloads

## Main environment-sensitive values

- `SNAPSHOT_BLOB_BASE_URL`
- `BLOB_READ_WRITE_TOKEN`
- `CRON_SECRET`
- `NEWS_PERF_LOGS`

## Fast checks

### API health

```bash
curl -i https://<app>/api/sources
curl -i "https://<app>/api/news?page=1&limit=20"
```

### Manual cron trigger

```bash
curl -i \
  -H "Authorization: Bearer <CRON_SECRET>" \
  https://<app>/api/cron/regenerate-snapshots
```

### Direct snapshot validation

```bash
curl -i "https://<blob-base-url>/snapshots/<encoded-key>.json"
```

## Common failure meanings

- missing snapshot does not necessarily mean broken UI
- Blob read failures should fall back to live API behavior
- wrong cron secret should fail with `401`
- missing Blob write token should fail regeneration early

## Operational rule

Snapshots are an optimization layer. If the live API is healthy, the product should still work even when snapshot hydration is unavailable.

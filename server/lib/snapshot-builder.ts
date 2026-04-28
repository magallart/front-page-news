import { SNAPSHOT_EXPIRES_AFTER_MS, SNAPSHOT_STALE_AFTER_MS } from '../constants/snapshot.constants.js';

import { toNewsSnapshotKey, toSourcesSnapshotKey } from '../../shared/lib/snapshot-key.js';

import type { NewsQuery } from '../../shared/interfaces/news-query.interface';
import type { NewsResponse } from '../../shared/interfaces/news-response.interface';
import type { NewsSnapshot } from '../../shared/interfaces/news-snapshot.interface';
import type { SourcesResponse } from '../../shared/interfaces/sources-response.interface';
import type { SourcesSnapshot } from '../../shared/interfaces/sources-snapshot.interface';

export function buildNewsSnapshot(query: NewsQuery, payload: NewsResponse, generatedAtMs: number): NewsSnapshot {
  return {
    key: toNewsSnapshotKey(query),
    kind: 'news',
    generatedAt: toIsoString(generatedAtMs),
    staleAt: toIsoString(generatedAtMs + SNAPSHOT_STALE_AFTER_MS),
    expiresAt: toIsoString(generatedAtMs + SNAPSHOT_EXPIRES_AFTER_MS),
    query,
    payload,
  };
}

export function buildSourcesSnapshot(payload: SourcesResponse, generatedAtMs: number): SourcesSnapshot {
  return {
    key: toSourcesSnapshotKey(),
    kind: 'sources',
    generatedAt: toIsoString(generatedAtMs),
    staleAt: toIsoString(generatedAtMs + SNAPSHOT_STALE_AFTER_MS),
    expiresAt: toIsoString(generatedAtMs + SNAPSHOT_EXPIRES_AFTER_MS),
    query: null,
    payload,
  };
}

function toIsoString(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

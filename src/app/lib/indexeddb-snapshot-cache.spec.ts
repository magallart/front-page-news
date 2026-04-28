import { describe, expect, it } from 'vitest';

import { IndexedDbSnapshotCache } from './indexeddb-snapshot-cache';

import type { NewsSnapshot } from '../../../shared/interfaces/news-snapshot.interface';
import type { SourcesSnapshot } from '../../../shared/interfaces/sources-snapshot.interface';
import type { SnapshotCacheDatabase } from '../interfaces/snapshot-cache-database.interface';

describe('src/app/lib/indexeddb-snapshot-cache', () => {
  it('stores and reads news snapshots using the canonical query key', async () => {
    let nowMs = Date.parse('2026-04-28T08:00:00.000Z');
    const database = createInMemorySnapshotCacheDatabase();
    const cache = new IndexedDbSnapshotCache({
      now: () => nowMs,
      openDatabase: async () => database,
    });

    await cache.putNewsSnapshot(createNewsSnapshot());

    nowMs += 1_000;
    const record = await cache.getNewsSnapshot({
      section: ' ACTUALIDAD ',
      page: 1,
      limit: 20,
    });

    expect(record?.snapshot.key).toBe('news:id=-:section=actualidad:source=-:q=-:page=1:limit=20');
    expect(record?.persistedAtMs).toBe(Date.parse('2026-04-28T08:00:00.000Z'));
    expect(record?.lastReadAtMs).toBe(Date.parse('2026-04-28T08:00:01.000Z'));
  });

  it('drops expired records on read and reports them through prune', async () => {
    let nowMs = Date.parse('2026-04-28T08:00:00.000Z');
    const database = createInMemorySnapshotCacheDatabase();
    const cache = new IndexedDbSnapshotCache({
      now: () => nowMs,
      openDatabase: async () => database,
    });

    await cache.putNewsSnapshot(
      createNewsSnapshot({
        expiresAt: '2026-04-28T08:00:01.000Z',
      }),
    );
    await cache.putSourcesSnapshot(
      createSourcesSnapshot({
        expiresAt: '2026-04-28T08:00:01.000Z',
      }),
    );

    nowMs = Date.parse('2026-04-28T08:00:02.000Z');

    expect(await cache.getNewsSnapshot({ section: 'actualidad' })).toBeNull();

    const cleanup = await cache.pruneExpiredEntries();
    expect(cleanup).toEqual({
      newsSnapshotsRemoved: 0,
      sourcesSnapshotsRemoved: 1,
      totalRemoved: 1,
    });
    expect(await cache.getSourcesSnapshot()).toBeNull();
  });

  it('degrades to a noop cache when IndexedDB is unavailable', async () => {
    const cache = new IndexedDbSnapshotCache({
      openDatabase: async () => null,
    });

    await cache.putNewsSnapshot(createNewsSnapshot());

    expect(await cache.getNewsSnapshot({ section: 'actualidad' })).toBeNull();
    expect(await cache.pruneExpiredEntries()).toEqual({
      newsSnapshotsRemoved: 0,
      sourcesSnapshotsRemoved: 0,
      totalRemoved: 0,
    });
  });
});

function createInMemorySnapshotCacheDatabase(): SnapshotCacheDatabase {
  const stores = new Map<string, Map<string, unknown>>();

  return {
    async get<TRecord>(storeName: string, key: string): Promise<TRecord | null> {
      return (stores.get(storeName)?.get(key) as TRecord | undefined) ?? null;
    },
    async put<TRecord extends { key: string }>(storeName: string, record: TRecord): Promise<void> {
      getStore(stores, storeName).set(record.key, record);
    },
    async delete(storeName: string, key: string): Promise<void> {
      getStore(stores, storeName).delete(key);
    },
    async getAll<TRecord>(storeName: string): Promise<readonly TRecord[]> {
      return Array.from(getStore(stores, storeName).values()) as readonly TRecord[];
    },
    async clear(storeName: string): Promise<void> {
      getStore(stores, storeName).clear();
    },
  };
}

function getStore(
  stores: Map<string, Map<string, unknown>>,
  storeName: string,
): Map<string, unknown> {
  const existingStore = stores.get(storeName);
  if (existingStore) {
    return existingStore;
  }

  const createdStore = new Map<string, unknown>();
  stores.set(storeName, createdStore);
  return createdStore;
}

function createNewsSnapshot(overrides: Partial<NewsSnapshot> = {}): NewsSnapshot {
  return {
    key: 'news:id=-:section=actualidad:source=-:q=-:page=1:limit=20',
    kind: 'news',
    generatedAt: '2026-04-28T08:00:00.000Z',
    staleAt: '2026-04-28T08:15:00.000Z',
    expiresAt: '2026-04-29T20:00:00.000Z',
    query: {
      id: null,
      section: 'actualidad',
      sourceIds: [],
      searchQuery: null,
      page: 1,
      limit: 20,
    },
    payload: {
      articles: [],
      total: 0,
      page: 1,
      limit: 20,
      warnings: [],
    },
    ...overrides,
  };
}

function createSourcesSnapshot(overrides: Partial<SourcesSnapshot> = {}): SourcesSnapshot {
  return {
    key: 'sources:default',
    kind: 'sources',
    generatedAt: '2026-04-28T08:00:00.000Z',
    staleAt: '2026-04-28T08:15:00.000Z',
    expiresAt: '2026-04-29T20:00:00.000Z',
    query: null,
    payload: {
      sources: [],
      sections: [],
    },
    ...overrides,
  };
}

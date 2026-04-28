import { Injectable } from '@angular/core';

import { toNewsSnapshotKey, toSourcesSnapshotKey } from '../../../shared/lib/snapshot-key';

import { toNewsSnapshotQuery } from './news-request';

import type { NewsRequestQuery } from './news-request';
import type { NewsSnapshot } from '../../../shared/interfaces/news-snapshot.interface';
import type { SourcesSnapshot } from '../../../shared/interfaces/sources-snapshot.interface';
import type { PersistedNewsSnapshotRecord } from '../interfaces/persisted-news-snapshot-record.interface';
import type { PersistedSnapshotRecord } from '../interfaces/persisted-snapshot-record.interface';
import type { PersistedSourcesSnapshotRecord } from '../interfaces/persisted-sources-snapshot-record.interface';
import type { SnapshotCacheCleanupResult } from '../interfaces/snapshot-cache-cleanup-result.interface';
import type { SnapshotCacheDatabase } from '../interfaces/snapshot-cache-database.interface';

const SNAPSHOT_CACHE_DATABASE_NAME = 'front-page-news-snapshot-cache';
const SNAPSHOT_CACHE_DATABASE_VERSION = 1;

const SNAPSHOT_CACHE_STORE_NAME = {
  NEWS: 'newsSnapshots',
  SOURCES: 'sourcesSnapshots',
} as const;

type SnapshotCacheStoreName = (typeof SNAPSHOT_CACHE_STORE_NAME)[keyof typeof SNAPSHOT_CACHE_STORE_NAME];

interface IndexedDbSnapshotCacheOptions {
  readonly now?: () => number;
  readonly openDatabase?: () => Promise<SnapshotCacheDatabase | null>;
}

interface SnapshotCacheWriteOptions {
  readonly staleAtMs?: number;
  readonly expiresAtMs?: number;
}

let sharedDatabasePromise: Promise<SnapshotCacheDatabase | null> | null = null;

@Injectable({ providedIn: 'root' })
export class IndexedDbSnapshotCache {
  private now: () => number = () => Date.now();
  private openDatabase: () => Promise<SnapshotCacheDatabase | null> = openSharedSnapshotCacheDatabase;

  withOptions(options: IndexedDbSnapshotCacheOptions): this {
    this.now = options.now ?? this.now;
    this.openDatabase = options.openDatabase ?? this.openDatabase;
    return this;
  }

  async getNewsSnapshot(query: NewsRequestQuery = {}): Promise<PersistedNewsSnapshotRecord | null> {
    const key = toNewsSnapshotKey(toNewsSnapshotQuery(query));
    return this.readRecord<PersistedNewsSnapshotRecord>(SNAPSHOT_CACHE_STORE_NAME.NEWS, key);
  }

  async putNewsSnapshot(
    snapshot: NewsSnapshot,
    options: SnapshotCacheWriteOptions = {},
  ): Promise<PersistedNewsSnapshotRecord> {
    const record = this.toPersistedRecord(snapshot, options);
    await this.writeRecord(SNAPSHOT_CACHE_STORE_NAME.NEWS, record);
    return record;
  }

  async deleteNewsSnapshot(query: NewsRequestQuery = {}): Promise<void> {
    const key = toNewsSnapshotKey(toNewsSnapshotQuery(query));
    await this.deleteRecord(SNAPSHOT_CACHE_STORE_NAME.NEWS, key);
  }

  async getSourcesSnapshot(): Promise<PersistedSourcesSnapshotRecord | null> {
    return this.readRecord<PersistedSourcesSnapshotRecord>(SNAPSHOT_CACHE_STORE_NAME.SOURCES, toSourcesSnapshotKey());
  }

  async putSourcesSnapshot(
    snapshot: SourcesSnapshot,
    options: SnapshotCacheWriteOptions = {},
  ): Promise<PersistedSourcesSnapshotRecord> {
    const record = this.toPersistedRecord(snapshot, options);
    await this.writeRecord(SNAPSHOT_CACHE_STORE_NAME.SOURCES, record);
    return record;
  }

  async clear(): Promise<void> {
    const database = await this.openDatabase();
    if (!database) {
      return;
    }

    await Promise.all([
      database.clear(SNAPSHOT_CACHE_STORE_NAME.NEWS),
      database.clear(SNAPSHOT_CACHE_STORE_NAME.SOURCES),
    ]);
  }

  async pruneExpiredEntries(): Promise<SnapshotCacheCleanupResult> {
    const database = await this.openDatabase();
    if (!database) {
      return {
        newsSnapshotsRemoved: 0,
        sourcesSnapshotsRemoved: 0,
        totalRemoved: 0,
      };
    }

    const newsSnapshotsRemoved = await this.pruneStore<PersistedNewsSnapshotRecord>(
      database,
      SNAPSHOT_CACHE_STORE_NAME.NEWS,
    );
    const sourcesSnapshotsRemoved = await this.pruneStore<PersistedSourcesSnapshotRecord>(
      database,
      SNAPSHOT_CACHE_STORE_NAME.SOURCES,
    );

    return {
      newsSnapshotsRemoved,
      sourcesSnapshotsRemoved,
      totalRemoved: newsSnapshotsRemoved + sourcesSnapshotsRemoved,
    };
  }

  private async readRecord<TRecord extends PersistedSnapshotRecord<NewsSnapshot | SourcesSnapshot>>(
    storeName: SnapshotCacheStoreName,
    key: string,
  ): Promise<TRecord | null> {
    const database = await this.openDatabase();
    if (!database) {
      return null;
    }

    const record = await database.get<TRecord>(storeName, key);
    if (!record) {
      return null;
    }

    if (this.isExpired(record.expiresAtMs)) {
      await database.delete(storeName, key);
      return null;
    }

    const touchedRecord: TRecord = {
      ...record,
      lastReadAtMs: this.now(),
    };
    await database.put(storeName, touchedRecord);
    return touchedRecord;
  }

  private async writeRecord<TRecord extends { key: string }>(
    storeName: SnapshotCacheStoreName,
    record: TRecord,
  ): Promise<void> {
    const database = await this.openDatabase();
    if (!database) {
      return;
    }

    await database.put(storeName, record);
  }

  private async deleteRecord(storeName: SnapshotCacheStoreName, key: string): Promise<void> {
    const database = await this.openDatabase();
    if (!database) {
      return;
    }

    await database.delete(storeName, key);
  }

  private async pruneStore<TRecord extends PersistedSnapshotRecord<NewsSnapshot | SourcesSnapshot>>(
    database: SnapshotCacheDatabase,
    storeName: SnapshotCacheStoreName,
  ): Promise<number> {
    const records = await database.getAll<TRecord>(storeName);
    let removed = 0;

    for (const record of records) {
      if (!this.isExpired(record.expiresAtMs)) {
        continue;
      }

      await database.delete(storeName, record.key);
      removed += 1;
    }

    return removed;
  }

  private toPersistedRecord<TSnapshot extends NewsSnapshot | SourcesSnapshot>(
    snapshot: TSnapshot,
    options: SnapshotCacheWriteOptions,
  ): PersistedSnapshotRecord<TSnapshot> {
    const timestamp = this.now();
    const staleAtMs = options.staleAtMs ?? parseTimestamp(snapshot.staleAt);
    const expiresAtMs = options.expiresAtMs ?? parseTimestamp(snapshot.expiresAt);

    return {
      key: snapshot.key,
      snapshot,
      persistedAtMs: timestamp,
      lastReadAtMs: timestamp,
      staleAtMs,
      expiresAtMs,
    };
  }

  private isExpired(expiresAtMs: number): boolean {
    return this.now() >= expiresAtMs;
  }
}

async function openSharedSnapshotCacheDatabase(): Promise<SnapshotCacheDatabase | null> {
  if (!sharedDatabasePromise) {
    sharedDatabasePromise = createIndexedDbSnapshotCacheDatabase(globalThis.indexedDB ?? null);
  }

  return sharedDatabasePromise;
}

async function createIndexedDbSnapshotCacheDatabase(indexedDb: IDBFactory | null): Promise<SnapshotCacheDatabase | null> {
  if (!indexedDb) {
    return null;
  }

  try {
    const database = await openDatabase(indexedDb);
    return {
      get: async <TRecord>(storeName: string, key: string) =>
        runReadOnlyTransaction<TRecord | undefined>(database, storeName, (store) => requestToPromise(store.get(key))).then(
          (result) => result ?? null,
        ),
      put: async <TRecord extends { key: string }>(storeName: string, record: TRecord) =>
        runReadWriteTransaction(database, storeName, (store) => store.put(record)),
      delete: async (storeName: string, key: string) => runReadWriteTransaction(database, storeName, (store) => store.delete(key)),
      getAll: async <TRecord>(storeName: string) =>
        runReadOnlyTransaction<TRecord[]>(database, storeName, (store) => requestToPromise(store.getAll())),
      clear: async (storeName: string) => runReadWriteTransaction(database, storeName, (store) => store.clear()),
    };
  } catch {
    sharedDatabasePromise = null;
    return null;
  }
}

function openDatabase(indexedDb: IDBFactory): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDb.open(SNAPSHOT_CACHE_DATABASE_NAME, SNAPSHOT_CACHE_DATABASE_VERSION);

    request.onerror = () => {
      reject(request.error ?? new Error('Unable to open IndexedDB snapshot cache'));
    };

    request.onupgradeneeded = () => {
      const database = request.result;
      ensureObjectStore(database, SNAPSHOT_CACHE_STORE_NAME.NEWS);
      ensureObjectStore(database, SNAPSHOT_CACHE_STORE_NAME.SOURCES);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

function ensureObjectStore(database: IDBDatabase, storeName: SnapshotCacheStoreName): void {
  if (!database.objectStoreNames.contains(storeName)) {
    database.createObjectStore(storeName, { keyPath: 'key' });
  }
}

function runReadOnlyTransaction<TResult>(
  database: IDBDatabase,
  storeName: string,
  worker: (store: IDBObjectStore) => Promise<TResult>,
): Promise<TResult> {
  const transaction = database.transaction(storeName, 'readonly');
  return worker(transaction.objectStore(storeName));
}

async function runReadWriteTransaction(
  database: IDBDatabase,
  storeName: string,
  worker: (store: IDBObjectStore) => IDBRequest,
): Promise<void> {
  const transaction = database.transaction(storeName, 'readwrite');
  const request = worker(transaction.objectStore(storeName));

  await Promise.all([requestToPromise(request), waitForTransaction(transaction)]);
}

function requestToPromise<TResult>(request: IDBRequest<TResult>): Promise<TResult> {
  return new Promise((resolve, reject) => {
    request.onerror = () => {
      reject(request.error ?? new Error('IndexedDB request failed'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

function waitForTransaction(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      resolve();
    };
    transaction.onerror = () => {
      reject(transaction.error ?? new Error('IndexedDB transaction failed'));
    };
    transaction.onabort = () => {
      reject(transaction.error ?? new Error('IndexedDB transaction aborted'));
    };
  });
}

function parseTimestamp(value: string): number {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid snapshot timestamp: ${value}`);
  }

  return parsed;
}

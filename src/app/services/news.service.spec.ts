import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { toArray } from 'rxjs/operators';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FORCE_REFRESH_HEADER, NEWS_CACHE_TTL_MS } from '../constants/news-cache.constants';
import { NEWS_SERVICE_RESULT_SOURCE } from '../interfaces/news-service-result-source.interface';
import { IndexedDbSnapshotCache } from '../lib/indexeddb-snapshot-cache';

import { NewsService } from './news.service';
import { RemoteNewsSnapshotService } from './remote-news-snapshot.service';

import type { NewsResponse } from '../../../shared/interfaces/news-response.interface';
import type { NewsSnapshot } from '../../../shared/interfaces/news-snapshot.interface';
import type { PersistedNewsSnapshotRecord } from '../interfaces/persisted-news-snapshot-record.interface';

describe('NewsService', () => {
  let service: NewsService;
  let httpController: HttpTestingController;
  let indexedDbSnapshotCacheMock: {
    getNewsSnapshot: ReturnType<typeof vi.fn>;
    putNewsSnapshot: ReturnType<typeof vi.fn>;
  };
  let remoteNewsSnapshotServiceMock: {
    getNewsSnapshot: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    indexedDbSnapshotCacheMock = {
      getNewsSnapshot: vi.fn().mockResolvedValue(null),
      putNewsSnapshot: vi.fn().mockResolvedValue(undefined),
    };
    remoteNewsSnapshotServiceMock = {
      getNewsSnapshot: vi.fn().mockResolvedValue(null),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        NewsService,
        {
          provide: IndexedDbSnapshotCache,
          useValue: indexedDbSnapshotCacheMock,
        },
        {
          provide: RemoteNewsSnapshotService,
          useValue: remoteNewsSnapshotServiceMock,
        },
      ],
    });

    service = TestBed.inject(NewsService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    vi.useRealTimers();
    httpController.verify();
    TestBed.resetTestingModule();
  });

  it('builds typed query params and requests a fresh network response', async () => {
    const requestPromise = firstValueFrom(
      service.getNews({
        id: 'url-article-123',
        section: '  Economia ',
        sourceIds: ['source-a', 'source-b'],
        searchQuery: ' Inflacion ',
        page: 2,
        limit: 10,
      }),
    );

    await flushPendingAsyncHydration();
    const request = httpController.expectOne(
      '/api/news?id=url-article-123&section=economia&source=source-a,source-b&q=inflacion&page=2&limit=10',
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get(FORCE_REFRESH_HEADER)).toBe('1');
    request.flush(createValidNewsPayload());

    await expect(requestPromise).resolves.toMatchObject({
      source: NEWS_SERVICE_RESULT_SOURCE.NETWORK,
      isRefreshing: false,
      isStale: false,
      response: createValidNewsPayload(),
    });
  });

  it('hydrates from IndexedDB without hitting the network when the cached snapshot is fresh', async () => {
    indexedDbSnapshotCacheMock.getNewsSnapshot.mockResolvedValue(
      createPersistedNewsSnapshotRecord({
        expiresAtMs: Date.parse('2026-01-01T12:00:00.000Z'),
      }),
    );

    const result = await firstValueFrom(service.getNews({ section: 'actualidad' }));

    httpController.expectNone('/api/news?section=actualidad');
    expect(remoteNewsSnapshotServiceMock.getNewsSnapshot).not.toHaveBeenCalled();
    expect(result.source).toBe(NEWS_SERVICE_RESULT_SOURCE.INDEXEDDB);
    expect(result.isRefreshing).toBe(false);
  });

  it('hydrates from a remote snapshot and persists it locally when no IndexedDB record exists', async () => {
    remoteNewsSnapshotServiceMock.getNewsSnapshot.mockResolvedValue(
      createNewsSnapshot({
        key: 'news:id=-:section=actualidad:source=-:q=-:page=1:limit=20',
        query: {
          id: null,
          section: 'actualidad',
          sourceIds: [],
          searchQuery: null,
          page: 1,
          limit: 20,
        },
      }),
    );

    const result = await firstValueFrom(service.getNews({ section: 'actualidad' }));

    httpController.expectNone('/api/news?section=actualidad');
    expect(result.source).toBe(NEWS_SERVICE_RESULT_SOURCE.REMOTE_SNAPSHOT);
    expect(indexedDbSnapshotCacheMock.putNewsSnapshot).toHaveBeenCalledTimes(1);
  });

  it('emits stale cached data first and then the revalidated network response', async () => {
    indexedDbSnapshotCacheMock.getNewsSnapshot.mockResolvedValue(
      createPersistedNewsSnapshotRecord({
        staleAtMs: Date.parse('2025-12-31T23:00:00.000Z'),
        expiresAtMs: Date.parse('2026-01-01T12:00:00.000Z'),
      }),
    );

    const resultPromise = lastValueFrom(service.getNews({ section: 'actualidad' }).pipe(toArray()));

    await flushPendingAsyncHydration();
    const request = httpController.expectOne('/api/news?section=actualidad');
    request.flush(
      createValidNewsPayload({
        articles: [
          {
            ...createValidNewsPayload().articles[0],
            id: 'news-2',
            title: 'Titulo revalidado',
          },
        ],
      }),
    );

    await expect(resultPromise).resolves.toMatchObject([
      {
        source: NEWS_SERVICE_RESULT_SOURCE.INDEXEDDB,
        isRefreshing: true,
        isStale: true,
      },
      {
        source: NEWS_SERVICE_RESULT_SOURCE.NETWORK,
        isRefreshing: false,
        isStale: false,
      },
    ]);
  });

  it('reuses the memory cache for identical queries within ttl', async () => {
    const firstRequestPromise = firstValueFrom(service.getNews({ section: 'economia' }));
    await flushPendingAsyncHydration();
    const firstRequest = httpController.expectOne('/api/news?section=economia');
    firstRequest.flush(createValidNewsPayload());
    await firstRequestPromise;

    const secondRequestResult = await firstValueFrom(service.getNews({ section: 'economia' }));

    httpController.expectNone('/api/news?section=economia');
    expect(secondRequestResult.source).toBe(NEWS_SERVICE_RESULT_SOURCE.MEMORY);
  });

  it('revalidates when serving a stale memory entry within ttl', async () => {
    indexedDbSnapshotCacheMock.getNewsSnapshot.mockResolvedValue(
      createPersistedNewsSnapshotRecord({
        staleAtMs: Date.parse('2025-12-31T23:00:00.000Z'),
        expiresAtMs: Date.parse('2026-01-01T12:00:00.000Z'),
      }),
    );

    const firstResultPromise = lastValueFrom(service.getNews({ section: 'economia' }).pipe(toArray()));
    await flushPendingAsyncHydration();
    const firstRequest = httpController.expectOne('/api/news?section=economia');
    firstRequest.flush('upstream timeout', { status: 504, statusText: 'Gateway Timeout' });
    await expect(firstResultPromise).resolves.toMatchObject([
      {
        source: NEWS_SERVICE_RESULT_SOURCE.INDEXEDDB,
        isRefreshing: true,
        isStale: true,
      },
    ]);

    const secondResultPromise = lastValueFrom(service.getNews({ section: 'economia' }).pipe(toArray()));
    await flushPendingAsyncHydration();
    const secondRequest = httpController.expectOne('/api/news?section=economia');
    secondRequest.flush(
      createValidNewsPayload({
        articles: [
          {
            ...createValidNewsPayload().articles[0],
            id: 'news-2',
            title: 'Titulo revalidado desde memoria stale',
          },
        ],
      }),
    );

    await expect(secondResultPromise).resolves.toMatchObject([
      {
        source: NEWS_SERVICE_RESULT_SOURCE.MEMORY,
        isRefreshing: true,
        isStale: true,
      },
      {
        source: NEWS_SERVICE_RESULT_SOURCE.NETWORK,
        isRefreshing: false,
        isStale: false,
      },
    ]);
  });

  it('fetches again when the memory cache ttl expires', async () => {
    const firstRequestPromise = firstValueFrom(service.getNews({ section: 'economia' }));
    await flushPendingAsyncHydration();
    const firstRequest = httpController.expectOne('/api/news?section=economia');
    firstRequest.flush(createValidNewsPayload());
    await firstRequestPromise;

    vi.setSystemTime(new Date(Date.now() + NEWS_CACHE_TTL_MS + 1));

    const secondRequestPromise = firstValueFrom(service.getNews({ section: 'economia' }));
    await flushPendingAsyncHydration();
    const secondRequest = httpController.expectOne('/api/news?section=economia');
    secondRequest.flush(createValidNewsPayload());
    await secondRequestPromise;
  });

  it('bypasses hydrated caches when forceRefresh is true', async () => {
    indexedDbSnapshotCacheMock.getNewsSnapshot.mockResolvedValue(
      createPersistedNewsSnapshotRecord({
        expiresAtMs: Date.parse('2026-01-01T12:00:00.000Z'),
      }),
    );

    const requestPromise = firstValueFrom(service.getNews({ section: 'economia' }, { forceRefresh: true }));
    await flushPendingAsyncHydration();
    const request = httpController.expectOne('/api/news?section=economia');
    request.flush(createValidNewsPayload());
    const result = await requestPromise;

    expect(indexedDbSnapshotCacheMock.getNewsSnapshot).not.toHaveBeenCalled();
    expect(result.source).toBe(NEWS_SERVICE_RESULT_SOURCE.NETWORK);
  });

  it('fails when the network response shape is invalid and no cached data exists', async () => {
    const requestPromise = firstValueFrom(service.getNews());
    await flushPendingAsyncHydration();
    const request = httpController.expectOne('/api/news');
    request.flush({
      articles: [],
      total: 1,
      page: 1,
      limit: 20,
      warnings: 'invalid',
    });

    await expect(requestPromise).rejects.toThrow('Invalid news response: "warnings" must be an array');
  });
});

function createValidNewsPayload(overrides: Partial<NewsResponse> = {}): NewsResponse {
  return {
    articles: [
      {
        id: 'news-1',
        externalId: null,
        title: 'Titulo de prueba',
        summary: 'Resumen de prueba',
        url: 'https://example.com/news-1',
        canonicalUrl: null,
        imageUrl: null,
        sourceId: 'source-example',
        sourceName: 'Example',
        sectionSlug: 'actualidad',
        author: null,
        publishedAt: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    warnings: [],
    ...overrides,
  };
}

async function flushPendingAsyncHydration(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

function createNewsSnapshot(overrides: Partial<NewsSnapshot> = {}): NewsSnapshot {
  return {
    key: 'news:id=-:section=-:source=-:q=-:page=1:limit=20',
    kind: 'news',
    generatedAt: '2026-01-01T00:00:00.000Z',
    staleAt: '2026-01-01T00:15:00.000Z',
    expiresAt: '2026-01-01T12:00:00.000Z',
    query: {
      id: null,
      section: null,
      sourceIds: [],
      searchQuery: null,
      page: 1,
      limit: 20,
    },
    payload: createValidNewsPayload(),
    ...overrides,
  };
}

function createPersistedNewsSnapshotRecord(
  overrides: Partial<PersistedNewsSnapshotRecord> = {},
): PersistedNewsSnapshotRecord {
  return {
    key: 'news:id=-:section=actualidad:source=-:q=-:page=1:limit=20',
    snapshot: createNewsSnapshot({
      key: 'news:id=-:section=actualidad:source=-:q=-:page=1:limit=20',
      query: {
        id: null,
        section: 'actualidad',
        sourceIds: [],
        searchQuery: null,
        page: 1,
        limit: 20,
      },
    }),
    persistedAtMs: Date.parse('2026-01-01T00:00:00.000Z'),
    lastReadAtMs: Date.parse('2026-01-01T00:00:00.000Z'),
    staleAtMs: Date.parse('2026-01-01T00:15:00.000Z'),
    expiresAtMs: Date.parse('2026-01-01T12:00:00.000Z'),
    ...overrides,
  };
}

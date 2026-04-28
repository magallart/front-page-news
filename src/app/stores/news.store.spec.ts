import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { NEWS_SERVICE_RESULT_SOURCE } from '../interfaces/news-service-result-source.interface';
import { NewsService } from '../services/news.service';

import { NewsStore } from './news.store';

import type { NewsResponse } from '../../../shared/interfaces/news-response.interface';
import type { NewsServiceResult } from '../interfaces/news-service-result.interface';

describe('NewsStore', () => {
  it('loads initial data and marks the query as hydrated', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-10T10:00:00.000Z'));

    const newsServiceMock = {
      getNews: vi.fn().mockReturnValue(of(createServiceResult())),
    };

    const store = configureStore(newsServiceMock);
    store.load({ section: 'economia' });

    expect(newsServiceMock.getNews).toHaveBeenCalledWith({ section: 'economia' }, { forceRefresh: false });
    expect(store.loading({ section: 'economia' })).toBe(false);
    expect(store.isHydrated({ section: 'economia' })).toBe(true);
    expect(store.data({ section: 'economia' })).toEqual(createNewsResponse().articles);
    expect(store.lastUpdated({ section: 'economia' })).toBe(new Date('2026-01-10T10:00:00.000Z').getTime());

    vi.useRealTimers();
  });

  it('keeps stale visible data while a background refresh is running', () => {
    const stream = createObservableController<NewsServiceResult>();
    const newsServiceMock = {
      getNews: vi.fn().mockReturnValue(stream.observable),
    };

    const store = configureStore(newsServiceMock);
    store.load({ section: 'economia' });

    stream.next(
      createServiceResult({
        source: NEWS_SERVICE_RESULT_SOURCE.INDEXEDDB,
        isStale: true,
        isRefreshing: true,
      }),
    );

    expect(store.data({ section: 'economia' })).toEqual(createNewsResponse().articles);
    expect(store.isHydrated({ section: 'economia' })).toBe(true);
    expect(store.isRefreshing({ section: 'economia' })).toBe(true);
    expect(store.isShowingStaleData({ section: 'economia' })).toBe(true);
  });

  it('stores a fresh update as pending during background revalidation', () => {
    const stream = createObservableController<NewsServiceResult>();
    const newsServiceMock = {
      getNews: vi.fn().mockReturnValue(stream.observable),
    };

    const store = configureStore(newsServiceMock);
    store.load({ section: 'economia' });

    stream.next(
      createServiceResult({
        source: NEWS_SERVICE_RESULT_SOURCE.INDEXEDDB,
        isStale: true,
        isRefreshing: true,
      }),
    );
    stream.next(
      createServiceResult({
        source: NEWS_SERVICE_RESULT_SOURCE.NETWORK,
        response: createNewsResponse({
          articles: [
            {
              ...createNewsResponse().articles[0],
              id: 'news-2',
              title: 'Noticia fresca',
            },
          ],
        }),
      }),
    );
    stream.complete();

    expect(store.data({ section: 'economia' })[0]?.id).toBe('news-1');
    expect(store.hasFreshUpdateAvailable({ section: 'economia' })).toBe(true);
    expect(store.isRefreshing({ section: 'economia' })).toBe(false);

    store.applyFreshUpdate({ section: 'economia' });

    expect(store.data({ section: 'economia' })[0]?.id).toBe('news-2');
    expect(store.hasFreshUpdateAvailable({ section: 'economia' })).toBe(false);
    expect(store.isShowingStaleData({ section: 'economia' })).toBe(false);
  });

  it('refreshes the selected query without clearing visible data', () => {
    const stream = createObservableController<NewsServiceResult>();
    const newsServiceMock = {
      getNews: vi
        .fn()
        .mockReturnValueOnce(of(createServiceResult()))
        .mockReturnValueOnce(stream.observable),
    };

    const store = configureStore(newsServiceMock);
    store.load({ section: 'actualidad', limit: 10 });
    store.refresh({ section: 'actualidad', limit: 10 });

    expect(newsServiceMock.getNews).toHaveBeenNthCalledWith(1, { section: 'actualidad', limit: 10 }, { forceRefresh: false });
    expect(newsServiceMock.getNews).toHaveBeenNthCalledWith(2, { section: 'actualidad', limit: 10 }, { forceRefresh: true });
    expect(store.data({ section: 'actualidad', limit: 10 })).toEqual(createNewsResponse().articles);
    expect(store.isRefreshing({ section: 'actualidad', limit: 10 })).toBe(true);

    stream.next(
      createServiceResult({
        response: createNewsResponse({
          articles: [
            {
              ...createNewsResponse().articles[0],
              id: 'news-2',
            },
          ],
        }),
      }),
    );
    stream.complete();

    expect(store.data({ section: 'actualidad', limit: 10 })[0]?.id).toBe('news-2');
    expect(store.hasFreshUpdateAvailable({ section: 'actualidad', limit: 10 })).toBe(false);
  });

  it('keeps independent state per query key', () => {
    const economyStream = createObservableController<NewsServiceResult>();
    const cultureStream = createObservableController<NewsServiceResult>();
    const newsServiceMock = {
      getNews: vi
        .fn()
        .mockReturnValueOnce(economyStream.observable)
        .mockReturnValueOnce(cultureStream.observable),
    };

    const store = configureStore(newsServiceMock);
    store.load({ section: 'economia' });
    store.load({ section: 'cultura' });

    economyStream.next(
      createServiceResult({
        query: {
          id: null,
          section: 'economia',
          sourceIds: [],
          searchQuery: null,
          page: 1,
          limit: 20,
        },
      }),
    );
    cultureStream.next(
      createServiceResult({
        query: {
          id: null,
          section: 'cultura',
          sourceIds: [],
          searchQuery: null,
          page: 1,
          limit: 20,
        },
        response: createNewsResponse({
          articles: [
            {
              ...createNewsResponse().articles[0],
              id: 'news-culture',
              sectionSlug: 'cultura',
            },
          ],
        }),
      }),
    );

    expect(store.data({ section: 'economia' })[0]?.sectionSlug).toBe('economia');
    expect(store.data({ section: 'cultura' })[0]?.sectionSlug).toBe('cultura');
  });

  it('stores error when the initial request fails', () => {
    const newsServiceMock = {
      getNews: vi.fn().mockReturnValue(throwError(() => new Error('API unavailable'))),
    };

    const store = configureStore(newsServiceMock);
    store.load({ section: 'cultura' });

    expect(store.loading({ section: 'cultura' })).toBe(false);
    expect(store.error({ section: 'cultura' })).toBe('API unavailable');
    expect(store.data({ section: 'cultura' })).toEqual([]);
  });
});

function configureStore(newsServiceMock: Pick<NewsService, 'getNews'>): NewsStore {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      NewsStore,
      {
        provide: NewsService,
        useValue: newsServiceMock,
      },
    ],
  });

  return TestBed.inject(NewsStore);
}

function createNewsResponse(overrides: Partial<NewsResponse> = {}): NewsResponse {
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
        sourceId: 'source-ejemplo',
        sourceName: 'Ejemplo',
        sectionSlug: 'economia',
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

function createObservableController<T>(): {
  readonly observable: Observable<T>;
  next(value: T): void;
  complete(): void;
  error(error: unknown): void;
} {
  let nextHandler: ((value: T) => void) | null = null;
  let completeHandler: (() => void) | null = null;
  let errorHandler: ((error: unknown) => void) | null = null;

  return {
    observable: new Observable<T>((subscriber) => {
      nextHandler = (value) => subscriber.next(value);
      completeHandler = () => subscriber.complete();
      errorHandler = (error) => subscriber.error(error);
    }),
    next(value: T) {
      nextHandler?.(value);
    },
    complete() {
      completeHandler?.();
    },
    error(error: unknown) {
      errorHandler?.(error);
    },
  };
}

function createServiceResult(overrides: Partial<NewsServiceResult> = {}): NewsServiceResult {
  return {
    key: 'news:id=-:section=economia:source=-:q=-:page=1:limit=20',
    query: {
      id: null,
      section: 'economia',
      sourceIds: [],
      searchQuery: null,
      page: 1,
      limit: 20,
    },
    response: createNewsResponse(),
    source: NEWS_SERVICE_RESULT_SOURCE.NETWORK,
    staleAtMs: Date.parse('2026-01-10T10:15:00.000Z'),
    expiresAtMs: Date.parse('2026-01-10T22:00:00.000Z'),
    isStale: false,
    isRefreshing: false,
    ...overrides,
  };
}

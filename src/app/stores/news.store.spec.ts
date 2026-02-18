import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { NewsService } from '../services/news.service';

import { NewsStore } from './news.store';

describe('NewsStore', () => {
  it('loads news and updates data, warnings and lastUpdated', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-10T10:00:00.000Z'));

    const newsServiceMock = {
      getNews: vi.fn().mockReturnValue(of(createNewsResponse())),
    };

    const store = configureStore(newsServiceMock);
    store.load({ section: 'economia' });

    expect(newsServiceMock.getNews).toHaveBeenCalledWith({ section: 'economia' }, { forceRefresh: false });
    expect(store.loading()).toBe(false);
    expect(store.data()).toEqual(createNewsResponse().articles);
    expect(store.warnings()).toEqual(createNewsResponse().warnings);
    expect(store.error()).toBeNull();
    expect(store.lastUpdated()).toBe(new Date('2026-01-10T10:00:00.000Z').getTime());

    vi.useRealTimers();
  });

  it('stores error when request fails', () => {
    const newsServiceMock = {
      getNews: vi.fn().mockReturnValue(throwError(() => new Error('API unavailable'))),
    };

    const store = configureStore(newsServiceMock);
    store.load({ section: 'cultura' });

    expect(store.loading()).toBe(false);
    expect(store.error()).toBe('API unavailable');
    expect(store.data()).toEqual([]);
  });

  it('refreshes with forceRefresh using last query', () => {
    const newsServiceMock = {
      getNews: vi.fn().mockReturnValue(of(createNewsResponse())),
    };

    const store = configureStore(newsServiceMock);
    store.load({ section: 'actualidad', limit: 10 });
    store.refresh();

    expect(newsServiceMock.getNews).toHaveBeenNthCalledWith(1, { section: 'actualidad', limit: 10 }, { forceRefresh: false });
    expect(newsServiceMock.getNews).toHaveBeenNthCalledWith(2, { section: 'actualidad', limit: 10 }, { forceRefresh: true });
  });

  it('does nothing on refresh when no query was loaded yet', () => {
    const newsServiceMock = {
      getNews: vi.fn().mockReturnValue(of(createNewsResponse())),
    };

    const store = configureStore(newsServiceMock);
    store.refresh();

    expect(newsServiceMock.getNews).not.toHaveBeenCalled();
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

function createNewsResponse() {
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
    warnings: [
      {
        code: 'source_timeout',
        message: 'Source timeout',
        sourceId: 'source-ejemplo',
        feedUrl: 'https://example.com/rss.xml',
      },
    ],
  } as const;
}

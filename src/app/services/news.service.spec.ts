import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NEWS_CACHE_TTL_MS, NewsService } from './news.service';

describe('NewsService', () => {
  let service: NewsService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    httpController.verify();
  });

  it('builds typed query params for /api/news', () => {
    configureTestingModule();
    service = TestBed.inject(NewsService);
    httpController = TestBed.inject(HttpTestingController);

    firstValueFrom(
      service.getNews({
        id: 'url-article-123',
        section: '  Economia ',
        sourceIds: ['source-a', 'source-b'],
        searchQuery: ' Inflacion ',
        page: 2,
        limit: 10,
      }),
    );

    const request = httpController.expectOne(
      '/api/news?id=url-article-123&section=economia&source=source-a,source-b&q=inflacion&page=2&limit=10'
    );
    expect(request.request.method).toBe('GET');
    request.flush(createValidNewsPayload());
  });

  it('omits invalid or empty query params', () => {
    configureTestingModule();
    service = TestBed.inject(NewsService);
    httpController = TestBed.inject(HttpTestingController);

    firstValueFrom(
      service.getNews({
        section: '   ',
        sourceIds: [' ', ''],
        searchQuery: ' ',
        page: 0,
        limit: -5,
      }),
    );

    const request = httpController.expectOne('/api/news');
    expect(request.request.method).toBe('GET');
    request.flush(createValidNewsPayload());
  });

  it('returns a strictly adapted response for /api/news', async () => {
    configureTestingModule();
    service = TestBed.inject(NewsService);
    httpController = TestBed.inject(HttpTestingController);

    const requestPromise = firstValueFrom(service.getNews());
    const request = httpController.expectOne('/api/news');
    request.flush(createValidNewsPayload());

    await expect(requestPromise).resolves.toEqual(createValidNewsPayload());
  });

  it('reuses cached response for identical queries', async () => {
    configureTestingModule();
    service = TestBed.inject(NewsService);
    httpController = TestBed.inject(HttpTestingController);

    const firstRequestPromise = firstValueFrom(service.getNews({ section: 'economia', page: 1, limit: 10 }));
    const secondRequestPromise = firstValueFrom(service.getNews({ section: 'economia', page: 1, limit: 10 }));

    const request = httpController.expectOne('/api/news?section=economia&page=1&limit=10');
    request.flush(createValidNewsPayload());

    await expect(Promise.all([firstRequestPromise, secondRequestPromise])).resolves.toEqual([
      createValidNewsPayload(),
      createValidNewsPayload(),
    ]);
  });

  it('creates a request on cache miss for a query key', async () => {
    configureTestingModule();
    service = TestBed.inject(NewsService);
    httpController = TestBed.inject(HttpTestingController);

    const requestPromise = firstValueFrom(service.getNews({ section: 'deportes', page: 1, limit: 20 }));

    const request = httpController.expectOne('/api/news?section=deportes&page=1&limit=20');
    expect(request.request.method).toBe('GET');
    request.flush(createValidNewsPayload());

    await expect(requestPromise).resolves.toEqual(createValidNewsPayload());
  });

  it('creates a new request when query changes', async () => {
    configureTestingModule();
    service = TestBed.inject(NewsService);
    httpController = TestBed.inject(HttpTestingController);

    const economyRequestPromise = firstValueFrom(service.getNews({ section: 'economia' }));
    const economyRequest = httpController.expectOne('/api/news?section=economia');
    economyRequest.flush(createValidNewsPayload());
    await economyRequestPromise;

    const cultureRequestPromise = firstValueFrom(service.getNews({ section: 'cultura' }));
    const cultureRequest = httpController.expectOne('/api/news?section=cultura');
    cultureRequest.flush(createValidNewsPayload());
    await cultureRequestPromise;
  });

  it('creates a new request when cache entry TTL expires', async () => {
    configureTestingModule();
    service = TestBed.inject(NewsService);
    httpController = TestBed.inject(HttpTestingController);

    const firstRequestPromise = firstValueFrom(service.getNews({ section: 'economia' }));
    const firstRequest = httpController.expectOne('/api/news?section=economia');
    firstRequest.flush(createValidNewsPayload());
    await firstRequestPromise;

    vi.setSystemTime(new Date(Date.now() + NEWS_CACHE_TTL_MS + 1));

    const secondRequestPromise = firstValueFrom(service.getNews({ section: 'economia' }));
    const secondRequest = httpController.expectOne('/api/news?section=economia');
    secondRequest.flush(createValidNewsPayload());
    await secondRequestPromise;
  });

  it('clears all cached entries with clear()', async () => {
    configureTestingModule();
    service = TestBed.inject(NewsService);
    httpController = TestBed.inject(HttpTestingController);

    const firstRequestPromise = firstValueFrom(service.getNews({ section: 'economia' }));
    const firstRequest = httpController.expectOne('/api/news?section=economia');
    firstRequest.flush(createValidNewsPayload());
    await firstRequestPromise;

    service.clear();

    const secondRequestPromise = firstValueFrom(service.getNews({ section: 'economia' }));
    const secondRequest = httpController.expectOne('/api/news?section=economia');
    secondRequest.flush(createValidNewsPayload());
    await secondRequestPromise;
  });

  it('invalidates only entries for selected section', async () => {
    configureTestingModule();
    service = TestBed.inject(NewsService);
    httpController = TestBed.inject(HttpTestingController);

    const economyPromise = firstValueFrom(service.getNews({ section: 'economia' }));
    const economyRequest = httpController.expectOne('/api/news?section=economia');
    economyRequest.flush(createValidNewsPayload());
    await economyPromise;

    const culturePromise = firstValueFrom(service.getNews({ section: 'cultura' }));
    const cultureRequest = httpController.expectOne('/api/news?section=cultura');
    cultureRequest.flush(createValidNewsPayload());
    await culturePromise;

    service.invalidateBySection('economia');

    const refreshedEconomyPromise = firstValueFrom(service.getNews({ section: 'economia' }));
    const refreshedEconomyRequest = httpController.expectOne('/api/news?section=economia');
    refreshedEconomyRequest.flush(createValidNewsPayload());
    await refreshedEconomyPromise;

    const cachedCulturePromise = firstValueFrom(service.getNews({ section: 'cultura' }));
    await expect(cachedCulturePromise).resolves.toEqual(createValidNewsPayload());
  });

  it('forces refresh when forceRefresh is true', async () => {
    configureTestingModule();
    service = TestBed.inject(NewsService);
    httpController = TestBed.inject(HttpTestingController);

    const firstRequestPromise = firstValueFrom(service.getNews({ section: 'economia' }));
    const firstRequest = httpController.expectOne('/api/news?section=economia');
    firstRequest.flush(createValidNewsPayload());
    await firstRequestPromise;

    const secondRequestPromise = firstValueFrom(service.getNews({ section: 'economia' }, { forceRefresh: true }));
    const secondRequest = httpController.expectOne('/api/news?section=economia');
    secondRequest.flush(createValidNewsPayload());
    await secondRequestPromise;
  });

  it('fails when response shape is invalid', async () => {
    configureTestingModule();
    service = TestBed.inject(NewsService);
    httpController = TestBed.inject(HttpTestingController);

    const requestPromise = firstValueFrom(service.getNews());
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

function configureTestingModule(): void {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
}

function createValidNewsPayload() {
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
  };
}

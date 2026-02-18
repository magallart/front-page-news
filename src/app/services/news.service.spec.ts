import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';

import { NewsService } from './news.service';

describe('NewsService', () => {
  let service: NewsService;
  let httpController: HttpTestingController;

  afterEach(() => {
    httpController.verify();
  });

  it('builds typed query params for /api/news', () => {
    configureTestingModule();
    service = TestBed.inject(NewsService);
    httpController = TestBed.inject(HttpTestingController);

    firstValueFrom(
      service.getNews({
        section: '  Economia ',
        sourceIds: ['source-a', 'source-b'],
        searchQuery: ' Inflacion ',
        page: 2,
        limit: 10,
      }),
    );

    const request = httpController.expectOne('/api/news?section=economia&source=source-a,source-b&q=inflacion&page=2&limit=10');
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

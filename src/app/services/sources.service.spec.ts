import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SOURCES_CACHE_TTL_MS, SourcesService } from './sources.service';

describe('SourcesService', () => {
  let service: SourcesService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    httpController.verify();
  });

  it('returns a strictly adapted response for /api/sources', async () => {
    configureTestingModule();
    service = TestBed.inject(SourcesService);
    httpController = TestBed.inject(HttpTestingController);

    const requestPromise = firstValueFrom(service.getSources());
    const request = httpController.expectOne('/api/sources');
    expect(request.request.method).toBe('GET');

    request.flush({
      sources: [
        {
          id: 'source-ejemplo',
          name: 'Ejemplo',
          baseUrl: 'https://example.com',
          feedUrl: 'https://example.com/rss.xml',
          sectionSlugs: ['actualidad', 'economia'],
        },
      ],
      sections: [
        {
          id: 'section-actualidad',
          slug: 'actualidad',
          name: 'Actualidad',
        },
      ],
    });

    await expect(requestPromise).resolves.toEqual({
      sources: [
        {
          id: 'source-ejemplo',
          name: 'Ejemplo',
          baseUrl: 'https://example.com',
          feedUrl: 'https://example.com/rss.xml',
          sectionSlugs: ['actualidad', 'economia'],
        },
      ],
      sections: [
        {
          id: 'section-actualidad',
          slug: 'actualidad',
          name: 'Actualidad',
        },
      ],
    });
  });

  it('fails when response shape is invalid', async () => {
    configureTestingModule();
    service = TestBed.inject(SourcesService);
    httpController = TestBed.inject(HttpTestingController);

    const requestPromise = firstValueFrom(service.getSources());
    const request = httpController.expectOne('/api/sources');
    request.flush({ sources: 'invalid', sections: [] });

    await expect(requestPromise).rejects.toThrow('Invalid sources response: "sources" must be an array');
  });

  it('reuses cached response for repeated calls', async () => {
    configureTestingModule();
    service = TestBed.inject(SourcesService);
    httpController = TestBed.inject(HttpTestingController);

    const firstRequestPromise = firstValueFrom(service.getSources());
    const secondRequestPromise = firstValueFrom(service.getSources());

    const request = httpController.expectOne('/api/sources');
    request.flush({
      sources: [
        {
          id: 'source-ejemplo',
          name: 'Ejemplo',
          baseUrl: 'https://example.com',
          feedUrl: 'https://example.com/rss.xml',
          sectionSlugs: ['actualidad'],
        },
      ],
      sections: [
        {
          id: 'section-actualidad',
          slug: 'actualidad',
          name: 'Actualidad',
        },
      ],
    });

    await expect(Promise.all([firstRequestPromise, secondRequestPromise])).resolves.toEqual([
      {
        sources: [
          {
            id: 'source-ejemplo',
            name: 'Ejemplo',
            baseUrl: 'https://example.com',
            feedUrl: 'https://example.com/rss.xml',
            sectionSlugs: ['actualidad'],
          },
        ],
        sections: [
          {
            id: 'section-actualidad',
            slug: 'actualidad',
            name: 'Actualidad',
          },
        ],
      },
      {
        sources: [
          {
            id: 'source-ejemplo',
            name: 'Ejemplo',
            baseUrl: 'https://example.com',
            feedUrl: 'https://example.com/rss.xml',
            sectionSlugs: ['actualidad'],
          },
        ],
        sections: [
          {
            id: 'section-actualidad',
            slug: 'actualidad',
            name: 'Actualidad',
          },
        ],
      },
    ]);
  });

  it('creates a new request when cache entry TTL expires', async () => {
    configureTestingModule();
    service = TestBed.inject(SourcesService);
    httpController = TestBed.inject(HttpTestingController);

    const firstRequestPromise = firstValueFrom(service.getSources());
    const firstRequest = httpController.expectOne('/api/sources');
    firstRequest.flush(createValidSourcesPayload());
    await firstRequestPromise;

    vi.setSystemTime(new Date(Date.now() + SOURCES_CACHE_TTL_MS + 1));

    const secondRequestPromise = firstValueFrom(service.getSources());
    const secondRequest = httpController.expectOne('/api/sources');
    secondRequest.flush(createValidSourcesPayload());
    await secondRequestPromise;
  });

  it('clears cached response with clear()', async () => {
    configureTestingModule();
    service = TestBed.inject(SourcesService);
    httpController = TestBed.inject(HttpTestingController);

    const firstRequestPromise = firstValueFrom(service.getSources());
    const firstRequest = httpController.expectOne('/api/sources');
    firstRequest.flush(createValidSourcesPayload());
    await firstRequestPromise;

    service.clear();

    const secondRequestPromise = firstValueFrom(service.getSources());
    const secondRequest = httpController.expectOne('/api/sources');
    secondRequest.flush(createValidSourcesPayload());
    await secondRequestPromise;
  });

  it('forces refresh when forceRefresh is true', async () => {
    configureTestingModule();
    service = TestBed.inject(SourcesService);
    httpController = TestBed.inject(HttpTestingController);

    const firstRequestPromise = firstValueFrom(service.getSources());
    const firstRequest = httpController.expectOne('/api/sources');
    firstRequest.flush(createValidSourcesPayload());
    await firstRequestPromise;

    const secondRequestPromise = firstValueFrom(service.getSources({ forceRefresh: true }));
    const secondRequest = httpController.expectOne('/api/sources');
    secondRequest.flush(createValidSourcesPayload());
    await secondRequestPromise;
  });
});

function configureTestingModule(): void {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
}

function createValidSourcesPayload() {
  return {
    sources: [
      {
        id: 'source-ejemplo',
        name: 'Ejemplo',
        baseUrl: 'https://example.com',
        feedUrl: 'https://example.com/rss.xml',
        sectionSlugs: ['actualidad'],
      },
    ],
    sections: [
      {
        id: 'section-actualidad',
        slug: 'actualidad',
        name: 'Actualidad',
      },
    ],
  };
}

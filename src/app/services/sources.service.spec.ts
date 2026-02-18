import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';

import { SourcesService } from './sources.service';

describe('SourcesService', () => {
  let service: SourcesService;
  let httpController: HttpTestingController;

  afterEach(() => {
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
});

function configureTestingModule(): void {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
}

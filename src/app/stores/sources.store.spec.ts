import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { SourcesService } from '../services/sources.service';

import { SourcesStore } from './sources.store';

describe('SourcesStore', () => {
  it('loads sources successfully and updates loading/data state', () => {
    const sourcesServiceMock = {
      getSources: vi.fn().mockReturnValue(of(createSourcesResponse())),
    };

    const store = configureStore(sourcesServiceMock);

    expect(store.loading()).toBe(false);
    expect(store.data()).toBeNull();
    expect(store.error()).toBeNull();

    store.loadInitial();

    expect(sourcesServiceMock.getSources).toHaveBeenCalledTimes(1);
    expect(sourcesServiceMock.getSources).toHaveBeenCalledWith({ forceRefresh: false });
    expect(store.loading()).toBe(false);
    expect(store.data()).toEqual(createSourcesResponse());
    expect(store.error()).toBeNull();
  });

  it('stores a readable error when source loading fails', () => {
    const sourcesServiceMock = {
      getSources: vi.fn().mockReturnValue(throwError(() => new Error('Network down'))),
    };

    const store = configureStore(sourcesServiceMock);
    store.loadInitial();

    expect(store.loading()).toBe(false);
    expect(store.data()).toBeNull();
    expect(store.error()).toBe('Network down');
  });

  it('does not repeat initial load when data was already loaded', () => {
    const sourcesServiceMock = {
      getSources: vi.fn().mockReturnValue(of(createSourcesResponse())),
    };

    const store = configureStore(sourcesServiceMock);
    store.loadInitial();
    store.loadInitial();

    expect(sourcesServiceMock.getSources).toHaveBeenCalledTimes(1);
  });

  it('forces a fresh request on refresh', () => {
    const sourcesServiceMock = {
      getSources: vi.fn().mockReturnValue(of(createSourcesResponse())),
    };

    const store = configureStore(sourcesServiceMock);
    store.loadInitial();
    store.refresh();

    expect(sourcesServiceMock.getSources).toHaveBeenCalledTimes(2);
    expect(sourcesServiceMock.getSources).toHaveBeenNthCalledWith(1, { forceRefresh: false });
    expect(sourcesServiceMock.getSources).toHaveBeenNthCalledWith(2, { forceRefresh: true });
  });
});

function configureStore(sourcesServiceMock: Pick<SourcesService, 'getSources'>): SourcesStore {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      SourcesStore,
      {
        provide: SourcesService,
        useValue: sourcesServiceMock,
      },
    ],
  });

  return TestBed.inject(SourcesStore);
}

function createSourcesResponse() {
  return {
    sources: [
      {
        id: 'source-1',
        name: 'Fuente Uno',
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
  } as const;
}

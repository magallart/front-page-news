import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';

import { MostReadNewsComponent } from '../../components/news/most-read-news.component';
import { NewsCarouselComponent } from '../../components/news/news-carousel.component';
import { NewsQuickViewModalComponent } from '../../components/news/news-quick-view-modal.component';
import { SourceDirectoryComponent } from '../../components/news/source-directory.component';
import { IndexedDbSnapshotCache } from '../../lib/indexeddb-snapshot-cache';
import { createHomeNewsQuery } from '../../lib/news-query-factory';
import { RemoteNewsSnapshotService } from '../../services/remote-news-snapshot.service';
import { NewsStore } from '../../stores/news.store';
import { SourcesStore } from '../../stores/sources.store';

import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
  it('integrates with /api/news and renders mixed rows from real store data', async () => {
    const sourcesStoreMock = createSourcesStoreMock();
    const indexedDbSnapshotCacheMock = {
      getNewsSnapshot: vi.fn().mockResolvedValue(null),
      putNewsSnapshot: vi.fn().mockResolvedValue(undefined),
    };
    const remoteNewsSnapshotServiceMock = {
      getNewsSnapshot: vi.fn().mockResolvedValue(null),
    };

    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: IndexedDbSnapshotCache, useValue: indexedDbSnapshotCacheMock },
        { provide: RemoteNewsSnapshotService, useValue: remoteNewsSnapshotServiceMock },
        { provide: SourcesStore, useValue: sourcesStoreMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomePageComponent);
    const httpController = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    await fixture.whenStable();
    const request = await expectPendingRequest(httpController, (request) =>
      request.url === '/api/news' &&
      request.params.get('page') === '1' &&
      request.params.get('limit') === '250',
    );
    expect(request.request.method).toBe('GET');
    request.flush({
      articles: [
        createArticle('home-1', 'actualidad'),
        createArticle('home-2', 'actualidad'),
        createArticle('home-3', 'economia'),
        createArticle('home-4', 'cultura'),
      ],
      total: 4,
      page: 1,
      limit: 250,
      warnings: [],
    });

    await fixture.whenStable();
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-news-carousel')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('app-breaking-news')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('app-most-read-news')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('app-source-directory')).toBeTruthy();
      expect(fixture.nativeElement.querySelectorAll('app-section-block').length).toBe(2);
    });

    httpController.verify();
  });

  it('renders top hero+breaking and mixed rows with most-read', async () => {
    const newsStoreMock = createNewsStoreMock();
    const sourcesStoreMock = createSourcesStoreMock();

    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [
        provideRouter([]),
        { provide: NewsStore, useValue: newsStoreMock },
        { provide: SourcesStore, useValue: sourcesStoreMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.detectChanges();

    expect(newsStoreMock.load).toHaveBeenCalledWith(createHomeNewsQuery());
    expect(fixture.nativeElement.querySelector('app-news-carousel')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-breaking-news')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-most-read-news')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-source-directory')).toBeTruthy();
    expect(sourcesStoreMock.loadInitial).toHaveBeenCalledTimes(1);

    const sectionBlocks = fixture.nativeElement.querySelectorAll('app-section-block');
    expect(sectionBlocks.length).toBe(5);

    const pageText = fixture.nativeElement.textContent as string;
    expect(pageText).not.toContain('Ver más');
  });

  it('renders structured skeleton blocks while loading with no data', async () => {
    const newsStoreMock = createNewsStoreMock({ data: [], loading: true });
    const sourcesStoreMock = createSourcesStoreMock();

    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [
        provideRouter([]),
        { provide: NewsStore, useValue: newsStoreMock },
        { provide: SourcesStore, useValue: sourcesStoreMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.detectChanges();

    const loadingSection = fixture.nativeElement.querySelector('section[aria-label="Cargando portada"]');

    expect(loadingSection).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('.fp-skeleton-block').length).toBeGreaterThan(20);
    expect(fixture.nativeElement.querySelector('app-news-carousel')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('app-breaking-news')).toBeFalsy();
  });

  it('shows background refresh status when cached home content is being revalidated', async () => {
    const newsStoreMock = createNewsStoreMock({
      refreshing: true,
      stale: true,
      lastUpdated: Date.parse('2026-03-04T10:45:00.000Z'),
    });
    const sourcesStoreMock = createSourcesStoreMock();

    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [
        provideRouter([]),
        { provide: NewsStore, useValue: newsStoreMock },
        { provide: SourcesStore, useValue: sourcesStoreMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.detectChanges();

    const refreshStatus = fixture.nativeElement.querySelector('[data-testid="refresh-status"]');
    expect(refreshStatus).toBeTruthy();
    expect(refreshStatus.textContent as string).toContain('Actualizando en segundo plano');
    expect(refreshStatus.textContent as string).toContain('Última actualización');
  });

  it('shows and dismisses the fresh update banner after a home refresh', async () => {
    const newsStoreMock = createNewsStoreMock({
      freshUpdateAvailable: true,
      lastUpdated: Date.parse('2026-03-04T10:50:00.000Z'),
    });
    const sourcesStoreMock = createSourcesStoreMock();

    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [
        provideRouter([]),
        { provide: NewsStore, useValue: newsStoreMock },
        { provide: SourcesStore, useValue: sourcesStoreMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.detectChanges();

    const banner = fixture.nativeElement.querySelector('[data-testid="fresh-update-banner"]');
    expect(banner).toBeTruthy();
    expect(banner.textContent as string).toContain('Portada actualizada');

    const dismissButton = fixture.nativeElement.querySelector('button[aria-label="Ocultar aviso de actualización"]') as HTMLButtonElement;
    dismissButton.click();

    expect(newsStoreMock.dismissFreshUpdateNotice).toHaveBeenCalledWith(createHomeNewsQuery());
  });

  it('shows and dismisses the last-visit banner for the home query', async () => {
    const newsStoreMock = createNewsStoreMock({
      newSinceLastVisit: true,
      newSinceLastVisitCount: 2,
    });
    const sourcesStoreMock = createSourcesStoreMock();

    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [
        provideRouter([]),
        { provide: NewsStore, useValue: newsStoreMock },
        { provide: SourcesStore, useValue: sourcesStoreMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.detectChanges();

    const banner = fixture.nativeElement.querySelector('[data-testid="last-visit-banner"]');
    expect(banner).toBeTruthy();
    expect(banner.textContent as string).toContain('2 titulares nuevos');

    const dismissButton = fixture.nativeElement.querySelector('button[aria-label="Ocultar aviso de novedades"]') as HTMLButtonElement;
    dismissButton.click();

    expect(newsStoreMock.dismissLastVisitNotice).toHaveBeenCalledWith(createHomeNewsQuery());
  });

  it('renders total error state when api fails and there is no data', async () => {
    const newsStoreMock = createNewsStoreMock({
      data: [],
      error: 'Request failed',
    });
    const sourcesStoreMock = createSourcesStoreMock();

    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [
        provideRouter([]),
        { provide: NewsStore, useValue: newsStoreMock },
        { provide: SourcesStore, useValue: sourcesStoreMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-error-state')).toBeTruthy();
    expect(fixture.nativeElement.textContent as string).toContain('No se ha podido cargar la portada');
  });

  it('ranks "most read" with recency and source repetition and caps items per source', async () => {
    const now = Date.now();
    const newsStoreMock = createNewsStoreMock({
      data: [
        createArticle('a-1', 'actualidad', { sourceName: 'Fuente A', publishedAt: toIso(now, 5) }),
        createArticle('a-2', 'actualidad', { sourceName: 'Fuente A', publishedAt: toIso(now, 10) }),
        createArticle('a-3', 'actualidad', { sourceName: 'Fuente A', publishedAt: toIso(now, 15) }),
        createArticle('a-4', 'actualidad', { sourceName: 'Fuente A', publishedAt: toIso(now, 20) }),
        createArticle('a-5', 'actualidad', { sourceName: 'Fuente A', publishedAt: toIso(now, 25) }),
        createArticle('b-1', 'economia', { sourceName: 'Fuente B', publishedAt: toIso(now, 2) }),
        createArticle('c-1', 'cultura', { sourceName: 'Fuente C', publishedAt: toIso(now, 7) }),
      ],
    });
    const sourcesStoreMock = createSourcesStoreMock();

    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [
        provideRouter([]),
        { provide: NewsStore, useValue: newsStoreMock },
        { provide: SourcesStore, useValue: sourcesStoreMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.detectChanges();

    const mostRead = fixture.debugElement.query(By.directive(MostReadNewsComponent)).componentInstance as MostReadNewsComponent;
    const items = mostRead.items();
    const sourceACount = items.filter((item) => item.source === 'Fuente A').length;

    expect(sourceACount).toBe(3);
    expect(items[0]?.source).toBe('Fuente A');
  });

  it('selects featured news with section diversity and source cap', async () => {
    const now = Date.now();
    const newsStoreMock = createNewsStoreMock({
      data: [
        createArticle('a-1', 'actualidad', { sourceName: 'Fuente A', publishedAt: toIso(now, 1) }),
        createArticle('a-2', 'actualidad', { sourceName: 'Fuente A', publishedAt: toIso(now, 2) }),
        createArticle('a-3', 'actualidad', { sourceName: 'Fuente A', publishedAt: toIso(now, 3) }),
        createArticle('e-1', 'economia', { sourceName: 'Fuente B', publishedAt: toIso(now, 4) }),
        createArticle('c-1', 'cultura', { sourceName: 'Fuente C', publishedAt: toIso(now, 5) }),
        createArticle('d-1', 'deportes', { sourceName: 'Fuente D', publishedAt: toIso(now, 6) }),
      ],
    });
    const sourcesStoreMock = createSourcesStoreMock();

    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [
        provideRouter([]),
        { provide: NewsStore, useValue: newsStoreMock },
        { provide: SourcesStore, useValue: sourcesStoreMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.detectChanges();

    const carousel = fixture.debugElement.query(By.directive(NewsCarouselComponent)).componentInstance as NewsCarouselComponent;
    const items = carousel.articles();
    const sections = new Set(items.map((item) => item.section));
    const sourceACount = items.filter((item) => item.source === 'Fuente A').length;

    expect(items).toHaveLength(5);
    expect(sections.has('economia')).toBe(true);
    expect(sections.has('cultura')).toBe(true);
    expect(sections.has('deportes')).toBe(true);
    expect(sourceACount).toBe(2);
  });

  it('uses publisher homepages for source directory links instead of rss hosts', async () => {
    const newsStoreMock = createNewsStoreMock();
    const sourcesStoreMock = createSourcesStoreMock({
      sources: [
        {
          id: 'source-expansion',
          name: 'Expansion',
          baseUrl: 'https://e01-expansion.uecdn.es',
          feedUrl: 'https://e01-expansion.uecdn.es/rss/economia.xml',
          sectionSlugs: ['economia'],
        },
      ],
    });

    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [
        provideRouter([]),
        { provide: NewsStore, useValue: newsStoreMock },
        { provide: SourcesStore, useValue: sourcesStoreMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.detectChanges();

    const sourceDirectory = fixture.debugElement.query(By.directive(SourceDirectoryComponent))
      .componentInstance as SourceDirectoryComponent;
    const [item] = sourceDirectory.items();

    expect(item?.url).toBe('https://www.expansion.com');
  });

  it('opens and closes quick-view modal when children emit preview and close events', async () => {
    const newsStoreMock = createNewsStoreMock({
      data: [createArticle('quick-1', 'actualidad', { sourceName: 'Fuente Rapida' })],
    });
    const sourcesStoreMock = createSourcesStoreMock();

    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [
        provideRouter([]),
        { provide: NewsStore, useValue: newsStoreMock },
        { provide: SourcesStore, useValue: sourcesStoreMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.detectChanges();

    const carousel = fixture.debugElement.query(By.directive(NewsCarouselComponent)).componentInstance as NewsCarouselComponent;
    carousel.previewRequested.emit({
      id: 'quick-1',
      title: 'Titulo quick-1',
      summary: 'Resumen quick-1',
      imageUrl: 'https://example.com/image.jpg',
      sourceId: 'fuente-rapida',
      source: 'Fuente Rapida',
      section: 'actualidad',
      publishedAt: '2026-03-04T08:30:00.000Z',
      author: 'Autor',
      url: 'https://example.com/quick-1',
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent as string).toContain('Abrir noticia completa');

    const quickView = fixture.debugElement.query(By.directive(NewsQuickViewModalComponent))
      .componentInstance as NewsQuickViewModalComponent;
    quickView.closed.emit();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent as string).not.toContain('Abrir noticia completa');
  });
});

function createNewsStoreMock(
  overrides?: Partial<{
    data: readonly unknown[];
    error: string | null;
    loading: boolean;
    refreshing: boolean;
    stale: boolean;
    freshUpdateAvailable: boolean;
    newSinceLastVisit: boolean;
    newSinceLastVisitCount: number;
    lastUpdated: number | null;
  }>,
) {
  const dataSignal = signal((overrides?.data as readonly ReturnType<typeof createArticle>[]) ?? createHomeDataset());
  const loadingSignal = signal(overrides?.loading ?? false);
  const errorSignal = signal<string | null>(overrides?.error ?? null);
  const refreshingSignal = signal(overrides?.refreshing ?? false);
  const staleSignal = signal(overrides?.stale ?? false);
  const freshUpdateSignal = signal(overrides?.freshUpdateAvailable ?? false);
  const newSinceLastVisitSignal = signal(overrides?.newSinceLastVisit ?? false);
  const newSinceLastVisitCountSignal = signal(overrides?.newSinceLastVisitCount ?? 0);
  const lastUpdatedSignal = signal<number | null>(overrides?.lastUpdated ?? null);

  return {
    isInitialLoading: loadingSignal.asReadonly(),
    data: dataSignal.asReadonly(),
    error: errorSignal.asReadonly(),
    warnings: signal([]).asReadonly(),
    isRefreshing: refreshingSignal.asReadonly(),
    isShowingStaleData: staleSignal.asReadonly(),
    hasFreshUpdateAvailable: freshUpdateSignal.asReadonly(),
    hasNewSinceLastVisit: newSinceLastVisitSignal.asReadonly(),
    newSinceLastVisitCount: newSinceLastVisitCountSignal.asReadonly(),
    lastUpdated: lastUpdatedSignal.asReadonly(),
    load: vi.fn(),
    dismissFreshUpdateNotice: vi.fn(),
    dismissLastVisitNotice: vi.fn(),
  };
}

function createSourcesStoreMock(
  overrides?: Partial<{
    sources: readonly {
      id: string;
      name: string;
      baseUrl: string;
      feedUrl: string;
      sectionSlugs: readonly string[];
    }[];
  }>,
) {
  return {
    data: signal({
      sources:
        overrides?.sources ??
        [
          {
            id: 'source-a',
            name: 'Periodico A',
            baseUrl: 'https://periodico-a.test',
            feedUrl: 'https://periodico-a.test/rss',
            sectionSlugs: ['actualidad'],
          },
        ],
      sections: [],
    }).asReadonly(),
    loadInitial: vi.fn(),
  };
}

function createHomeDataset() {
  const now = Date.now();
  return [
    createArticle('n-1', 'actualidad', { sourceName: 'Fuente A', publishedAt: toIso(now, 1) }),
    createArticle('n-2', 'actualidad', { sourceName: 'Fuente B', publishedAt: toIso(now, 2) }),
    createArticle('n-3', 'economia', { sourceName: 'Fuente C', publishedAt: toIso(now, 3) }),
    createArticle('n-4', 'economia', { sourceName: 'Fuente D', publishedAt: toIso(now, 4) }),
    createArticle('n-5', 'cultura', { sourceName: 'Fuente E', publishedAt: toIso(now, 5) }),
    createArticle('n-6', 'cultura', { sourceName: 'Fuente F', publishedAt: toIso(now, 6) }),
    createArticle('n-7', 'deportes', { sourceName: 'Fuente G', publishedAt: toIso(now, 7) }),
    createArticle('n-8', 'deportes', { sourceName: 'Fuente H', publishedAt: toIso(now, 8) }),
    createArticle('n-9', 'tecnologia', { sourceName: 'Fuente I', publishedAt: toIso(now, 9) }),
    createArticle('n-10', 'tecnologia', { sourceName: 'Fuente J', publishedAt: toIso(now, 10) }),
    createArticle('n-11', 'opinion', { sourceName: 'Fuente K', publishedAt: toIso(now, 11) }),
    createArticle('n-12', 'opinion', { sourceName: 'Fuente L', publishedAt: toIso(now, 12) }),
    createArticle('n-13', 'internacional', { sourceName: 'Fuente A', publishedAt: toIso(now, 13) }),
    createArticle('n-14', 'internacional', { sourceName: 'Fuente B', publishedAt: toIso(now, 14) }),
    createArticle('n-15', 'sucesos', { sourceName: 'Fuente C', publishedAt: toIso(now, 15) }),
    createArticle('n-16', 'sucesos', { sourceName: 'Fuente D', publishedAt: toIso(now, 16) }),
    createArticle('n-17', 'salud', { sourceName: 'Fuente E', publishedAt: toIso(now, 17) }),
    createArticle('n-18', 'salud', { sourceName: 'Fuente F', publishedAt: toIso(now, 18) }),
  ] as const;
}

function createArticle(
  id: string,
  sectionSlug: string,
  overrides?: Partial<{ sourceName: string; publishedAt: string | null }>,
) {
  return {
    id,
    externalId: null,
    title: `Titulo ${id}`,
    summary: `Resumen ${id}`,
    url: `https://example.com/${id}`,
    canonicalUrl: null,
    imageUrl: 'https://example.com/image.jpg',
    sourceId: 'source-example',
    sourceName: overrides?.sourceName ?? 'Example',
    sectionSlug,
    author: null,
    publishedAt: overrides?.publishedAt ?? null,
  } as const;
}

function toIso(now: number, minutesAgo: number): string {
  return new Date(now - minutesAgo * 60 * 1000).toISOString();
}

async function expectPendingRequest(
  httpController: HttpTestingController,
  matcher: Parameters<HttpTestingController['expectOne']>[0],
) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return httpController.expectOne(matcher);
    } catch {
      await Promise.resolve();
    }
  }

  return httpController.expectOne(matcher);
}

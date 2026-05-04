import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';

import { NewsCardComponent } from '../../components/news/news-card.component';
import { SourceSectionFiltersComponent } from '../../components/news/source-section-filters.component';
import { createSourceNewsQuery } from '../../lib/news-query-factory';
import { NewsStore } from '../../stores/news.store';
import { SourcesStore } from '../../stores/sources.store';

import { SourcePageComponent } from './source-page.component';

describe('SourcePageComponent', () => {
  it('loads source news for the resolved slug and renders matching cards', async () => {
    const routeMock = createRouteMock('mundo-diario');
    const sourcesStoreMock = createSourcesStoreMock({
      sources: [createSource('source-mundo-diario', 'Mundo Diario', ['actualidad', 'cultura'])],
    });
    const newsStoreMock = createNewsStoreMock({
      data: [
        createArticle('news-1', 'actualidad', 'source-mundo-diario', 'Mundo Diario', '2026-03-04T10:20:00.000Z'),
        createArticle('news-2', 'cultura', 'mundo-diario', 'Mundo Diario', '2026-03-04T09:20:00.000Z'),
        createArticle('news-3', 'actualidad', 'otra-fuente', 'Otra Fuente', '2026-03-04T08:20:00.000Z'),
      ],
    });

    await TestBed.configureTestingModule({
      imports: [SourcePageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: SourcesStore, useValue: sourcesStoreMock },
        { provide: NewsStore, useValue: newsStoreMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SourcePageComponent);
    fixture.detectChanges();

    expect(sourcesStoreMock.loadInitial).toHaveBeenCalled();
    expect(newsStoreMock.load).toHaveBeenCalledWith(createSourceNewsQuery('source-mundo-diario'));
    expect(fixture.nativeElement.querySelectorAll('app-news-card')).toHaveLength(2);
    expect((fixture.nativeElement.textContent as string)).toContain('Mundo Diario');
  });

  it('shows a missing source state when the slug is not in the catalog', async () => {
    const routeMock = createRouteMock('fuente-desconocida');
    const sourcesStoreMock = createSourcesStoreMock({
      sources: [createSource('mundo-diario', 'Mundo Diario', ['actualidad'])],
    });
    const newsStoreMock = createNewsStoreMock();

    await TestBed.configureTestingModule({
      imports: [SourcePageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: SourcesStore, useValue: sourcesStoreMock },
        { provide: NewsStore, useValue: newsStoreMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SourcePageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-error-state')).toBeTruthy();
    expect((fixture.nativeElement.textContent as string)).toContain('No encontramos este periódico');
    expect(newsStoreMock.load).not.toHaveBeenCalled();
  });

  it('shows a source catalog error state when sources fail to load', async () => {
    const routeMock = createRouteMock('mundo-diario');
    const sourcesStoreMock = createSourcesStoreMock({
      sources: [],
      error: 'Catalogo no disponible.',
    });
    const newsStoreMock = createNewsStoreMock();

    await TestBed.configureTestingModule({
      imports: [SourcePageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: SourcesStore, useValue: sourcesStoreMock },
        { provide: NewsStore, useValue: newsStoreMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SourcePageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-error-state')).toBeTruthy();
    expect((fixture.nativeElement.textContent as string)).toContain('No se ha podido cargar el catálogo de medios');
    expect((fixture.nativeElement.textContent as string)).toContain('Catalogo no disponible.');
    expect(fixture.nativeElement.querySelector('app-section-page-skeleton')).toBeNull();
    expect(newsStoreMock.load).not.toHaveBeenCalled();
  });

  it('filters source news by selected sections and keeps the filters visible after clearing all', async () => {
    const routeMock = createRouteMock('mundo-diario');
    const sourcesStoreMock = createSourcesStoreMock({
      sources: [createSource('mundo-diario', 'Mundo Diario', ['actualidad', 'cultura'])],
    });
    const newsStoreMock = createNewsStoreMock({
      data: [
        createArticle('news-1', 'actualidad', 'mundo-diario', 'Mundo Diario', '2026-03-04T10:20:00.000Z'),
        createArticle('news-2', 'cultura', 'mundo-diario', 'Mundo Diario', '2026-03-04T09:20:00.000Z'),
      ],
    });

    await TestBed.configureTestingModule({
      imports: [SourcePageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: SourcesStore, useValue: sourcesStoreMock },
        { provide: NewsStore, useValue: newsStoreMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SourcePageComponent);
    fixture.detectChanges();

    openFiltersPanel(fixture.nativeElement);
    fixture.detectChanges();

    let filters = fixture.debugElement.query(By.directive(SourceSectionFiltersComponent))
      .componentInstance as SourceSectionFiltersComponent;
    filters.selectedSectionsChange.emit([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-error-state')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-source-section-filters')).toBeTruthy();

    filters = fixture.debugElement.query(By.directive(SourceSectionFiltersComponent))
      .componentInstance as SourceSectionFiltersComponent;
    filters.selectedSectionsChange.emit(['cultura']);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('app-news-card')).toHaveLength(1);
    expect((fixture.nativeElement.textContent as string)).toContain('Titulo news-2');
  });

  it('dismisses the fresh update banner for the active source query', async () => {
    const routeMock = createRouteMock('mundo-diario');
    const sourcesStoreMock = createSourcesStoreMock({
      sources: [createSource('mundo-diario', 'Mundo Diario', ['actualidad'])],
    });
    const newsStoreMock = createNewsStoreMock({
      data: [createArticle('news-1', 'actualidad', 'mundo-diario', 'Mundo Diario', '2026-03-04T10:20:00.000Z')],
      freshUpdateAvailable: true,
      lastUpdated: Date.parse('2026-03-04T10:50:00.000Z'),
    });

    await TestBed.configureTestingModule({
      imports: [SourcePageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: SourcesStore, useValue: sourcesStoreMock },
        { provide: NewsStore, useValue: newsStoreMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SourcePageComponent);
    fixture.detectChanges();

    const dismissButton = fixture.nativeElement.querySelector(
      'button[aria-label="Ocultar aviso de actualización"]',
    ) as HTMLButtonElement;
    dismissButton.click();

    expect(newsStoreMock.dismissFreshUpdateNotice).toHaveBeenCalledWith(createSourceNewsQuery('mundo-diario'));
  });

  it('dismisses the last-visit banner for the active source query', async () => {
    const routeMock = createRouteMock('mundo-diario');
    const sourcesStoreMock = createSourcesStoreMock({
      sources: [createSource('mundo-diario', 'Mundo Diario', ['actualidad'])],
    });
    const newsStoreMock = createNewsStoreMock({
      data: [createArticle('news-1', 'actualidad', 'mundo-diario', 'Mundo Diario', '2026-03-04T10:20:00.000Z')],
      newSinceLastVisit: true,
      newSinceLastVisitCount: 2,
    });

    await TestBed.configureTestingModule({
      imports: [SourcePageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: SourcesStore, useValue: sourcesStoreMock },
        { provide: NewsStore, useValue: newsStoreMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SourcePageComponent);
    fixture.detectChanges();

    const dismissButton = fixture.nativeElement.querySelector(
      'button[aria-label="Ocultar aviso de novedades"]',
    ) as HTMLButtonElement;
    dismissButton.click();

    expect(newsStoreMock.dismissLastVisitNotice).toHaveBeenCalledWith(createSourceNewsQuery('mundo-diario'));
  });

  it('opens the quick-view modal from a source card and closes it on demand', async () => {
    const routeMock = createRouteMock('mundo-diario');
    const sourcesStoreMock = createSourcesStoreMock({
      sources: [createSource('mundo-diario', 'Mundo Diario', ['actualidad'])],
    });
    const newsStoreMock = createNewsStoreMock({
      data: [createArticle('news-1', 'actualidad', 'mundo-diario', 'Mundo Diario', '2026-03-04T10:20:00.000Z')],
    });

    await TestBed.configureTestingModule({
      imports: [SourcePageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: SourcesStore, useValue: sourcesStoreMock },
        { provide: NewsStore, useValue: newsStoreMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SourcePageComponent);
    fixture.detectChanges();

    const card = fixture.debugElement.query(By.directive(NewsCardComponent)).componentInstance as NewsCardComponent;
    card.previewRequested.emit({
      id: 'news-1',
      title: 'Titulo news-1',
      summary: 'Resumen news-1',
      imageUrl: '/images/no-image.jpg',
      sourceId: 'mundo-diario',
      source: 'Mundo Diario',
      section: 'actualidad',
      publishedAt: '2026-03-04T10:20:00.000Z',
      author: 'Autor',
      url: 'https://example.com/news-1',
    });
    fixture.detectChanges();

    expect((fixture.nativeElement.textContent as string)).toContain('Abrir noticia completa');

    const closeButton = fixture.nativeElement.querySelector(
      '.quick-view-dialog button[aria-label="Cerrar modal"]',
    ) as HTMLButtonElement;
    closeButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.quick-view-dialog')).toBeNull();
  });
});

function createRouteMock(slug: string) {
  return {
    snapshot: {
      paramMap: convertToParamMap({ slug }),
    },
  };
}

function createSourcesStoreMock(
  overrides?: Partial<{
    sources: readonly ReturnType<typeof createSource>[];
    loading: boolean;
    error: string | null;
  }>,
) {
  const sources = overrides?.sources ?? [];
  const hasError = overrides?.error !== undefined && overrides.error !== null;
  const dataSignal = signal(hasError ? null : { sources, sections: [] });
  const loadingSignal = signal(overrides?.loading ?? false);
  const errorSignal = signal<string | null>(overrides?.error ?? null);

  return {
    loadInitial: vi.fn(),
    loading: loadingSignal.asReadonly(),
    data: dataSignal.asReadonly(),
    error: errorSignal.asReadonly(),
  };
}

function createNewsStoreMock(
  overrides?: Partial<{
    data: readonly ReturnType<typeof createArticle>[];
    loading: boolean;
    error: string | null;
    refreshing: boolean;
    stale: boolean;
    freshUpdateAvailable: boolean;
    newSinceLastVisit: boolean;
    newSinceLastVisitCount: number;
    lastUpdated: number | null;
  }>,
) {
  const dataSignal = signal(overrides?.data ?? []);
  const loadingSignal = signal(overrides?.loading ?? false);
  const errorSignal = signal<string | null>(overrides?.error ?? null);
  const refreshingSignal = signal(overrides?.refreshing ?? false);
  const staleSignal = signal(overrides?.stale ?? false);
  const freshUpdateSignal = signal(overrides?.freshUpdateAvailable ?? false);
  const newSinceLastVisitSignal = signal(overrides?.newSinceLastVisit ?? false);
  const newSinceLastVisitCountSignal = signal(overrides?.newSinceLastVisitCount ?? 0);
  const lastUpdatedSignal = signal<number | null>(overrides?.lastUpdated ?? null);

  return {
    load: vi.fn(),
    data: dataSignal.asReadonly(),
    isInitialLoading: loadingSignal.asReadonly(),
    error: errorSignal.asReadonly(),
    warnings: signal([]).asReadonly(),
    isRefreshing: refreshingSignal.asReadonly(),
    isShowingStaleData: staleSignal.asReadonly(),
    hasFreshUpdateAvailable: freshUpdateSignal.asReadonly(),
    hasNewSinceLastVisit: newSinceLastVisitSignal.asReadonly(),
    newSinceLastVisitCount: newSinceLastVisitCountSignal.asReadonly(),
    lastUpdated: lastUpdatedSignal.asReadonly(),
    dismissFreshUpdateNotice: vi.fn(),
    dismissLastVisitNotice: vi.fn(),
  };
}

function createSource(id: string, name: string, sectionSlugs: readonly string[]) {
  return {
    id,
    name,
    baseUrl: `https://www.${id}.test`,
    feedUrl: `https://www.${id}.test/rss`,
    sectionSlugs,
  } as const;
}

function createArticle(
  id: string,
  sectionSlug: string,
  sourceId: string,
  sourceName: string,
  publishedAt: string,
) {
  return {
    id,
    externalId: null,
    title: `Titulo ${id}`,
    summary: `Resumen ${id}`,
    url: `https://example.com/${id}`,
    canonicalUrl: null,
    imageUrl: 'https://example.com/image.jpg',
    thumbnailUrl: 'https://example.com/image-thumb.jpg',
    sourceId,
    sourceName,
    sectionSlug,
    author: 'Autor',
    publishedAt,
  } as const;
}

function openFiltersPanel(container: HTMLElement): void {
  const toggle = Array.from(container.querySelectorAll('button')).find((button) =>
    button.textContent?.includes('Filtrar secciones'),
  ) as HTMLButtonElement | undefined;
  toggle?.click();
}

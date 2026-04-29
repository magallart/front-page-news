import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';

import { NewsCardComponent } from '../../components/news/news-card.component';
import { SectionFiltersComponent } from '../../components/news/section-filters.component';
import { createSearchNewsQuery } from '../../lib/news-query-factory';
import { NewsStore } from '../../stores/news.store';

import { SearchPageComponent } from './search-page.component';

describe('SearchPageComponent', () => {
  it('loads global search results from the q query param', async () => {
    const routeMock = createRouteMock({ q: 'vivienda' });
    const newsStoreMock = createNewsStoreMock({
      data: [
        createArticle('news-1', 'actualidad', 'Portada Nacional', '2026-03-04T10:20:00.000Z'),
        createArticle('news-2', 'economia', 'Mundo Diario', '2026-03-04T09:20:00.000Z'),
      ],
    });

    await TestBed.configureTestingModule({
      imports: [SearchPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: NewsStore, useValue: newsStoreMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SearchPageComponent);
    fixture.detectChanges();

    expect(newsStoreMock.load).toHaveBeenCalledWith(createSearchNewsQuery('vivienda'));
    expect(fixture.nativeElement.querySelectorAll('app-news-card')).toHaveLength(2);
    expect((fixture.nativeElement.textContent as string)).toContain('resultados para "vivienda"');
  });

  it('shows an empty prompt before any search query is provided', async () => {
    const routeMock = createRouteMock();
    const newsStoreMock = createNewsStoreMock();

    await TestBed.configureTestingModule({
      imports: [SearchPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: NewsStore, useValue: newsStoreMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SearchPageComponent);
    fixture.detectChanges();

    expect(newsStoreMock.load).not.toHaveBeenCalled();
    expect((fixture.nativeElement.textContent as string)).toContain('Escribe un término para empezar');
  });

  it('filters visible results by selected sources', async () => {
    const routeMock = createRouteMock({ q: 'vivienda' });
    const newsStoreMock = createNewsStoreMock({
      data: [
        createArticle('news-1', 'actualidad', 'Portada Nacional', '2026-03-04T10:20:00.000Z'),
        createArticle('news-2', 'economia', 'Mundo Diario', '2026-03-04T09:20:00.000Z'),
      ],
    });

    await TestBed.configureTestingModule({
      imports: [SearchPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: NewsStore, useValue: newsStoreMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SearchPageComponent);
    fixture.detectChanges();

    openFiltersPanel(fixture.nativeElement);
    fixture.detectChanges();

    const filters = fixture.debugElement.query(By.directive(SectionFiltersComponent)).componentInstance as SectionFiltersComponent;
    filters.selectedSourcesChange.emit(['Mundo Diario']);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('app-news-card')).toHaveLength(1);
    expect((fixture.nativeElement.textContent as string)).toContain('Titulo news-2');
  });

  it('navigates when submitting a search query from the form', async () => {
    const routeMock = createRouteMock();
    const newsStoreMock = createNewsStoreMock();

    await TestBed.configureTestingModule({
      imports: [SearchPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: NewsStore, useValue: newsStoreMock },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(SearchPageComponent);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'Inflacion';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    expect(navigateSpy).toHaveBeenCalledWith(['/buscar'], {
      queryParams: { q: 'inflacion' },
    });
  });

  it('opens quick view from a search result card', async () => {
    const routeMock = createRouteMock({ q: 'vivienda' });
    const newsStoreMock = createNewsStoreMock({
      data: [createArticle('news-1', 'actualidad', 'Portada Nacional', '2026-03-04T10:20:00.000Z')],
    });

    await TestBed.configureTestingModule({
      imports: [SearchPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: NewsStore, useValue: newsStoreMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SearchPageComponent);
    fixture.detectChanges();

    const card = fixture.debugElement.query(By.directive(NewsCardComponent)).componentInstance as NewsCardComponent;
    card.previewRequested.emit({
      id: 'news-1',
      title: 'Titulo news-1',
      summary: 'Resumen news-1',
      imageUrl: '/images/no-image.jpg',
      sourceId: 'portada-nacional',
      source: 'Portada Nacional',
      section: 'actualidad',
      publishedAt: '2026-03-04T10:20:00.000Z',
      author: 'Autor',
      url: 'https://example.com/news-1',
    });
    fixture.detectChanges();

    expect((fixture.nativeElement.textContent as string)).toContain('Abrir noticia completa');
  });

  it('dismisses the last-visit banner for the active search query', async () => {
    const routeMock = createRouteMock({ q: 'vivienda' });
    const newsStoreMock = createNewsStoreMock({
      data: [createArticle('news-1', 'actualidad', 'Portada Nacional', '2026-03-04T10:20:00.000Z')],
      newSinceLastVisit: true,
      newSinceLastVisitCount: 4,
    });

    await TestBed.configureTestingModule({
      imports: [SearchPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: NewsStore, useValue: newsStoreMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SearchPageComponent);
    fixture.detectChanges();

    const dismissButton = fixture.nativeElement.querySelector(
      'button[aria-label="Ocultar aviso de novedades"]',
    ) as HTMLButtonElement;
    dismissButton.click();

    expect(newsStoreMock.dismissLastVisitNotice).toHaveBeenCalledWith(createSearchNewsQuery('vivienda'));
  });
});

function createRouteMock(query: Record<string, string> = {}) {
  return {
    snapshot: {
      queryParamMap: convertToParamMap(query),
    },
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

function createArticle(id: string, sectionSlug: string, sourceName: string, publishedAt: string) {
  return {
    id,
    externalId: null,
    title: `Titulo ${id}`,
    summary: `Resumen ${id}`,
    url: `https://example.com/${id}`,
    canonicalUrl: null,
    imageUrl: 'https://example.com/image.jpg',
    thumbnailUrl: 'https://example.com/image-thumb.jpg',
    sourceId: sourceName.toLowerCase().replace(/\s+/g, '-'),
    sourceName,
    sectionSlug,
    author: 'Autor',
    publishedAt,
  } as const;
}

function openFiltersPanel(container: HTMLElement): void {
  const toggle = Array.from(container.querySelectorAll('button')).find((button) =>
    button.textContent?.includes('Filtrar medios'),
  ) as HTMLButtonElement | undefined;
  toggle?.click();
}

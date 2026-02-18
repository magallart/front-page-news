import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { SectionFiltersComponent } from '../../components/news/section-filters.component';
import { NewsStore } from '../../stores/news.store';

import { SectionPageComponent } from './section-page.component';

describe('SectionPageComponent', () => {
  it('loads section news using slug and query params', async () => {
    const routeMock = createRouteMock({ slug: 'economia' }, { source: 'source-a,source-b', q: 'inflacion', page: '2', limit: '10' });
    const newsStoreMock = createNewsStoreMock({
      data: [
        createArticle('news-1', 'economia', 'Fuente A'),
        createArticle('news-2', 'economia', 'Fuente B'),
        createArticle('news-3', 'economia', 'Fuente C'),
      ],
    });

    await TestBed.configureTestingModule({
      imports: [SectionPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: NewsStore, useValue: newsStoreMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SectionPageComponent);
    fixture.detectChanges();

    expect(newsStoreMock.load).toHaveBeenCalledWith({
      section: 'economia',
      sourceIds: ['source-a', 'source-b'],
      searchQuery: 'inflacion',
      page: 2,
      limit: 10,
    });

    const cards = fixture.nativeElement.querySelectorAll('app-news-card');
    expect(cards.length).toBe(3);
  });

  it('renders empty state when api returns no results', async () => {
    const routeMock = createRouteMock({ slug: 'economia' });
    const newsStoreMock = createNewsStoreMock({ data: [], error: null, loading: false });

    await TestBed.configureTestingModule({
      imports: [SectionPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: NewsStore, useValue: newsStoreMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SectionPageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('app-news-card').length).toBe(0);
    expect(fixture.nativeElement.querySelector('app-error-state')).toBeTruthy();

    const text = (fixture.nativeElement.textContent as string).replace(/\s+/g, ' ').trim();
    expect(text).toContain('No hay noticias en esta sección');
  });

  it('filters section cards by selected source from filters panel', async () => {
    const routeMock = createRouteMock({ slug: 'actualidad' });
    const newsStoreMock = createNewsStoreMock({
      data: [
        createArticle('news-1', 'actualidad', 'Mundo Diario'),
        createArticle('news-2', 'actualidad', 'Planeta News'),
      ],
    });

    await TestBed.configureTestingModule({
      imports: [SectionPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: NewsStore, useValue: newsStoreMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SectionPageComponent);
    fixture.detectChanges();

    openFiltersPanel(fixture);

    const filtersDebug = fixture.debugElement.query(By.directive(SectionFiltersComponent));
    const filters = filtersDebug.componentInstance as SectionFiltersComponent;

    filters.selectedSourcesChange.emit(['Mundo Diario']);
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('app-news-card');
    expect(cards.length).toBe(1);
    expect((fixture.nativeElement.textContent as string)).toContain('Titulo news-1');
  });

  it('shows 24 cards initially and loads 12 more when clicking "Ver más"', async () => {
    const routeMock = createRouteMock({ slug: 'deportes' });
    const newsStoreMock = createNewsStoreMock({
      data: createSectionArticles('deportes', 'Fuente Deportes', 30),
    });

    await TestBed.configureTestingModule({
      imports: [SectionPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: NewsStore, useValue: newsStoreMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SectionPageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('app-news-card').length).toBe(24);

    const loadMoreButton = getLoadMoreButton(fixture.nativeElement);
    expect(loadMoreButton).toBeTruthy();
    loadMoreButton?.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('app-news-card').length).toBe(30);
    expect(getLoadMoreButton(fixture.nativeElement)).toBeNull();
  });

  it('resets visible cards to 24 when filters change after loading more', async () => {
    const routeMock = createRouteMock({ slug: 'deportes' });
    const newsStoreMock = createNewsStoreMock({
      data: [
        ...createSectionArticles('deportes', 'Fuente A', 30),
        ...createSectionArticles('deportes', 'Fuente B', 30, 1000),
      ],
    });

    await TestBed.configureTestingModule({
      imports: [SectionPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: NewsStore, useValue: newsStoreMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SectionPageComponent);
    fixture.detectChanges();

    getLoadMoreButton(fixture.nativeElement)?.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('app-news-card').length).toBe(36);

    openFiltersPanel(fixture);
    const filtersDebug = fixture.debugElement.query(By.directive(SectionFiltersComponent));
    const filters = filtersDebug.componentInstance as SectionFiltersComponent;
    filters.selectedSourcesChange.emit(['Fuente A']);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('app-news-card').length).toBe(24);
  });
});

function createRouteMock(params: Record<string, string>, query: Record<string, string> = {}) {
  return {
    paramMap: of(convertToParamMap(params)),
    queryParamMap: of(convertToParamMap(query)),
  };
}

function createNewsStoreMock(overrides?: Partial<{ data: readonly ReturnType<typeof createArticle>[]; error: string | null; loading: boolean }>) {
  const dataSignal = signal(overrides?.data ?? []);
  const errorSignal = signal<string | null>(overrides?.error ?? null);
  const loadingSignal = signal(overrides?.loading ?? false);

  return {
    loading: loadingSignal.asReadonly(),
    data: dataSignal.asReadonly(),
    error: errorSignal.asReadonly(),
    warnings: signal([]).asReadonly(),
    load: vi.fn(),
  };
}

function createArticle(id: string, sectionSlug: string, sourceName: string) {
  return {
    id,
    externalId: null,
    title: `Titulo ${id}`,
    summary: `Resumen ${id}`,
    url: `https://example.com/${id}`,
    canonicalUrl: null,
    imageUrl: 'https://example.com/image.jpg',
    sourceId: `source-${sourceName.toLowerCase().replace(/\s+/g, '-')}`,
    sourceName,
    sectionSlug,
    author: null,
    publishedAt: null,
  } as const;
}

function createSectionArticles(sectionSlug: string, sourceName: string, count: number, startIndex = 1) {
  return Array.from({ length: count }, (_, index) =>
    createArticle(`news-${startIndex + index}`, sectionSlug, sourceName),
  );
}

function getLoadMoreButton(container: HTMLElement): HTMLButtonElement | null {
  return Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Ver más')) ?? null;
}

function openFiltersPanel(fixture: { nativeElement: HTMLElement; detectChanges: () => void }) {
  const toggle = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  toggle.click();
  fixture.detectChanges();
}

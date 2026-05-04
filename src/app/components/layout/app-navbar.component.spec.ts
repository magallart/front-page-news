import { type Signal, type WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { createLatestNewsTickerQuery } from '../../lib/news-query-factory';
import { NewsService } from '../../services/news.service';
import { NewsStore } from '../../stores/news.store';

import { AppNavbarComponent } from './app-navbar.component';

describe('AppNavbarComponent', () => {
  it('shows sticky header by default on mobile viewport', async () => {
    mockMatchMedia(true);

    await TestBed.configureTestingModule({
      imports: [AppNavbarComponent],
      providers: [
        provideRouter([]),
        { provide: NewsStore, useValue: createNewsStoreMock() },
        { provide: NewsService, useValue: createNewsServiceMock() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppNavbarComponent);
    fixture.detectChanges();

    const component = asNavbarTestInstance(fixture.componentInstance);
    expect(component.shouldShowSticky()).toBe(true);
  });

  it('keeps sticky hidden on desktop until crossing scroll threshold', async () => {
    mockMatchMedia(false);
    setWindowScrollY(0);

    await TestBed.configureTestingModule({
      imports: [AppNavbarComponent],
      providers: [
        provideRouter([]),
        { provide: NewsStore, useValue: createNewsStoreMock() },
        { provide: NewsService, useValue: createNewsServiceMock() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppNavbarComponent);
    fixture.detectChanges();

    const component = asNavbarTestInstance(fixture.componentInstance);
    expect(component.shouldShowSticky()).toBe(false);

    setWindowScrollY(260);
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    expect(component.shouldShowSticky()).toBe(true);
  });

  it('closes side menu when scroll returns below desktop threshold', async () => {
    mockMatchMedia(false);
    setWindowScrollY(260);

    await TestBed.configureTestingModule({
      imports: [AppNavbarComponent],
      providers: [
        provideRouter([]),
        { provide: NewsStore, useValue: createNewsStoreMock() },
        { provide: NewsService, useValue: createNewsServiceMock() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppNavbarComponent);
    fixture.detectChanges();

    const component = asNavbarTestInstance(fixture.componentInstance);
    component.menuOpen.set(true);

    setWindowScrollY(100);
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    expect(component.menuOpen()).toBe(false);
    expect(component.shouldShowSticky()).toBe(false);
  });

  it('hides sticky meta label in mobile viewport', async () => {
    mockMatchMedia(true);

    await TestBed.configureTestingModule({
      imports: [AppNavbarComponent],
      providers: [
        provideRouter([]),
        { provide: NewsStore, useValue: createNewsStoreMock() },
        { provide: NewsService, useValue: createNewsServiceMock() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppNavbarComponent);
    fixture.detectChanges();

    const component = asNavbarTestInstance(fixture.componentInstance);
    const label = component.stickyTopbarMeta();
    expect(label).toBe('');
  });

  it('does not trigger ticker fallback load when news data already exists', async () => {
    mockMatchMedia(false);
    const storeMock = createNewsStoreMock();

    await TestBed.configureTestingModule({
      imports: [AppNavbarComponent],
      providers: [
        provideRouter([]),
        { provide: NewsStore, useValue: storeMock },
        { provide: NewsService, useValue: createNewsServiceMock() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppNavbarComponent);
    fixture.detectChanges();

    expect(storeMock.load).not.toHaveBeenCalled();
  });

  it('renders latest-news ticker headlines from the canonical ticker query', async () => {
    mockMatchMedia(false);
    const storeMock = createNewsStoreMock({
      articles: [
        createArticle('news-1', 'Titular urgente 1'),
        createArticle('news-2', 'Titular urgente 2'),
      ],
    });

    await TestBed.configureTestingModule({
      imports: [AppNavbarComponent],
      providers: [
        provideRouter([]),
        { provide: NewsStore, useValue: storeMock },
        { provide: NewsService, useValue: createNewsServiceMock() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppNavbarComponent);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Titular urgente 1');
    expect(text).toContain('Titular urgente 2');
    expect(text).not.toContain('Actualizando titulares...');
    expect(storeMock.data).toHaveBeenCalledWith(createLatestNewsTickerQuery());
    expect(storeMock.load).not.toHaveBeenCalled();
  });

  it('shows fallback ticker headline when store has no news', async () => {
    mockMatchMedia(false);
    const storeMock = createNewsStoreMock({ articles: [] });

    await TestBed.configureTestingModule({
      imports: [AppNavbarComponent],
      providers: [
        provideRouter([]),
        { provide: NewsStore, useValue: storeMock },
        { provide: NewsService, useValue: createNewsServiceMock() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppNavbarComponent);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Actualizando titulares...');
    expect(storeMock.load).toHaveBeenCalledTimes(1);
    expect(storeMock.load).toHaveBeenCalledWith(createLatestNewsTickerQuery());
  });

  it('loads ticker latest-news query when store is empty', async () => {
    mockMatchMedia(false);
    const storeMock = createNewsStoreMock({ articles: [] });

    await TestBed.configureTestingModule({
      imports: [AppNavbarComponent],
      providers: [
        provideRouter([]),
        { provide: NewsStore, useValue: storeMock },
        { provide: NewsService, useValue: createNewsServiceMock() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppNavbarComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as { loadTickerNewsIfNeeded: () => void };
    component.loadTickerNewsIfNeeded();

    expect(storeMock.load).toHaveBeenCalledTimes(2);
    expect(storeMock.load).toHaveBeenNthCalledWith(1, createLatestNewsTickerQuery());
    expect(storeMock.load).toHaveBeenNthCalledWith(2, createLatestNewsTickerQuery());
  });

  it('does not load ticker latest-news query while store is already loading', async () => {
    mockMatchMedia(false);
    const storeMock = createNewsStoreMock({ articles: [], loading: true });

    await TestBed.configureTestingModule({
      imports: [AppNavbarComponent],
      providers: [
        provideRouter([]),
        { provide: NewsStore, useValue: storeMock },
        { provide: NewsService, useValue: createNewsServiceMock() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppNavbarComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as { loadTickerNewsIfNeeded: () => void };
    component.loadTickerNewsIfNeeded();

    expect(storeMock.load).not.toHaveBeenCalled();
  });

  it('opens the search dialog and navigates only when the search has results', async () => {
    mockMatchMedia(false);
    const newsServiceMock = createNewsServiceMock({
      resultArticles: [createArticle('search-1', 'Resultado vivienda')],
    });

    await TestBed.configureTestingModule({
      imports: [AppNavbarComponent],
      providers: [
        provideRouter([]),
        { provide: NewsStore, useValue: createNewsStoreMock() },
        { provide: NewsService, useValue: newsServiceMock },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(AppNavbarComponent);
    fixture.detectChanges();

    const openButton = fixture.nativeElement.querySelector('button[aria-label="Buscar noticias"]') as HTMLButtonElement;
    openButton.click();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'Vivienda';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();

    expect(newsServiceMock.getNews).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/buscar'], {
      queryParams: { q: 'vivienda' },
    });
  });

  it('keeps the dialog open and shows feedback when the search has no results', async () => {
    mockMatchMedia(false);
    const newsServiceMock = createNewsServiceMock({ resultArticles: [] });

    await TestBed.configureTestingModule({
      imports: [AppNavbarComponent],
      providers: [
        provideRouter([]),
        { provide: NewsStore, useValue: createNewsStoreMock() },
        { provide: NewsService, useValue: newsServiceMock },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(AppNavbarComponent);
    fixture.detectChanges();

    const openButton = fixture.nativeElement.querySelector('button[aria-label="Buscar noticias"]') as HTMLButtonElement;
    openButton.click();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'Termino inexistente';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();

    expect(navigateSpy).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent as string).toContain('No encontramos resultados para "termino inexistente"');
  });
});

function asNavbarTestInstance(component: AppNavbarComponent): NavbarTestInstance {
  const map = component as unknown as Record<string, unknown>;
  return {
    topbarMeta: map['topbarMeta'] as Signal<string>,
    stickyTopbarMeta: map['stickyTopbarMeta'] as Signal<string>,
    shouldShowSticky: map['shouldShowSticky'] as Signal<boolean>,
    menuOpen: map['menuOpen'] as WritableSignal<boolean>,
  };
}

function mockMatchMedia(matches: boolean): void {
  const mql = {
    matches,
    media: '(max-width: 1023px)',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList;

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockReturnValue(mql),
  });
}

function setWindowScrollY(value: number): void {
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    writable: true,
    value,
  });
}

function createNewsStoreMock(overrides?: Partial<{ articles: readonly ReturnType<typeof createArticle>[]; loading: boolean }>) {
  return {
    data: vi.fn(
      () =>
        overrides?.articles ?? [
          createArticle('news-1', 'Titular 1'),
          createArticle('news-2', 'Titular 2'),
          createArticle('news-3', 'Titular 3'),
        ]
    ),
    isInitialLoading: vi.fn(() => overrides?.loading ?? false),
    load: vi.fn(),
  };
}

function createNewsServiceMock(overrides?: Partial<{ resultArticles: readonly ReturnType<typeof createArticle>[] }>) {
  return {
    getNews: vi.fn(() =>
      of({
        key: 'news:id=-:section=-:source=-:q=vivienda:page=1:limit=20',
        query: { searchQuery: 'vivienda' },
        response: {
          articles: overrides?.resultArticles ?? [],
          total: overrides?.resultArticles?.length ?? 0,
          page: 1,
          limit: 20,
          warnings: [],
        },
        source: 'network',
        staleAtMs: Date.now() + 60_000,
        expiresAtMs: Date.now() + 120_000,
        isStale: false,
        isRefreshing: false,
      }),
    ),
  };
}

function createArticle(id: string, title: string) {
  return {
    id,
    externalId: null,
    title,
    summary: 'Resumen',
    url: 'https://example.com/noticia',
    canonicalUrl: null,
    imageUrl: null,
    sourceId: 'source-1',
    sourceName: 'Fuente',
    sectionSlug: 'actualidad',
    author: null,
    publishedAt: null,
  } as const;
}

interface NavbarTestInstance {
  readonly topbarMeta: Signal<string>;
  readonly stickyTopbarMeta: Signal<string>;
  readonly shouldShowSticky: Signal<boolean>;
  readonly menuOpen: WritableSignal<boolean>;
}


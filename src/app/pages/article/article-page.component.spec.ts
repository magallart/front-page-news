import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { MAX_FEED_NEWS_LIMIT } from '../../constants/news-limit.constants';
import { NewsService } from '../../services/news.service';
import { NewsStore } from '../../stores/news.store';

import { ArticlePageComponent } from './article-page.component';

describe('ArticlePageComponent', () => {
  it('integrates with /api/news aggregated dataset and renders article content', async () => {
    await TestBed.configureTestingModule({
      imports: [ArticlePageComponent],
      providers: [provideRouter([]), provideRouteId('news-1'), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    const fixture = TestBed.createComponent(ArticlePageComponent);
    const httpController = TestBed.inject(HttpTestingController);

    fixture.detectChanges();

    const aggregateRequest = httpController.expectOne('/api/news?page=1&limit=1000');
    aggregateRequest.flush({
      articles: [
        createArticle('news-1', 'actualidad'),
        createArticle('news-2', 'actualidad'),
      ],
      total: 2,
      page: 1,
      limit: 1000,
      warnings: [],
    });
    httpController.expectNone('/api/news?id=news-1&page=1&limit=1');

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-article-content')).toBeTruthy();
    expect((fixture.nativeElement.textContent as string)).toContain('Titulo news-1');

    httpController.verify();
  });

  it('does not trigger fallback request while aggregated dataset is loading', async () => {
    const dataSignal = signal<readonly ReturnType<typeof createArticle>[]>([]);
    const errorSignal = signal<string | null>(null);
    const loadingSignal = signal(true);
    const newsServiceMock = createNewsServiceMock({
      response: { articles: [createArticle('news-missing', 'actualidad')], total: 1, page: 1, limit: 1, warnings: [] },
    });

    await TestBed.configureTestingModule({
      imports: [ArticlePageComponent],
      providers: [
        provideRouter([]),
        provideRouteId('news-missing'),
        {
          provide: NewsStore,
          useValue: {
            loading: loadingSignal.asReadonly(),
            data: dataSignal.asReadonly(),
            error: errorSignal.asReadonly(),
            warnings: signal([]).asReadonly(),
            load: vi.fn(),
          },
        },
        { provide: NewsService, useValue: newsServiceMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ArticlePageComponent);
    fixture.detectChanges();

    expect(newsServiceMock.getNews).not.toHaveBeenCalled();

    loadingSignal.set(false);
    fixture.detectChanges();

    expect(newsServiceMock.getNews).toHaveBeenCalledWith({ id: 'news-missing', page: 1, limit: 1 }, { forceRefresh: true });
  });

  it('integrates fallback request by id when article is missing in aggregated dataset', async () => {
    await TestBed.configureTestingModule({
      imports: [ArticlePageComponent],
      providers: [provideRouter([]), provideRouteId('news-missing'), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    const fixture = TestBed.createComponent(ArticlePageComponent);
    const httpController = TestBed.inject(HttpTestingController);

    fixture.detectChanges();

    const aggregateRequest = httpController.expectOne('/api/news?page=1&limit=1000');
    aggregateRequest.flush({
      articles: [createArticle('news-1', 'actualidad')],
      total: 1,
      page: 1,
      limit: 1000,
      warnings: [],
    });
    fixture.detectChanges();

    const fallbackRequest = httpController.expectOne('/api/news?id=news-missing&page=1&limit=1');
    fallbackRequest.flush({
      articles: [createArticle('news-missing', 'actualidad')],
      total: 1,
      page: 1,
      limit: 1,
      warnings: [],
    });

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-article-content')).toBeTruthy();
    expect((fixture.nativeElement.textContent as string)).toContain('Titulo news-missing');

    httpController.verify();
  });

  it('renders article content with metadata, preview cta and right sidebar', async () => {
    const newsStoreMock = createNewsStoreMock({
      data: [createArticle('news-1', 'actualidad'), createArticle('news-2', 'actualidad'), createArticle('news-3', 'economia')],
    });
    const newsServiceMock = createNewsServiceMock();

    await TestBed.configureTestingModule({
      imports: [ArticlePageComponent],
      providers: [
        provideRouter([]),
        provideRouteId('news-1'),
        { provide: NewsStore, useValue: newsStoreMock },
        { provide: NewsService, useValue: newsServiceMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ArticlePageComponent);
    fixture.detectChanges();

    expect(newsStoreMock.load).toHaveBeenCalledWith({ page: 1, limit: MAX_FEED_NEWS_LIMIT });
    expect(newsServiceMock.getNews).not.toHaveBeenCalled();

    const text = (fixture.nativeElement.textContent as string).replace(/\s+/g, ' ').trim();
    expect(text).toContain('Actualidad');
    expect(text).toContain('Titulo news-1');
    expect(text).toContain('Autor news-1');
    expect(text).toContain('Fuente news');
    expect(text).toContain('Estas leyendo una vista previa de la noticia');

    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(image).toBeTruthy();
    expect(image.alt).toContain('Titulo news-1');

    expect(fixture.nativeElement.querySelector('app-breaking-news')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-most-read-news')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-article-content')).toBeTruthy();

    const sidebar = fixture.nativeElement.querySelector('aside') as HTMLElement;
    expect(sidebar.className).toContain('hidden');
    expect(sidebar.className).toContain('lg:block');
  });

  it('renders not-found state when article id does not exist', async () => {
    const newsStoreMock = createNewsStoreMock({
      data: [createArticle('news-1', 'actualidad')],
    });
    const newsServiceMock = createNewsServiceMock({
      response: { articles: [], total: 0, page: 1, limit: 1, warnings: [] },
    });

    await TestBed.configureTestingModule({
      imports: [ArticlePageComponent],
      providers: [
        provideRouter([]),
        provideRouteId('id-inexistente'),
        { provide: NewsStore, useValue: newsStoreMock },
        { provide: NewsService, useValue: newsServiceMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ArticlePageComponent);
    fixture.detectChanges();

    const text = (fixture.nativeElement.textContent as string).replace(/\s+/g, ' ').trim();
    expect(text).toContain('Noticia no encontrada');
    expect(text).toContain('Ir a portada');
    expect(fixture.nativeElement.querySelector('app-article-not-found')).toBeTruthy();

    expect(fixture.nativeElement.querySelector('app-breaking-news')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-most-read-news')).toBeTruthy();
    expect(newsServiceMock.getNews).toHaveBeenCalledWith({ id: 'id-inexistente', page: 1, limit: 1 }, { forceRefresh: true });
  });

  it('renders error state when api fails and article is not available', async () => {
    const newsStoreMock = createNewsStoreMock({ data: [], error: 'Request failed' });
    const newsServiceMock = createNewsServiceMock({ shouldFail: true });

    await TestBed.configureTestingModule({
      imports: [ArticlePageComponent],
      providers: [
        provideRouter([]),
        provideRouteId('news-missing'),
        { provide: NewsStore, useValue: newsStoreMock },
        { provide: NewsService, useValue: newsServiceMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ArticlePageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-error-state')).toBeTruthy();
    expect(fixture.nativeElement.textContent as string).toContain('No se ha podido cargar la noticia');
  });
});

function provideRouteId(id: string) {
  return {
    provide: ActivatedRoute,
    useValue: {
      paramMap: of(convertToParamMap({ id })),
    },
  };
}

function createNewsServiceMock(
  overrides?: Partial<{
    response: { articles: readonly ReturnType<typeof createArticle>[]; total: number; page: number; limit: number; warnings: readonly unknown[] };
    shouldFail: boolean;
  }>,
) {
  const response =
    overrides?.response ??
    ({
      articles: [createArticle('news-fallback', 'actualidad')],
      total: 1,
      page: 1,
      limit: 1,
      warnings: [],
    } as const);

  return {
    getNews: vi.fn(() =>
      overrides?.shouldFail ? throwError(() => new Error('Request failed')) : of(response),
    ),
  };
}

function createNewsStoreMock(
  overrides?: Partial<{ data: readonly ReturnType<typeof createArticle>[]; error: string | null; loading: boolean }>,
) {
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

function createArticle(id: string, sectionSlug: string) {
  return {
    id,
    externalId: null,
    title: `Titulo ${id}`,
    summary: `Resumen ${id}`,
    url: `https://example.com/${id}`,
    canonicalUrl: null,
    imageUrl: 'https://example.com/image.jpg',
    sourceId: 'source-news',
    sourceName: 'Fuente news',
    sectionSlug,
    author: `Autor ${id}`,
    publishedAt: '2026-02-18T10:30:00.000Z',
  } as const;
}

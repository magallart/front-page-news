import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';

import { MostReadNewsComponent } from '../../components/news/most-read-news.component';
import { MAX_FEED_NEWS_LIMIT } from '../../constants/news-limit.constants';
import { NewsStore } from '../../stores/news.store';

import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
  it('integrates with /api/news and renders editorial blocks from real store data', async () => {
    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomePageComponent);
    const httpController = TestBed.inject(HttpTestingController);

    fixture.detectChanges();

    const request = httpController.expectOne('/api/news?page=1&limit=1000');
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
      limit: 1000,
      warnings: [],
    });

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-news-carousel')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-breaking-news')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-most-read-news')).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('app-section-block').length).toBe(3);

    httpController.verify();
  });

  it('renders top hero+breaking and lower sections with most-read', async () => {
    const newsStoreMock = createNewsStoreMock();

    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [provideRouter([]), { provide: NewsStore, useValue: newsStoreMock }],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.detectChanges();

    expect(newsStoreMock.load).toHaveBeenCalledWith({ page: 1, limit: MAX_FEED_NEWS_LIMIT });

    expect(fixture.nativeElement.querySelector('app-news-carousel')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-breaking-news')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-most-read-news')).toBeTruthy();

    const sectionBlocks = fixture.nativeElement.querySelectorAll('app-section-block');
    expect(sectionBlocks.length).toBe(3);

    const sectionText = fixture.nativeElement.textContent as string;
    expect(sectionText).toContain('Actualidad');
    expect(sectionText).toContain('Economía');
    expect(sectionText).toContain('Cultura');
  });

  it('renders total error state when api fails and there is no data', async () => {
    const newsStoreMock = createNewsStoreMock({
      data: [],
      error: 'Request failed',
    });

    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [provideRouter([]), { provide: NewsStore, useValue: newsStoreMock }],
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

    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [provideRouter([]), { provide: NewsStore, useValue: newsStoreMock }],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.detectChanges();

    const mostRead = fixture.debugElement.query(By.directive(MostReadNewsComponent)).componentInstance as MostReadNewsComponent;
    const items = mostRead.items();
    const sourceACount = items.filter((item) => item.source === 'Fuente A').length;

    expect(sourceACount).toBe(3);
    expect(items[0]?.source).toBe('Fuente A');
  });
});

function createNewsStoreMock(overrides?: Partial<{ data: readonly unknown[]; error: string | null; loading: boolean }>) {
  const dataSignal = signal(
    (overrides?.data as readonly ReturnType<typeof createArticle>[]) ?? [
      createArticle('news-1', 'actualidad'),
      createArticle('news-2', 'actualidad'),
      createArticle('news-3', 'economia'),
      createArticle('news-4', 'cultura'),
      createArticle('news-5', 'economia'),
      createArticle('news-6', 'actualidad'),
    ],
  );
  const loadingSignal = signal(overrides?.loading ?? false);
  const errorSignal = signal<string | null>(overrides?.error ?? null);

  return {
    loading: loadingSignal.asReadonly(),
    data: dataSignal.asReadonly(),
    error: errorSignal.asReadonly(),
    warnings: signal([]).asReadonly(),
    load: vi.fn(),
  };
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

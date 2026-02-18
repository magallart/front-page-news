import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';

import { MAX_FEED_NEWS_LIMIT } from '../../constants/news-limit.constants';
import { NewsStore } from '../../stores/news.store';

import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
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

function createArticle(id: string, sectionSlug: string) {
  return {
    id,
    externalId: null,
    title: `Titulo ${id}`,
    summary: `Resumen ${id}`,
    url: `https://example.com/${id}`,
    canonicalUrl: null,
    imageUrl: 'https://example.com/image.jpg',
    sourceId: 'source-example',
    sourceName: 'Example',
    sectionSlug,
    author: null,
    publishedAt: null,
  } as const;
}

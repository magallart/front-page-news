import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { NewsCarouselComponent } from './news-carousel.component';

import type { NewsItem } from '../../interfaces/news-item.interface';

describe('NewsCarouselComponent', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows hero story and moves to next one when clicking next button', async () => {
    await TestBed.configureTestingModule({
      imports: [NewsCarouselComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(NewsCarouselComponent);
    fixture.componentRef.setInput('articles', MOCK_ARTICLES);
    fixture.detectChanges();

    const beforeTitle = getHeroTitle(fixture.nativeElement);
    expect(beforeTitle).toBeTruthy();

    const heroImage = fixture.nativeElement.querySelector('[data-testid="carousel-hero"] img') as HTMLImageElement;
    expect(heroImage.className).toContain('absolute');
    expect(heroImage.className).toContain('inset-0');
    expect(heroImage.className).toContain('h-full');
    expect(heroImage.className).toContain('w-full');
    expect(heroImage.className).toContain('object-cover');

    const nextButton = fixture.nativeElement.querySelector(
      'button[aria-label="Siguiente noticia"]',
    ) as HTMLButtonElement;
    nextButton.click();
    fixture.detectChanges();

    const afterTitle = getHeroTitle(fixture.nativeElement);
    expect(beforeTitle).not.toEqual(afterTitle);
  });

  it('rotates hero story automatically over time', async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [NewsCarouselComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(NewsCarouselComponent);
    fixture.componentRef.setInput('articles', MOCK_ARTICLES);
    fixture.detectChanges();

    const beforeTitle = getHeroTitle(fixture.nativeElement);
    vi.advanceTimersByTime(5000);
    fixture.detectChanges();

    const afterTitle = getHeroTitle(fixture.nativeElement);
    expect(beforeTitle).not.toEqual(afterTitle);
  });

  it('does not rotate automatically when there is only one article', async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [NewsCarouselComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(NewsCarouselComponent);
    fixture.componentRef.setInput('articles', [MOCK_ARTICLES[0]]);
    fixture.detectChanges();

    const beforeTitle = getHeroTitle(fixture.nativeElement);
    vi.advanceTimersByTime(10_000);
    fixture.detectChanges();

    const afterTitle = getHeroTitle(fixture.nativeElement);
    expect(afterTitle).toBe(beforeTitle);
  });

  it('stops automatic rotation when article list shrinks to one item', async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [NewsCarouselComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(NewsCarouselComponent);
    fixture.componentRef.setInput('articles', MOCK_ARTICLES);
    fixture.detectChanges();

    fixture.componentRef.setInput('articles', [MOCK_ARTICLES[0]]);
    fixture.detectChanges();

    const beforeTitle = getHeroTitle(fixture.nativeElement);
    vi.advanceTimersByTime(10_000);
    fixture.detectChanges();

    const afterTitle = getHeroTitle(fixture.nativeElement);
    expect(afterTitle).toBe(beforeTitle);
  });

  it('restarts automatic rotation window after manual navigation', async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [NewsCarouselComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(NewsCarouselComponent);
    fixture.componentRef.setInput('articles', MOCK_ARTICLES);
    fixture.detectChanges();

    const nextButton = fixture.nativeElement.querySelector(
      'button[aria-label="Siguiente noticia"]',
    ) as HTMLButtonElement;
    nextButton.click();
    fixture.detectChanges();

    const titleAfterManualMove = getHeroTitle(fixture.nativeElement);
    vi.advanceTimersByTime(4_000);
    fixture.detectChanges();
    expect(getHeroTitle(fixture.nativeElement)).toBe(titleAfterManualMove);

    vi.advanceTimersByTime(1_000);
    fixture.detectChanges();
    expect(getHeroTitle(fixture.nativeElement)).not.toBe(titleAfterManualMove);
  });

  it('shows author, source and formatted publication datetime in hero metadata', async () => {
    await TestBed.configureTestingModule({
      imports: [NewsCarouselComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(NewsCarouselComponent);
    fixture.componentRef.setInput('articles', [
      {
        ...MOCK_ARTICLES[0],
        author: 'Antonio Rodríguez',
        source: 'El País',
        publishedAt: '2026-02-20T12:33:00.000Z',
      },
    ]);
    fixture.detectChanges();

    const heroParagraphs = Array.from(
      fixture.nativeElement.querySelectorAll('[data-testid="carousel-hero"] p')
    ) as HTMLParagraphElement[];
    const metaText = heroParagraphs[heroParagraphs.length - 1]?.textContent?.replace(/\s+/g, ' ')?.trim() ?? '';
    const sourceLink = fixture.nativeElement.querySelector('[data-testid="carousel-hero"] a') as HTMLAnchorElement;

    expect(metaText).toContain('Por Antonio Rodríguez');
    expect(metaText).toContain('El País');
    expect(metaText).toMatch(/\d{2}:\d{2} - 20\.02\.2026$/);
    expect(sourceLink.getAttribute('href')).toBe('/fuente/fuente-1');
  });

  it('keeps hero copy left aligned and renders the visible section badge', async () => {
    await TestBed.configureTestingModule({
      imports: [NewsCarouselComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(NewsCarouselComponent);
    fixture.componentRef.setInput('articles', [MOCK_ARTICLES[0]]);
    fixture.detectChanges();

    const heroButton = fixture.nativeElement.querySelector('[data-testid="carousel-hero"] [role="button"]') as HTMLDivElement;
    const heroTitle = fixture.nativeElement.querySelector('[data-testid="carousel-hero"] h2') as HTMLHeadingElement;
    const sectionBadge = fixture.nativeElement.querySelector('[data-testid="carousel-hero"] p') as HTMLParagraphElement;

    expect(heroButton.className).toContain('text-left');
    expect(heroTitle.textContent?.trim()).toBe('Titular uno');
    expect(sectionBadge.textContent?.trim()).toBe('actualidad');
    expect(sectionBadge.className).toContain('inline-flex');
    expect(sectionBadge.className).toContain('bg-primary');
  });

  it('emits preview when clicking nested hero content outside the source link', async () => {
    await TestBed.configureTestingModule({
      imports: [NewsCarouselComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(NewsCarouselComponent);
    fixture.componentRef.setInput('articles', [MOCK_ARTICLES[0]]);
    fixture.detectChanges();

    let previewedArticleId: string | null = null;
    fixture.componentInstance.previewRequested.subscribe((article) => {
      previewedArticleId = article.id;
    });

    const heroTitle = fixture.nativeElement.querySelector('[data-testid="carousel-hero"] h2') as HTMLHeadingElement;
    heroTitle.click();

    expect(previewedArticleId).toBe('carousel-001');
  });

  it('does not open preview or cancel navigation when keyboard activation starts on the nested source link', async () => {
    await TestBed.configureTestingModule({
      imports: [NewsCarouselComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(NewsCarouselComponent);
    fixture.componentRef.setInput('articles', [MOCK_ARTICLES[0]]);
    fixture.detectChanges();

    let previewedArticleId: string | null = null;
    fixture.componentInstance.previewRequested.subscribe((article) => {
      previewedArticleId = article.id;
    });

    const sourceLink = fixture.nativeElement.querySelector('[data-testid="carousel-hero"] a') as HTMLAnchorElement;
    const keyboardEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });

    sourceLink.dispatchEvent(keyboardEvent);

    expect(previewedArticleId).toBeNull();
    expect(keyboardEvent.defaultPrevented).toBe(false);
  });
});

function getHeroTitle(rootElement: HTMLElement): string {
  return rootElement.querySelector('[data-testid="carousel-hero"] h2')?.textContent?.trim() ?? '';
}

const MOCK_ARTICLES: readonly NewsItem[] = [
  {
    id: 'carousel-001',
    title: 'Titular uno',
    summary: 'Resumen uno',
    imageUrl: '',
    sourceId: 'fuente-1',
    source: 'Fuente 1',
    section: 'actualidad',
    publishedAt: '2026-02-11',
    author: 'Autor 1',
    url: 'https://example.com/1',
  },
  {
    id: 'carousel-002',
    title: 'Titular dos',
    summary: 'Resumen dos',
    imageUrl: '',
    sourceId: 'fuente-2',
    source: 'Fuente 2',
    section: 'actualidad',
    publishedAt: '2026-02-11',
    author: 'Autor 2',
    url: 'https://example.com/2',
  },
  {
    id: 'carousel-003',
    title: 'Titular tres',
    summary: 'Resumen tres',
    imageUrl: '',
    sourceId: 'fuente-3',
    source: 'Fuente 3',
    section: 'actualidad',
    publishedAt: '2026-02-11',
    author: 'Autor 3',
    url: 'https://example.com/3',
  },
  {
    id: 'carousel-004',
    title: 'Titular cuatro',
    summary: 'Resumen cuatro',
    imageUrl: '',
    sourceId: 'fuente-4',
    source: 'Fuente 4',
    section: 'actualidad',
    publishedAt: '2026-02-11',
    author: 'Autor 4',
    url: 'https://example.com/4',
  },
] as const;

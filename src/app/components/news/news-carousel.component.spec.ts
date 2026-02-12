import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';

import { NewsCarouselComponent } from './news-carousel.component';

import type { NewsItem } from '../../interfaces/news-item.interface';

describe('NewsCarouselComponent', () => {
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

    vi.useRealTimers();
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
    source: 'Fuente 4',
    section: 'actualidad',
    publishedAt: '2026-02-11',
    author: 'Autor 4',
    url: 'https://example.com/4',
  },
] as const;

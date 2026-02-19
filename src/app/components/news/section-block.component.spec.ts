import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';

import { SectionBlockComponent } from './section-block.component';

import type { NewsItem } from '../../interfaces/news-item.interface';

describe('SectionBlockComponent', () => {
  it('renders section heading, styled CTA and 3 news cards', async () => {
    await TestBed.configureTestingModule({
      imports: [SectionBlockComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(SectionBlockComponent);
    fixture.componentRef.setInput('title', 'Economía');
    fixture.componentRef.setInput('sectionSlug', 'economia');
    fixture.componentRef.setInput('articles', MOCK_ARTICLES);
    fixture.detectChanges();

    const heading = fixture.nativeElement.querySelector('h2') as HTMLElement;
    expect(heading.textContent?.trim()).toBe('Economía');
    expect(heading.className).toContain('font-editorial-title');

    const link = fixture.nativeElement.querySelector('a[href="/seccion/economia"]') as HTMLAnchorElement;
    expect(link).toBeTruthy();
    expect(link.textContent).toContain('Ver más');
    expect(link.className).toContain('font-editorial-body');
    expect(link.querySelector('app-icon-arrow-right')).toBeTruthy();

    const cards = fixture.nativeElement.querySelectorAll('app-news-card');
    expect(cards.length).toBe(3);
  });
});

const MOCK_ARTICLES: readonly NewsItem[] = [
  {
    id: 'section-001',
    title: 'Titulo 1',
    summary: 'Resumen 1',
    imageUrl: '',
    source: 'Diario 1',
    section: 'economia',
    publishedAt: '2026-02-11T08:15:00',
    author: 'Autor 1',
    url: 'https://example.com/section-1',
  },
  {
    id: 'section-002',
    title: 'Titulo 2',
    summary: 'Resumen 2',
    imageUrl: '',
    source: 'Diario 2',
    section: 'economia',
    publishedAt: '2026-02-11T09:15:00',
    author: 'Autor 2',
    url: 'https://example.com/section-2',
  },
  {
    id: 'section-003',
    title: 'Titulo 3',
    summary: 'Resumen 3',
    imageUrl: '',
    source: 'Diario 3',
    section: 'economia',
    publishedAt: '2026-02-11T10:15:00',
    author: 'Autor 3',
    url: 'https://example.com/section-3',
  },
] as const;

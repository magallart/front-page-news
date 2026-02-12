import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';

import { CurrentNewsBlockComponent } from './current-news-block.component';

import type { NewsItem } from '../../interfaces/news-item.interface';

describe('CurrentNewsBlockComponent', () => {
  it('renders default title, styled CTA and up to 4 cards from input items', async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentNewsBlockComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(CurrentNewsBlockComponent);
    fixture.componentRef.setInput('articles', MOCK_ARTICLES);
    fixture.detectChanges();

    const heading = fixture.nativeElement.querySelector('h2') as HTMLElement;
    expect(heading.textContent?.trim()).toBe('Actualidad');
    expect(heading.className).toContain('font-editorial-title');

    const link = fixture.nativeElement.querySelector('a[href="/seccion/actualidad"]') as HTMLAnchorElement;
    expect(link).toBeTruthy();
    expect(link.textContent).toContain('Ver más');
    expect(link.className).toContain('font-editorial-body');
    expect(link.querySelector('app-icon-arrow-right')).toBeTruthy();

    const cards = fixture.nativeElement.querySelectorAll('app-news-card');
    expect(cards.length).toBe(4);
  });
});

const MOCK_ARTICLES: readonly NewsItem[] = [
  {
    id: 'current-001',
    title: 'Titulo 1',
    summary: 'Resumen 1',
    imageUrl: '',
    source: 'Diario 1',
    section: 'actualidad',
    publishedAt: '2026-02-11T08:15:00',
    author: 'Autor 1',
    url: 'https://example.com/current-1',
  },
  {
    id: 'current-002',
    title: 'Titulo 2',
    summary: 'Resumen 2',
    imageUrl: '',
    source: 'Diario 2',
    section: 'actualidad',
    publishedAt: '2026-02-11T09:15:00',
    author: 'Autor 2',
    url: 'https://example.com/current-2',
  },
  {
    id: 'current-003',
    title: 'Titulo 3',
    summary: 'Resumen 3',
    imageUrl: '',
    source: 'Diario 3',
    section: 'actualidad',
    publishedAt: '2026-02-11T10:15:00',
    author: 'Autor 3',
    url: 'https://example.com/current-3',
  },
  {
    id: 'current-004',
    title: 'Titulo 4',
    summary: 'Resumen 4',
    imageUrl: '',
    source: 'Diario 4',
    section: 'actualidad',
    publishedAt: '2026-02-11T11:15:00',
    author: 'Autor 4',
    url: 'https://example.com/current-4',
  },
] as const;

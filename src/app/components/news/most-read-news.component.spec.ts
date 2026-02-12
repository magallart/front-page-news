import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';

import { MostReadNewsComponent } from './most-read-news.component';

import type { NewsItem } from '../../interfaces/news-item.interface';

describe('MostReadNewsComponent', () => {
  it('renders heading, ranking numbers, typography and publication time', async () => {
    await TestBed.configureTestingModule({
      imports: [MostReadNewsComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(MostReadNewsComponent);
    fixture.componentRef.setInput('items', MOCK_ITEMS);
    fixture.detectChanges();

    const heading = fixture.nativeElement.querySelector('h2') as HTMLElement;
    expect(heading.textContent).toContain('Lo más leído');
    expect(heading.className).toContain('font-editorial-title');
    expect(fixture.nativeElement.querySelector('app-icon-trending-up')).toBeTruthy();

    const container = fixture.nativeElement.querySelector('#most-read-news') as HTMLElement;
    expect(container.className).toContain('bg-secondary');

    const numbers = Array.from(fixture.nativeElement.querySelectorAll('ol > li > span')).map((node) =>
      (node as HTMLElement).textContent?.trim(),
    );
    expect(numbers).toEqual(['1', '2', '3']);

    const firstTitle = fixture.nativeElement.querySelector('ol li a') as HTMLElement;
    expect(firstTitle.className).toContain('font-editorial-title');

    const firstMeta = fixture.nativeElement.querySelector('ol li p') as HTMLElement;
    expect(firstMeta.className).toContain('font-editorial-body');

    const metaText = fixture.nativeElement.textContent as string;
    expect(metaText).toContain('08:15');
    expect(metaText).toContain('09:40');
  });

  it('shows fallback time when publishedAt is invalid', async () => {
    await TestBed.configureTestingModule({
      imports: [MostReadNewsComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(MostReadNewsComponent);
    fixture.componentRef.setInput('items', [
      {
        ...MOCK_ITEMS[0],
        id: 'most-read-invalid-time',
        publishedAt: 'invalid-date',
      },
    ]);
    fixture.detectChanges();

    const metaText = fixture.nativeElement.textContent as string;
    expect(metaText).toContain('--:--');
  });
});

const MOCK_ITEMS: readonly NewsItem[] = [
  {
    id: 'most-read-001',
    title: 'Titular principal',
    summary: 'Resumen principal',
    imageUrl: '',
    source: 'Diario Uno',
    section: 'actualidad',
    publishedAt: '2026-02-11T08:15:00',
    author: 'Autor Uno',
    url: 'https://example.com/most-read-1',
  },
  {
    id: 'most-read-002',
    title: 'Titular secundario',
    summary: 'Resumen secundario',
    imageUrl: '',
    source: 'Diario Dos',
    section: 'economia',
    publishedAt: '2026-02-11T09:40:00',
    author: 'Autor Dos',
    url: 'https://example.com/most-read-2',
  },
  {
    id: 'most-read-003',
    title: 'Titular tercero',
    summary: 'Resumen tercero',
    imageUrl: '',
    source: 'Diario Tres',
    section: 'cultura',
    publishedAt: '2026-02-11T10:55:00',
    author: 'Autor Tres',
    url: 'https://example.com/most-read-3',
  },
] as const;

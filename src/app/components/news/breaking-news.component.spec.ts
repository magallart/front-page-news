import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';

import { BreakingNewsComponent } from './breaking-news.component';

describe('BreakingNewsComponent', () => {
  it('renders up to four items with real relative timestamps', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-04T12:00:00.000Z'));
    try {
      await TestBed.configureTestingModule({
        imports: [BreakingNewsComponent],
        providers: [provideRouter([])],
      }).compileComponents();

      const fixture = TestBed.createComponent(BreakingNewsComponent);
      fixture.componentRef.setInput(
        'items',
        createItems(5, [
          '2026-03-04T11:55:00.000Z',
          '2026-03-04T11:48:00.000Z',
          '2026-03-04T11:41:00.000Z',
          '2026-03-04T11:29:00.000Z',
          '2026-03-04T11:22:00.000Z',
        ]),
      );
      fixture.detectChanges();

      const rows = fixture.nativeElement.querySelectorAll('ul > li');
      const text = fixture.nativeElement.textContent as string;

      expect(rows.length).toBe(4);
      expect(text).toContain('Hace 5 min');
      expect(text).toContain('Hace 31 min');
      expect(text).not.toContain('Titulo 5');
    } finally {
      vi.useRealTimers();
    }
  });

  it('emits previewRequested when clicking a headline', async () => {
    await TestBed.configureTestingModule({
      imports: [BreakingNewsComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(BreakingNewsComponent);
    const items = createItems(2);
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();

    const emitSpy = vi.spyOn(fixture.componentInstance.previewRequested, 'emit');
    const firstHeadlineButton = fixture.nativeElement.querySelector('ul button') as HTMLButtonElement;
    firstHeadlineButton.click();

    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith(items[0]);
    expect(firstHeadlineButton.className).toContain('leading-[1.65rem]');
    expect(firstHeadlineButton.className).toContain('underline');
    expect(firstHeadlineButton.className).toContain('decoration-transparent');
    expect(firstHeadlineButton.className).toContain('hover:decoration-primary');
    expect(firstHeadlineButton.className).not.toContain('hover:text-primary');
  });

  it('shows empty fallback and keeps coverage link when there are no items', async () => {
    await TestBed.configureTestingModule({
      imports: [BreakingNewsComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(BreakingNewsComponent);
    fixture.componentRef.setInput('items', []);
    fixture.componentRef.setInput('coverageLink', '/seccion/ultima-hora');
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    const coverageCta = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;

    expect(text).toContain('No hay actualizaciones recientes.');
    expect(coverageCta.getAttribute('href')).toBe('/seccion/ultima-hora');
    expect(text).toContain('En directo');
  });

  it('shows fallback timestamp when publishedAt is invalid', async () => {
    await TestBed.configureTestingModule({
      imports: [BreakingNewsComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(BreakingNewsComponent);
    fixture.componentRef.setInput('items', createItems(1, ['not-a-date']));
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Ahora');
  });
});

function createItems(count: number, publishedAtList: readonly string[] = []) {
  return Array.from({ length: count }, (_, index) => ({
    id: `news-${index + 1}`,
    title: `Titulo ${index + 1}`,
    summary: `Resumen ${index + 1}`,
    imageUrl: 'https://example.com/image.jpg',
    source: `Fuente ${index + 1}`,
    section: 'actualidad',
    publishedAt: publishedAtList[index] ?? '2026-03-04T08:30:00.000Z',
    author: 'Autor',
    url: `https://example.com/news-${index + 1}`,
  }));
}

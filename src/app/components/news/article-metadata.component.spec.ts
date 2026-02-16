import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { ArticleMetadataComponent } from './article-metadata.component';

describe('ArticleMetadataComponent', () => {
  it('renders three centered columns with mobile and desktop date formats', async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleMetadataComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ArticleMetadataComponent);
    fixture.componentRef.setInput('author', 'Ana Redactora');
    fixture.componentRef.setInput('source', 'Diario Prueba');
    fixture.componentRef.setInput('publishedAt', '2026-02-16T10:00:00');
    fixture.detectChanges();

    const grid = fixture.nativeElement.querySelector('dl') as HTMLElement;
    expect(grid.className).toContain('grid-cols-3');

    const columns = fixture.nativeElement.querySelectorAll('dl > div');
    expect(columns.length).toBe(3);
    for (const column of columns) {
      expect((column as HTMLElement).className).toContain('text-center');
    }

    const mobileDate = fixture.nativeElement.querySelector('span.sm\\:hidden') as HTMLElement;
    const desktopDate = fixture.nativeElement.querySelector('span.hidden.sm\\:inline') as HTMLElement;

    expect(mobileDate.textContent?.trim()).toBe('16-02-26');
    expect(desktopDate.textContent?.trim()).toContain('2026');
  });

  it('shows date fallbacks when publishedAt is invalid', async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleMetadataComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ArticleMetadataComponent);
    fixture.componentRef.setInput('author', 'Ana Redactora');
    fixture.componentRef.setInput('source', 'Diario Prueba');
    fixture.componentRef.setInput('publishedAt', 'invalid-date');
    fixture.detectChanges();

    const mobileDate = fixture.nativeElement.querySelector('span.sm\\:hidden') as HTMLElement;
    const desktopDate = fixture.nativeElement.querySelector('span.hidden.sm\\:inline') as HTMLElement;

    expect(mobileDate.textContent?.trim()).toBe('-- -- --');
    expect(desktopDate.textContent?.trim()).toBe('Fecha no disponible');
  });
});

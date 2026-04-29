import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { ArticlePreviewCtaComponent } from './article-preview-cta.component';

describe('ArticlePreviewCtaComponent', () => {
  it('renders external CTA with secure attributes and source-aware label', async () => {
    await TestBed.configureTestingModule({
      imports: [ArticlePreviewCtaComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ArticlePreviewCtaComponent);
    fixture.componentRef.setInput('url', 'https://example.com/articulo');
    fixture.componentRef.setInput('source', 'Diario Uno');
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    const text = fixture.nativeElement.textContent as string;

    expect(link.href).toBe('https://example.com/articulo');
    expect(link.target).toBe('_blank');
    expect(link.rel).toContain('noopener');
    expect(link.rel).toContain('noreferrer');
    expect(link.getAttribute('aria-label')).toBe('Abrir noticia completa de Diario Uno');
    expect(text).toContain('Abrir noticia completa');
  });
});


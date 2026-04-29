import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';

import { ArticleContentComponent } from './article-content.component';

import type { NewsItem } from '../../interfaces/news-item.interface';

describe('ArticleContentComponent', () => {
  it('renders title, metadata and cta', async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleContentComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(ArticleContentComponent);
    fixture.componentRef.setInput('article', MOCK_ARTICLE);
    fixture.detectChanges();

    const text = (fixture.nativeElement.textContent as string).replace(/\s+/g, ' ').trim();
    expect(text).toContain('Titular de prueba para detalle');
    expect(text).toContain('Ana Redactora');
    expect(text).toContain('Diario Prueba');
    expect(text).toContain('Abrir noticia completa');

    expect(fixture.nativeElement.querySelector('app-article-metadata')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-article-locked-preview')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-article-preview-cta')).toBeTruthy();
  });

  it('hides image block when article has no image', async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleContentComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(ArticleContentComponent);
    fixture.componentRef.setInput('article', {
      ...MOCK_ARTICLE,
      imageUrl: '/images/no-image.jpg',
    });
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement | null;
    expect(image).toBeNull();
  });

  it('hides image when it fails to load', async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleContentComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(ArticleContentComponent);
    fixture.componentRef.setInput('article', MOCK_ARTICLE);
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(image).toBeTruthy();

    image.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    const imageAfterError = fixture.nativeElement.querySelector('img') as HTMLImageElement | null;
    expect(imageAfterError).toBeNull();
  });

  it('uses fallback text when article fields are empty', async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleContentComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(ArticleContentComponent);
    fixture.componentRef.setInput('article', {
      ...MOCK_ARTICLE,
      title: '',
      summary: '',
      imageUrl: '',
      source: '',
      section: '',
      sourceId: '',
      author: '',
      url: '',
    });
    fixture.detectChanges();

    const text = (fixture.nativeElement.textContent as string).replace(/\s+/g, ' ').trim();
    expect(text).toContain('Noticia sin titular disponible');
    expect(text).toContain('Redacci\u00F3n Front Page News');
    expect(text).toContain('Front Page News');
    expect(text).toContain('Actualidad');
    expect(text).not.toContain('Esta noticia no incluye resumen disponible en este momento.');

    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement | null;
    expect(image).toBeNull();
  });

  it('renders one paragraph per summary block separated by blank lines', async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleContentComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(ArticleContentComponent);
    fixture.componentRef.setInput('article', {
      ...MOCK_ARTICLE,
      summary: 'Primer párrafo.\n\nSegundo párrafo más largo.',
    });
    fixture.detectChanges();

    const paragraphs = Array.from(
      fixture.nativeElement.querySelectorAll('article > div.font-editorial-body p')
    ) as HTMLParagraphElement[];
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]?.textContent?.trim()).toBe('Primer párrafo.');
    expect(paragraphs[1]?.textContent?.trim()).toBe('Segundo párrafo más largo.');
  });
});

const MOCK_ARTICLE: NewsItem = {
  id: 'mock-article-content-001',
  title: 'Titular de prueba para detalle',
  summary: 'Resumen de prueba para render de componente de contenido.',
  imageUrl: 'https://example.com/mock.jpg',
  sourceId: 'diario-prueba',
  source: 'Diario Prueba',
  section: 'actualidad',
  publishedAt: '2026-02-16T10:00:00',
  author: 'Ana Redactora',
  url: 'https://example.com/full-article',
};


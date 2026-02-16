import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';

import { ArticleContentComponent } from './article-content.component';

import type { NewsItem } from '../../interfaces/news-item.interface';

describe('ArticleContentComponent', () => {
  it('renders title, metadata, locked preview and cta', async () => {
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

    expect(fixture.nativeElement.querySelector('app-article-metadata')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-article-locked-preview')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-article-preview-cta')).toBeTruthy();
  });

  it('uses fallback image and text when article fields are empty', async () => {
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
      author: '',
      url: '',
    });
    fixture.detectChanges();

    const text = (fixture.nativeElement.textContent as string).replace(/\s+/g, ' ').trim();
    expect(text).toContain('Noticia sin titular disponible');
    expect(text).toContain('Redaccion Front Page News');
    expect(text).toContain('Front Page News');
    expect(text).toContain('Actualidad');
    expect(text).toContain('Esta noticia no incluye resumen disponible en este momento.');

    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(image.src).toContain('/images/no-image.jpg');
  });
});

const MOCK_ARTICLE: NewsItem = {
  id: 'mock-article-content-001',
  title: 'Titular de prueba para detalle',
  summary: 'Resumen de prueba para render de componente de contenido.',
  imageUrl: 'https://example.com/mock.jpg',
  source: 'Diario Prueba',
  section: 'actualidad',
  publishedAt: '2026-02-16T10:00:00',
  author: 'Ana Redactora',
  url: 'https://example.com/full-article',
};

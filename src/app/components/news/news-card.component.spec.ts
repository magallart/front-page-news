import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';

import { NewsCardComponent } from './news-card.component';

describe('NewsCardComponent', () => {
  it('falls back to local placeholder when image fails to load', async () => {
    await TestBed.configureTestingModule({
      imports: [NewsCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(NewsCardComponent);
    fixture.componentRef.setInput('article', {
      id: 'news-1',
      title: 'Titulo',
      summary: 'Resumen',
      imageUrl: 'https://example.com/broken.jpg',
      source: 'Fuente',
      section: 'cultura',
      publishedAt: '',
      author: 'Autor',
      url: 'https://example.com/news-1',
    });
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    image.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(image.getAttribute('src')).toBe('/images/no-image.jpg');
  });
});

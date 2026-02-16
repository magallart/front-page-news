import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';

import { ArticleNotFoundComponent } from './article-not-found.component';

describe('ArticleNotFoundComponent', () => {
  it('renders not-found message and home link', async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleNotFoundComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(ArticleNotFoundComponent);
    fixture.detectChanges();

    const text = (fixture.nativeElement.textContent as string).replace(/\s+/g, ' ').trim();
    expect(text).toContain('Noticia no encontrada');
    expect(text).toContain('Ir a portada');

    const image = fixture.nativeElement.querySelector('img[src="/images/error.png"]') as HTMLImageElement;
    expect(image).toBeTruthy();
  });
});

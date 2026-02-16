import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';

import { ArticlePageComponent } from './article-page.component';

describe('ArticlePageComponent', () => {
  it('renders article content with metadata, preview cta and right sidebar', async () => {
    await TestBed.configureTestingModule({
      imports: [ArticlePageComponent],
      providers: [provideRouter([]), provideRouteId('demo-noticia-003')],
    }).compileComponents();

    const fixture = TestBed.createComponent(ArticlePageComponent);
    fixture.detectChanges();

    const text = (fixture.nativeElement.textContent as string).replace(/\s+/g, ' ').trim();
    expect(text).toContain('Actualidad');
    expect(text).toContain('Actualizacion judicial sobre el caso de mayor impacto de la semana');
    expect(text).toContain('Mario Ruiz');
    expect(text).toContain('Boletin Justicia');
    expect(text).toContain('Estas leyendo una vista previa de la noticia');

    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(image).toBeTruthy();
    expect(image.alt).toContain('Actualizacion judicial sobre el caso de mayor impacto de la semana');

    expect(fixture.nativeElement.querySelector('app-breaking-news')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-most-read-news')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-article-metadata')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-article-locked-preview')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-article-preview-cta')).toBeTruthy();
  });

  it('renders not-found state when article id does not exist', async () => {
    await TestBed.configureTestingModule({
      imports: [ArticlePageComponent],
      providers: [provideRouter([]), provideRouteId('id-inexistente')],
    }).compileComponents();

    const fixture = TestBed.createComponent(ArticlePageComponent);
    fixture.detectChanges();

    const text = (fixture.nativeElement.textContent as string).replace(/\s+/g, ' ').trim();
    expect(text).toContain('Noticia no encontrada');
    expect(text).toContain('Ir a portada');

    expect(fixture.nativeElement.querySelector('app-breaking-news')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-most-read-news')).toBeTruthy();
  });
});

function provideRouteId(id: string) {
  return {
    provide: ActivatedRoute,
    useValue: {
      paramMap: of(convertToParamMap({ id })),
    },
  };
}

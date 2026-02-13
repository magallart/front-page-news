import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';

import { SectionPageComponent } from './section-page.component';

describe('SectionPageComponent', () => {
  it('renders section news cards filtered by slug', async () => {
    await TestBed.configureTestingModule({
      imports: [SectionPageComponent],
      providers: [provideRouter([]), provideRouteSlug('economia')],
    }).compileComponents();

    const fixture = TestBed.createComponent(SectionPageComponent);
    fixture.detectChanges();

    const heading = fixture.nativeElement.querySelector('h1.sr-only') as HTMLElement;
    expect(heading.textContent?.trim()).toBe('Economia');

    const cards = fixture.nativeElement.querySelectorAll('app-news-card');
    expect(cards.length).toBe(3);

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Los mercados abren con subidas moderadas en Europa');
  });

  it('renders an empty state when section has no news', async () => {
    await TestBed.configureTestingModule({
      imports: [SectionPageComponent],
      providers: [provideRouter([]), provideRouteSlug('deportes')],
    }).compileComponents();

    const fixture = TestBed.createComponent(SectionPageComponent);
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('app-news-card');
    expect(cards.length).toBe(0);

    const errorState = fixture.nativeElement.querySelector('app-error-state');
    expect(errorState).toBeTruthy();

    const image = fixture.nativeElement.querySelector('img[src="/images/error.png"]') as HTMLImageElement;
    expect(image).toBeTruthy();

    const text = (fixture.nativeElement.textContent as string).replace(/\s+/g, ' ').trim();
    expect(text).toContain('Algo ha salido mal...');
    expect(text).toContain('Nuestros periodistas están peleándose con el WiFi. Vuelve en un momento.');
  });
});

function provideRouteSlug(slug: string) {
  return {
    provide: ActivatedRoute,
    useValue: {
      paramMap: of(convertToParamMap({ slug })),
    },
  };
}

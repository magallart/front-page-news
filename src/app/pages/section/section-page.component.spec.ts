import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';

import { SectionFiltersComponent } from '../../components/news/section-filters.component';

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

    const filters = fixture.nativeElement.querySelector('app-section-filters');
    expect(filters).toBeTruthy();
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

    const filters = fixture.nativeElement.querySelector('app-section-filters');
    expect(filters).toBeFalsy();

    const errorState = fixture.nativeElement.querySelector('app-error-state');
    expect(errorState).toBeTruthy();

    const image = fixture.nativeElement.querySelector('img[src="/images/error.png"]') as HTMLImageElement;
    expect(image).toBeTruthy();

    const text = (fixture.nativeElement.textContent as string).replace(/\s+/g, ' ').trim();
    expect(text).toContain('Algo ha salido mal...');
    expect(text).toContain('Nuestros periodistas están peleándose con el WiFi. Vuelve en un momento.');
  });

  it('filters section news by selected source', async () => {
    await TestBed.configureTestingModule({
      imports: [SectionPageComponent],
      providers: [provideRouter([]), provideRouteSlug('actualidad')],
    }).compileComponents();

    const fixture = TestBed.createComponent(SectionPageComponent);
    fixture.detectChanges();

    const filtersDebug = fixture.debugElement.query(By.directive(SectionFiltersComponent));
    const filters = filtersDebug.componentInstance as SectionFiltersComponent;

    filters.selectedSourcesChange.emit(['Mundo Diario']);
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('app-news-card');
    expect(cards.length).toBe(1);

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Actualidad internacional marcada por acuerdos energeticos');
  });

  it('sorts section news from oldest to newest', async () => {
    await TestBed.configureTestingModule({
      imports: [SectionPageComponent],
      providers: [provideRouter([]), provideRouteSlug('actualidad')],
    }).compileComponents();

    const fixture = TestBed.createComponent(SectionPageComponent);
    fixture.detectChanges();

    const filtersDebug = fixture.debugElement.query(By.directive(SectionFiltersComponent));
    const filters = filtersDebug.componentInstance as SectionFiltersComponent;

    filters.selectedSourcesChange.emit(filters.sources());
    filters.sortDirectionChange.emit('asc');
    fixture.detectChanges();

    const firstCard = fixture.nativeElement.querySelector('app-news-card') as HTMLElement;
    expect(firstCard.textContent).toContain('Tecnologia sanitaria acelera el diagnostico en centros publicos');
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

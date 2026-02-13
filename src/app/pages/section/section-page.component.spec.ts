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

    const toggle = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(toggle).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-icon-filter')).toBeTruthy();
    expect(toggle.textContent).toContain('Mostrar filtros');

    const filters = fixture.nativeElement.querySelector('app-section-filters');
    expect(filters).toBeFalsy();
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

    const toggle = fixture.nativeElement.querySelector('button');
    expect(toggle).toBeFalsy();

    const filters = fixture.nativeElement.querySelector('app-section-filters');
    expect(filters).toBeFalsy();

    const errorState = fixture.nativeElement.querySelector('app-error-state');
    expect(errorState).toBeTruthy();

    const image = fixture.nativeElement.querySelector('img[src="/images/error.png"]') as HTMLImageElement;
    expect(image).toBeTruthy();

    const text = (fixture.nativeElement.textContent as string).replace(/\s+/g, ' ').trim();
    expect(text).toContain('Algo ha salido mal...');
    expect(text).toContain('Nuestros periodistas');
    expect(text).toContain('WiFi. Vuelve en un momento.');
  });

  it('filters section news by selected source', async () => {
    await TestBed.configureTestingModule({
      imports: [SectionPageComponent],
      providers: [provideRouter([]), provideRouteSlug('actualidad')],
    }).compileComponents();

    const fixture = TestBed.createComponent(SectionPageComponent);
    fixture.detectChanges();

    openFiltersPanel(fixture);

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

    openFiltersPanel(fixture);

    const filtersDebug = fixture.debugElement.query(By.directive(SectionFiltersComponent));
    const filters = filtersDebug.componentInstance as SectionFiltersComponent;

    filters.selectedSourcesChange.emit(filters.sources());
    filters.sortDirectionChange.emit('asc');
    fixture.detectChanges();

    const firstCard = fixture.nativeElement.querySelector('app-news-card') as HTMLElement;
    expect(firstCard.textContent).toContain('Tecnologia sanitaria acelera el diagnostico en centros publicos');
  });

  it('toggles filters panel open and close', async () => {
    await TestBed.configureTestingModule({
      imports: [SectionPageComponent],
      providers: [provideRouter([]), provideRouteSlug('actualidad')],
    }).compileComponents();

    const fixture = TestBed.createComponent(SectionPageComponent);
    fixture.detectChanges();

    const toggle = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(toggle.textContent).toContain('Mostrar filtros');
    expect(fixture.nativeElement.querySelector('app-section-filters')).toBeFalsy();

    toggle.click();
    fixture.detectChanges();
    expect(toggle.textContent).toContain('Ocultar filtros');
    expect(fixture.nativeElement.querySelector('app-section-filters')).toBeTruthy();

    toggle.click();
    fixture.detectChanges();
    expect(toggle.textContent).toContain('Mostrar filtros');
    expect(fixture.nativeElement.querySelector('app-section-filters')).toBeFalsy();
  });

  it('shows error state when all sources are cleared from filters', async () => {
    await TestBed.configureTestingModule({
      imports: [SectionPageComponent],
      providers: [provideRouter([]), provideRouteSlug('actualidad')],
    }).compileComponents();

    const fixture = TestBed.createComponent(SectionPageComponent);
    fixture.detectChanges();

    openFiltersPanel(fixture);

    const filtersDebug = fixture.debugElement.query(By.directive(SectionFiltersComponent));
    const filters = filtersDebug.componentInstance as SectionFiltersComponent;

    filters.selectedSourcesChange.emit([]);
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('app-news-card');
    const errorState = fixture.nativeElement.querySelector('app-error-state');

    expect(cards.length).toBe(0);
    expect(errorState).toBeTruthy();
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

function openFiltersPanel(fixture: { nativeElement: HTMLElement; detectChanges: () => void }) {
  const toggle = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  toggle.click();
  fixture.detectChanges();
}

import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { SectionFiltersComponent } from './section-filters.component';

describe('SectionFiltersComponent', () => {
  it('renders sources and selection controls', async () => {
    await TestBed.configureTestingModule({
      imports: [SectionFiltersComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SectionFiltersComponent);
    fixture.componentRef.setInput('sources', ['Diario Uno', 'Diario Dos']);
    fixture.componentRef.setInput('selectedSources', ['Diario Uno']);
    fixture.componentRef.setInput('sortDirection', 'desc');
    fixture.detectChanges();

    const sourceCheckboxes = fixture.nativeElement.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    expect(sourceCheckboxes.length).toBe(2);
    expect(sourceCheckboxes[0]?.checked).toBe(true);
    expect(sourceCheckboxes[1]?.checked).toBe(false);

    const selectAll = fixture.nativeElement.querySelectorAll('button')[0] as HTMLButtonElement;
    const clearAll = fixture.nativeElement.querySelectorAll('button')[1] as HTMLButtonElement;
    expect(selectAll.textContent).toContain('SELECCIONAR TODO');
    expect(clearAll.textContent).toContain('QUITAR TODO');

    const newestFirst = fixture.nativeElement.querySelector('input[type="radio"][value="desc"]') as HTMLInputElement;
    const oldestFirst = fixture.nativeElement.querySelector('input[type="radio"][value="asc"]') as HTMLInputElement;
    expect(newestFirst.checked).toBe(true);
    expect(oldestFirst.checked).toBe(false);
  });

  it('emits selectedSourcesChange when checking a source', async () => {
    await TestBed.configureTestingModule({
      imports: [SectionFiltersComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SectionFiltersComponent);
    fixture.componentRef.setInput('sources', ['Diario Uno', 'Diario Dos']);
    fixture.componentRef.setInput('selectedSources', ['Diario Uno']);
    fixture.componentRef.setInput('sortDirection', 'desc');
    fixture.detectChanges();

    const onSourcesChange = vi.fn();
    fixture.componentInstance.selectedSourcesChange.subscribe(onSourcesChange);

    const sourceCheckboxes = fixture.nativeElement.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    sourceCheckboxes[1]!.checked = true;
    sourceCheckboxes[1]!.dispatchEvent(new Event('change'));

    expect(onSourcesChange).toHaveBeenCalledWith(['Diario Uno', 'Diario Dos']);
  });

  it('emits selectedSourcesChange when unchecking a source', async () => {
    await TestBed.configureTestingModule({
      imports: [SectionFiltersComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SectionFiltersComponent);
    fixture.componentRef.setInput('sources', ['Diario Uno', 'Diario Dos']);
    fixture.componentRef.setInput('selectedSources', ['Diario Uno', 'Diario Dos']);
    fixture.componentRef.setInput('sortDirection', 'desc');
    fixture.detectChanges();

    const onSourcesChange = vi.fn();
    fixture.componentInstance.selectedSourcesChange.subscribe(onSourcesChange);

    const sourceCheckboxes = fixture.nativeElement.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    sourceCheckboxes[0]!.checked = false;
    sourceCheckboxes[0]!.dispatchEvent(new Event('change'));

    expect(onSourcesChange).toHaveBeenCalledWith(['Diario Dos']);
  });

  it('does not emit duplicate sources when selecting an already selected source', async () => {
    await TestBed.configureTestingModule({
      imports: [SectionFiltersComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SectionFiltersComponent);
    fixture.componentRef.setInput('sources', ['Diario Uno', 'Diario Dos']);
    fixture.componentRef.setInput('selectedSources', ['Diario Uno']);
    fixture.componentRef.setInput('sortDirection', 'desc');
    fixture.detectChanges();

    const onSourcesChange = vi.fn();
    fixture.componentInstance.selectedSourcesChange.subscribe(onSourcesChange);

    (fixture.componentInstance as unknown as { onSourceToggle: (source: string, event: Event) => void }).onSourceToggle(
      'Diario Uno',
      { target: { checked: true } } as unknown as Event,
    );

    expect(onSourcesChange).toHaveBeenCalledWith(['Diario Uno']);
  });

  it('emits sortDirectionChange when selecting oldest first', async () => {
    await TestBed.configureTestingModule({
      imports: [SectionFiltersComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SectionFiltersComponent);
    fixture.componentRef.setInput('sources', ['Diario Uno', 'Diario Dos']);
    fixture.componentRef.setInput('selectedSources', ['Diario Uno']);
    fixture.componentRef.setInput('sortDirection', 'desc');
    fixture.detectChanges();

    const onSortChange = vi.fn();
    fixture.componentInstance.sortDirectionChange.subscribe(onSortChange);

    const oldestFirst = fixture.nativeElement.querySelector('input[type="radio"][value="asc"]') as HTMLInputElement;
    oldestFirst.dispatchEvent(new Event('change'));

    expect(onSortChange).toHaveBeenCalledWith('asc');
  });

  it('emits all sources when clicking select all', async () => {
    await TestBed.configureTestingModule({
      imports: [SectionFiltersComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SectionFiltersComponent);
    fixture.componentRef.setInput('sources', ['Diario Uno', 'Diario Dos']);
    fixture.componentRef.setInput('selectedSources', ['Diario Uno']);
    fixture.componentRef.setInput('sortDirection', 'desc');
    fixture.detectChanges();

    const onSourcesChange = vi.fn();
    fixture.componentInstance.selectedSourcesChange.subscribe(onSourcesChange);

    const selectAll = fixture.nativeElement.querySelectorAll('button')[0] as HTMLButtonElement;
    selectAll.click();

    expect(onSourcesChange).toHaveBeenCalledWith(['Diario Uno', 'Diario Dos']);
  });

  it('emits empty source list when clicking clear all', async () => {
    await TestBed.configureTestingModule({
      imports: [SectionFiltersComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SectionFiltersComponent);
    fixture.componentRef.setInput('sources', ['Diario Uno', 'Diario Dos']);
    fixture.componentRef.setInput('selectedSources', ['Diario Uno']);
    fixture.componentRef.setInput('sortDirection', 'desc');
    fixture.detectChanges();

    const onSourcesChange = vi.fn();
    fixture.componentInstance.selectedSourcesChange.subscribe(onSourcesChange);

    const clearAll = fixture.nativeElement.querySelectorAll('button')[1] as HTMLButtonElement;
    clearAll.click();

    expect(onSourcesChange).toHaveBeenCalledWith([]);
  });

  it('renders no source checkboxes when sources input is empty', async () => {
    await TestBed.configureTestingModule({
      imports: [SectionFiltersComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SectionFiltersComponent);
    fixture.componentRef.setInput('sources', []);
    fixture.componentRef.setInput('selectedSources', []);
    fixture.componentRef.setInput('sortDirection', 'desc');
    fixture.detectChanges();

    const sourceCheckboxes = fixture.nativeElement.querySelectorAll('input[type="checkbox"]');
    expect(sourceCheckboxes.length).toBe(0);
  });
});

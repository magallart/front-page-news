import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { SectionFiltersComponent } from './section-filters.component';

describe('SectionFiltersComponent', () => {
  it('renders sources and emits source + sort changes', async () => {
    await TestBed.configureTestingModule({
      imports: [SectionFiltersComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SectionFiltersComponent);
    fixture.componentRef.setInput('sources', ['Diario Uno', 'Diario Dos']);
    fixture.componentRef.setInput('selectedSources', ['Diario Uno']);
    fixture.componentRef.setInput('sortDirection', 'desc');
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const onSourcesChange = vi.fn();
    const onSortChange = vi.fn();
    component.selectedSourcesChange.subscribe(onSourcesChange);
    component.sortDirectionChange.subscribe(onSortChange);

    const sourceCheckboxes = fixture.nativeElement.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    expect(sourceCheckboxes.length).toBe(2);
    expect(sourceCheckboxes[0]?.checked).toBe(true);
    expect(sourceCheckboxes[1]?.checked).toBe(false);

    sourceCheckboxes[1]!.checked = true;
    sourceCheckboxes[1]!.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(onSourcesChange).toHaveBeenCalledWith(['Diario Uno', 'Diario Dos']);

    const oldestFirst = fixture.nativeElement.querySelector('input[type="radio"][value="asc"]') as HTMLInputElement;
    oldestFirst.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(onSortChange).toHaveBeenCalledWith('asc');
  });
});

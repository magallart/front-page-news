import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { SourceSectionFiltersComponent } from './source-section-filters.component';

describe('SourceSectionFiltersComponent', () => {
  it('renders section checkboxes and sort controls', async () => {
    await TestBed.configureTestingModule({
      imports: [SourceSectionFiltersComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SourceSectionFiltersComponent);
    fixture.componentRef.setInput('sections', ['actualidad', 'cultura']);
    fixture.componentRef.setInput('selectedSections', ['actualidad']);
    fixture.componentRef.setInput('sortDirection', 'desc');
    fixture.detectChanges();

    const checkboxes = fixture.nativeElement.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    expect(checkboxes.length).toBe(2);
    expect(checkboxes[0]?.checked).toBe(true);
    expect(checkboxes[1]?.checked).toBe(false);

    const newestFirst = fixture.nativeElement.querySelector('input[type="radio"][value="desc"]') as HTMLInputElement;
    const oldestFirst = fixture.nativeElement.querySelector('input[type="radio"][value="asc"]') as HTMLInputElement;
    expect(newestFirst.checked).toBe(true);
    expect(oldestFirst.checked).toBe(false);
  });

  it('emits selected sections when toggling a checkbox', async () => {
    await TestBed.configureTestingModule({
      imports: [SourceSectionFiltersComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SourceSectionFiltersComponent);
    fixture.componentRef.setInput('sections', ['actualidad', 'cultura']);
    fixture.componentRef.setInput('selectedSections', ['actualidad']);
    fixture.componentRef.setInput('sortDirection', 'desc');
    fixture.detectChanges();

    const onSectionsChange = vi.fn();
    fixture.componentInstance.selectedSectionsChange.subscribe(onSectionsChange);

    const checkboxes = fixture.nativeElement.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    checkboxes[1]!.checked = true;
    checkboxes[1]!.dispatchEvent(new Event('change'));

    expect(onSectionsChange).toHaveBeenCalledWith(['actualidad', 'cultura']);
  });

  it('emits empty selection when clear all is pressed', async () => {
    await TestBed.configureTestingModule({
      imports: [SourceSectionFiltersComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SourceSectionFiltersComponent);
    fixture.componentRef.setInput('sections', ['actualidad', 'cultura']);
    fixture.componentRef.setInput('selectedSections', ['actualidad']);
    fixture.componentRef.setInput('sortDirection', 'desc');
    fixture.detectChanges();

    const onSectionsChange = vi.fn();
    fixture.componentInstance.selectedSectionsChange.subscribe(onSectionsChange);

    const clearAll = fixture.nativeElement.querySelectorAll('button')[1] as HTMLButtonElement;
    clearAll.click();

    expect(onSectionsChange).toHaveBeenCalledWith([]);
  });

  it('emits all sections when select all is pressed', async () => {
    await TestBed.configureTestingModule({
      imports: [SourceSectionFiltersComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SourceSectionFiltersComponent);
    fixture.componentRef.setInput('sections', ['actualidad', 'cultura']);
    fixture.componentRef.setInput('selectedSections', []);
    fixture.componentRef.setInput('sortDirection', 'desc');
    fixture.detectChanges();

    const onSectionsChange = vi.fn();
    fixture.componentInstance.selectedSectionsChange.subscribe(onSectionsChange);

    const selectAll = fixture.nativeElement.querySelectorAll('button')[0] as HTMLButtonElement;
    selectAll.click();

    expect(onSectionsChange).toHaveBeenCalledWith(['actualidad', 'cultura']);
  });

  it('emits sort direction changes', async () => {
    await TestBed.configureTestingModule({
      imports: [SourceSectionFiltersComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SourceSectionFiltersComponent);
    fixture.componentRef.setInput('sections', ['actualidad', 'cultura']);
    fixture.componentRef.setInput('selectedSections', ['actualidad']);
    fixture.componentRef.setInput('sortDirection', 'desc');
    fixture.detectChanges();

    const onSortChange = vi.fn();
    fixture.componentInstance.sortDirectionChange.subscribe(onSortChange);

    const oldestFirst = fixture.nativeElement.querySelector('input[type="radio"][value="asc"]') as HTMLInputElement;
    oldestFirst.dispatchEvent(new Event('change'));

    expect(onSortChange).toHaveBeenCalledWith('asc');
  });
});

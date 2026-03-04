import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { MostReadSkeletonComponent } from './most-read-skeleton.component';

describe('MostReadSkeletonComponent', () => {
  it('renders default most-read skeleton with ten items', async () => {
    await TestBed.configureTestingModule({
      imports: [MostReadSkeletonComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(MostReadSkeletonComponent);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('ol > li');
    const text = fixture.nativeElement.textContent as string;

    expect(rows.length).toBe(10);
    expect(text).toContain('Lo más leído');
  });

  it('respects custom itemCount input', async () => {
    await TestBed.configureTestingModule({
      imports: [MostReadSkeletonComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(MostReadSkeletonComponent);
    fixture.componentRef.setInput('itemCount', 3);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('ol > li');
    expect(rows.length).toBe(3);
  });
});


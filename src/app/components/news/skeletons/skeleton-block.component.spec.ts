import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { SkeletonBlockComponent } from './skeleton-block.component';

describe('SkeletonBlockComponent', () => {
  it('uses default size and radius classes', async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonBlockComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SkeletonBlockComponent);
    fixture.detectChanges();

    const block = fixture.nativeElement.querySelector('.fp-skeleton-block') as HTMLDivElement;
    expect(block.className).toContain('w-full');
    expect(block.className).toContain('h-4');
    expect(block.className).toContain('rounded-sm');
  });

  it('applies custom classes from inputs', async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonBlockComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SkeletonBlockComponent);
    fixture.componentRef.setInput('widthClass', 'w-28');
    fixture.componentRef.setInput('heightClass', 'h-3');
    fixture.componentRef.setInput('radiusClass', 'rounded-lg');
    fixture.componentRef.setInput('extraClass', 'ml-auto');
    fixture.detectChanges();

    const block = fixture.nativeElement.querySelector('.fp-skeleton-block') as HTMLDivElement;
    expect(block.className).toContain('w-28');
    expect(block.className).toContain('h-3');
    expect(block.className).toContain('rounded-lg');
    expect(block.className).toContain('ml-auto');
  });
});


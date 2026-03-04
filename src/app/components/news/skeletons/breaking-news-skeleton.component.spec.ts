import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { BreakingNewsSkeletonComponent } from './breaking-news-skeleton.component';

describe('BreakingNewsSkeletonComponent', () => {
  it('renders four breaking-news rows and default heading', async () => {
    await TestBed.configureTestingModule({
      imports: [BreakingNewsSkeletonComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(BreakingNewsSkeletonComponent);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('ul > li');
    const text = fixture.nativeElement.textContent as string;

    expect(rows.length).toBe(4);
    expect(text).toContain('En directo');
  });

  it('supports custom title input', async () => {
    await TestBed.configureTestingModule({
      imports: [BreakingNewsSkeletonComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(BreakingNewsSkeletonComponent);
    fixture.componentRef.setInput('title', 'Ultima hora');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent as string).toContain('Ultima hora');
  });
});


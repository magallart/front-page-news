import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { NewsCarouselSkeletonComponent } from './news-carousel-skeleton.component';

describe('NewsCarouselSkeletonComponent', () => {
  it('renders hero skeleton placeholders with highlighted section label', async () => {
    await TestBed.configureTestingModule({
      imports: [NewsCarouselSkeletonComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(NewsCarouselSkeletonComponent);
    fixture.detectChanges();

    const section = fixture.nativeElement.querySelector('section[aria-label="Destacadas"]');
    const blocks = fixture.nativeElement.querySelectorAll('.fp-skeleton-block');

    expect(section).toBeTruthy();
    expect(blocks.length).toBeGreaterThan(7);
  });
});


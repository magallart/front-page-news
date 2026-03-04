import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { NewsCardSkeletonComponent } from './news-card-skeleton.component';

describe('NewsCardSkeletonComponent', () => {
  it('renders structural placeholders for a news card', async () => {
    await TestBed.configureTestingModule({
      imports: [NewsCardSkeletonComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(NewsCardSkeletonComponent);
    fixture.detectChanges();

    const article = fixture.nativeElement.querySelector('article');
    const blocks = fixture.nativeElement.querySelectorAll('.fp-skeleton-block');

    expect(article).toBeTruthy();
    expect(blocks.length).toBeGreaterThan(8);
  });
});


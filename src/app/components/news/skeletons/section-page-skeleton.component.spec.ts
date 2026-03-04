import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { SectionPageSkeletonComponent } from './section-page-skeleton.component';

describe('SectionPageSkeletonComponent', () => {
  it('renders default section skeleton with 24 news cards', async () => {
    await TestBed.configureTestingModule({
      imports: [SectionPageSkeletonComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SectionPageSkeletonComponent);
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('app-news-card-skeleton');
    const filterIcon = fixture.nativeElement.querySelector('app-icon-filter');
    const eyeIcon = fixture.nativeElement.querySelector('app-icon-eye');

    expect(cards.length).toBe(24);
    expect(filterIcon).toBeTruthy();
    expect(eyeIcon).toBeTruthy();
  });

  it('uses cardCount input to adjust amount of placeholders', async () => {
    await TestBed.configureTestingModule({
      imports: [SectionPageSkeletonComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SectionPageSkeletonComponent);
    fixture.componentRef.setInput('cardCount', 8);
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('app-news-card-skeleton');
    expect(cards.length).toBe(8);
  });
});


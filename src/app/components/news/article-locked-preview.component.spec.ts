import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { ArticleLockedPreviewComponent } from './article-locked-preview.component';

describe('ArticleLockedPreviewComponent', () => {
  it('renders a blurred locked preview skeleton with exactly 2 paragraphs', async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleLockedPreviewComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ArticleLockedPreviewComponent);
    fixture.detectChanges();

    const container = fixture.nativeElement.querySelector('div[aria-label="Contenido bloqueado"]') as HTMLElement;
    expect(container).toBeTruthy();

    const paragraphs = fixture.nativeElement.querySelectorAll('div.space-y-3');
    const lockedParagraphCount = paragraphs.length;
    expect(lockedParagraphCount).toBe(2);

    const lines = fixture.nativeElement.querySelectorAll('div.skeleton-line');
    expect(lines.length).toBeGreaterThanOrEqual(8);

    const blurredContainer = fixture.nativeElement.querySelector('.blur-\\[4px\\]') as HTMLElement;
    expect(blurredContainer).toBeTruthy();
  });
});

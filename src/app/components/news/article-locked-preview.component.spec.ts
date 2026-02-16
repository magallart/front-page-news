import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { ArticleLockedPreviewComponent } from './article-locked-preview.component';

describe('ArticleLockedPreviewComponent', () => {
  it('renders a blurred locked preview with 2 to 3 random paragraphs', async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleLockedPreviewComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ArticleLockedPreviewComponent);
    fixture.detectChanges();

    const container = fixture.nativeElement.querySelector('div[aria-label="Contenido bloqueado"]') as HTMLElement;
    expect(container).toBeTruthy();

    const paragraphs = fixture.nativeElement.querySelectorAll('p');
    const lockedParagraphCount = paragraphs.length;
    expect(lockedParagraphCount).toBeGreaterThanOrEqual(2);
    expect(lockedParagraphCount).toBeLessThanOrEqual(3);

    const blurredContainer = fixture.nativeElement.querySelector('.blur-\\[4px\\]') as HTMLElement;
    expect(blurredContainer).toBeTruthy();
  });
});

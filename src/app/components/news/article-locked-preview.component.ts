import { ChangeDetectionStrategy, Component } from '@angular/core';

import { LOCKED_PREVIEW_LINE_PATTERNS } from '../../mocks/article-locked-preview.mock';

@Component({
  selector: 'app-article-locked-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative" aria-label="Contenido bloqueado">
      <div class="space-y-6 blur-[4px] select-none" aria-hidden="true">
        @for (paragraphLines of lockedParagraphs; track $index) {
          <div class="space-y-3">
            @for (lineWidth of paragraphLines; track $index) {
              <div class="skeleton-line h-4 rounded-sm bg-muted-foreground/35" [style.width.%]="lineWidth"></div>
            }
          </div>
        }
      </div>
      <div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/8 via-background/40 to-background/78"></div>
    </div>
  `,
})
export class ArticleLockedPreviewComponent {
  protected readonly lockedParagraphs = pickRandomParagraphs(LOCKED_PREVIEW_LINE_PATTERNS);
}

function pickRandomParagraphs(pool: readonly (readonly number[])[]): readonly (readonly number[])[] {
  const shuffled = [...pool];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const current = shuffled[index];
    shuffled[index] = shuffled[randomIndex];
    shuffled[randomIndex] = current;
  }

  const paragraphCount = 2;
  return shuffled.slice(0, paragraphCount);
}

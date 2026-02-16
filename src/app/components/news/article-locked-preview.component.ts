import { ChangeDetectionStrategy, Component } from '@angular/core';

import { LOCKED_PREVIEW_PARAGRAPHS } from '../../mocks/article-locked-preview.mock';

@Component({
  selector: 'app-article-locked-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative" aria-label="Contenido bloqueado">
      <div class="font-editorial-body space-y-5 text-lg leading-8 text-muted-foreground blur-[4px] select-none">
        @for (paragraph of lockedParagraphs; track paragraph) {
          <p>{{ paragraph }}</p>
        }
      </div>
      <div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/8 via-background/40 to-background/78"></div>
    </div>
  `,
})
export class ArticleLockedPreviewComponent {
  protected readonly lockedParagraphs = pickRandomParagraphs(LOCKED_PREVIEW_PARAGRAPHS);
}

function pickRandomParagraphs(pool: readonly string[]): readonly string[] {
  const shuffled = [...pool];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const current = shuffled[index];
    shuffled[index] = shuffled[randomIndex];
    shuffled[randomIndex] = current;
  }

  const paragraphCount = Math.floor(Math.random() * 2) + 2;
  return shuffled.slice(0, paragraphCount);
}

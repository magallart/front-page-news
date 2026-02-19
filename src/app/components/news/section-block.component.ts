import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { NewsCardComponent } from './news-card.component';

import type { NewsItem } from '../../interfaces/news-item.interface';

@Component({
  selector: 'app-section-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
  imports: [NewsCardComponent],
  template: `
    <section>
      <div class="grid gap-4 md:grid-cols-3">
        @for (article of articles(); track article.id) {
          <app-news-card [article]="article" />
        }
      </div>
    </section>
  `,
})
export class SectionBlockComponent {
  readonly articles = input<readonly NewsItem[]>([]);
}

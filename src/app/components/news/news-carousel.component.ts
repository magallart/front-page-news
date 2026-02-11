import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { NewsCardComponent } from './news-card.component';

import type { NewsItem } from '../../interfaces/news-item.interface';

@Component({
  selector: 'app-news-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NewsCardComponent],
  template: `
    <section class="space-y-4">
      <header class="flex items-center justify-between gap-3">
        <h2 class="font-heading text-2xl font-semibold tracking-tight">{{ title() }}</h2>
        <p class="text-sm text-muted-foreground">{{ articles().length }} noticias</p>
      </header>

      <div class="grid gap-4 md:grid-cols-2">
        @for (article of articles(); track article.id) {
          <app-news-card [article]="article" [showSummary]="false" />
        }
      </div>
    </section>
  `,
})
export class NewsCarouselComponent {
  readonly title = input('Destacadas');
  readonly articles = input<readonly NewsItem[]>([]);
}

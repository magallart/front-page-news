import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NewsCardComponent } from './news-card.component';

import type { NewsItem } from '../../interfaces/news-item.interface';

@Component({
  selector: 'app-section-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NewsCardComponent],
  template: `
    <section class="space-y-4">
      <header class="flex items-center justify-between gap-3">
        <h2 class="font-heading text-2xl font-semibold tracking-tight">{{ title() }}</h2>
        <a
          class="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          [routerLink]="['/seccion', sectionSlug()]"
        >
          Ver seccion
        </a>
      </header>

      <div class="grid gap-4 md:grid-cols-3">
        @for (article of articles(); track article.id) {
          <app-news-card [article]="article" />
        }
      </div>
    </section>
  `,
})
export class SectionBlockComponent {
  readonly title = input.required<string>();
  readonly sectionSlug = input.required<string>();
  readonly articles = input<readonly NewsItem[]>([]);
}

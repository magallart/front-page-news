import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NewsCardComponent } from './news-card.component';

import type { NewsItem } from '../../interfaces/news-item.interface';

@Component({
  selector: 'app-current-affairs-block',
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

      <div class="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        @if (leadArticle(); as lead) {
          <app-news-card [article]="lead" />
        }

        <aside class="rounded-lg border border-border bg-card p-4 shadow-subtle">
          <h3 class="font-heading text-lg font-semibold">Ultima hora</h3>
          <ul class="mt-4 space-y-4">
            @for (article of secondaryArticles(); track article.id) {
              <li class="border-b border-border pb-4 last:border-b-0 last:pb-0">
                <a
                  class="text-sm font-medium leading-5 text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  [routerLink]="['/noticia', article.id]"
                >
                  {{ article.title }}
                </a>
                <p class="mt-1 text-xs text-muted-foreground">{{ article.source }} · {{ article.publishedAt }}</p>
              </li>
            }
          </ul>
        </aside>
      </div>
    </section>
  `,
})
export class CurrentAffairsBlockComponent {
  readonly title = input('Actualidad');
  readonly sectionSlug = input('actualidad');
  readonly articles = input<readonly NewsItem[]>([]);

  protected readonly leadArticle = computed(() => this.articles().at(0));
  protected readonly secondaryArticles = computed(() => this.articles().slice(1, 5));
}

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconArrowRightComponent } from '../icons/icon-arrow-right.component';

import { NewsCardComponent } from './news-card.component';

import type { NewsItem } from '../../interfaces/news-item.interface';

@Component({
  selector: 'app-current-news-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NewsCardComponent, IconArrowRightComponent],
  template: `
    <section class="space-y-4">
      <header class="flex items-center justify-between gap-3">
        <h2 class="font-editorial-title text-2xl font-semibold tracking-tight">{{ title() }}</h2>
        <a
          class="font-editorial-body inline-flex items-center gap-1 text-sm font-medium text-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          [routerLink]="['/seccion', sectionSlug()]"
        >
          <span class="underline decoration-secondary underline-offset-4 hover:decoration-primary">Ver más</span>
          <span class="inline-flex items-center"><app-icon-arrow-right /></span>
        </a>
      </header>

      <div class="grid gap-4">
        @if (leadArticle(); as lead) {
          <app-news-card [article]="lead" />
        }

        <div class="grid gap-4 md:grid-cols-3">
          @for (article of secondaryArticles(); track article.id) {
            <app-news-card [article]="article" />
          }
        </div>
      </div>

    </section>
  `,
})
export class CurrentNewsBlockComponent {
  readonly title = input('Actualidad');
  readonly sectionSlug = input('actualidad');
  readonly articles = input<readonly NewsItem[]>([]);

  protected readonly leadArticle = computed(() => this.articles().at(0));
  protected readonly secondaryArticles = computed(() => this.articles().slice(1, 4));
}

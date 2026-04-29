import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { formatTime24 } from '../../utils/date-formatting';
import { buildSourceRoute } from '../../utils/source-routing';
import { IconTrendingUpComponent } from '../icons/icon-trending-up.component';

import type { NewsItem } from '../../interfaces/news-item.interface';

@Component({
  selector: 'app-most-read-news',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconTrendingUpComponent, RouterLink],
  template: `
    <section class="rounded-xl bg-secondary px-4 py-5 text-secondary-foreground shadow-subtle sm:px-5" id="most-read-news">
      <header class="mb-4 border-b border-primary/35 pb-3">
        <h2 class="font-editorial-title inline-flex items-center gap-2 text-2xl font-semibold tracking-tight">
          {{ title() }}
          <app-icon-trending-up />
        </h2>
      </header>

      <ol class="space-y-3">
        @for (item of items(); track item.id; let index = $index) {
          <li class="flex gap-3 border-b border-secondary-foreground/20 pb-3 last:border-b-0 last:pb-0">
            <span class="mt-0.5 w-6 shrink-0 text-sm font-semibold text-primary">{{ index + 1 }}</span>

            <div class="min-w-0 space-y-1">
              <button
                type="button"
                class="font-editorial-title line-clamp-2 block text-left text-lg font-medium leading-6 text-secondary-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
                (click)="onPreviewRequest($event, item)"
              >
                {{ item.title }}
              </button>
              <p class="font-editorial-body text-xs uppercase tracking-[0.08em] text-secondary-foreground/70">
                <a
                  class="underline decoration-transparent underline-offset-4 transition hover:text-primary hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
                  [routerLink]="buildSourceRoute(item.sourceId, item.source)"
                  [attr.aria-label]="'Ver noticias de ' + item.source"
                >
                  {{ item.source }}
                </a>
                <span aria-hidden="true"> - </span>
                <span>{{ getPublishedTime(item.publishedAt) }}</span>
              </p>
            </div>
          </li>
        }
      </ol>
    </section>
  `,
})
export class MostReadNewsComponent {
  readonly title = input('Lo m\u00E1s le\u00EDdo');
  readonly items = input<readonly NewsItem[]>([]);
  readonly previewRequested = output<NewsItem>();
  protected readonly buildSourceRoute = buildSourceRoute;

  protected getPublishedTime(publishedAt: string): string {
    return formatTime24(new Date(publishedAt));
  }

  protected onPreviewRequest(event: Event, item: NewsItem): void {
    event.preventDefault();
    this.previewRequested.emit(item);
  }
}

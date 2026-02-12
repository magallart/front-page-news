import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { NewsItem } from '../../interfaces/news-item.interface';

@Component({
  selector: 'app-most-read-news',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="rounded-xl px-4 py-5 shadow-subtle sm:px-5" id="most-read-news">
      <header class="mb-4 border-b border-primary/35 pb-3">
        <h2 class="font-editorial-title text-2xl font-semibold tracking-tight">{{ title() }}</h2>
      </header>

      <ol class="space-y-3">
        @for (item of items(); track item.id; let index = $index) {
          <li class="flex gap-3 border-b border-primary/25 pb-3 last:border-b-0 last:pb-0">
            <span class="mt-0.5 w-6 shrink-0 text-sm font-semibold text-primary">{{ index + 1 }}</span>

            <div class="min-w-0 space-y-1">
              <a
                class="font-editorial-title line-clamp-2 text-lg font-medium leading-6 text-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                [routerLink]="['/noticia', item.id]"
              >
                {{ item.title }}
              </a>
              <p class="font-editorial-body text-xs uppercase tracking-[0.08em] text-muted-foreground">
                {{ item.source }} - {{ getPublishedTime(item.publishedAt) }}
              </p>
            </div>
          </li>
        }
      </ol>
    </section>
  `,
})
export class MostReadNewsComponent {
  readonly title = input('Lo mas leido');
  readonly items = input<readonly NewsItem[]>([]);

  protected getPublishedTime(publishedAt: string): string {
    const date = new Date(publishedAt);
    if (Number.isNaN(date.getTime())) {
      return '--:--';
    }

    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  }
}

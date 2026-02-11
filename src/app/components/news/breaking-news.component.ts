import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { NewsItem } from '../../interfaces/news-item.interface';

@Component({
  selector: 'app-breaking-news',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="rounded-lg border border-border bg-card p-4 shadow-subtle">
      <header class="mb-4">
        <h2 class="font-heading text-2xl font-semibold tracking-tight">{{ title() }}</h2>
      </header>

      <ul class="space-y-4">
        @for (item of items(); track item.id) {
          <li class="border-b border-border pb-4 last:border-b-0 last:pb-0">
            <a
              class="text-sm font-medium leading-5 text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              [routerLink]="['/noticia', item.id]"
            >
              {{ item.title }}
            </a>
            <p class="mt-1 text-xs text-muted-foreground">{{ item.source }} · {{ item.publishedAt }}</p>
          </li>
        }
      </ul>
    </section>
  `,
})
export class BreakingNewsComponent {
  readonly title = input('Ultima hora');
  readonly items = input<readonly NewsItem[]>([]);
}

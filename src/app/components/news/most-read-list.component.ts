import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { NewsItem } from '../../interfaces/news-item.interface';

@Component({
  selector: 'app-most-read-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="rounded-lg border border-border bg-card p-4 shadow-subtle">
      <header class="mb-4">
        <h2 class="font-editorial-title text-2xl font-semibold tracking-tight">{{ title() }}</h2>
      </header>

      <ol class="space-y-4">
        @for (item of items(); track item.id; let index = $index) {
          <li class="flex gap-3">
            <span class="mt-0.5 w-6 shrink-0 text-sm font-semibold text-primary">{{ index + 1 }}</span>

            <div class="min-w-0 space-y-1">
              <a
                class="font-editorial-body line-clamp-2 text-sm font-medium leading-5 text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                [routerLink]="['/noticia', item.id]"
              >
                {{ item.title }}
              </a>
              <p class="text-xs text-muted-foreground">{{ item.source }} · {{ item.publishedAt }}</p>
            </div>
          </li>
        }
      </ol>
    </section>
  `,
})
export class MostReadListComponent {
  readonly title = input('Lo mas leido');
  readonly items = input<readonly NewsItem[]>([]);
}

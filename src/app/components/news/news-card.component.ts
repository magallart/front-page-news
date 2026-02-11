import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { NewsItem } from '../../interfaces/news-item.interface';

@Component({
  selector: 'app-news-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <article class="overflow-hidden rounded-lg border border-border bg-card shadow-subtle">
      <div class="aspect-[16/10] w-full bg-muted">
        @if (article().imageUrl) {
          <img [src]="article().imageUrl" [alt]="article().title" class="h-full w-full object-cover" />
        } @else {
          <div class="flex h-full items-center justify-center text-sm text-muted-foreground">
            Imagen no disponible
          </div>
        }
      </div>

      <div class="space-y-3 p-4">
        <div class="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <a
            class="rounded px-1 py-0.5 uppercase tracking-wide hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            [routerLink]="['/seccion', article().section]"
          >
            {{ article().section }}
          </a>
          <span>{{ article().source }}</span>
        </div>

        <h3 class="font-heading text-lg font-semibold leading-tight tracking-tight">
          <a
            class="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            [routerLink]="['/noticia', article().id]"
          >
            {{ article().title }}
          </a>
        </h3>

        @if (showSummary()) {
          <p class="text-sm text-muted-foreground">
            {{ article().summary }}
          </p>
        }
      </div>
    </article>
  `,
})
export class NewsCardComponent {
  readonly article = input.required<NewsItem>();
  readonly showSummary = input(true);
}

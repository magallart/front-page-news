import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { NewsItem } from '../../interfaces/news-item.interface';

@Component({
  selector: 'app-news-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  styles: `
    .title-clamp {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .summary-clamp {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `,
  template: `
    <article
      class="group relative h-full overflow-hidden rounded-xl border border-border bg-card shadow-subtle transition duration-300 hover:shadow-medium"
    >
      <div class="absolute left-0 top-0 h-full w-1 bg-primary/60"></div>

      <div class="flex h-full flex-col gap-3 p-4 pl-5">
        <div class="flex items-center justify-between gap-3">
          <p
            class="inline-flex rounded-sm bg-primary px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-secondary"
          >
            {{ article().section }}
          </p>
          <p class="text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted-foreground">{{ article().source }}</p>
        </div>

        <a
          [routerLink]="['/noticia', article().id]"
          class="block overflow-hidden rounded-lg bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          @if (article().imageUrl) {
            <img
              [src]="article().imageUrl"
              [alt]="article().title"
              class="aspect-[16/9] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              loading="lazy"
            />
          } @else {
            <div class="flex aspect-[16/9] items-center justify-center text-sm text-muted-foreground">Imagen no disponible</div>
          }
        </a>

        <h3 class="font-editorial-title title-clamp text-xl font-semibold leading-[1.5rem] tracking-[0.01em]">
          <a
            class="transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            [routerLink]="['/noticia', article().id]"
          >
            {{ article().title }}
          </a>
        </h3>

        <p class="font-editorial-body summary-clamp text-sm leading-[1.2rem] text-muted-foreground">{{ article().summary }}</p>

        <p class="mt-auto text-[0.65rem] font-medium uppercase tracking-[0.08em] text-muted-foreground">{{ article().author }}</p>
      </div>
    </article>
  `,
})
export class NewsCardComponent {
  readonly article = input.required<NewsItem>();
}

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconNewsComponent } from '../icons/icon-news.component';

import type { NewsItem } from '../../interfaces/news-item.interface';

@Component({
  selector: 'app-breaking-news',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconNewsComponent],
  styles: `
    .breaking-title-clamp {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .live-dot {
      animation: livePulse 2.2s ease-in-out infinite;
      transform-origin: center;
    }

    @keyframes livePulse {
      0%,
      100% {
        opacity: 0.9;
        transform: scale(1);
      }
      50% {
        opacity: 0.55;
        transform: scale(0.86);
      }
    }
  `,
  template: `
    <section class="rounded-xl bg-card px-5 py-0 shadow-subtle sm:px-6 sm:py-0 lg:flex lg:h-[30rem] lg:flex-col" id="breaking-news">
      <header class="mb-3 flex items-center gap-3">
        <span class="live-dot inline-flex h-3 w-3 rounded-full bg-destructive"></span>
        <h2 class="text-lg font-semibold uppercase tracking-[0.22em] text-foreground">{{ title() }}</h2>
      </header>

      @if (visibleItems().length > 0) {
        <ul class="grid grow grid-rows-4">
          @for (item of visibleItems(); track item.id; let index = $index) {
            <li class="min-h-0 border-b-2 border-primary/60 py-3 last:border-b-0 lg:flex lg:flex-col lg:justify-center">
              <div class="flex items-center gap-3">
                <span class="inline-flex h-2.5 w-2.5 rounded-full bg-accent/50"></span>
                <p class="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {{ getTimestamp(index) }}
                </p>
              </div>
              <a
                class="breaking-title-clamp mt-1 block text-base font-medium leading-6 text-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                [routerLink]="['/noticia', item.id]"
              >
                {{ item.title }}
              </a>
            </li>
          }
        </ul>
      } @else {
        <p class="text-sm text-muted-foreground">No hay actualizaciones recientes.</p>
      }

      <a
        class="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-primary bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-secondary transition-colors duration-500 ease-out hover:border-secondary hover:bg-secondary hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        [routerLink]="coverageLink()"
      >
        <app-icon-news />
        Ver ultimas noticias
      </a>
    </section>
  `,
})
export class BreakingNewsComponent {
  readonly title = input('En directo');
  readonly items = input<readonly NewsItem[]>([]);
  readonly coverageLink = input('/seccion/actualidad');

  private readonly minuteMarks = [5, 12, 19, 31] as const;

  protected readonly visibleItems = computed(() => this.items().slice(0, 4));

  protected getTimestamp(index: number): string {
    const minutes = this.minuteMarks[index] ?? this.minuteMarks[this.minuteMarks.length - 1];
    return `Hace ${minutes} min`;
  }
}

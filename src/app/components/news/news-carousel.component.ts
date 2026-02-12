import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconChevronLeftComponent } from '../icons/icon-chevron-left.component';
import { IconChevronRightComponent } from '../icons/icon-chevron-right.component';
import { IconNewsComponent } from '../icons/icon-news.component';

import type { NewsItem } from '../../interfaces/news-item.interface';

@Component({
  selector: 'app-news-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconChevronLeftComponent, IconChevronRightComponent, IconNewsComponent],
  styles: `
    .hero-title-clamp {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

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
    @if (activeArticle(); as article) {
      <section
        class="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(19rem,1fr)] lg:items-stretch"
        [attr.aria-label]="title()"
      >
        <article
          class="group relative overflow-hidden rounded-xl border border-border bg-card shadow-subtle lg:h-[30rem]"
          data-testid="carousel-hero"
        >
          <a
            [routerLink]="['/noticia', article.id]"
            class="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <img
              [src]="article.imageUrl"
              [alt]="article.title"
              class="h-[16rem] w-full object-cover transition duration-500 group-hover:scale-[1.02] sm:h-[19rem] lg:h-full"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-secondary/95 via-secondary/65 to-transparent"></div>
            <div class="absolute inset-x-0 bottom-0 space-y-4 p-5 sm:p-7">
              <p
                class="inline-flex rounded-sm bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-secondary"
              >
                {{ article.section }}
              </p>
              <h2
                class="hero-title-clamp font-heading text-3xl font-semibold leading-tight text-primary-foreground sm:text-4xl lg:max-w-3xl"
              >
                {{ article.title }}
              </h2>
              <p class="max-w-2xl truncate text-sm leading-6 text-primary-foreground/90 sm:text-base">
                {{ article.summary }}
              </p>
              <p class="text-xs font-medium uppercase tracking-[0.08em] text-primary-foreground/90 sm:text-sm">
                Por {{ article.author }} - {{ article.publishedAt }}
              </p>
            </div>
          </a>

          @if (hasSlides()) {
            <div class="pointer-events-none absolute inset-0 flex items-center justify-between px-3 sm:px-4">
              <button
                type="button"
                class="pointer-events-auto inline-flex h-9 w-9 items-center justify-center text-primary-foreground transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                (click)="goToPrevious()"
                aria-label="Noticia anterior"
              >
                <app-icon-chevron-left />
              </button>

              <button
                type="button"
                class="pointer-events-auto inline-flex h-9 w-9 items-center justify-center text-primary-foreground transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                (click)="goToNext()"
                aria-label="Siguiente noticia"
              >
                <app-icon-chevron-right />
              </button>
            </div>
          }
        </article>

        <aside
          class="rounded-xl bg-card px-5 py-0 shadow-subtle sm:px-6 sm:py-0 lg:flex lg:h-[30rem] lg:flex-col"
          id="breaking-news"
          data-testid="breaking-panel"
        >
          <header class="mb-3 flex items-center gap-3">
            <span class="live-dot inline-flex h-3 w-3 rounded-full bg-destructive"></span>
            <h3 class="text-lg font-semibold uppercase tracking-[0.22em] text-foreground">{{ breakingTitle() }}</h3>
          </header>

          @if (visibleBreakingItems().length > 0) {
            <ul class="grid grow grid-rows-4">
              @for (item of visibleBreakingItems(); track item.id; let index = $index) {
                <li class="min-h-0 border-b-2 border-primary/60 py-3 last:border-b-0 lg:flex lg:flex-col lg:justify-center">
                  <div class="flex items-center gap-3">
                    <span class="inline-flex h-2.5 w-2.5 rounded-full bg-accent/50"></span>
                    <p class="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {{ getBreakingTimestamp(index) }}
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
        </aside>
      </section>
    } @else {
      <section class="rounded-lg border border-border bg-card p-4">
        <p class="text-sm text-muted-foreground">No hay noticias destacadas disponibles por ahora.</p>
      </section>
    }
  `,
})
export class NewsCarouselComponent {
  readonly title = input('Portada');
  readonly articles = input<readonly NewsItem[]>([]);
  readonly breakingTitle = input('En directo');
  readonly breakingItems = input<readonly NewsItem[]>([]);
  readonly coverageLink = input('/seccion/actualidad');

  private readonly activeSlideIndex = signal(0);
  private readonly rotationTimer = createRotationTimer(() => {
    this.goToNext();
  });
  private readonly breakingMinuteMarks = [5, 12, 19, 31, 45, 58] as const;

  protected readonly hasSlides = computed(() => this.articles().length > 1);
  protected readonly visibleBreakingItems = computed(() => this.breakingItems().slice(0, 4));
  protected readonly activeIndex = computed(() => {
    const totalSlides = this.articles().length;
    if (totalSlides === 0) {
      return 0;
    }

    return this.activeSlideIndex() % totalSlides;
  });
  protected readonly activeArticle = computed(() => this.articles()[this.activeIndex()]);

  protected goToPrevious(): void {
    this.rotateBy(-1);
  }

  protected goToNext(): void {
    this.rotateBy(1);
  }

  protected goToIndex(index: number): void {
    this.activeSlideIndex.set(index);
    this.rotationTimer.restart();
  }

  protected getBreakingTimestamp(index: number): string {
    const minutes = this.breakingMinuteMarks[index] ?? this.breakingMinuteMarks[this.breakingMinuteMarks.length - 1];
    return `Hace ${minutes} min`;
  }

  private rotateBy(step: number): void {
    const totalSlides = this.articles().length;
    if (totalSlides === 0) {
      return;
    }

    const nextIndex = (this.activeSlideIndex() + step + totalSlides) % totalSlides;
    this.activeSlideIndex.set(nextIndex);
    this.rotationTimer.restart();
  }
}

function createRotationTimer(onTick: () => void): { restart: () => void } {
  const destroyRef = inject(DestroyRef);
  const intervalMilliseconds = 5000;
  let timerId: ReturnType<typeof setInterval> | undefined;

  const restart = (): void => {
    if (timerId !== undefined) {
      clearInterval(timerId);
    }

    timerId = setInterval(() => {
      onTick();
    }, intervalMilliseconds);
  };

  restart();
  destroyRef.onDestroy(() => {
    if (timerId !== undefined) {
      clearInterval(timerId);
    }
  });

  return { restart };
}

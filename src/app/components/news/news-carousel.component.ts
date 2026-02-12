import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconChevronLeftComponent } from '../icons/icon-chevron-left.component';
import { IconChevronRightComponent } from '../icons/icon-chevron-right.component';

import type { NewsItem } from '../../interfaces/news-item.interface';

@Component({
  selector: 'app-news-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconChevronLeftComponent, IconChevronRightComponent],
  styles: `
    .hero-title-clamp {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `,
  template: `
    @if (activeArticle(); as article) {
      <section [attr.aria-label]="title()">
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
                class="font-editorial-title hero-title-clamp text-3xl font-semibold leading-tight text-primary-foreground sm:text-4xl lg:max-w-3xl"
              >
                {{ article.title }}
              </h2>
              <p class="font-editorial-body max-w-2xl truncate text-sm leading-6 text-primary-foreground/90 sm:text-base">
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

  private readonly activeSlideIndex = signal(0);
  private readonly rotationTimer = createRotationTimer(() => {
    this.goToNext();
  });

  protected readonly hasSlides = computed(() => this.articles().length > 1);
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

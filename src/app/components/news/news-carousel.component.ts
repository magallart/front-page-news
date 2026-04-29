import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { formatDateNumericWithDots, formatTime24 } from '../../utils/date-formatting';
import { createRestartableInterval } from '../../utils/restartable-interval';
import { buildSourceRoute } from '../../utils/source-routing';
import { IconChevronLeftComponent } from '../icons/icon-chevron-left.component';
import { IconChevronRightComponent } from '../icons/icon-chevron-right.component';

import type { NewsItem } from '../../interfaces/news-item.interface';

@Component({
  selector: 'app-news-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconChevronLeftComponent, IconChevronRightComponent, RouterLink],
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
          class="group relative h-[16rem] overflow-hidden rounded-xl border border-border bg-card shadow-subtle sm:h-[19rem] lg:h-[30rem]"
          data-testid="carousel-hero"
        >
          <div
            class="relative h-full w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            tabindex="0"
            role="button"
            [attr.aria-label]="'Abrir vista previa de ' + article.title"
            (click)="onPreviewRequest($event, article)"
            (keydown.enter)="onPreviewKeyboard($event, article)"
            (keydown.space)="onPreviewKeyboard($event, article)"
          >
          <img
            [src]="article.imageUrl"
            [alt]="article.title"
            class="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-secondary/95 via-secondary/65 to-transparent"></div>
          <div class="absolute inset-x-0 bottom-0 z-10 space-y-4 p-5 sm:p-7">
            <p
              class="pointer-events-none inline-flex rounded-sm bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-secondary"
            >
              {{ article.section }}
            </p>
            <h2
              class="pointer-events-none font-editorial-title hero-title-clamp text-3xl font-semibold leading-tight text-primary-foreground sm:text-4xl lg:max-w-3xl"
            >
              {{ article.title }}
            </h2>
            <p class="pointer-events-none font-editorial-body max-w-2xl truncate text-sm leading-6 text-primary-foreground/90 sm:text-base">
              {{ article.summary }}
            </p>
            <p
              class="grid grid-cols-[minmax(0,1.6fr)_auto_minmax(0,1fr)_auto_minmax(0,1.2fr)] items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-primary-foreground/90 sm:flex sm:items-center sm:gap-2 sm:text-sm"
            >
              <span class="pointer-events-none min-w-0 truncate sm:max-w-[16rem] lg:max-w-[20rem]">
                Por {{ article.author }}
              </span>
              <span aria-hidden="true" class="pointer-events-none shrink-0 text-primary-foreground/75">|</span>
              <a
                class="min-w-0 truncate underline decoration-transparent underline-offset-4 transition hover:text-primary hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                [routerLink]="buildSourceRoute(article.sourceId, article.source)"
                [attr.aria-label]="'Ver noticias de ' + article.source"
                (click)="$event.stopPropagation()"
              >
                {{ article.source }}
              </a>
              <span aria-hidden="true" class="pointer-events-none shrink-0 text-primary-foreground/75">|</span>
              <span class="pointer-events-none min-w-0 truncate text-right sm:shrink-0">
                {{ formatArticlePublishedAt(article.publishedAt) }}
              </span>
            </p>
          </div>
          </div>

          @if (hasSlides()) {
            <div class="pointer-events-none absolute inset-0 z-20 flex items-center justify-between px-3 sm:px-4">
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
  readonly previewRequested = output<NewsItem>();
  protected readonly buildSourceRoute = buildSourceRoute;

  private readonly activeSlideIndex = signal(0);
  private readonly rotationTimer = createRestartableInterval(() => {
    this.goToNext();
  }, 5000, { startOnCreate: false });
  private readonly rotationTimerSync = effect(() => {
    const totalSlides = this.articles().length;
    if (totalSlides > 1) {
      this.rotationTimer.restart();
      return;
    }

    this.rotationTimer.stop();
    this.activeSlideIndex.set(0);
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

  protected onPreviewRequest(event: Event, article: NewsItem): void {
    event.preventDefault();
    this.previewRequested.emit(article);
  }

  protected onPreviewKeyboard(event: Event, article: NewsItem): void {
    this.onPreviewRequest(event, article);
  }

  private rotateBy(step: number): void {
    const totalSlides = this.articles().length;
    if (totalSlides <= 1) {
      return;
    }

    const nextIndex = (this.activeSlideIndex() + step + totalSlides) % totalSlides;
    this.activeSlideIndex.set(nextIndex);
    this.rotationTimer.restart();
  }

  protected formatArticlePublishedAt(publishedAt: string): string {
    const date = new Date(publishedAt);
    const formattedDate = formatDateNumericWithDots(date);
    const formattedTime = formatTime24(date);

    return `${formattedTime} - ${formattedDate}`;
  }
}

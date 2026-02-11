import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, signal } from '@angular/core';

import { NewsCardComponent } from './news-card.component';

import type { NewsItem } from '../../interfaces/news-item.interface';

@Component({
  selector: 'app-news-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NewsCardComponent],
  template: `
    <section class="space-y-4">
      <header class="flex items-center justify-between gap-3">
        <div>
          <h2 class="font-heading text-2xl font-semibold tracking-tight">{{ title() }}</h2>
          <p class="text-sm text-muted-foreground">{{ articles().length }} noticias</p>
        </div>
      </header>

      @if (visibleArticles().length > 0) {
        <div class="space-y-3">
          <div class="grid gap-4 md:grid-cols-3">
            @for (article of visibleArticles(); track article.id) {
              <app-news-card [article]="article" [showSummary]="false" />
            }
          </div>

          @if (hasSlides()) {
            <div class="flex items-center justify-center gap-3">
              <button
                type="button"
                class="inline-flex items-center rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                (click)="goToPrevious()"
                aria-label="Noticia anterior"
              >
                <span aria-hidden="true">&larr;</span>
              </button>

              <div class="flex items-center gap-2">
                @for (item of articles(); track item.id; let index = $index) {
                  <button
                    type="button"
                    class="h-2.5 w-2.5 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    [class.bg-primary]="index === activeIndex()"
                    [class.bg-muted]="index !== activeIndex()"
                    (click)="goToIndex(index)"
                    [attr.aria-label]="'Ir a noticia ' + (index + 1)"
                  ></button>
                }
              </div>

              <button
                type="button"
                class="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                (click)="goToNext()"
                aria-label="Siguiente noticia"
              >
                <span aria-hidden="true">&rarr;</span>
              </button>
            </div>
          }
        </div>
      } @else {
        <p class="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          No hay noticias destacadas disponibles por ahora.
        </p>
      }
    </section>
  `,
})
export class NewsCarouselComponent {
  readonly title = input('Destacadas');
  readonly articles = input<readonly NewsItem[]>([]);

  private readonly activeSlideIndex = signal(0);
  private readonly rotationTimer = createRotationTimer(() => {
    this.goToNext();
  });
  private readonly visibleCardsCount = 3;

  protected readonly hasSlides = computed(() => this.articles().length > this.visibleCardsCount);
  protected readonly activeIndex = computed(() => {
    const totalSlides = this.articles().length;
    if (totalSlides === 0) {
      return 0;
    }

    return this.activeSlideIndex() % totalSlides;
  });
  protected readonly visibleArticles = computed(() => {
    const allArticles = this.articles();
    if (allArticles.length === 0) {
      return [];
    }

    if (allArticles.length <= this.visibleCardsCount) {
      return allArticles;
    }

    const startIndex = this.activeIndex();
    const result: NewsItem[] = [];

    for (let offset = 0; offset < this.visibleCardsCount; offset += 1) {
      const currentIndex = (startIndex + offset) % allArticles.length;
      const article = allArticles[currentIndex];
      if (article) {
        result.push(article);
      }
    }

    return result;
  });

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

import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SkeletonBlockComponent } from './skeleton-block.component';

@Component({
  selector: 'app-news-carousel-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonBlockComponent],
  template: `
    <section aria-label="Destacadas">
      <article class="group relative overflow-hidden rounded-xl border border-border bg-card shadow-subtle lg:h-[30rem]" data-testid="carousel-hero">
        <app-skeleton-block widthClass="w-full" heightClass="h-[16rem] sm:h-[19rem] lg:h-full" radiusClass="rounded-none" />
        <div class="absolute inset-0 bg-gradient-to-t from-secondary/95 via-secondary/65 to-transparent"></div>

        <div class="absolute inset-x-0 bottom-0 space-y-4 p-5 sm:p-7">
          <div class="inline-flex rounded-sm bg-primary px-3 py-1">
            <app-skeleton-block widthClass="w-20" heightClass="h-3" />
          </div>

          <div class="space-y-2">
            <app-skeleton-block widthClass="w-full" heightClass="h-8 sm:h-9" />
            <app-skeleton-block widthClass="w-10/12" heightClass="h-8 sm:h-9" />
          </div>

          <app-skeleton-block widthClass="w-11/12" heightClass="h-5" />

          <div class="grid grid-cols-[minmax(0,1.6fr)_auto_minmax(0,1fr)_auto_minmax(0,1.2fr)] items-center gap-2 sm:flex sm:items-center sm:gap-2">
            <app-skeleton-block widthClass="min-w-0" heightClass="h-4" extraClass="sm:max-w-[16rem] lg:max-w-[20rem]" />
            <span aria-hidden="true" class="shrink-0 text-primary-foreground/75">|</span>
            <app-skeleton-block widthClass="min-w-0" heightClass="h-4" />
            <span aria-hidden="true" class="shrink-0 text-primary-foreground/75">|</span>
            <app-skeleton-block widthClass="min-w-0" heightClass="h-4" />
          </div>
        </div>
      </article>
    </section>
  `,
})
export class NewsCarouselSkeletonComponent {}

import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BreakingNewsSkeletonComponent } from './breaking-news-skeleton.component';
import { MostReadSkeletonComponent } from './most-read-skeleton.component';
import { SkeletonBlockComponent } from './skeleton-block.component';

@Component({
  selector: 'app-article-page-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BreakingNewsSkeletonComponent, MostReadSkeletonComponent, SkeletonBlockComponent],
  template: `
    <section class="space-y-6 py-4 sm:space-y-8" aria-label="Cargando noticia" aria-busy="true">
      <div class="grid gap-5 lg:grid-cols-[minmax(0,2fr)_22rem] lg:items-start">
        <article class="space-y-6 sm:space-y-7">
          <header class="space-y-4">
            <div class="inline-flex rounded-sm bg-secondary px-2 py-1">
              <app-skeleton-block widthClass="w-20" heightClass="h-[0.65rem]" />
            </div>

            <div class="space-y-2">
              <app-skeleton-block widthClass="w-full" heightClass="h-10" />
              <app-skeleton-block widthClass="w-11/12" heightClass="h-10" />
              <app-skeleton-block widthClass="w-9/12" heightClass="h-10" />
            </div>

            <div class="pt-2 sm:pt-3">
              <dl class="grid grid-cols-3 gap-3 border-y-2 border-border py-4 text-sm">
                @for (item of metadataItems; track item) {
                  <div class="text-center lg:text-left">
                    <app-skeleton-block widthClass="w-14" heightClass="h-[0.65rem]" extraClass="mx-auto lg:mx-0" />
                    <app-skeleton-block widthClass="w-24" heightClass="h-4" extraClass="mt-1 mx-auto lg:mx-0" />
                  </div>
                }
              </dl>
            </div>
          </header>

          <div class="overflow-hidden rounded-xl border border-border bg-muted">
            <app-skeleton-block widthClass="w-full" heightClass="aspect-[16/9]" radiusClass="rounded-none" />
          </div>

          <div class="font-editorial-body space-y-5 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            <div class="space-y-3">
              <app-skeleton-block widthClass="w-full" heightClass="h-5" />
              <app-skeleton-block widthClass="w-11/12" heightClass="h-5" />
              <app-skeleton-block widthClass="w-10/12" heightClass="h-5" />
            </div>
            <div class="space-y-3">
              <app-skeleton-block widthClass="w-full" heightClass="h-5" />
              <app-skeleton-block widthClass="w-11/12" heightClass="h-5" />
              <app-skeleton-block widthClass="w-9/12" heightClass="h-5" />
            </div>
            <div class="space-y-3">
              <app-skeleton-block widthClass="w-full" heightClass="h-5" />
              <app-skeleton-block widthClass="w-10/12" heightClass="h-5" />
              <app-skeleton-block widthClass="w-8/12" heightClass="h-5" />
            </div>
          </div>

          <div class="mt-3 sm:mt-4">
            <div class="relative" aria-hidden="true">
              <div class="space-y-6 blur-[4px] select-none">
                @for (paragraph of lockedParagraphs; track paragraph) {
                  <div class="space-y-3">
                    <app-skeleton-block widthClass="w-full" heightClass="h-4" />
                    <app-skeleton-block widthClass="w-11/12" heightClass="h-4" />
                    <app-skeleton-block widthClass="w-9/12" heightClass="h-4" />
                  </div>
                }
              </div>
              <div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/8 via-background/40 to-background/78"></div>
            </div>
          </div>

          <div class="pt-2 sm:pt-4">
            <section class="rounded-xl border border-border px-5 py-6 text-center shadow-subtle sm:px-8">
              <app-skeleton-block widthClass="w-full" heightClass="h-4" extraClass="mx-auto max-w-xl" />
              <app-skeleton-block widthClass="w-10/12" heightClass="h-4" extraClass="mx-auto mt-2 max-w-xl" />

              <div class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md border border-primary bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-secondary sm:w-auto sm:px-5">
                <app-skeleton-block widthClass="w-56" heightClass="h-3" />
              </div>
            </section>
          </div>
        </article>

        <aside class="hidden lg:block lg:pl-5">
          <app-breaking-news-skeleton />
          <div class="mt-8">
            <app-most-read-skeleton />
          </div>
        </aside>
      </div>
    </section>
  `,
})
export class ArticlePageSkeletonComponent {
  protected readonly metadataItems = [1, 2, 3] as const;
  protected readonly lockedParagraphs = [1, 2] as const;
}

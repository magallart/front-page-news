import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SkeletonBlockComponent } from './skeleton-block.component';

@Component({
  selector: 'app-news-card-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonBlockComponent],
  template: `
    <article class="group relative h-full overflow-hidden rounded-xl border border-border shadow-subtle">
      <div class="absolute left-0 top-0 h-full w-1 bg-primary/60"></div>

      <div class="flex h-full flex-col gap-3 p-4 pl-5">
        <div class="flex items-center justify-between gap-3">
          <div class="inline-flex rounded-sm bg-primary px-2 py-1">
            <app-skeleton-block widthClass="w-14" heightClass="h-[0.65rem]" />
          </div>
          <app-skeleton-block widthClass="w-20" heightClass="h-[0.6rem]" extraClass="ml-auto" />
        </div>

        <div class="block overflow-hidden rounded-lg bg-muted">
          <app-skeleton-block widthClass="w-full" heightClass="aspect-[16/9]" radiusClass="rounded-lg" />
        </div>

        <div class="space-y-2">
          <app-skeleton-block widthClass="w-full" heightClass="h-6" />
          <app-skeleton-block widthClass="w-10/12" heightClass="h-6" />
          <app-skeleton-block widthClass="w-8/12" heightClass="h-6" />
        </div>

        <div class="space-y-2">
          <app-skeleton-block widthClass="w-full" heightClass="h-4" />
          <app-skeleton-block widthClass="w-11/12" heightClass="h-4" />
        </div>

        <app-skeleton-block widthClass="w-2/5" heightClass="h-[0.65rem]" extraClass="mt-auto" />
      </div>
    </article>
  `,
})
export class NewsCardSkeletonComponent {}

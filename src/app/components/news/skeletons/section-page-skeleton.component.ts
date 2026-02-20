import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { IconEyeComponent } from '../../icons/icon-eye.component';
import { IconFilterComponent } from '../../icons/icon-filter.component';

import { NewsCardSkeletonComponent } from './news-card-skeleton.component';
import { SkeletonBlockComponent } from './skeleton-block.component';

@Component({
  selector: 'app-section-page-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconEyeComponent, IconFilterComponent, NewsCardSkeletonComponent, SkeletonBlockComponent],
  template: `
    <div class="mb-4 flex justify-start">
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-md border border-border bg-foreground px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white"
      >
        <app-icon-filter />
        <app-skeleton-block widthClass="w-28" heightClass="h-3" />
      </button>
    </div>

    <div class="mb-5 rounded-xl border border-border p-4">
      <div class="grid gap-3 md:grid-cols-2">
        <app-skeleton-block widthClass="w-full" heightClass="h-10" radiusClass="rounded-md" />
        <app-skeleton-block widthClass="w-full" heightClass="h-10" radiusClass="rounded-md" />
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      @for (item of placeholders(); track item) {
        <app-news-card-skeleton />
      }
    </div>

    <div class="mt-10 flex justify-center">
      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 rounded-md border border-primary bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-secondary"
      >
        <app-icon-eye />
        <app-skeleton-block widthClass="w-28" heightClass="h-3" />
      </button>
    </div>
  `,
})
export class SectionPageSkeletonComponent {
  readonly cardCount = input(24);

  protected readonly placeholders = computed(() => Array.from({ length: this.cardCount() }, (_, index) => index));
}

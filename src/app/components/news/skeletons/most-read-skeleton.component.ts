import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { IconTrendingUpComponent } from '../../icons/icon-trending-up.component';

import { SkeletonBlockComponent } from './skeleton-block.component';

@Component({
  selector: 'app-most-read-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconTrendingUpComponent, SkeletonBlockComponent],
  template: `
    <section class="rounded-xl bg-secondary px-4 py-5 text-secondary-foreground shadow-subtle sm:px-5" id="most-read-news">
      <header class="mb-4 border-b border-primary/35 pb-3">
        <h2 class="font-editorial-title inline-flex items-center gap-2 text-2xl font-semibold tracking-tight">
          {{ title() }}
          <app-icon-trending-up />
        </h2>
      </header>

      <ol class="space-y-3">
        @for (placeholder of placeholders; track placeholder) {
          <li class="flex gap-3 border-b border-secondary-foreground/20 pb-3 last:border-b-0 last:pb-0">
            <span class="mt-0.5 w-6 shrink-0 text-sm font-semibold text-primary">
              <app-skeleton-block widthClass="w-4" heightClass="h-4" radiusClass="rounded-sm" />
            </span>

            <div class="min-w-0 space-y-1">
              <app-skeleton-block widthClass="w-full" heightClass="h-6" />
              <app-skeleton-block widthClass="w-10/12" heightClass="h-6" />
              <app-skeleton-block widthClass="w-1/2" heightClass="h-3" />
            </div>
          </li>
        }
      </ol>
    </section>
  `,
})
export class MostReadSkeletonComponent {
  readonly title = input('Lo más leído');
  readonly itemCount = input(10);

  protected get placeholders(): readonly number[] {
    return Array.from({ length: this.itemCount() }, (_, index) => index);
  }
}

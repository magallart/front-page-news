import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { SkeletonBlockComponent } from './skeleton-block.component';

@Component({
  selector: 'app-breaking-news-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonBlockComponent],
  template: `
    <section class="rounded-xl py-0 shadow-subtle lg:flex lg:h-[30rem] lg:flex-col" id="breaking-news">
      <header class="mb-3 flex items-center gap-3">
        <span class="inline-flex h-3 w-3 rounded-full bg-destructive"></span>
        <h2 class="font-editorial-title text-lg font-semibold uppercase tracking-[0.22em] text-foreground">{{ title() }}</h2>
      </header>

      <ul class="grid grow grid-rows-4">
        @for (placeholder of placeholders; track placeholder) {
          <li class="min-h-0 border-b-2 border-primary/60 py-3 last:border-b-0 lg:flex lg:flex-col lg:justify-center">
            <div class="flex items-center gap-3">
              <span class="inline-flex h-2.5 w-2.5 rounded-full bg-accent/50"></span>
              <app-skeleton-block widthClass="w-20" heightClass="h-3" />
            </div>
            <div class="mt-1 space-y-2">
              <app-skeleton-block widthClass="w-full" heightClass="h-5" />
              <app-skeleton-block widthClass="w-11/12" heightClass="h-5" />
            </div>
          </li>
        }
      </ul>

      <div class="mt-3 inline-flex h-[2.875rem] w-full items-center justify-center rounded-md border border-primary bg-primary px-4 py-3">
        <app-skeleton-block widthClass="w-36" heightClass="h-3" />
      </div>
    </section>
  `,
})
export class BreakingNewsSkeletonComponent {
  readonly title = input('En directo');
  protected readonly placeholders = [1, 2, 3, 4] as const;
}

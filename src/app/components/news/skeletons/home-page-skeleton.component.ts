import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BreakingNewsSkeletonComponent } from './breaking-news-skeleton.component';
import { MostReadSkeletonComponent } from './most-read-skeleton.component';
import { NewsCardSkeletonComponent } from './news-card-skeleton.component';
import { NewsCarouselSkeletonComponent } from './news-carousel-skeleton.component';
import { SourceDirectorySkeletonComponent } from './source-directory-skeleton.component';

@Component({
  selector: 'app-home-page-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BreakingNewsSkeletonComponent,
    MostReadSkeletonComponent,
    NewsCardSkeletonComponent,
    NewsCarouselSkeletonComponent,
    SourceDirectorySkeletonComponent,
  ],
  template: `
    <section class="space-y-6 py-4 sm:space-y-8" aria-label="Cargando portada" aria-busy="true">
      <div class="grid gap-5 lg:grid-cols-[minmax(0,2fr)_22rem] lg:items-stretch">
        <app-news-carousel-skeleton />
        <div class="lg:pl-5">
          <app-breaking-news-skeleton />
        </div>
      </div>

      <div class="grid gap-5 lg:grid-cols-[minmax(0,2fr)_22rem] lg:items-start">
        <div class="space-y-6">
          @for (row of rows; track row) {
            <section>
              <div class="grid gap-4 md:grid-cols-3">
                @for (card of cardsPerRow; track card) {
                  <app-news-card-skeleton />
                }
              </div>
            </section>
          }
        </div>

        <div class="space-y-10 lg:pl-5">
          <app-most-read-skeleton />
          <app-source-directory-skeleton />
        </div>
      </div>
    </section>
  `,
})
export class HomePageSkeletonComponent {
  protected readonly rows = [1, 2, 3, 4, 5] as const;
  protected readonly cardsPerRow = [1, 2, 3] as const;
}

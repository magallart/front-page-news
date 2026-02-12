import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { PageContainerComponent } from '../../components/layout/page-container.component';
import { CurrentNewsBlockComponent } from '../../components/news/current-news-block.component';
import { MostReadListComponent } from '../../components/news/most-read-list.component';
import { NewsCarouselComponent } from '../../components/news/news-carousel.component';
import { SectionBlockComponent } from '../../components/news/section-block.component';
import { MockNewsService } from '../../services/mock-news.service';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageContainerComponent,
    NewsCarouselComponent,
    CurrentNewsBlockComponent,
    MostReadListComponent,
    SectionBlockComponent,
  ],
  template: `
    <app-page-container>
      <section class="space-y-6 py-4 sm:space-y-8">
        <app-news-carousel title="Destacadas" [articles]="featuredNews" [breakingItems]="breakingNews" />

        <div class="grid gap-6 lg:grid-cols-[2fr_1fr]" id="current-news">
          <app-current-news-block [articles]="currentAffairsNews" />
          <div class="space-y-6">
            <div id="most-read">
              <app-most-read-list [items]="mostReadNews" />
            </div>
          </div>
        </div>

        <app-section-block title="Economia" sectionSlug="economia" [articles]="economyNews" />
      </section>
    </app-page-container>
  `,
})
export class HomePageComponent {
  private readonly mockNewsService = inject(MockNewsService);

  protected readonly featuredNews = this.mockNewsService.getFeaturedNews();
  protected readonly currentAffairsNews = this.mockNewsService.getCurrentAffairsNews();
  protected readonly breakingNews = this.mockNewsService.getBreakingNews();
  protected readonly economyNews = this.mockNewsService.getEconomyNews();
  protected readonly mostReadNews = this.mockNewsService.getMostReadNews();
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { PageContainerComponent } from '../../components/layout/page-container.component';
import { BreakingNewsComponent } from '../../components/news/breaking-news.component';
import { MostReadNewsComponent } from '../../components/news/most-read-news.component';
import { NewsCarouselComponent } from '../../components/news/news-carousel.component';
import { SectionBlockComponent } from '../../components/news/section-block.component';
import { MockNewsService } from '../../services/mock-news.service';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageContainerComponent,
    NewsCarouselComponent,
    BreakingNewsComponent,
    MostReadNewsComponent,
    SectionBlockComponent,
  ],
  template: `
    <app-page-container>
      <section class="space-y-6 py-4 sm:space-y-8">
        <div class="grid gap-5 lg:grid-cols-[minmax(0,2fr)_22rem] lg:items-stretch">
          <app-news-carousel title="Destacadas" [articles]="featuredNews" />
          <div class="lg:pl-5">
            <app-breaking-news [items]="breakingNews" />
          </div>
        </div>

        <div class="grid gap-5 lg:grid-cols-[minmax(0,2fr)_22rem] lg:items-start" id="current-news">
          <div>
            <div class="mb-12">
              <app-section-block title="Actualidad" sectionSlug="actualidad" [articles]="currentAffairsNews" />
            </div>
            <div class="mb-12">
              <app-section-block title="Economia" sectionSlug="economia" [articles]="economyNews" />
            </div>
            <div>
              <app-section-block title="Cultura" sectionSlug="cultura" [articles]="cultureNews" />
            </div>
          </div>

          <div class="lg:pl-5" id="most-read">
            <app-most-read-news [items]="mostReadNews" />
          </div>
        </div>
      </section>
    </app-page-container>
  `,
})
export class HomePageComponent {
  private readonly mockNewsService = inject(MockNewsService);

  protected readonly featuredNews = this.mockNewsService.getFeaturedNews();
  protected readonly currentAffairsNews = this.mockNewsService.getCurrentAffairsNews(3);
  protected readonly breakingNews = this.mockNewsService.getBreakingNews();
  protected readonly economyNews = this.mockNewsService.getEconomyNews();
  protected readonly cultureNews = this.mockNewsService.getCultureNews();
  protected readonly mostReadNews = this.mockNewsService.getMostReadNews(10);
}

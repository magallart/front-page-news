import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { PageContainerComponent } from '../../components/layout/page-container.component';
import { BreakingNewsComponent } from '../../components/news/breaking-news.component';
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
    BreakingNewsComponent,
    MostReadListComponent,
    SectionBlockComponent,
  ],
  template: `
    <app-page-container>
      <section class="space-y-6 py-4 sm:space-y-8">
        <header class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Portada</p>
          <h1 class="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Portada de noticias</h1>
          <p class="max-w-3xl text-sm text-muted-foreground sm:text-base">
            Estructura base de portada para mostrar varias noticias de distintos periodicos en un solo portal.
          </p>
        </header>

        <app-news-carousel title="Destacadas" [articles]="featuredNews" />

        <div class="grid gap-6 lg:grid-cols-[2fr_1fr]" id="current-news">
          <app-current-news-block [articles]="currentAffairsNews" />
          <div class="space-y-6">
            <div class="mb-2" id="breaking-news">
              <app-breaking-news [items]="breakingNews" />
            </div>
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

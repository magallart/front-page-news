import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { PageContainerComponent } from '../../components/layout/page-container.component';
import { BreakingNewsComponent } from '../../components/news/breaking-news.component';
import { ErrorStateComponent } from '../../components/news/error-state.component';
import { MostReadNewsComponent } from '../../components/news/most-read-news.component';
import { NewsCarouselComponent } from '../../components/news/news-carousel.component';
import { NewsQuickViewModalComponent } from '../../components/news/news-quick-view-modal.component';
import { SectionBlockComponent } from '../../components/news/section-block.component';
import { HomePageSkeletonComponent } from '../../components/news/skeletons/home-page-skeleton.component';
import { SourceDirectoryComponent } from '../../components/news/source-directory.component';
import { UI_VIEW_STATE } from '../../interfaces/ui-view-state.interface';
import { createHomeNewsQuery } from '../../lib/news-query-factory';
import { NewsStore } from '../../stores/news.store';
import { SourcesStore } from '../../stores/sources.store';
import { adaptArticlesToNewsItems } from '../../utils/api-ui-adapters';
import { selectBreakingNews } from '../../utils/breaking-news-selection';
import { selectFeaturedNews } from '../../utils/featured-news-selection';
import { chunkNewsItems, selectHomeMixedNews } from '../../utils/home-mixed-selection';
import { rankMostReadNews } from '../../utils/most-read-ranking';
import { resolveSourceHomepage } from '../../utils/source-homepage';
import { resolveHomeUiState } from '../../utils/ui-state-matrix';

import type { NewsItem } from '../../interfaces/news-item.interface';
import type { OnInit } from '@angular/core';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageContainerComponent,
    ErrorStateComponent,
    HomePageSkeletonComponent,
    NewsCarouselComponent,
    BreakingNewsComponent,
    MostReadNewsComponent,
    NewsQuickViewModalComponent,
    SectionBlockComponent,
    SourceDirectoryComponent,
  ],
  template: `
    <app-page-container>
      @switch (uiState()) {
        @case (uiViewState.LOADING) {
          <app-home-page-skeleton />
        }
        @case (uiViewState.ERROR_TOTAL) {
          <section class="py-4">
            <app-error-state
              headline="No se ha podido cargar la portada"
              message="No hay conexión con el servicio de noticias. Inténtalo de nuevo en unos minutos."
            />
          </section>
        }
        @case (uiViewState.EMPTY) {
          <section class="py-4">
            <app-error-state
              headline="No hay noticias disponibles"
              message="Estamos actualizando fuentes. Vuelve a intentarlo en unos minutos."
            />
          </section>
        }
        @default {
          <section class="space-y-6 py-4 sm:space-y-8">
            <div class="grid gap-5 lg:grid-cols-[minmax(0,2fr)_22rem] lg:items-stretch">
              <app-news-carousel title="Destacadas" [articles]="featuredNews()" (previewRequested)="openQuickView($event)" />
              <div class="lg:pl-5">
                <app-breaking-news [items]="breakingNews()" (previewRequested)="openQuickView($event)" />
              </div>
            </div>

            <div class="grid gap-5 lg:grid-cols-[minmax(0,2fr)_22rem] lg:items-start" id="current-news">
              <div class="space-y-6">
                @for (row of mixedNewsRows(); track $index) {
                  <app-section-block [articles]="row" (previewRequested)="openQuickView($event)" />
                }
              </div>

              <div class="space-y-10 lg:pl-5" id="most-read">
                <app-most-read-news [items]="mostReadNews()" (previewRequested)="openQuickView($event)" />
                <app-source-directory [items]="sourceDirectoryItems()" />
              </div>
            </div>
          </section>
        }
      }
    </app-page-container>
    <app-news-quick-view-modal [article]="quickViewArticle()" (closed)="closeQuickView()" />
  `,
})
export class HomePageComponent implements OnInit {
  private readonly newsStore = inject(NewsStore);
  private readonly sourcesStore = inject(SourcesStore);
  protected readonly uiViewState = UI_VIEW_STATE;
  private readonly homeNewsQuery = createHomeNewsQuery();

  private readonly newsItems = computed(() => adaptArticlesToNewsItems(this.newsStore.data(this.homeNewsQuery)));
  protected readonly quickViewArticle = signal<NewsItem | null>(null);

  protected readonly uiState = computed(() =>
    resolveHomeUiState({
      loading: this.newsStore.isInitialLoading(this.homeNewsQuery),
      error: this.newsStore.error(this.homeNewsQuery),
      warnings: this.newsStore.warnings(this.homeNewsQuery),
      itemCount: this.newsItems().length,
    }),
  );

  protected readonly featuredNews = computed(() => selectFeaturedNews(this.newsItems()));
  protected readonly breakingNews = computed(() => selectBreakingNews(this.getNewsBySection('actualidad'), 6));
  protected readonly mixedNewsRows = computed(() => chunkNewsItems(selectHomeMixedNews(this.newsItems(), 15), 3).slice(0, 5));
  protected readonly mostReadNews = computed(() => rankMostReadNews(this.newsItems()).slice(0, 10));
  protected readonly sourceDirectoryItems = computed(() =>
    (this.sourcesStore.data()?.sources ?? []).map((source) => ({
      id: source.id,
      name: source.name,
      url: resolveSourceHomepage(source),
      logoUrl: `/images/sources/${source.id}.png`,
    })),
  );

  ngOnInit(): void {
    this.newsStore.load(this.homeNewsQuery);
    this.sourcesStore.loadInitial();
  }

  protected openQuickView(item: NewsItem): void {
    this.quickViewArticle.set(item);
  }

  protected closeQuickView(): void {
    this.quickViewArticle.set(null);
  }

  private getNewsBySection(sectionSlug: string) {
    return this.newsItems().filter((item) => item.section === sectionSlug);
  }
}

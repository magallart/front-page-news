import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { PageContainerComponent } from '../../components/layout/page-container.component';
import { BreakingNewsComponent } from '../../components/news/breaking-news.component';
import { ErrorStateComponent } from '../../components/news/error-state.component';
import { MostReadNewsComponent } from '../../components/news/most-read-news.component';
import { NewsCarouselComponent } from '../../components/news/news-carousel.component';
import { SectionBlockComponent } from '../../components/news/section-block.component';
import { SourceDirectoryComponent } from '../../components/news/source-directory.component';
import { MAX_FEED_NEWS_LIMIT } from '../../constants/news-limit.constants';
import { UI_VIEW_STATE } from '../../interfaces/ui-view-state.interface';
import { NewsStore } from '../../stores/news.store';
import { SourcesStore } from '../../stores/sources.store';
import { adaptArticlesToNewsItems } from '../../utils/api-ui-adapters';
import { selectFeaturedNews } from '../../utils/featured-news-selection';
import { chunkNewsItems, selectHomeMixedNews } from '../../utils/home-mixed-selection';
import { rankMostReadNews } from '../../utils/most-read-ranking';
import { resolveHomeUiState } from '../../utils/ui-state-matrix';

import type { OnInit } from '@angular/core';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageContainerComponent,
    ErrorStateComponent,
    NewsCarouselComponent,
    BreakingNewsComponent,
    MostReadNewsComponent,
    SectionBlockComponent,
    SourceDirectoryComponent,
  ],
  template: `
    <app-page-container>
      @switch (uiState()) {
        @case (uiViewState.LOADING) {
          <section class="space-y-4 py-4 sm:space-y-6">
            <p class="text-sm text-muted-foreground">Cargando portada...</p>
          </section>
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
              <app-news-carousel title="Destacadas" [articles]="featuredNews()" />
              <div class="lg:pl-5">
                <app-breaking-news [items]="breakingNews()" />
              </div>
            </div>

            <div class="grid gap-5 lg:grid-cols-[minmax(0,2fr)_22rem] lg:items-start" id="current-news">
              <div class="space-y-6">
                @for (row of mixedNewsRows(); track $index) {
                  <app-section-block [articles]="row" />
                }
              </div>

              <div class="space-y-10 lg:pl-5" id="most-read">
                <app-most-read-news [items]="mostReadNews()" />
                <app-source-directory [items]="sourceDirectoryItems()" />
              </div>
            </div>
          </section>
        }
      }
    </app-page-container>
  `,
})
export class HomePageComponent implements OnInit {
  private readonly newsStore = inject(NewsStore);
  private readonly sourcesStore = inject(SourcesStore);
  protected readonly uiViewState = UI_VIEW_STATE;

  private readonly newsItems = computed(() => adaptArticlesToNewsItems(this.newsStore.data()));

  protected readonly uiState = computed(() =>
    resolveHomeUiState({
      loading: this.newsStore.loading(),
      error: this.newsStore.error(),
      warnings: this.newsStore.warnings(),
      itemCount: this.newsItems().length,
    }),
  );

  protected readonly featuredNews = computed(() => selectFeaturedNews(this.newsItems()));
  protected readonly breakingNews = computed(() => this.getNewsBySection('actualidad').slice(0, 6));
  protected readonly mixedNewsRows = computed(() => chunkNewsItems(selectHomeMixedNews(this.newsItems(), 15), 3).slice(0, 5));
  protected readonly mostReadNews = computed(() => rankMostReadNews(this.newsItems()).slice(0, 10));
  protected readonly sourceDirectoryItems = computed(() =>
    (this.sourcesStore.data()?.sources ?? []).map((source) => ({
      id: source.id,
      name: source.name,
      url: source.baseUrl,
      logoUrl: `/images/sources/${source.id}.png`,
    })),
  );

  ngOnInit(): void {
    this.newsStore.load({ page: 1, limit: MAX_FEED_NEWS_LIMIT });
    this.sourcesStore.loadInitial();
  }

  private getNewsBySection(sectionSlug: string) {
    return this.newsItems().filter((item) => item.section === sectionSlug);
  }
}

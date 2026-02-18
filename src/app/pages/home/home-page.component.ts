import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { PageContainerComponent } from '../../components/layout/page-container.component';
import { BreakingNewsComponent } from '../../components/news/breaking-news.component';
import { ErrorStateComponent } from '../../components/news/error-state.component';
import { MostReadNewsComponent } from '../../components/news/most-read-news.component';
import { NewsCarouselComponent } from '../../components/news/news-carousel.component';
import { SectionBlockComponent } from '../../components/news/section-block.component';
import { MAX_FEED_NEWS_LIMIT } from '../../constants/news-limit.constants';
import { UI_VIEW_STATE } from '../../interfaces/ui-view-state.interface';
import { NewsStore } from '../../stores/news.store';
import { adaptArticlesToNewsItems } from '../../utils/api-ui-adapters';
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
              message="No hay conexion con el servicio de noticias. Intentalo de nuevo en unos minutos."
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
              <div>
                <div class="mb-12">
                  <app-section-block title="Actualidad" sectionSlug="actualidad" [articles]="currentAffairsNews()" />
                </div>
                <div class="mb-12">
                  <app-section-block title="Economia" sectionSlug="economia" [articles]="economyNews()" />
                </div>
                <div>
                  <app-section-block title="Cultura" sectionSlug="cultura" [articles]="cultureNews()" />
                </div>
              </div>

              <div class="lg:pl-5" id="most-read">
                <app-most-read-news [items]="mostReadNews()" />
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

  protected readonly featuredNews = computed(() => this.newsItems().slice(0, 5));
  protected readonly currentAffairsNews = computed(() => this.getNewsBySection('actualidad').slice(0, 3));
  protected readonly breakingNews = computed(() => this.getNewsBySection('actualidad').slice(0, 6));
  protected readonly economyNews = computed(() => this.getNewsBySection('economia').slice(0, 3));
  protected readonly cultureNews = computed(() => this.getNewsBySection('cultura').slice(0, 3));
  protected readonly mostReadNews = computed(() => this.newsItems().slice(0, 10));

  ngOnInit(): void {
    this.newsStore.load({ page: 1, limit: MAX_FEED_NEWS_LIMIT });
  }

  private getNewsBySection(sectionSlug: string) {
    return this.newsItems().filter((item) => item.section === sectionSlug);
  }
}

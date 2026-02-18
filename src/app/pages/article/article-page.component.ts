import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import { PageContainerComponent } from '../../components/layout/page-container.component';
import { ArticleContentComponent } from '../../components/news/article-content.component';
import { ArticleNotFoundComponent } from '../../components/news/article-not-found.component';
import { BreakingNewsComponent } from '../../components/news/breaking-news.component';
import { ErrorStateComponent } from '../../components/news/error-state.component';
import { MostReadNewsComponent } from '../../components/news/most-read-news.component';
import { UI_VIEW_STATE } from '../../interfaces/ui-view-state.interface';
import { NewsStore } from '../../stores/news.store';
import { adaptArticlesToNewsItems } from '../../utils/api-ui-adapters';
import { resolveDetailUiState } from '../../utils/ui-state-matrix';

@Component({
  selector: 'app-article-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageContainerComponent,
    ArticleContentComponent,
    ArticleNotFoundComponent,
    BreakingNewsComponent,
    ErrorStateComponent,
    MostReadNewsComponent,
  ],
  template: `
    <app-page-container>
      <section class="space-y-6 py-4 sm:space-y-8">
        <div class="grid gap-5 lg:grid-cols-[minmax(0,2fr)_22rem] lg:items-start">
          <div>
            @if (detailUiState() === uiViewState.LOADING) {
              <p class="text-sm text-muted-foreground">Cargando noticia...</p>
            } @else if (detailUiState() === uiViewState.ERROR_TOTAL) {
              <app-error-state
                headline="No se ha podido cargar la noticia"
                message="Estamos teniendo problemas para cargar este contenido. Intentalo de nuevo en unos minutos."
              />
            } @else if (article(); as item) {
              <app-article-content [article]="item" />
            } @else {
              <app-article-not-found />
            }
          </div>

          <aside class="hidden lg:block lg:pl-5">
            <app-breaking-news [items]="breakingNews()" />
            <div class="mt-8">
              <app-most-read-news [items]="mostReadNews()" />
            </div>
          </aside>
        </div>
      </section>
    </app-page-container>
  `,
})
export class ArticlePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly newsStore = inject(NewsStore);
  protected readonly uiViewState = UI_VIEW_STATE;

  protected readonly articleId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? 'sin-id')),
    { initialValue: 'sin-id' },
  );

  private readonly aggregatedNewsItems = computed(() => adaptArticlesToNewsItems(this.newsStore.data()));
  protected readonly article = computed(() => this.aggregatedNewsItems().find((item) => item.id === this.articleId()));

  private readonly sideItems = computed(() => {
    const currentArticleId = this.articleId();
    const article = this.article();
    const bySection = this.aggregatedNewsItems().filter(
      (item) => item.id !== currentArticleId && (!article || item.section === article.section),
    );

    if (bySection.length > 0) {
      return bySection;
    }

    return this.aggregatedNewsItems().filter((item) => item.id !== currentArticleId);
  });

  protected readonly breakingNews = computed(() => this.sideItems().slice(0, 4));
  protected readonly mostReadNews = computed(() => this.sideItems().slice(0, 10));

  protected readonly detailUiState = computed(() =>
    resolveDetailUiState({
      loading: this.newsStore.loading(),
      error: this.newsStore.error(),
      warnings: this.newsStore.warnings(),
      hasItem: Boolean(this.article()),
    }),
  );

  constructor() {
    this.newsStore.load({ page: 1, limit: 100 });
  }
}

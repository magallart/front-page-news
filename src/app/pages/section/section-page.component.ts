import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { IconEyeComponent } from '../../components/icons/icon-eye.component';
import { IconFilterComponent } from '../../components/icons/icon-filter.component';
import { PageContainerComponent } from '../../components/layout/page-container.component';
import { ErrorStateComponent } from '../../components/news/error-state.component';
import { NewsCardComponent } from '../../components/news/news-card.component';
import { NewsQuickViewModalComponent } from '../../components/news/news-quick-view-modal.component';
import { NewsRefreshIndicatorComponent } from '../../components/news/news-refresh-indicator.component';
import { SectionFiltersComponent } from '../../components/news/section-filters.component';
import { SectionPageSkeletonComponent } from '../../components/news/skeletons/section-page-skeleton.component';
import {
  SECTION_PAGE_DEFAULT_SLUG,
  SECTION_PAGE_INITIAL_VISIBLE_NEWS_COUNT,
  SECTION_PAGE_LOAD_MORE_NEWS_STEP,
} from '../../constants/section-page.constants';
import { UI_VIEW_STATE } from '../../interfaces/ui-view-state.interface';
import { createSectionNewsQuery } from '../../lib/news-query-factory';
import { NewsStore } from '../../stores/news.store';
import { adaptArticlesToNewsItems } from '../../utils/api-ui-adapters';
import { formatSectionLabel } from '../../utils/section-label';
import { DEFAULT_SECTION_QUERY_FILTERS, parseSectionQueryFilters } from '../../utils/section-query-filters';
import { resolveSectionUiState } from '../../utils/ui-state-matrix';

import type { NewsItem } from '../../interfaces/news-item.interface';
import type { SourceSelectionState } from '../../interfaces/source-selection-state.interface';
import type { OnInit } from '@angular/core';

@Component({
  selector: 'app-section-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageContainerComponent,
    NewsCardComponent,
    ErrorStateComponent,
    NewsRefreshIndicatorComponent,
    SectionFiltersComponent,
    SectionPageSkeletonComponent,
    NewsQuickViewModalComponent,
    IconFilterComponent,
    IconEyeComponent,
  ],
  template: `
    <app-page-container>
      <section class="pt-1 pb-4 sm:pb-6">
        <h1 class="sr-only">{{ sectionTitle() }}</h1>

        @if (sectionUiState() === uiViewState.LOADING) {
          <app-section-page-skeleton />
        } @else if (sectionUiState() === uiViewState.ERROR_TOTAL) {
          <app-error-state
            headline="No se han podido cargar noticias"
            message="Estamos teniendo problemas para cargar esta sección. Inténtalo de nuevo en unos minutos."
          />
        } @else {
          <app-news-refresh-indicator
            [scopeLabel]="sectionTitle()"
            [isRefreshing]="isRefreshing()"
            [isShowingStaleData]="isShowingStaleData()"
            [hasFreshUpdateAvailable]="hasFreshUpdateAvailable()"
            [lastUpdated]="lastUpdated()"
            (dismissed)="dismissFreshUpdateNotice()"
          />

          @if (hasSectionNews()) {
            <div class="mb-4 flex justify-start">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-md border border-border bg-foreground px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                (click)="toggleFilters()"
              >
                <app-icon-filter />
                {{ filtersOpen() ? 'Ocultar filtros' : 'Mostrar filtros' }}
              </button>
            </div>

            @if (filtersOpen()) {
              <div class="mb-5">
                <app-section-filters
                  [sources]="availableSources()"
                  [selectedSources]="activeSelectedSources()"
                  [sortDirection]="sortDirection()"
                  (selectedSourcesChange)="onSelectedSourcesChange($event)"
                  (sortDirectionChange)="onSortDirectionChange($event)"
                />
              </div>
            }
          }

          @if (sectionUiState() === uiViewState.EMPTY) {
            <app-error-state
              headline="No hay noticias en esta sección"
              message="No encontramos resultados para los filtros actuales. Prueba con otra combinación."
            />
          } @else {
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              @for (item of visibleSectionNews(); track item.id) {
                <app-news-card [article]="item" (previewRequested)="openQuickView($event)" />
              }
            </div>

            @if (hasMoreNews()) {
              <div class="mt-10 flex justify-center">
                <button
                  type="button"
                  class="inline-flex items-center justify-center gap-2 rounded-md border border-primary bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-secondary transition-colors duration-500 ease-out hover:border-secondary hover:bg-secondary hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  (click)="loadMoreNews()"
                >
                  <app-icon-eye />
                  Ver más noticias
                </button>
              </div>
            }
          }
        }
      </section>
    </app-page-container>
    <app-news-quick-view-modal [article]="quickViewArticle()" (closed)="closeQuickView()" />
  `,
})
export class SectionPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly newsStore = inject(NewsStore);
  private readonly sourceSelection = signal<SourceSelectionState>({
    hasCustomSelection: false,
    selectedSources: [],
  });
  private readonly visibleNewsCount = signal(SECTION_PAGE_INITIAL_VISIBLE_NEWS_COUNT);
  protected readonly quickViewArticle = signal<NewsItem | null>(null);
  protected readonly uiViewState = UI_VIEW_STATE;
  protected readonly filtersOpen = signal(false);
  protected readonly sortDirection = signal<'asc' | 'desc'>('desc');
  protected readonly sectionSlug = signal(this.route.snapshot.paramMap.get('slug') ?? SECTION_PAGE_DEFAULT_SLUG);
  private readonly queryFilters = signal(
    parseSectionQueryFilters(this.route.snapshot.queryParamMap) ?? DEFAULT_SECTION_QUERY_FILTERS,
  );

  protected readonly sectionTitle = computed(() => formatSectionLabel(this.sectionSlug()));
  private readonly sectionNewsQuery = computed(() => {
    const slug = this.sectionSlug();
    const filters = this.queryFilters();

    return createSectionNewsQuery(slug, filters);
  });
  private readonly sectionArticles = computed(() =>
    this.newsStore.data(this.sectionNewsQuery()).filter((article) => article.sectionSlug === this.sectionSlug()),
  );
  protected readonly sectionNews = computed(() => adaptArticlesToNewsItems(this.sectionArticles()));
  protected readonly hasSectionNews = computed(() => this.sectionNews().length > 0);

  protected readonly availableSources = computed(() => {
    const uniqueSources = new Set(this.sectionNews().map((item) => item.source));
    return [...uniqueSources].sort((left, right) => left.localeCompare(right, 'es'));
  });

  protected readonly activeSelectedSources = computed(() => {
    const currentSelection = this.sourceSelection();
    if (!currentSelection.hasCustomSelection) {
      return this.availableSources();
    }

    return currentSelection.selectedSources;
  });

  protected readonly filteredSectionNews = computed(() => {
    const selectedSourceSet = new Set(this.activeSelectedSources());
    const filteredNews = this.sectionNews().filter((item) => selectedSourceSet.has(item.source));

    return [...filteredNews].sort((left, right) => {
      const leftTime = Date.parse(left.publishedAt);
      const rightTime = Date.parse(right.publishedAt);
      return this.sortDirection() === 'desc' ? rightTime - leftTime : leftTime - rightTime;
    });
  });
  protected readonly visibleSectionNews = computed(() =>
    this.filteredSectionNews().slice(0, this.visibleNewsCount()),
  );
  protected readonly hasMoreNews = computed(() =>
    this.filteredSectionNews().length > this.visibleSectionNews().length,
  );

  protected readonly sectionUiState = computed(() =>
    resolveSectionUiState({
      loading: this.newsStore.loading(this.sectionNewsQuery()),
      error: this.newsStore.error(this.sectionNewsQuery()),
      warnings: this.newsStore.warnings(this.sectionNewsQuery()),
      itemCount: this.filteredSectionNews().length,
    }),
  );
  protected readonly isRefreshing = computed(() => this.newsStore.isRefreshing(this.sectionNewsQuery()));
  protected readonly isShowingStaleData = computed(() => this.newsStore.isShowingStaleData(this.sectionNewsQuery()));
  protected readonly hasFreshUpdateAvailable = computed(() => this.newsStore.hasFreshUpdateAvailable(this.sectionNewsQuery()));
  protected readonly lastUpdated = computed(() => this.newsStore.lastUpdated(this.sectionNewsQuery()));

  ngOnInit(): void {
    this.syncFromRouteSnapshot();

    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (!(event instanceof NavigationEnd)) {
          return;
        }

        this.syncFromRouteSnapshot();
      });
  }

  protected toggleFilters(): void {
    this.filtersOpen.update((value) => !value);
  }

  protected onSelectedSourcesChange(nextSources: readonly string[]): void {
    this.visibleNewsCount.set(SECTION_PAGE_INITIAL_VISIBLE_NEWS_COUNT);
    this.sourceSelection.set({
      hasCustomSelection: true,
      selectedSources: nextSources,
    });
  }

  protected onSortDirectionChange(direction: 'asc' | 'desc'): void {
    this.visibleNewsCount.set(SECTION_PAGE_INITIAL_VISIBLE_NEWS_COUNT);
    this.sortDirection.set(direction);
  }

  protected loadMoreNews(): void {
    this.visibleNewsCount.update((count) => count + SECTION_PAGE_LOAD_MORE_NEWS_STEP);
  }

  protected openQuickView(item: NewsItem): void {
    this.quickViewArticle.set(item);
  }

  protected closeQuickView(): void {
    this.quickViewArticle.set(null);
  }

  protected dismissFreshUpdateNotice(): void {
    this.newsStore.dismissFreshUpdateNotice(this.sectionNewsQuery());
  }

  private syncFromRouteSnapshot(): void {
    const slug = this.route.snapshot.paramMap.get('slug') ?? SECTION_PAGE_DEFAULT_SLUG;
    const filters = parseSectionQueryFilters(this.route.snapshot.queryParamMap);

    this.sectionSlug.set(slug);
    this.queryFilters.set(filters);
    this.sourceSelection.set({
      hasCustomSelection: false,
      selectedSources: [],
    });
    this.filtersOpen.set(false);
    this.sortDirection.set('desc');
    this.visibleNewsCount.set(SECTION_PAGE_INITIAL_VISIBLE_NEWS_COUNT);

    this.newsStore.load(createSectionNewsQuery(slug, filters));
  }
}

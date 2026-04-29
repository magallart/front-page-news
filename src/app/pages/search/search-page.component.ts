import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { IconEyeComponent } from '../../components/icons/icon-eye.component';
import { IconFilterComponent } from '../../components/icons/icon-filter.component';
import { IconSearchComponent } from '../../components/icons/icon-search.component';
import { PageContainerComponent } from '../../components/layout/page-container.component';
import { ErrorStateComponent } from '../../components/news/error-state.component';
import { NewsCardComponent } from '../../components/news/news-card.component';
import { NewsQuickViewModalComponent } from '../../components/news/news-quick-view-modal.component';
import { NewsRefreshIndicatorComponent } from '../../components/news/news-refresh-indicator.component';
import { SectionFiltersComponent } from '../../components/news/section-filters.component';
import { SectionPageSkeletonComponent } from '../../components/news/skeletons/section-page-skeleton.component';
import {
  SECTION_PAGE_INITIAL_VISIBLE_NEWS_COUNT,
  SECTION_PAGE_LOAD_MORE_NEWS_STEP,
} from '../../constants/section-page.constants';
import { UI_VIEW_STATE } from '../../interfaces/ui-view-state.interface';
import { createSearchNewsQuery } from '../../lib/news-query-factory';
import { toNewsRequestSnapshotKey } from '../../lib/news-request';
import { NewsViewPreferencesStore } from '../../lib/news-view-preferences-store';
import { NewsStore } from '../../stores/news.store';
import { adaptArticlesToNewsItems } from '../../utils/api-ui-adapters';
import { resolveSectionUiState } from '../../utils/ui-state-matrix';

import type { NewsItem } from '../../interfaces/news-item.interface';
import type { SourceSelectionState } from '../../interfaces/source-selection-state.interface';
import type { OnInit } from '@angular/core';

@Component({
  selector: 'app-search-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageContainerComponent,
    ErrorStateComponent,
    NewsCardComponent,
    NewsQuickViewModalComponent,
    NewsRefreshIndicatorComponent,
    SectionFiltersComponent,
    SectionPageSkeletonComponent,
    IconFilterComponent,
    IconEyeComponent,
    IconSearchComponent,
  ],
  template: `
    <app-page-container>
      <section class="pt-1 pb-4 sm:pb-6">
        <header class="mb-5 space-y-3 border-b border-border pb-4">
          <p class="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Buscar noticias</p>
          <h1 class="font-editorial-title text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            Búsqueda editorial.
          </h1>
          <p class="font-editorial-body max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            Encuentra titulares por intención y afina los resultados por medio sin salir de la cobertura.
          </p>

          <form class="grid gap-3 pt-1 md:grid-cols-[minmax(0,1fr)_auto]" (submit)="submitSearch($event)">
            <label class="relative block" for="news-search-query">
              <span class="sr-only">Buscar noticias</span>
              <span class="pointer-events-none absolute inset-y-0 left-3 inline-flex items-center text-muted-foreground">
                <app-icon-search />
              </span>
              <input
                id="news-search-query"
                type="search"
                name="q"
                aria-label="Buscar noticias"
                class="w-full rounded-lg border border-border bg-card px-11 py-3 font-editorial-body text-base text-foreground outline-none transition placeholder:text-muted-foreground/80 focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Ejemplo: vivienda, inflación, inteligencia artificial..."
                [value]="draftSearchQuery()"
                (input)="onDraftSearchChange($event)"
              />
            </label>

            <div class="flex gap-3">
              <button
                type="submit"
                class="inline-flex items-center justify-center gap-2 rounded-lg border border-primary bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-secondary transition-colors duration-300 ease-out hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <app-icon-search />
                Buscar
              </button>

              @if (hasSearchIntent()) {
                <button
                  type="button"
                  class="inline-flex items-center justify-center rounded-lg border border-border px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  (click)="clearSearch()"
                >
                  Limpiar
                </button>
              }
            </div>
          </form>
        </header>

        @if (!hasSearchIntent()) {
          <app-error-state
            headline="Escribe un término para empezar"
            message="Usa el buscador para encontrar noticias por titular o resumen en todo el catálogo disponible."
          />
        } @else if (searchUiState() === uiViewState.LOADING) {
          <app-section-page-skeleton />
        } @else if (searchUiState() === uiViewState.ERROR_TOTAL) {
          <app-error-state
            headline="No se han podido cargar resultados"
            message="Estamos teniendo problemas para resolver esta búsqueda. Inténtalo de nuevo en unos minutos."
          />
        } @else {
          <app-news-refresh-indicator
            [scopeLabel]="resultsScopeLabel()"
            [isRefreshing]="isRefreshing()"
            [isShowingStaleData]="isShowingStaleData()"
            [hasFreshUpdateAvailable]="hasFreshUpdateAvailable()"
            [hasNewSinceLastVisit]="hasNewSinceLastVisit()"
            [newSinceLastVisitCount]="newSinceLastVisitCount()"
            [lastUpdated]="lastUpdated()"
            (dismissed)="dismissFreshUpdateNotice()"
            (lastVisitDismissed)="dismissLastVisitNotice()"
          />

          @if (hasSearchResults()) {
            <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p class="text-sm text-muted-foreground" data-testid="search-results-summary">
                {{ filteredSearchNews().length }} resultados para <span class="font-semibold text-foreground">"{{ searchQuery() }}"</span>.
              </p>

              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-md border border-border bg-foreground px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                (click)="toggleFilters()"
              >
                <app-icon-filter />
                {{ filtersOpen() ? 'Ocultar filtros' : 'Filtrar medios' }}
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

          @if (searchUiState() === uiViewState.EMPTY) {
            <app-error-state
              headline="No hemos encontrado resultados"
              message="Prueba con otro término o ajusta los medios seleccionados para ampliar la búsqueda."
            />
          } @else {
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              @for (item of visibleSearchNews(); track item.id) {
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
                  Ver más resultados
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
export class SearchPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly newsStore = inject(NewsStore);
  private readonly newsViewPreferencesStore = inject(NewsViewPreferencesStore);
  private readonly sourceSelection = signal<SourceSelectionState>({
    hasCustomSelection: false,
    selectedSources: [],
  });
  private readonly visibleNewsCount = signal(SECTION_PAGE_INITIAL_VISIBLE_NEWS_COUNT);
  protected readonly quickViewArticle = signal<NewsItem | null>(null);
  protected readonly uiViewState = UI_VIEW_STATE;
  protected readonly filtersOpen = signal(false);
  protected readonly sortDirection = signal<'asc' | 'desc'>('desc');
  protected readonly draftSearchQuery = signal(this.route.snapshot.queryParamMap.get('q')?.trim() ?? '');
  protected readonly searchQuery = signal(normalizeSearchQuery(this.route.snapshot.queryParamMap.get('q')));

  private readonly searchNewsQuery = computed(() => {
    const query = this.searchQuery();
    return query ? createSearchNewsQuery(query) : null;
  });
  private readonly searchArticles = computed(() => {
    const query = this.searchNewsQuery();
    return query ? this.newsStore.data(query) : [];
  });
  protected readonly searchNews = computed(() => adaptArticlesToNewsItems(this.searchArticles()));
  protected readonly hasSearchIntent = computed(() => this.searchQuery() !== null);
  protected readonly hasSearchResults = computed(() => this.searchNews().length > 0);
  protected readonly resultsScopeLabel = computed(() => `Búsqueda: ${this.searchQuery() ?? ''}`);

  protected readonly availableSources = computed(() => {
    const uniqueSources = new Set(this.searchNews().map((item) => item.source));
    return [...uniqueSources].sort((left, right) => left.localeCompare(right, 'es'));
  });

  protected readonly activeSelectedSources = computed(() => {
    const currentSelection = this.sourceSelection();
    if (!currentSelection.hasCustomSelection) {
      return this.availableSources();
    }

    if (currentSelection.selectedSources.length === 0) {
      return [];
    }

    const availableSourceSet = new Set(this.availableSources());
    const persistedSelection = currentSelection.selectedSources.filter((source) => availableSourceSet.has(source));
    return persistedSelection.length > 0 ? persistedSelection : this.availableSources();
  });

  protected readonly filteredSearchNews = computed(() => {
    const selectedSourceSet = new Set(this.activeSelectedSources());
    const filteredNews = this.searchNews().filter((item) => selectedSourceSet.has(item.source));

    return [...filteredNews].sort((left, right) => {
      const leftTime = Date.parse(left.publishedAt);
      const rightTime = Date.parse(right.publishedAt);
      return this.sortDirection() === 'desc' ? rightTime - leftTime : leftTime - rightTime;
    });
  });
  protected readonly visibleSearchNews = computed(() => this.filteredSearchNews().slice(0, this.visibleNewsCount()));
  protected readonly hasMoreNews = computed(() => this.filteredSearchNews().length > this.visibleSearchNews().length);

  protected readonly searchUiState = computed(() => {
    const query = this.searchNewsQuery();
    if (!query) {
      return UI_VIEW_STATE.EMPTY;
    }

    return resolveSectionUiState({
      loading: this.newsStore.isInitialLoading(query),
      error: this.newsStore.error(query),
      warnings: this.newsStore.warnings(query),
      itemCount: this.filteredSearchNews().length,
    });
  });
  protected readonly isRefreshing = computed(() => {
    const query = this.searchNewsQuery();
    return query ? this.newsStore.isRefreshing(query) : false;
  });
  protected readonly isShowingStaleData = computed(() => {
    const query = this.searchNewsQuery();
    return query ? this.newsStore.isShowingStaleData(query) : false;
  });
  protected readonly hasFreshUpdateAvailable = computed(() => {
    const query = this.searchNewsQuery();
    return query ? this.newsStore.hasFreshUpdateAvailable(query) : false;
  });
  protected readonly hasNewSinceLastVisit = computed(() => {
    const query = this.searchNewsQuery();
    return query ? this.newsStore.hasNewSinceLastVisit(query) : false;
  });
  protected readonly newSinceLastVisitCount = computed(() => {
    const query = this.searchNewsQuery();
    return query ? this.newsStore.newSinceLastVisitCount(query) : 0;
  });
  protected readonly lastUpdated = computed(() => {
    const query = this.searchNewsQuery();
    return query ? this.newsStore.lastUpdated(query) : null;
  });

  ngOnInit(): void {
    this.syncFromRouteSnapshot();

    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      if (!(event instanceof NavigationEnd)) {
        return;
      }

      this.syncFromRouteSnapshot();
    });
  }

  protected onDraftSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.draftSearchQuery.set(input?.value ?? '');
  }

  protected submitSearch(event: Event): void {
    event.preventDefault();

    const query = normalizeSearchQuery(this.draftSearchQuery());
    void this.router.navigate(['/buscar'], {
      queryParams: query ? { q: query } : {},
    });
  }

  protected clearSearch(): void {
    this.draftSearchQuery.set('');
    void this.router.navigate(['/buscar']);
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
    this.persistViewPreferences();
  }

  protected onSortDirectionChange(direction: 'asc' | 'desc'): void {
    this.visibleNewsCount.set(SECTION_PAGE_INITIAL_VISIBLE_NEWS_COUNT);
    this.sortDirection.set(direction);
    this.persistViewPreferences();
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
    const query = this.searchNewsQuery();
    if (!query) {
      return;
    }

    this.newsStore.dismissFreshUpdateNotice(query);
  }

  protected dismissLastVisitNotice(): void {
    const query = this.searchNewsQuery();
    if (!query) {
      return;
    }

    this.newsStore.dismissLastVisitNotice(query);
  }

  private syncFromRouteSnapshot(): void {
    const query = normalizeSearchQuery(this.route.snapshot.queryParamMap.get('q'));
    const searchNewsQuery = query ? createSearchNewsQuery(query) : null;
    const storedPreferences = searchNewsQuery
      ? this.newsViewPreferencesStore.read(toNewsRequestSnapshotKey(searchNewsQuery))
      : null;

    this.searchQuery.set(query);
    this.draftSearchQuery.set(query ?? '');
    this.sourceSelection.set({
      hasCustomSelection: storedPreferences?.hasCustomSelection ?? false,
      selectedSources: storedPreferences?.selectedValues ?? [],
    });
    this.filtersOpen.set(false);
    this.sortDirection.set(storedPreferences?.sortDirection ?? 'desc');
    this.visibleNewsCount.set(SECTION_PAGE_INITIAL_VISIBLE_NEWS_COUNT);

    if (searchNewsQuery) {
      this.newsStore.load(searchNewsQuery);
    }
  }

  private persistViewPreferences(): void {
    const query = this.searchNewsQuery();
    if (!query) {
      return;
    }

    this.newsViewPreferencesStore.write(toNewsRequestSnapshotKey(query), {
      hasCustomSelection: this.sourceSelection().hasCustomSelection,
      selectedValues: this.sourceSelection().selectedSources,
      sortDirection: this.sortDirection(),
    });
  }
}

function normalizeSearchQuery(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { IconEyeComponent } from '../../components/icons/icon-eye.component';
import { IconFilterComponent } from '../../components/icons/icon-filter.component';
import { PageContainerComponent } from '../../components/layout/page-container.component';
import { ErrorStateComponent } from '../../components/news/error-state.component';
import { NewsCardComponent } from '../../components/news/news-card.component';
import { NewsQuickViewModalComponent } from '../../components/news/news-quick-view-modal.component';
import { NewsRefreshIndicatorComponent } from '../../components/news/news-refresh-indicator.component';
import { SectionPageSkeletonComponent } from '../../components/news/skeletons/section-page-skeleton.component';
import { SourceSectionFiltersComponent } from '../../components/news/source-section-filters.component';
import {
  SECTION_PAGE_INITIAL_VISIBLE_NEWS_COUNT,
  SECTION_PAGE_LOAD_MORE_NEWS_STEP,
} from '../../constants/section-page.constants';
import { UI_VIEW_STATE } from '../../interfaces/ui-view-state.interface';
import { createSourceNewsQuery } from '../../lib/news-query-factory';
import { toNewsRequestSnapshotKey } from '../../lib/news-request';
import { NewsViewPreferencesStore } from '../../lib/news-view-preferences-store';
import { NewsStore } from '../../stores/news.store';
import { SourcesStore } from '../../stores/sources.store';
import { adaptArticlesToNewsItems } from '../../utils/api-ui-adapters';
import { formatSectionLabel } from '../../utils/section-label';
import { findSourceBySlug, toSourceSlug } from '../../utils/source-routing';
import { resolveSectionUiState } from '../../utils/ui-state-matrix';

import type { NewsItem } from '../../interfaces/news-item.interface';
import type { OnInit } from '@angular/core';

interface SectionSelectionState {
  readonly hasCustomSelection: boolean;
  readonly selectedSections: readonly string[];
}

@Component({
  selector: 'app-source-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageContainerComponent,
    ErrorStateComponent,
    NewsCardComponent,
    NewsQuickViewModalComponent,
    NewsRefreshIndicatorComponent,
    SourceSectionFiltersComponent,
    SectionPageSkeletonComponent,
    IconFilterComponent,
    IconEyeComponent,
  ],
  template: `
    <app-page-container>
      <section class="pt-1 pb-4 sm:pb-6">
        @if (isResolvingSource()) {
          <app-section-page-skeleton />
        } @else if (missingSource()) {
          <app-error-state
            headline="No encontramos este periódico"
            message="La fuente solicitada no existe o no está disponible en el catálogo actual."
          />
        } @else {
          <header class="mb-5 space-y-2 border-b border-border pb-4">
            <p class="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Fuente</p>
            <h1 class="font-editorial-title text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
              {{ sourceTitle() }}
            </h1>
            <p class="font-editorial-body max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
              Todas las noticias disponibles de este medio, con filtros por sección para acotar la cobertura.
            </p>
          </header>

          @if (sourceUiState() === uiViewState.LOADING) {
            <app-section-page-skeleton />
          } @else if (sourceUiState() === uiViewState.ERROR_TOTAL) {
            <app-error-state
              headline="No se han podido cargar noticias de esta fuente"
              message="Estamos teniendo problemas para cargar este medio. Inténtalo de nuevo en unos minutos."
            />
          } @else {
            <app-news-refresh-indicator
              [scopeLabel]="sourceTitle()"
              [isRefreshing]="isRefreshing()"
              [isShowingStaleData]="isShowingStaleData()"
              [hasFreshUpdateAvailable]="hasFreshUpdateAvailable()"
              [hasNewSinceLastVisit]="hasNewSinceLastVisit()"
              [newSinceLastVisitCount]="newSinceLastVisitCount()"
              [lastUpdated]="lastUpdated()"
              (dismissed)="dismissFreshUpdateNotice()"
              (lastVisitDismissed)="dismissLastVisitNotice()"
            />

            @if (hasSourceNews()) {
              <div class="mb-4 flex justify-start">
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-md border border-border bg-foreground px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  (click)="toggleFilters()"
                >
                  <app-icon-filter />
                  {{ filtersOpen() ? 'Ocultar filtros' : 'Filtrar secciones' }}
                </button>
              </div>

              @if (filtersOpen()) {
                <div class="mb-5">
                  <app-source-section-filters
                    [sections]="availableSections()"
                    [selectedSections]="activeSelectedSections()"
                    [sortDirection]="sortDirection()"
                    (selectedSectionsChange)="onSelectedSectionsChange($event)"
                    (sortDirectionChange)="onSortDirectionChange($event)"
                  />
                </div>
              }
            }

            @if (sourceUiState() === uiViewState.EMPTY) {
              <app-error-state
                headline="No hay noticias para esta combinación"
                message="No encontramos resultados para las secciones seleccionadas dentro de este medio."
              />
            } @else {
              <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                @for (item of visibleSourceNews(); track item.id) {
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
        }
      </section>
    </app-page-container>
    <app-news-quick-view-modal [article]="quickViewArticle()" (closed)="closeQuickView()" />
  `,
})
export class SourcePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly newsStore = inject(NewsStore);
  private readonly newsViewPreferencesStore = inject(NewsViewPreferencesStore);
  private readonly sourcesStore = inject(SourcesStore);
  private readonly sectionSelection = signal<SectionSelectionState>({
    hasCustomSelection: false,
    selectedSections: [],
  });
  private readonly appliedPreferencesScopeKey = signal<string | null>(null);
  private readonly visibleNewsCount = signal(SECTION_PAGE_INITIAL_VISIBLE_NEWS_COUNT);
  protected readonly quickViewArticle = signal<NewsItem | null>(null);
  protected readonly uiViewState = UI_VIEW_STATE;
  protected readonly filtersOpen = signal(false);
  protected readonly sortDirection = signal<'asc' | 'desc'>('desc');
  protected readonly sourceSlug = signal(this.route.snapshot.paramMap.get('slug'));

  protected readonly resolvedSource = computed(() => {
    const sources = this.sourcesStore.data()?.sources ?? [];
    return findSourceBySlug(sources, this.sourceSlug());
  });
  protected readonly sourceTitle = computed(() => this.resolvedSource()?.name ?? 'Fuente');

  private readonly sourceNewsQuery = computed(() => {
    const source = this.resolvedSource();
    return source ? createSourceNewsQuery(source.id) : null;
  });
  private readonly sourceArticles = computed(() => {
    const source = this.resolvedSource();
    const query = this.sourceNewsQuery();
    if (!source || !query) {
      return [];
    }

    const sourceSlug = toSourceSlug(source.id, source.name);
    return this.newsStore.data(query).filter((article) => toSourceSlug(article.sourceId, article.sourceName) === sourceSlug);
  });
  protected readonly sourceNews = computed(() => adaptArticlesToNewsItems(this.sourceArticles()));
  protected readonly hasSourceNews = computed(() => this.sourceNews().length > 0);

  protected readonly availableSections = computed(() => {
    const source = this.resolvedSource();
    const sourceSectionSlugs = source?.sectionSlugs ?? [];
    const newsSectionSlugs = this.sourceNews().map((item) => item.section);
    const uniqueSections = [...new Set([...sourceSectionSlugs, ...newsSectionSlugs])];
    return uniqueSections.sort((left, right) =>
      formatSectionLabel(left).localeCompare(formatSectionLabel(right), 'es'),
    );
  });

  protected readonly activeSelectedSections = computed(() => {
    const currentSelection = this.sectionSelection();
    if (!currentSelection.hasCustomSelection) {
      return this.availableSections();
    }

    if (currentSelection.selectedSections.length === 0) {
      return [];
    }

    const availableSectionSet = new Set(this.availableSections());
    const persistedSelection = currentSelection.selectedSections.filter((section) => availableSectionSet.has(section));
    return persistedSelection.length > 0 ? persistedSelection : this.availableSections();
  });

  protected readonly filteredSourceNews = computed(() => {
    const selectedSectionSet = new Set(this.activeSelectedSections());
    const filteredNews = this.sourceNews().filter((item) => selectedSectionSet.has(item.section));

    return [...filteredNews].sort((left, right) => {
      const leftTime = Date.parse(left.publishedAt);
      const rightTime = Date.parse(right.publishedAt);
      return this.sortDirection() === 'desc' ? rightTime - leftTime : leftTime - rightTime;
    });
  });
  protected readonly visibleSourceNews = computed(() => this.filteredSourceNews().slice(0, this.visibleNewsCount()));
  protected readonly hasMoreNews = computed(() => this.filteredSourceNews().length > this.visibleSourceNews().length);

  protected readonly isResolvingSource = computed(
    () => this.sourcesStore.loading() && this.sourcesStore.data() === null && this.resolvedSource() === null,
  );
  protected readonly missingSource = computed(
    () => !this.sourcesStore.loading() && this.sourcesStore.data() !== null && this.resolvedSource() === null,
  );

  protected readonly sourceUiState = computed(() => {
    const query = this.sourceNewsQuery();
    if (!query) {
      return UI_VIEW_STATE.LOADING;
    }

    return resolveSectionUiState({
      loading: this.newsStore.isInitialLoading(query),
      error: this.newsStore.error(query),
      warnings: this.newsStore.warnings(query),
      itemCount: this.filteredSourceNews().length,
    });
  });
  protected readonly isRefreshing = computed(() => {
    const query = this.sourceNewsQuery();
    return query ? this.newsStore.isRefreshing(query) : false;
  });
  protected readonly isShowingStaleData = computed(() => {
    const query = this.sourceNewsQuery();
    return query ? this.newsStore.isShowingStaleData(query) : false;
  });
  protected readonly hasFreshUpdateAvailable = computed(() => {
    const query = this.sourceNewsQuery();
    return query ? this.newsStore.hasFreshUpdateAvailable(query) : false;
  });
  protected readonly hasNewSinceLastVisit = computed(() => {
    const query = this.sourceNewsQuery();
    return query ? this.newsStore.hasNewSinceLastVisit(query) : false;
  });
  protected readonly newSinceLastVisitCount = computed(() => {
    const query = this.sourceNewsQuery();
    return query ? this.newsStore.newSinceLastVisitCount(query) : 0;
  });
  protected readonly lastUpdated = computed(() => {
    const query = this.sourceNewsQuery();
    return query ? this.newsStore.lastUpdated(query) : null;
  });

  private readonly sourceNewsLoader = effect(() => {
    const source = this.resolvedSource();
    if (!source) {
      return;
    }

    const sourceNewsQuery = createSourceNewsQuery(source.id);
    const preferencesScopeKey = toNewsRequestSnapshotKey(sourceNewsQuery);
    if (this.appliedPreferencesScopeKey() !== preferencesScopeKey) {
      const storedPreferences = this.newsViewPreferencesStore.read(preferencesScopeKey);
      this.sectionSelection.set({
        hasCustomSelection: storedPreferences?.hasCustomSelection ?? false,
        selectedSections: storedPreferences?.selectedValues ?? [],
      });
      this.sortDirection.set(storedPreferences?.sortDirection ?? 'desc');
      this.appliedPreferencesScopeKey.set(preferencesScopeKey);
    }

    this.newsStore.load(sourceNewsQuery);
  });

  ngOnInit(): void {
    this.sourcesStore.loadInitial();
    this.syncFromRouteSnapshot();

    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      if (!(event instanceof NavigationEnd)) {
        return;
      }

      this.syncFromRouteSnapshot();
    });
  }

  protected toggleFilters(): void {
    this.filtersOpen.update((value) => !value);
  }

  protected onSelectedSectionsChange(nextSections: readonly string[]): void {
    this.visibleNewsCount.set(SECTION_PAGE_INITIAL_VISIBLE_NEWS_COUNT);
    this.sectionSelection.set({
      hasCustomSelection: true,
      selectedSections: nextSections,
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
    const query = this.sourceNewsQuery();
    if (!query) {
      return;
    }

    this.newsStore.dismissFreshUpdateNotice(query);
  }

  protected dismissLastVisitNotice(): void {
    const query = this.sourceNewsQuery();
    if (!query) {
      return;
    }

    this.newsStore.dismissLastVisitNotice(query);
  }

  private syncFromRouteSnapshot(): void {
    this.sourceSlug.set(this.route.snapshot.paramMap.get('slug'));
    this.appliedPreferencesScopeKey.set(null);
    this.sectionSelection.set({
      hasCustomSelection: false,
      selectedSections: [],
    });
    this.filtersOpen.set(false);
    this.sortDirection.set('desc');
    this.visibleNewsCount.set(SECTION_PAGE_INITIAL_VISIBLE_NEWS_COUNT);
  }

  private persistViewPreferences(): void {
    const query = this.sourceNewsQuery();
    if (!query) {
      return;
    }

    this.newsViewPreferencesStore.write(toNewsRequestSnapshotKey(query), {
      hasCustomSelection: this.sectionSelection().hasCustomSelection,
      selectedValues: this.sectionSelection().selectedSections,
      sortDirection: this.sortDirection(),
    });
  }
}

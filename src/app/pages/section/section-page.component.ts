import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import { IconEyeComponent } from '../../components/icons/icon-eye.component';
import { IconFilterComponent } from '../../components/icons/icon-filter.component';
import { PageContainerComponent } from '../../components/layout/page-container.component';
import { ErrorStateComponent } from '../../components/news/error-state.component';
import { NewsCardComponent } from '../../components/news/news-card.component';
import { SectionFiltersComponent } from '../../components/news/section-filters.component';
import { MAX_FEED_NEWS_LIMIT } from '../../constants/news-limit.constants';
import { UI_VIEW_STATE } from '../../interfaces/ui-view-state.interface';
import { NewsStore } from '../../stores/news.store';
import { adaptArticlesToNewsItems } from '../../utils/api-ui-adapters';
import { resolveSectionUiState } from '../../utils/ui-state-matrix';

@Component({
  selector: 'app-section-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageContainerComponent,
    NewsCardComponent,
    ErrorStateComponent,
    SectionFiltersComponent,
    IconFilterComponent,
    IconEyeComponent,
  ],
  template: `
    <app-page-container>
      <section class="pt-1 pb-4 sm:pb-6">
        <h1 class="sr-only">{{ sectionTitle() }}</h1>

        @if (sectionUiState() === uiViewState.LOADING) {
          <p class="text-sm text-muted-foreground">Cargando seccion...</p>
        } @else if (sectionUiState() === uiViewState.ERROR_TOTAL) {
          <app-error-state
            headline="No se han podido cargar noticias"
            message="Estamos teniendo problemas para cargar esta seccion. Intentalo de nuevo en unos minutos."
          />
        } @else if (sectionUiState() === uiViewState.EMPTY) {
          <app-error-state
            headline="No hay noticias en esta seccion"
            message="No encontramos resultados para los filtros actuales. Prueba con otra combinacion."
          />
        } @else {
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
                (sortDirectionChange)="sortDirection.set($event)"
              />
            </div>
          }

          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            @for (item of visibleSectionNews(); track item.id) {
              <app-news-card [article]="item" />
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
      </section>
    </app-page-container>
  `,
})
export class SectionPageComponent {
  private static readonly INITIAL_VISIBLE_NEWS_COUNT = 24;
  private static readonly LOAD_MORE_NEWS_STEP = 12;

  private readonly route = inject(ActivatedRoute);
  private readonly newsStore = inject(NewsStore);
  private readonly selectedSources = signal<readonly string[]>([]);
  private readonly visibleNewsCount = signal(SectionPageComponent.INITIAL_VISIBLE_NEWS_COUNT);
  protected readonly uiViewState = UI_VIEW_STATE;
  protected readonly filtersOpen = signal(false);
  protected readonly sortDirection = signal<'asc' | 'desc'>('desc');
  private readonly hasCustomSourceSelection = signal(false);

  protected readonly sectionSlug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug') ?? 'actualidad')),
    { initialValue: 'actualidad' },
  );

  private readonly queryFilters = toSignal(
    this.route.queryParamMap.pipe(
      map((params) => ({
        sourceIds: parseSourceIds(params.get('source')),
        searchQuery: normalizeQueryValue(params.get('q')),
        page: parsePositiveNumber(params.get('page'), 1),
        limit: parsePositiveNumber(params.get('limit'), MAX_FEED_NEWS_LIMIT),
      })),
    ),
    {
      initialValue: {
        sourceIds: [] as readonly string[],
        searchQuery: null as string | null,
        page: 1,
        limit: MAX_FEED_NEWS_LIMIT,
      },
    },
  );

  protected readonly sectionTitle = computed(() => formatSectionLabel(this.sectionSlug()));
  private readonly sectionArticles = computed(() =>
    this.newsStore.data().filter((article) => article.sectionSlug === this.sectionSlug()),
  );
  protected readonly sectionNews = computed(() => adaptArticlesToNewsItems(this.sectionArticles()));

  protected readonly availableSources = computed(() => {
    const uniqueSources = new Set(this.sectionNews().map((item) => item.source));
    return [...uniqueSources].sort((left, right) => left.localeCompare(right, 'es'));
  });

  protected readonly activeSelectedSources = computed(() => {
    if (!this.hasCustomSourceSelection()) {
      return this.availableSources();
    }

    return this.selectedSources();
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
      loading: this.newsStore.loading(),
      error: this.newsStore.error(),
      warnings: this.newsStore.warnings(),
      itemCount: this.filteredSectionNews().length,
    }),
  );

  constructor() {
    effect(() => {
      this.sectionSlug();
      this.selectedSources.set([]);
      this.filtersOpen.set(false);
      this.hasCustomSourceSelection.set(false);
      this.sortDirection.set('desc');
    });

    effect(() => {
      this.sectionSlug();
      this.queryFilters();
      this.activeSelectedSources();
      this.sortDirection();
      this.visibleNewsCount.set(SectionPageComponent.INITIAL_VISIBLE_NEWS_COUNT);
    });

    effect(() => {
      const slug = this.sectionSlug();
      const filters = this.queryFilters();

      this.newsStore.load({
        section: slug,
        sourceIds: filters.sourceIds,
        searchQuery: filters.searchQuery,
        page: filters.page,
        limit: filters.limit,
      });
    });
  }

  protected toggleFilters(): void {
    this.filtersOpen.update((value) => !value);
  }

  protected onSelectedSourcesChange(nextSources: readonly string[]): void {
    this.hasCustomSourceSelection.set(true);
    this.selectedSources.set(nextSources);
  }

  protected loadMoreNews(): void {
    this.visibleNewsCount.update((count) => count + SectionPageComponent.LOAD_MORE_NEWS_STEP);
  }
}

function formatSectionLabel(slug: string): string {
  const words = slug
    .split('-')
    .filter((part) => part.length > 0)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`);

  return words.length > 0 ? words.join(' ') : 'Actualidad';
}

function parseSourceIds(value: string | null): readonly string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((sourceId) => normalizeQueryValue(sourceId))
    .filter((sourceId): sourceId is string => Boolean(sourceId));
}

function normalizeQueryValue(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

function parsePositiveNumber(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

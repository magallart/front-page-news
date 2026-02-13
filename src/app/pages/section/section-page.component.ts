import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import { PageContainerComponent } from '../../components/layout/page-container.component';
import { ErrorStateComponent } from '../../components/news/error-state.component';
import { NewsCardComponent } from '../../components/news/news-card.component';
import { SectionFiltersComponent } from '../../components/news/section-filters.component';
import { MockNewsService } from '../../services/mock-news.service';

@Component({
  selector: 'app-section-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageContainerComponent, NewsCardComponent, ErrorStateComponent, SectionFiltersComponent],
  template: `
    <app-page-container>
      <section class="pt-1 pb-4 sm:pb-6">
        <h1 class="sr-only">{{ sectionTitle() }}</h1>

        @if (sectionNews().length > 0) {
          <div class="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
            <app-section-filters
              [sources]="availableSources()"
              [selectedSources]="activeSelectedSources()"
              [sortDirection]="sortDirection()"
              (selectedSourcesChange)="onSelectedSourcesChange($event)"
              (sortDirectionChange)="sortDirection.set($event)"
            />

            @if (filteredSectionNews().length > 0) {
              <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                @for (item of filteredSectionNews(); track item.id) {
                  <app-news-card [article]="item" />
                }
              </div>
            } @else {
              <app-error-state
                headline="Algo ha salido mal..."
                message="Nuestros periodistas están peleándose con el WiFi. Vuelve en un momento."
              />
            }
          </div>
        } @else {
          <app-error-state
            headline="Algo ha salido mal..."
            message="Nuestros periodistas están peleándose con el WiFi. Vuelve en un momento."
          />
        }
      </section>
    </app-page-container>
  `,
})
export class SectionPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly mockNewsService = inject(MockNewsService);
  private readonly selectedSources = signal<readonly string[]>([]);
  protected readonly sortDirection = signal<'asc' | 'desc'>('desc');
  private readonly hasCustomSourceSelection = signal(false);

  protected readonly sectionSlug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug') ?? 'actualidad')),
    { initialValue: 'actualidad' },
  );

  protected readonly sectionTitle = computed(() => formatSectionLabel(this.sectionSlug()));
  protected readonly sectionNews = computed(() => this.mockNewsService.getSectionNews(this.sectionSlug()));

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

  constructor() {
    effect(() => {
      this.sectionSlug();
      this.selectedSources.set([]);
      this.hasCustomSourceSelection.set(false);
      this.sortDirection.set('desc');
    });
  }

  protected onSelectedSourcesChange(nextSources: readonly string[]): void {
    this.hasCustomSourceSelection.set(true);
    this.selectedSources.set(nextSources);
  }
}

function formatSectionLabel(slug: string): string {
  const words = slug
    .split('-')
    .filter((part) => part.length > 0)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`);

  return words.length > 0 ? words.join(' ') : 'Actualidad';
}

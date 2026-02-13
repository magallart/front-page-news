import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import { PageContainerComponent } from '../../components/layout/page-container.component';
import { NewsCardComponent } from '../../components/news/news-card.component';
import { MockNewsService } from '../../services/mock-news.service';

@Component({
  selector: 'app-section-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageContainerComponent, NewsCardComponent],
  template: `
    <app-page-container>
      <section class="space-y-6 py-4 sm:space-y-8">
        <header class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Seccion</p>
          <h1 class="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {{ sectionTitle() }}
          </h1>
          <p class="text-sm text-muted-foreground sm:text-base">
            Cobertura actualizada de la seccion {{ sectionTitle() }}.
          </p>
        </header>

        @if (sectionNews().length > 0) {
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            @for (item of sectionNews(); track item.id) {
              <app-news-card [article]="item" />
            }
          </div>
        } @else {
          <p class="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            No hay noticias disponibles para esta seccion.
          </p>
        }
      </section>
    </app-page-container>
  `,
})
export class SectionPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly mockNewsService = inject(MockNewsService);

  protected readonly sectionSlug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug') ?? 'actualidad')),
    { initialValue: 'actualidad' },
  );

  protected readonly sectionTitle = computed(() => formatSectionLabel(this.sectionSlug()));
  protected readonly sectionNews = computed(() => this.mockNewsService.getSectionNews(this.sectionSlug()));
}

function formatSectionLabel(slug: string): string {
  const words = slug
    .split('-')
    .filter((part) => part.length > 0)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`);

  return words.length > 0 ? words.join(' ') : 'Actualidad';
}

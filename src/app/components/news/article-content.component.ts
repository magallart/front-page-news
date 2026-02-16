import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ArticleLockedPreviewComponent } from './article-locked-preview.component';
import { ArticleMetadataComponent } from './article-metadata.component';
import { ArticlePreviewCtaComponent } from './article-preview-cta.component';

import type { NewsItem } from '../../interfaces/news-item.interface';

@Component({
  selector: 'app-article-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ArticleMetadataComponent, ArticleLockedPreviewComponent, ArticlePreviewCtaComponent],
  template: `
    <article class="space-y-6 sm:space-y-7">
      <header class="space-y-4">
        <a
          class="inline-flex rounded-sm bg-secondary px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-secondary-foreground transition hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          [routerLink]="['/seccion', article().section]"
        >
          {{ formattedSection() }}
        </a>

        <h1 class="font-editorial-title text-3xl font-semibold leading-[1.2] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {{ article().title }}
        </h1>

        <div class="pt-2 sm:pt-3">
          <app-article-metadata [author]="article().author" [source]="article().source" [publishedAt]="article().publishedAt" />
        </div>
      </header>

      <div class="overflow-hidden rounded-xl border border-border bg-muted">
        <img [src]="article().imageUrl" [alt]="article().title" class="aspect-[16/9] w-full object-cover" loading="eager" />
      </div>

      <div class="font-editorial-body space-y-5 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
        @for (paragraph of articleParagraphs(); track $index) {
          <p>{{ paragraph }}</p>
        }
      </div>

      <app-article-locked-preview />

      <div class="pt-2 sm:pt-4">
        <app-article-preview-cta [url]="article().url" [source]="article().source" />
      </div>
    </article>
  `,
})
export class ArticleContentComponent {
  readonly article = input.required<NewsItem>();

  protected readonly formattedSection = computed(() => formatSectionLabel(this.article().section));
  protected readonly articleParagraphs = computed(() => {
    const item = this.article();

    return [
      item.summary,
      `Segun fuentes de ${item.source}, este avance refuerza la cobertura en ${formatSectionLabel(item.section).toLowerCase()} y abre nuevas lineas de seguimiento editorial en los proximos dias.`,
      'El equipo de redaccion mantendra esta historia en actualizacion constante para aportar contexto, datos verificados y el impacto directo en la audiencia.',
    ] as const;
  });
}

function formatSectionLabel(section: string): string {
  if (!section) {
    return 'Actualidad';
  }

  return `${section.charAt(0).toUpperCase()}${section.slice(1)}`;
}

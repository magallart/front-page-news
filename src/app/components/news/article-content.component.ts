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
          [routerLink]="['/seccion', safeArticle().section]"
        >
          {{ formattedSection() }}
        </a>

        <h1 class="font-editorial-title text-3xl font-semibold leading-[1.2] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {{ safeArticle().title }}
        </h1>

        <div class="pt-2 sm:pt-3">
          <app-article-metadata
            [author]="safeArticle().author"
            [source]="safeArticle().source"
            [publishedAt]="safeArticle().publishedAt"
          />
        </div>
      </header>

      <div class="overflow-hidden rounded-xl border border-border bg-muted">
        <img [src]="safeArticle().imageUrl" [alt]="safeArticle().title" class="aspect-[16/9] w-full object-cover" loading="eager" />
      </div>

      <div class="font-editorial-body space-y-5 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
        @for (paragraph of articleParagraphs(); track $index) {
          <p>{{ paragraph }}</p>
        }
      </div>

      <div class="mt-3 sm:mt-4">
        <app-article-locked-preview />
      </div>

      <div class="pt-2 sm:pt-4">
        <app-article-preview-cta [url]="safeArticle().url" [source]="safeArticle().source" />
      </div>
    </article>
  `,
})
export class ArticleContentComponent {
  readonly article = input.required<NewsItem>();

  protected readonly safeArticle = computed(() => {
    const item = this.article();
    const section = normalizeOrFallback(item.section, 'actualidad');
    const source = normalizeOrFallback(item.source, 'Front Page News');

    return {
      title: normalizeOrFallback(item.title, 'Noticia sin titular disponible'),
      summary: normalizeOrFallback(item.summary, 'Esta noticia no incluye resumen disponible en este momento.'),
      imageUrl: normalizeOrFallback(item.imageUrl, '/images/no-image.jpg'),
      source,
      section,
      publishedAt: item.publishedAt,
      author: normalizeOrFallback(item.author, 'Redacción Front Page News'),
      url: normalizeOrFallback(item.url, '/'),
    } as const;
  });

  protected readonly formattedSection = computed(() => formatSectionLabel(this.safeArticle().section));
  protected readonly articleParagraphs = computed(() => {
    const item = this.safeArticle();

    return [
      item.summary,
      `Según fuentes de ${item.source}, este avance refuerza la cobertura en ${formatSectionLabel(item.section).toLowerCase()} y abre nuevas líneas de seguimiento editorial en los próximos días.`,
      'El equipo de redacción mantendrá esta historia en actualización constante para aportar contexto, datos verificados y el impacto directo en la audiencia.',
    ] as const;
  });
}

function formatSectionLabel(section: string): string {
  if (!section) {
    return 'Actualidad';
  }

  return `${section.charAt(0).toUpperCase()}${section.slice(1)}`;
}

function normalizeOrFallback(value: string, fallback: string): string {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : fallback;
}

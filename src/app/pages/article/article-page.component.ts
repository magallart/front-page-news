import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { PageContainerComponent } from '../../components/layout/page-container.component';
import { ArticleMetadataComponent } from '../../components/news/article-metadata.component';
import { ArticlePreviewCtaComponent } from '../../components/news/article-preview-cta.component';
import { BreakingNewsComponent } from '../../components/news/breaking-news.component';
import { MostReadNewsComponent } from '../../components/news/most-read-news.component';
import { MockNewsService } from '../../services/mock-news.service';

@Component({
  selector: 'app-article-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    PageContainerComponent,
    ArticleMetadataComponent,
    ArticlePreviewCtaComponent,
    BreakingNewsComponent,
    MostReadNewsComponent,
  ],
  template: `
    <app-page-container>
      <section class="space-y-6 py-4 sm:space-y-8">
        <div class="grid gap-5 lg:grid-cols-[minmax(0,2fr)_22rem] lg:items-start">
          <div>
            @if (article(); as item) {
              <article class="space-y-6 sm:space-y-7">
                <header class="space-y-4">
                  <a
                    class="inline-flex rounded-sm bg-secondary px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-secondary-foreground transition hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    [routerLink]="['/seccion', item.section]"
                  >
                    {{ formatSection(item.section) }}
                  </a>

                  <h1 class="font-editorial-title text-3xl font-semibold leading-[1.2] tracking-tight text-foreground sm:text-5xl">
                    {{ item.title }}
                  </h1>

                  <div class="pt-2 sm:pt-3">
                    <app-article-metadata [author]="item.author" [source]="item.source" [publishedAt]="item.publishedAt" />
                  </div>
                </header>

                <div class="overflow-hidden rounded-xl border border-border bg-muted">
                  <img [src]="item.imageUrl" [alt]="item.title" class="aspect-[16/9] w-full object-cover" loading="eager" />
                </div>

                <div class="font-editorial-body space-y-5 text-lg leading-8 text-muted-foreground">
                  @for (paragraph of articleParagraphs(); track $index) {
                    <p>{{ paragraph }}</p>
                  }
                </div>

                <div class="pt-2 sm:pt-4">
                  <app-article-preview-cta [url]="item.url" [source]="item.source" />
                </div>
              </article>
            } @else {
              <article class="rounded-xl border border-border bg-card p-6 shadow-subtle">
                <h1 class="font-editorial-title text-3xl font-semibold text-foreground sm:text-4xl">Noticia no encontrada</h1>
                <p class="mt-4 text-base text-muted-foreground">
                  No hemos encontrado la noticia solicitada. Vuelve a portada para seguir navegando.
                </p>
                <a
                  class="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  routerLink="/"
                >
                  Ir a portada
                </a>
              </article>
            }
          </div>

          <aside class="space-y-6 sm:space-y-8 lg:pl-5">
            <app-breaking-news [items]="breakingNews" />
            <div class="mt-8">
              <app-most-read-news [items]="mostReadNews" />
            </div>
          </aside>
        </div>
      </section>
    </app-page-container>
  `,
})
export class ArticlePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly mockNewsService = inject(MockNewsService);

  protected readonly articleId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? 'sin-id')),
    { initialValue: 'sin-id' },
  );

  protected readonly article = computed(() => this.mockNewsService.getNewsById(this.articleId()));
  protected readonly breakingNews = this.mockNewsService.getBreakingNews();
  protected readonly mostReadNews = this.mockNewsService.getMostReadNews(10);

  protected readonly articleParagraphs = computed(() => {
    const item = this.article();
    if (!item) {
      return [] as readonly string[];
    }

    return [
      item.summary,
      `Segun fuentes de ${item.source}, este avance refuerza la cobertura en ${this.formatSection(item.section).toLowerCase()} y abre nuevas lineas de seguimiento editorial en los proximos dias.`,
      `El equipo de redaccion mantendra esta historia en actualizacion constante para aportar contexto, datos verificados y el impacto directo en la audiencia.`,
    ] as const;
  });

  protected formatSection(section: string): string {
    if (!section) {
      return 'Actualidad';
    }

    return `${section.charAt(0).toUpperCase()}${section.slice(1)}`;
  }
}

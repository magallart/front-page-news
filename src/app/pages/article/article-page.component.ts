import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { PageContainerComponent } from '../../components/layout/page-container.component';

@Component({
  selector: 'app-article-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PageContainerComponent],
  template: `
    <app-page-container>
      <section class="space-y-6 py-4 sm:space-y-8">
        <nav aria-label="Breadcrumb" class="text-sm text-muted-foreground">
          <a
            class="hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            routerLink="/"
          >
            Portada
          </a>
          <span class="px-2">/</span>
          <a
            class="hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            routerLink="/seccion/actualidad"
          >
            Actualidad
          </a>
          <span class="px-2">/</span>
          <span class="text-foreground">Noticia</span>
        </nav>

        <article class="rounded-lg border border-border bg-card p-6 shadow-subtle">
          <header class="space-y-3">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Detalle de noticia</p>
            <h1 class="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Noticia {{ articleId() }}
            </h1>
            <p class="text-sm text-muted-foreground sm:text-base">
              Placeholder para mostrar resumen, autor, medio, fecha e imagen de la noticia RSS.
            </p>
          </header>

          <dl class="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt class="font-medium text-foreground">Autor</dt>
              <dd class="text-muted-foreground">{{ author() }}</dd>
            </div>
            <div>
              <dt class="font-medium text-foreground">Medio</dt>
              <dd class="text-muted-foreground">Pendiente de API</dd>
            </div>
            <div>
              <dt class="font-medium text-foreground">Fecha</dt>
              <dd class="text-muted-foreground">Pendiente de API</dd>
            </div>
            <div>
              <dt class="font-medium text-foreground">Seccion</dt>
              <dd class="text-muted-foreground">Actualidad</dd>
            </div>
          </dl>

          <a
            class="mt-8 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            href="https://example.com/noticia-original"
            target="_blank"
            rel="noopener noreferrer"
          >
            Leer en el medio original
          </a>
        </article>
      </section>
    </app-page-container>
  `,
})
export class ArticlePageComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly articleId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? 'sin-id')),
    { initialValue: 'sin-id' },
  );

  protected readonly author = computed(() => `Autor pendiente para ${this.articleId()}`);
}

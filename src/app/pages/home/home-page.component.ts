import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PageContainerComponent } from '../../components/layout/page-container.component';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PageContainerComponent],
  template: `
    <app-page-container>
      <section class="space-y-6 py-4 sm:space-y-8">
        <header class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Portada</p>
          <h1 class="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Portada de noticias</h1>
          <p class="max-w-3xl text-sm text-muted-foreground sm:text-base">
            Estructura base de portada para mostrar varias noticias de distintos periodicos en un solo portal.
          </p>
        </header>

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article class="rounded-lg border border-border bg-card p-4">
            <h2 class="font-heading text-lg font-semibold">Carousel destacadas</h2>
            <p class="mt-2 text-sm text-muted-foreground">Placeholder para noticias destacadas aleatorias.</p>
          </article>

          <article class="rounded-lg border border-border bg-card p-4">
            <h2 class="font-heading text-lg font-semibold">Actualidad</h2>
            <p class="mt-2 text-sm text-muted-foreground">Bloque para titulares de ultima hora.</p>
          </article>

          <article class="rounded-lg border border-border bg-card p-4">
            <h2 class="font-heading text-lg font-semibold">Noticias por seccion</h2>
            <p class="mt-2 text-sm text-muted-foreground">Resumen de 2-3 noticias por cada seccion.</p>
          </article>

          <article class="rounded-lg border border-border bg-card p-4">
            <h2 class="font-heading text-lg font-semibold">Lo mas leido</h2>
            <p class="mt-2 text-sm text-muted-foreground">Ranking editorial para lectura rapida.</p>
          </article>
        </div>

        <div class="flex flex-wrap gap-3">
          <a
            class="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            routerLink="/seccion/actualidad"
          >
            Ir a seccion actualidad
          </a>
          <a
            class="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            routerLink="/noticia/demo-noticia-001"
          >
            Ver detalle de noticia
          </a>
        </div>
      </section>
    </app-page-container>
  `,
})
export class HomePageComponent {}

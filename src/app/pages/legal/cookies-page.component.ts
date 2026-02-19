import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PageContainerComponent } from '../../components/layout/page-container.component';

@Component({
  selector: 'app-cookies-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageContainerComponent],
  template: `
    <app-page-container>
      <section class="mx-auto max-w-3xl space-y-6 py-4 sm:py-8">
        <header class="space-y-2 text-center">
          <h1 class="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Cookies</h1>
        </header>

        <article class="space-y-8 rounded-lg bg-card p-6 text-sm leading-7 text-card-foreground sm:p-8">
          <section class="space-y-2">
            <h2 class="font-heading text-xl font-semibold tracking-tight">1. Qué son las cookies</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam nec ante. Sed lacinia, urna non tincidunt
              mattis, tortor neque adipiscing diam, a cursus ipsum ante quis turpis.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="font-heading text-xl font-semibold tracking-tight">2. Tipos de cookies utilizadas</h2>
            <p>
              Nulla facilisi. Ut fringilla. Suspendisse potenti. Nunc feugiat mi a tellus consequat imperdiet.
              Vestibulum sapien. Proin quam.
            </p>
            <ul class="list-disc space-y-1 pl-5 text-card-foreground/90">
              <li>Cookies técnicas y funcionales.</li>
              <li>Cookies de analítica y rendimiento.</li>
              <li>Cookies de personalización de contenido.</li>
            </ul>
          </section>

          <section class="space-y-2">
            <h2 class="font-heading text-xl font-semibold tracking-tight">3. Finalidad</h2>
            <p>
              Etiam ultrices. Suspendisse in justo eu magna luctus suscipit. Sed lectus. Integer euismod lacus luctus
              magna. Quisque cursus, metus vitae pharetra auctor.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="font-heading text-xl font-semibold tracking-tight">4. Gestión y desactivación</h2>
            <p>
              Sem massa mattis sem, at interdum magna augue eget diam. Vestibulum ante ipsum primis in faucibus orci
              luctus et ultrices posuere cubilia curae.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="font-heading text-xl font-semibold tracking-tight">5. Cookies de terceros</h2>
            <p>
              Morbi lacinia molestie dui. Praesent blandit dolor. Sed non quam. In vel mi sit amet augue congue
              elementum.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="font-heading text-xl font-semibold tracking-tight">6. Actualizaciones de esta política</h2>
            <p>
              Morbi in ipsum sit amet pede facilisis laoreet. Donec lacus nunc, viverra nec, blandit vel, egestas et,
              augue.
            </p>
          </section>
        </article>
      </section>
    </app-page-container>
  `,
})
export class CookiesPageComponent {}

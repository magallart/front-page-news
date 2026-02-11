import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PageContainerComponent } from '../../components/layout/page-container.component';

@Component({
  selector: 'app-legal-notice-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageContainerComponent],
  template: `
    <app-page-container>
      <section class="mx-auto max-w-3xl space-y-6 py-4 sm:py-8">
        <header class="space-y-2 text-center">
          <h1 class="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Aviso legal</h1>
        </header>

        <article class="space-y-8 rounded-lg bg-card p-6 text-sm leading-7 text-card-foreground sm:p-8">
          <section class="space-y-2">
            <h2 class="font-heading text-xl font-semibold tracking-tight">1. Titularidad del sitio</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus
              ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="font-heading text-xl font-semibold tracking-tight">2. Objeto y ambito de aplicacion</h2>
            <p>
              Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum
              lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="font-heading text-xl font-semibold tracking-tight">3. Condiciones de uso</h2>
            <p>
              Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh.
              Aenean quam. In scelerisque sem at dolor.
            </p>
            <ul class="list-disc space-y-1 pl-5 text-card-foreground/90">
              <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
              <li>Vivamus luctus urna sed urna ultricies ac tempor dui sagittis.</li>
              <li>In condimentum facilisis porta.</li>
            </ul>
          </section>

          <section class="space-y-2">
            <h2 class="font-heading text-xl font-semibold tracking-tight">4. Propiedad intelectual e industrial</h2>
            <p>
              Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at
              dolor. Maecenas mattis. Sed convallis tristique sem.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="font-heading text-xl font-semibold tracking-tight">5. Responsabilidad</h2>
            <p>
              Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non,
              massa. Fusce ac turpis quis ligula lacinia aliquet.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="font-heading text-xl font-semibold tracking-tight">6. Legislacion aplicable</h2>
            <p>
              Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh. Quisque volutpat
              condimentum velit.
            </p>
          </section>
        </article>
      </section>
    </app-page-container>
  `,
})
export class LegalNoticePageComponent {}

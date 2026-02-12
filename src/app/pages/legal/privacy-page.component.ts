import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PageContainerComponent } from '../../components/layout/page-container.component';

@Component({
  selector: 'app-privacy-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageContainerComponent],
  template: `
    <app-page-container>
      <section class="mx-auto max-w-3xl space-y-6 py-4 sm:py-8">
        <header class="space-y-2 text-center">
          <h1 class="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Privacidad</h1>
        </header>

        <article class="space-y-8 rounded-lg bg-card p-6 text-sm leading-7 text-card-foreground sm:p-8">
          <section class="space-y-2">
            <h2 class="font-heading text-xl font-semibold tracking-tight">1. Responsable del tratamiento</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent libero. Sed cursus ante dapibus diam.
              Sed nisi. Nulla quis sem at nibh elementum imperdiet.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="font-heading text-xl font-semibold tracking-tight">2. Datos que recopilamos</h2>
            <p>Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa.</p>
            <ul class="list-disc space-y-1 pl-5 text-card-foreground/90">
              <li>Lorem ipsum dolor sit amet.</li>
              <li>Consectetur adipiscing elit.</li>
              <li>Integer nec odio praesent libero.</li>
            </ul>
          </section>

          <section class="space-y-2">
            <h2 class="font-heading text-xl font-semibold tracking-tight">3. Finalidades del tratamiento</h2>
            <p>
              Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra,
              per inceptos himenaeos. Curabitur sodales ligula in libero.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="font-heading text-xl font-semibold tracking-tight">4. Base juridica</h2>
            <p>
              Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at
              dolor. Maecenas mattis.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="font-heading text-xl font-semibold tracking-tight">5. Conservacion de datos</h2>
            <p>
              Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus, iaculis
              vel, suscipit quis, luctus non, massa.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="font-heading text-xl font-semibold tracking-tight">6. Derechos del usuario</h2>
            <p>
              Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt
              sed, euismod in, nibh.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="font-heading text-xl font-semibold tracking-tight">7. Transferencias y cesiones</h2>
            <p>
              Quisque volutpat condimentum velit. Class aptent taciti sociosqu ad litora torquent per conubia nostra,
              per inceptos himenaeos.
            </p>
          </section>
        </article>
      </section>
    </app-page-container>
  `,
})
export class PrivacyPageComponent {}

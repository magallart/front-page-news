import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconExclamationCircleComponent } from '../icons/icon-exclamation-circle.component';

@Component({
  selector: 'app-article-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconExclamationCircleComponent],
  template: `
    <article class="mx-auto flex max-w-2xl flex-col items-center px-4 py-6 text-center sm:py-8">
      <img
        src="/images/error.png"
        alt="Ilustración de error"
        class="mb-6 h-36 w-auto sm:h-44 lg:h-52"
        loading="eager"
      />

      <h1 class="font-editorial-title text-3xl font-semibold text-foreground sm:text-4xl">Noticia no encontrada</h1>
      <p class="mt-4 max-w-xl text-base text-muted-foreground">
        Revisa el enlace de la noticia, porque puede haber un error en la URL. Si el enlace es correcto, es posible
        que esta noticia ya no esté disponible porque la fuente original ha actualizado o modificado su publicación.
        Puedes regresar a portada para seguir navegando por el resto de noticias.
      </p>
      <a
        class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md border border-primary bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-secondary transition-colors duration-500 ease-out hover:border-secondary hover:bg-secondary hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-auto"
        routerLink="/"
      >
        <app-icon-exclamation-circle />
        Ir a portada
      </a>
    </article>
  `,
})
export class ArticleNotFoundComponent {}

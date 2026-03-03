import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { IconExternalLinkComponent } from '../icons/icon-external-link.component';

@Component({
  selector: 'app-article-preview-cta',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconExternalLinkComponent],
  template: `
    <section class="text-center">
      <a
        class="inline-flex w-full items-center justify-center gap-2 rounded-md border border-primary bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-secondary transition-colors duration-300 ease-out hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-auto sm:px-5"
        [href]="url()"
        [attr.aria-label]="'Abrir noticia completa en ' + source()"
        target="_blank"
        rel="noopener noreferrer"
      >
        Abrir noticia completa en {{ source() }}
        <app-icon-external-link />
      </a>
    </section>
  `,
})
export class ArticlePreviewCtaComponent {
  readonly url = input.required<string>();
  readonly source = input.required<string>();
}

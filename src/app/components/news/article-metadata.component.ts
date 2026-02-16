import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-article-metadata',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dl class="grid gap-3 border-y-2 border-border py-4 text-sm sm:grid-cols-3">
      <div>
        <dt class="text-[0.65rem] font-black uppercase tracking-[0.1em] text-muted-foreground">Autor</dt>
        <dd class="font-editorial-body mt-1 text-foreground">{{ author() }}</dd>
      </div>

      <div>
        <dt class="text-[0.65rem] font-black uppercase tracking-[0.1em] text-muted-foreground">Publicado en</dt>
        <dd class="font-editorial-body mt-1 text-foreground">{{ source() }}</dd>
      </div>

      <div>
        <dt class="text-[0.65rem] font-black uppercase tracking-[0.1em] text-muted-foreground">Fecha</dt>
        <dd class="font-editorial-body mt-1 text-foreground">{{ getFormattedDate(publishedAt()) }}</dd>
      </div>
    </dl>
  `,
})
export class ArticleMetadataComponent {
  readonly author = input.required<string>();
  readonly source = input.required<string>();
  readonly publishedAt = input.required<string>();

  protected getFormattedDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Fecha no disponible';
    }

    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }
}

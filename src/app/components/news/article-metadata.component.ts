import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-article-metadata',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dl class="grid grid-cols-3 gap-3 border-y-2 border-border py-4 text-sm">
      <div class="text-center">
        <dt class="text-[0.65rem] font-black uppercase tracking-[0.1em] text-muted-foreground">Autor</dt>
        <dd class="font-editorial-body mt-1 text-foreground">{{ author() }}</dd>
      </div>

      <div class="text-center">
        <dt class="text-[0.65rem] font-black uppercase tracking-[0.1em] text-muted-foreground">Publicado en</dt>
        <dd class="font-editorial-body mt-1 text-foreground">{{ source() }}</dd>
      </div>

      <div class="text-center">
        <dt class="text-[0.65rem] font-black uppercase tracking-[0.1em] text-muted-foreground">Fecha</dt>
        <dd class="font-editorial-body mt-1 text-foreground">
          <span class="sm:hidden">{{ formattedDateShort() }}</span>
          <span class="hidden sm:inline">{{ formattedDateLong() }}</span>
        </dd>
      </div>
    </dl>
  `,
})
export class ArticleMetadataComponent {
  readonly author = input.required<string>();
  readonly source = input.required<string>();
  readonly publishedAt = input.required<string>();

  protected readonly formattedDateLong = computed(() => {
    const date = new Date(this.publishedAt());
    if (Number.isNaN(date.getTime())) {
      return 'Fecha no disponible';
    }

    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  });

  protected readonly formattedDateShort = computed(() => {
    const date = new Date(this.publishedAt());
    if (Number.isNaN(date.getTime())) {
      return '-- -- --';
    }

    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    })
      .format(date)
      .replace(/\//g, '-');
  });
}

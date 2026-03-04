import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { formatDateLong, formatDateShort } from '../../utils/date-formatting';

@Component({
  selector: 'app-article-metadata',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dl class="grid grid-cols-3 gap-3 border-y-2 border-border py-4 text-base">
      <div class="text-center">
        <dt class="text-[0.72rem] font-black uppercase tracking-[0.1em] text-muted-foreground">Autor</dt>
        <dd class="font-editorial-body mt-1 text-[1.02rem] text-foreground sm:text-[1.08rem]">{{ author() }}</dd>
      </div>

      <div class="text-center">
        <dt class="text-[0.72rem] font-black uppercase tracking-[0.1em] text-muted-foreground">Publicado en</dt>
        <dd class="font-editorial-body mt-1 text-[1.02rem] text-foreground sm:text-[1.08rem]">{{ source() }}</dd>
      </div>

      <div class="text-center">
        <dt class="text-[0.72rem] font-black uppercase tracking-[0.1em] text-muted-foreground">Fecha</dt>
        <dd class="font-editorial-body mt-1 text-[1.02rem] text-foreground sm:text-[1.08rem]">
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

  protected readonly formattedDateLong = computed(() => formatDateLong(new Date(this.publishedAt())));
  protected readonly formattedDateShort = computed(() => formatDateShort(new Date(this.publishedAt())));
}

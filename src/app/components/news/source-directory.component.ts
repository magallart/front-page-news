import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { SourceDirectoryItem } from '../../interfaces/source-directory-item.interface';

@Component({
  selector: 'app-source-directory',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
  template: `
    <section>
      <p class="font-editorial-title mb-4 text-center text-2xl leading-[1.25] text-foreground">
        Visita las webs oficiales para conocer todas las noticias
      </p>
      <div class="mx-auto mb-4 w-[70%] border-b-2 border-primary/60"></div>

      @if (items().length === 0) {
        <p class="text-sm text-muted-foreground">No hay fuentes disponibles en este momento.</p>
      } @else {
        <div class="pt-2">
          <div class="space-y-4">
            @for (row of rows(); track $index) {
              <ul class="flex justify-center gap-10">
                @for (item of row; track item.id) {
                  <li class="relative flex justify-center">
                    <a
                      [href]="item.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      [attr.aria-label]="item.name"
                      class="group relative flex h-12 w-12 items-center justify-center rounded-sm bg-muted/20 transition-colors duration-200 hover:bg-muted/40"
                    >
                  <img
                    [src]="item.logoUrl"
                    [alt]="'Logotipo de ' + item.name"
                    loading="lazy"
                    (error)="handleLogoError($event)"
                    class="h-10 w-10 object-contain transition-transform duration-200 ease-out group-hover:scale-110"
                  />
                      <span
                        class="pointer-events-none absolute top-full left-1/2 z-10 mt-1 hidden -translate-x-1/2 whitespace-nowrap rounded-sm bg-foreground px-2 py-1 text-xs font-bold tracking-[0.04em] text-background shadow-sm group-hover:block"
                      >
                        {{ item.name }}
                      </span>
                    </a>
                  </li>
                }
              </ul>
            }
          </div>
        </div>
      }
    </section>
  `,
})
export class SourceDirectoryComponent {
  readonly items = input<readonly SourceDirectoryItem[]>([]);
  protected readonly rows = computed(() => buildAlternatingRows(this.items()));

  protected handleLogoError(event: Event): void {
    const element = event.target as HTMLImageElement | null;
    if (!element) {
      return;
    }

    element.onerror = null;
    element.src = '/images/sources/source-placeholder.svg';
  }
}

function buildAlternatingRows(items: readonly SourceDirectoryItem[]): readonly (readonly SourceDirectoryItem[])[] {
  const rows: SourceDirectoryItem[][] = [];
  let index = 0;
  let take = 3;

  while (index < items.length) {
    rows.push(items.slice(index, index + take));
    index += take;
    take = take === 3 ? 2 : 3;
  }

  return rows;
}

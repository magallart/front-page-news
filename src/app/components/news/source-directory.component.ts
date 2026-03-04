import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, signal } from '@angular/core';

import {
  SOURCE_DIRECTORY_EMPTY_MESSAGE,
  SOURCE_DIRECTORY_TABLET_ROW_COUNT,
  SOURCE_DIRECTORY_TITLE,
} from '../../constants/source-directory.constants';
import { registerMediaQueryListener } from '../../utils/media-query-listener';
import { buildAlternatingRows, buildFixedRows } from '../../utils/source-directory-rows';

import { SourceDirectoryLogoLinkComponent } from './source-directory-logo-link.component';

import type { SourceDirectoryItem } from '../../interfaces/source-directory-item.interface';

@Component({
  selector: 'app-source-directory',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SourceDirectoryLogoLinkComponent],
  host: {
    class: 'block',
  },
  template: `
    <section>
      <p class="font-editorial-title mb-4 text-center text-2xl leading-[1.25] text-foreground">
        {{ title }}
      </p>
      <div class="mx-auto mb-4 w-[70%] border-b-2 border-primary/60"></div>

      @if (items().length === 0) {
        <p class="text-sm text-muted-foreground">{{ emptyMessage }}</p>
      } @else {
        <div class="space-y-4 pt-2">
          @for (row of visibleRows(); track $index) {
            <ul class="flex justify-center gap-10">
              @for (item of row; track item.id) {
                <li class="relative flex justify-center">
                  <app-source-directory-logo-link [item]="item" />
                </li>
              }
            </ul>
          }
        </div>
      }
    </section>
  `,
})
export class SourceDirectoryComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly items = input<readonly SourceDirectoryItem[]>([]);
  protected readonly title = SOURCE_DIRECTORY_TITLE;
  protected readonly emptyMessage = SOURCE_DIRECTORY_EMPTY_MESSAGE;
  protected readonly isTabletViewport = signal(false);
  protected readonly tabletRows = computed(() => buildFixedRows(this.items(), SOURCE_DIRECTORY_TABLET_ROW_COUNT));
  protected readonly desktopRows = computed(() => buildAlternatingRows(this.items()));
  protected readonly visibleRows = computed(() => (this.isTabletViewport() ? this.tabletRows() : this.desktopRows()));

  constructor() {
    this.initTabletMode();
  }

  private initTabletMode(): void {
    registerMediaQueryListener({
      query: '(min-width: 768px) and (max-width: 1023px)',
      destroyRef: this.destroyRef,
      onChange: (matches) => {
        this.isTabletViewport.set(matches);
      },
    });
  }
}

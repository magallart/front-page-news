import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { SOURCE_DIRECTORY_PLACEHOLDER_LOGO_URL } from '../../constants/source-directory.constants';

import type { SourceDirectoryItem } from '../../interfaces/source-directory-item.interface';

@Component({
  selector: 'app-source-directory-logo-link',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      [href]="item().url"
      target="_blank"
      rel="noopener noreferrer"
      [attr.aria-label]="item().name"
      class="group relative flex h-12 w-12 items-center justify-center rounded-sm bg-muted/20 transition-colors duration-200 hover:bg-muted/40"
    >
      <img
        [src]="item().logoUrl"
        [alt]="'Logotipo de ' + item().name"
        loading="lazy"
        (error)="handleImageError($event)"
        class="h-10 w-10 object-contain transition-transform duration-200 ease-out group-hover:scale-110"
      />
      <span
        class="pointer-events-none absolute top-full left-1/2 z-10 mt-1 hidden -translate-x-1/2 whitespace-nowrap rounded-sm bg-foreground px-2 py-1 text-xs font-bold tracking-[0.04em] text-background shadow-sm group-hover:block"
      >
        {{ item().name }}
      </span>
    </a>
  `,
})
export class SourceDirectoryLogoLinkComponent {
  readonly item = input.required<SourceDirectoryItem>();

  protected handleImageError(event: Event): void {
    const element = event.target as HTMLImageElement | null;
    if (!element) {
      return;
    }

    element.onerror = null;
    element.src = SOURCE_DIRECTORY_PLACEHOLDER_LOGO_URL;
  }
}

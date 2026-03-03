import { ChangeDetectionStrategy, Component, HostListener, input, output } from '@angular/core';

import { IconCloseComponent } from '../icons/icon-close.component';

import { ArticleContentComponent } from './article-content.component';

import type { NewsItem } from '../../interfaces/news-item.interface';

@Component({
  selector: 'app-news-quick-view-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ArticleContentComponent, IconCloseComponent],
  styles: `
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes modalIn {
      from {
        opacity: 0;
        transform: translateY(8px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .quick-view-overlay {
      animation: fadeIn 180ms ease-out both;
    }

    .quick-view-dialog {
      animation: modalIn 220ms ease-out both;
    }

    @media (prefers-reduced-motion: reduce) {
      .quick-view-overlay,
      .quick-view-dialog {
        animation: none;
      }
    }
  `,
  template: `
    @if (article(); as article) {
      <div
        class="quick-view-overlay fixed inset-0 z-[90] flex items-center justify-center bg-foreground/55 p-4 sm:p-6"
        role="presentation"
        (click)="requestClose()"
      >
        <button
          type="button"
          class="mobile-close-button absolute right-3 top-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-transparent text-primary transition-colors duration-300 hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:hidden"
          aria-label="Cerrar modal"
          (click)="requestClose()"
        >
          <app-icon-close style="transform: scale(1.35);" />
        </button>

        <article
          class="quick-view-dialog flex w-full max-w-3xl max-h-[82dvh] flex-col overflow-hidden rounded-xl border border-border bg-card px-8 py-5 shadow-lg sm:max-h-[90dvh] sm:px-12 sm:py-8"
          role="dialog"
          aria-modal="true"
          aria-label="Lectura rapida de noticia"
          (click)="$event.stopPropagation()"
        >
          <div class="mb-2 flex shrink-0 justify-end sm:mb-3">
            <button
              type="button"
              class="hidden h-10 w-10 items-center justify-center rounded-full bg-transparent text-secondary transition-colors duration-300 hover:text-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:inline-flex"
              aria-label="Cerrar modal"
              (click)="requestClose()"
            >
              <app-icon-close />
            </button>
          </div>

          <div class="min-h-0 overflow-y-auto pr-2 pt-3 pb-12 sm:pr-3 sm:pt-4 sm:pb-12">
            <app-article-content [article]="article" />
          </div>
        </article>
      </div>
    }
  `,
})
export class NewsQuickViewModalComponent {
  readonly article = input<NewsItem | null>(null);
  readonly closed = output<void>();

  @HostListener('document:keydown.escape')
  protected onEscapeKey(): void {
    if (this.article()) {
      this.requestClose();
    }
  }

  protected requestClose(): void {
    this.closed.emit();
  }
}

import { ChangeDetectionStrategy, Component, input, output, viewChild } from '@angular/core';

import { IconCloseComponent } from '../../icons/icon-close.component';
import { IconSearchComponent } from '../../icons/icon-search.component';

import type { ElementRef, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-navbar-search-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconCloseComponent, IconSearchComponent],
  styles: [
    `
      @keyframes searchDialogFadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes searchDialogPanelIn {
        from {
          opacity: 0;
          transform: translateY(10px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .search-dialog-overlay {
        animation: searchDialogFadeIn 180ms ease-out both;
      }

      .search-dialog-panel {
        animation: searchDialogPanelIn 220ms ease-out both;
      }

      @media (prefers-reduced-motion: reduce) {
        .search-dialog-overlay,
        .search-dialog-panel {
          animation: none;
        }
      }
    `,
  ],
  template: `
    @if (open()) {
      <div
        class="search-dialog-overlay fixed inset-0 z-[95] flex items-center justify-center bg-foreground/70 px-4 py-6 backdrop-blur-sm sm:px-6"
        role="presentation"
        (click)="emitClose()"
        (keydown)="onContainerKeydown($event)"
      >
        <section
          #dialogPanel
          class="search-dialog-panel relative w-full max-w-xl rounded-xl border border-border bg-card shadow-lg"
          role="dialog"
          aria-modal="true"
          aria-labelledby="navbar-search-dialog-title"
          tabindex="-1"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
            <h2 id="navbar-search-dialog-title" class="font-editorial-title text-xl font-semibold text-foreground sm:text-2xl">
              Buscar noticias
            </h2>

            <button
              #closeButton
              type="button"
              class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Cerrar búsqueda"
              (click)="emitClose()"
            >
              <app-icon-close />
            </button>
          </div>

          <form class="space-y-4 px-5 py-5 sm:px-6 sm:py-6" (submit)="emitSubmit($event)">
            <label class="block" for="navbar-search-query">
              <span class="sr-only">Buscar noticias</span>
              <div class="relative">
                <span class="pointer-events-none absolute inset-y-0 left-4 inline-flex items-center text-muted-foreground">
                  <app-icon-search />
                </span>
                <input
                  #searchInput
                  id="navbar-search-query"
                  type="search"
                  name="q"
                  aria-label="Buscar noticias"
                  class="w-full rounded-xl border border-border bg-background px-12 py-4 font-editorial-body text-base text-foreground outline-none transition placeholder:text-muted-foreground/80 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Escribe tu búsqueda"
                  [value]="query()"
                  [disabled]="submitting()"
                  (input)="onQueryInput($event)"
                />
              </div>
            </label>

            @if (feedbackMessage(); as message) {
              <div class="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3" role="alert" aria-live="polite">
                <p class="font-editorial-body text-sm leading-6 text-foreground">
                  {{ message }}
                </p>
              </div>
            }

            <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-xl border border-border px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                [disabled]="submitting()"
                (click)="emitClose()"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="inline-flex items-center justify-center gap-2 rounded-xl border border-primary bg-primary px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors duration-300 ease-out hover:bg-primary/90 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
                [disabled]="submitting()"
              >
                <app-icon-search />
                {{ submitting() ? 'Buscando...' : 'Buscar' }}
              </button>
            </div>
          </form>
        </section>
      </div>
    }
  `,
})
export class NavbarSearchDialogComponent implements OnChanges {
  readonly open = input(false);
  readonly query = input('');
  readonly submitting = input(false);
  readonly feedbackMessage = input<string | null>(null);

  readonly closed = output<void>();
  readonly queryChange = output<string>();
  readonly submitted = output<void>();

  private readonly dialogPanelRef = viewChild<ElementRef<HTMLElement>>('dialogPanel');
  private readonly searchInputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly closeButtonRef = viewChild<ElementRef<HTMLButtonElement>>('closeButton');

  private wasOpen = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (!('open' in changes)) {
      return;
    }

    const isOpen = this.open();
    if (isOpen === this.wasOpen) {
      return;
    }

    if (isOpen) {
      queueMicrotask(() => {
        this.focusInitialElement();
      });
    }

    this.wasOpen = isOpen;
  }

  protected emitClose(): void {
    this.closed.emit();
  }

  protected emitSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.emit();
  }

  protected onQueryInput(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.queryChange.emit(input?.value ?? '');
  }

  protected onContainerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.emitClose();
      return;
    }

    if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  }

  private focusInitialElement(): void {
    const searchInput = this.searchInputRef()?.nativeElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
      return;
    }

    const closeButton = this.closeButtonRef()?.nativeElement;
    closeButton?.focus();
  }

  private trapFocus(event: KeyboardEvent): void {
    const panel = this.dialogPanelRef()?.nativeElement;
    if (!panel) {
      return;
    }

    const focusableElements = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (element) => !element.hasAttribute('disabled') && element.tabIndex >= 0,
    );

    if (focusableElements.length === 0) {
      event.preventDefault();
      panel.focus();
      return;
    }

    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];
    if (!firstFocusableElement || !lastFocusableElement) {
      return;
    }

    const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const activeElementInsidePanel = !!activeElement && panel.contains(activeElement);

    if (event.shiftKey) {
      if (!activeElementInsidePanel || activeElement === firstFocusableElement) {
        event.preventDefault();
        lastFocusableElement.focus();
      }
      return;
    }

    if (!activeElementInsidePanel || activeElement === lastFocusableElement) {
      event.preventDefault();
      firstFocusableElement.focus();
    }
  }
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

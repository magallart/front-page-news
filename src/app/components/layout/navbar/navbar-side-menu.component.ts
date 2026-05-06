import { ChangeDetectionStrategy, Component, input, output, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NAVBAR_SIDE_MENU_DIALOG_ID, NAVBAR_SIDE_MENU_TITLE_ID } from '../../../constants/navbar.constants';
import { IconCloseComponent } from '../../icons/icon-close.component';
import { SocialIconComponent } from '../../icons/social-icon.component';

import type { NavLink } from '../../../../interfaces/nav-link.interface';
import type { SocialLink } from '../../../../interfaces/social-link.interface';
import type { ElementRef, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-navbar-side-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SocialIconComponent, IconCloseComponent],
  template: `
    <div
      class="fixed inset-0 z-[60] transition lg:hidden"
      [class.pointer-events-none]="!open()"
      [attr.aria-hidden]="!open()"
      (keydown)="onContainerKeydown($event)"
    >
      <button
        type="button"
        class="absolute inset-0 bg-black/50 opacity-0 transition-opacity duration-300"
        [style.opacity]="open() ? '1' : '0'"
        (click)="emitClose()"
        aria-label="Cerrar menu lateral"
      ></button>

      <aside
        #sideMenuPanel
        [id]="dialogId"
        class="absolute left-0 top-0 h-full w-80 max-w-[85vw] border-r border-border bg-background p-5 shadow-medium transition-transform duration-300"
        [style.transform]="open() ? 'translateX(0)' : 'translateX(-100%)'"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="dialogTitleId"
        tabindex="-1"
      >
        <div class="mb-6 flex items-center justify-between">
          <h2 [id]="dialogTitleId" class="font-heading text-xl font-semibold tracking-tight">Menu</h2>
          <button
            #closeButton
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground/80 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            (click)="emitClose()"
            aria-label="Cerrar menu"
          >
            <app-icon-close />
          </button>
        </div>

        <nav aria-label="Menu principal" class="space-y-2">
          <a
            class="block rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-foreground transition duration-200 hover:bg-primary/10 hover:text-primary"
            routerLink="/"
            (click)="emitClose()"
          >
            Inicio
          </a>

          @for (link of links(); track link.href) {
            <a
              class="block rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-foreground transition duration-200 hover:bg-primary/10 hover:text-primary"
              [routerLink]="link.href"
              (click)="emitClose()"
            >
              {{ link.label }}
            </a>
          }

          <a
            class="block rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-foreground transition duration-200 hover:bg-primary/10 hover:text-primary"
            routerLink="/seccion/ultima-hora"
            (click)="emitClose()"
          >
            Última hora
          </a>
        </nav>

        <div class="mt-8 border-t border-border pt-6">
          <p class="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Redes sociales</p>
          <ul class="flex items-center gap-2">
            @for (social of socialLinks(); track social.label) {
              <li>
                <a
                  class="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground/80 transition duration-200 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  [href]="social.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  [attr.aria-label]="social.label"
                >
                  <app-social-icon [name]="social.icon" />
                </a>
              </li>
            }
          </ul>
        </div>
      </aside>
    </div>
  `,
})
export class NavbarSideMenuComponent implements OnChanges {
  readonly open = input(false);
  readonly links = input.required<readonly NavLink[]>();
  readonly socialLinks = input.required<readonly SocialLink[]>();

  readonly closed = output<void>();

  protected readonly dialogId = NAVBAR_SIDE_MENU_DIALOG_ID;
  protected readonly dialogTitleId = NAVBAR_SIDE_MENU_TITLE_ID;

  private readonly sideMenuPanelRef = viewChild<ElementRef<HTMLElement>>('sideMenuPanel');
  private readonly closeButtonRef = viewChild<ElementRef<HTMLButtonElement>>('closeButton');

  private wasOpen = false;
  private previouslyFocusedElement: HTMLElement | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (!('open' in changes)) {
      return;
    }

    const isOpen = this.open();
    if (isOpen === this.wasOpen) {
      return;
    }

    if (isOpen) {
      this.onOpen();
    } else {
      this.onClose();
    }

    this.wasOpen = isOpen;
  }

  protected emitClose(): void {
    this.closed.emit();
  }

  protected onContainerKeydown(event: KeyboardEvent): void {
    if (!this.open()) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.emitClose();
      return;
    }

    if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  }

  private onOpen(): void {
    this.previouslyFocusedElement = this.getActiveElement();
    queueMicrotask(() => {
      this.focusInitialElement();
    });
  }

  private onClose(): void {
    const focusTarget = this.previouslyFocusedElement;
    this.previouslyFocusedElement = null;
    if (!focusTarget) {
      return;
    }

    queueMicrotask(() => {
      focusTarget.focus();
    });
  }

  private focusInitialElement(): void {
    if (!this.open()) {
      return;
    }

    const closeButton = this.closeButtonRef()?.nativeElement;
    if (closeButton) {
      closeButton.focus();
      return;
    }

    const firstFocusableElement = this.getFocusableElements()[0];
    firstFocusableElement?.focus();
  }

  private trapFocus(event: KeyboardEvent): void {
    const panel = this.sideMenuPanelRef()?.nativeElement;
    if (!panel) {
      return;
    }

    const focusableElements = this.getFocusableElements();
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

    const activeElement = this.getActiveElement();
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

  private getActiveElement(): HTMLElement | null {
    if (typeof document === 'undefined') {
      return null;
    }

    return document.activeElement instanceof HTMLElement ? document.activeElement : null;
  }

  private getFocusableElements(): HTMLElement[] {
    const panel = this.sideMenuPanelRef()?.nativeElement;
    if (!panel) {
      return [];
    }

    return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (element) => !element.hasAttribute('disabled') && element.tabIndex >= 0,
    );
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

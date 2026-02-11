import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PageContainerComponent } from '../page-container.component';

@Component({
  selector: 'app-navbar-sticky-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageContainerComponent, RouterLink],
  template: `
    <div
      class="fixed inset-x-0 top-0 z-50 transition-all duration-300"
      [class.pointer-events-none]="!visible()"
      [class.opacity-0]="!visible()"
      [class.-translate-y-full]="!visible()"
      [class.opacity-100]="visible()"
      [class.translate-y-0]="visible()"
    >
      <div
        class="border-b border-secondary-foreground/20 shadow-subtle"
        style="background-color: hsl(var(--secondary)); color: hsl(var(--secondary-foreground));"
      >
        <app-page-container>
          <div class="grid grid-cols-[auto_1fr] items-center gap-3 py-3 sm:grid-cols-[auto_auto_1fr] sm:gap-4">
            <button
              type="button"
              class="mr-2 inline-flex h-10 w-10 items-center justify-center text-secondary-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:mr-3"
              (click)="menuToggle.emit()"
              [attr.aria-expanded]="menuOpen()"
              aria-label="Abrir menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M4 6l16 0" />
                <path d="M4 12l16 0" />
                <path d="M4 18l16 0" />
              </svg>
            </button>

            <a routerLink="/" class="min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40">
              <img
                src="/images/front-page-news-logo.png"
                alt="Front Page News"
                class="h-8 w-auto object-contain sm:h-10"
              />
            </a>

            <p
              class="justify-self-end text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary-foreground sm:text-xs"
            >
              {{ topbarMeta() }}
            </p>
          </div>
        </app-page-container>
      </div>
    </div>
  `,
})
export class NavbarStickyHeaderComponent {
  readonly visible = input.required<boolean>();
  readonly menuOpen = input.required<boolean>();
  readonly topbarMeta = input.required<string>();

  readonly menuToggle = output<void>();
}
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconCloseComponent } from '../../icons/icon-close.component';
import { SocialIconComponent } from '../../icons/social-icon.component';

import type { NavLink } from '../../../../interfaces/nav-link.interface';
import type { SocialLink } from '../../../../interfaces/social-link.interface';

@Component({
  selector: 'app-navbar-side-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SocialIconComponent, IconCloseComponent],
  template: `
    <div
      class="fixed inset-0 z-[60] transition"
      [class.pointer-events-none]="!open()"
      [attr.aria-hidden]="!open()"
    >
      <button
        type="button"
        class="absolute inset-0 bg-black/50 transition-opacity duration-300"
        [class.opacity-0]="!open()"
        [class.opacity-100]="open()"
        (click)="closed.emit()"
        aria-label="Cerrar menu lateral"
      ></button>

      <aside
        class="absolute left-0 top-0 h-full w-80 max-w-[85vw] border-r border-border bg-background p-5 shadow-medium transition-transform duration-300"
        [class.-translate-x-full]="!open()"
        [class.translate-x-0]="open()"
      >
        <div class="mb-6 flex items-center justify-between">
          <h2 class="font-heading text-xl font-semibold tracking-tight">Menu</h2>
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground/80 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            (click)="closed.emit()"
            aria-label="Cerrar menu"
          >
            <app-icon-close />
          </button>
        </div>

        <nav aria-label="Menu principal" class="space-y-2">
          <a
            class="block rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-foreground transition duration-200 hover:bg-primary/10 hover:text-primary"
            routerLink="/"
            (click)="closed.emit()"
          >
            Inicio
          </a>

          @for (link of links(); track link.href) {
            <a
              class="block rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-foreground transition duration-200 hover:bg-primary/10 hover:text-primary"
              [routerLink]="link.href"
              (click)="closed.emit()"
            >
              {{ link.label }}
            </a>
          }
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
export class NavbarSideMenuComponent {
  readonly open = input.required<boolean>();
  readonly links = input.required<readonly NavLink[]>();
  readonly socialLinks = input.required<readonly SocialLink[]>();

  readonly closed = output<void>();
}

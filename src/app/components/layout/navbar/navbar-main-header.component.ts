import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { IconSearchComponent } from '../../icons/icon-search.component';
import { PageContainerComponent } from '../page-container.component';

import type { NavLink } from '../../../../interfaces/nav-link.interface';
import type { TopLink } from '../../../../interfaces/top-link.interface';

@Component({
  selector: 'app-navbar-main-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageContainerComponent, RouterLink, RouterLinkActive, IconSearchComponent],
  styles: [
    `
      .brand-title {
        font-family: var(--font-brand), serif;
        font-weight: 700;
        letter-spacing: 0.06em;
      }
    `,
  ],
  template: `
    <div class="border-b border-border/70">
      <app-page-container>
        <div
          class="flex flex-col gap-3 py-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
        >
          <p class="text-center sm:text-left">{{ topbarMeta() }}</p>

          <ul class="flex items-center justify-center gap-5 sm:justify-end">
            @for (link of topLinks(); track link.label) {
              <li>
                <button
                  type="button"
                  class="transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {{ link.label }}
                </button>
              </li>
            }
            <li>
              <button
                type="button"
                class="rounded-full bg-primary px-3 py-1 font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Suscribete
              </button>
            </li>
          </ul>
        </div>
      </app-page-container>
    </div>

    <app-page-container>
      <div class="border-b border-border/70 py-8 text-center">
        <a
          class="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          routerLink="/"
        >
          <span class="brand-title text-5xl text-foreground">FRONT PAGE</span>
          <span class="brand-title ml-3 text-5xl italic text-primary">NEWS</span>
        </a>
      </div>

      <div class="flex items-center justify-between border-b border-border/70 py-4">
        <div class="w-10"></div>

        <nav aria-label="Navegacion principal" class="flex-1">
          <ul class="flex flex-wrap items-center justify-center gap-2 text-sm sm:gap-4">
            @for (link of links(); track link.href) {
              <li>
                <a
                  class="inline-flex border-b-2 border-transparent px-2 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  [routerLink]="link.href"
                  routerLinkActive="border-primary text-primary"
                  [routerLinkActiveOptions]="{ exact: link.exact }"
                >
                  {{ link.label }}
                </a>
              </li>
            }
          </ul>
        </nav>

        <button
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Buscador (proximamente)"
        >
          <app-icon-search />
        </button>
      </div>
    </app-page-container>
  `,
})
export class NavbarMainHeaderComponent {
  readonly links = input.required<readonly NavLink[]>();
  readonly topLinks = input.required<readonly TopLink[]>();
  readonly topbarMeta = input.required<string>();
}

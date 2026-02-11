import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { PageContainerComponent } from './page-container.component';

interface NavLink {
  readonly label: string;
  readonly href: string;
  readonly exact: boolean;
}

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, PageContainerComponent],
  template: `
    <header class="border-b border-border bg-background/95">
      <app-page-container>
        <div class="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <a
            class="font-heading text-xl font-semibold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            routerLink="/"
          >
            Front Page News
          </a>

          <nav aria-label="Navegacion principal">
            <ul class="flex flex-wrap items-center gap-2 text-sm">
              @for (link of links; track link.href) {
                <li>
                  <a
                    class="inline-flex rounded-md px-3 py-2 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    [routerLink]="link.href"
                    routerLinkActive="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                    [routerLinkActiveOptions]="{ exact: link.exact }"
                  >
                    {{ link.label }}
                  </a>
                </li>
              }
            </ul>
          </nav>
        </div>
      </app-page-container>
    </header>
  `,
})
export class AppNavbarComponent {
  protected readonly links: readonly NavLink[] = [
    { label: 'Portada', href: '/', exact: true },
    { label: 'Actualidad', href: '/seccion/actualidad', exact: false },
    { label: 'Economia', href: '/seccion/economia', exact: false },
    { label: 'Cultura', href: '/seccion/cultura', exact: false },
  ];
}

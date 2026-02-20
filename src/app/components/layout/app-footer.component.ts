import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SocialIconComponent } from '../icons/social-icon.component';

import { PageContainerComponent } from './page-container.component';

const FOOTER_SOCIAL_LINKS = [
  { label: 'Facebook', icon: 'facebook', url: 'https://facebook.com' },
  { label: 'Instagram', icon: 'instagram', url: 'https://instagram.com' },
  { label: 'X', icon: 'x', url: 'https://x.com' },
] as const;

const FOOTER_LEGAL_LINKS = [
  { label: 'Aviso legal', href: '/aviso-legal' },
  { label: 'Privacidad', href: '/privacidad' },
  { label: 'Cookies', href: '/cookies' },
] as const;

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageContainerComponent, RouterLink, SocialIconComponent],
  template: `
    <footer class="mt-12 bg-secondary text-secondary-foreground">
      <div class="h-1 w-full bg-primary"></div>

      <app-page-container>
        <div class="flex flex-col items-center gap-6 py-6 text-center md:flex-row md:items-center md:justify-between md:gap-8 md:text-left">
          <section class="flex shrink-0 justify-center md:justify-start">
            <img
              src="/images/front-page-news-logo.png"
              alt="Front Page News"
              class="mx-auto h-10 w-auto object-contain sm:h-12 md:mx-0"
            />
          </section>

          <section>
            <ul class="flex items-center justify-center gap-3 text-xs uppercase tracking-wider text-secondary-foreground/80 md:justify-end">
              @for (item of socialLinks; track item.label) {
                <li>
                  <a
                    class="inline-flex h-9 w-9 items-center justify-center rounded border border-secondary-foreground/25 transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
                    [href]="item.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    [attr.aria-label]="item.label"
                  >
                    <app-social-icon [name]="item.icon" />
                  </a>
                </li>
              }
            </ul>
          </section>
        </div>

        <div
          class="flex flex-col items-center gap-3 border-t border-secondary-foreground/15 py-5 text-center text-[11px] uppercase tracking-[0.18em] text-secondary-foreground/65 sm:flex-row sm:items-center sm:justify-between sm:text-left"
        >
          <p>&copy; 2026 Front Page News. Todos los derechos reservados.</p>
          <ul class="flex items-center justify-center gap-5">
            @for (item of legalLinks; track item.label) {
              <li>
                <a
                  class="transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
                  [routerLink]="item.href"
                >
                  {{ item.label }}
                </a>
              </li>
            }
          </ul>
        </div>
      </app-page-container>
    </footer>
  `,
})
export class AppFooterComponent {
  protected readonly socialLinks = FOOTER_SOCIAL_LINKS;
  protected readonly legalLinks = FOOTER_LEGAL_LINKS;
}

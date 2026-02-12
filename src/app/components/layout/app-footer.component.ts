import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  FOOTER_INTEREST_LINKS,
  FOOTER_LEGAL_LINKS,
  FOOTER_NEWSPAPER_LINKS,
  FOOTER_SECTION_LINKS,
  FOOTER_SERVICE_LINKS,
  FOOTER_SOCIAL_LINKS,
} from '../../mocks/footer.mock';
import { SocialIconComponent } from '../icons/social-icon.component';

import { PageContainerComponent } from './page-container.component';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageContainerComponent, RouterLink, SocialIconComponent],
  template: `
    <footer class="mt-12 bg-secondary text-secondary-foreground">
      <div class="h-1 w-full bg-primary"></div>

      <app-page-container>
        <div
          class="grid justify-items-center gap-y-10 gap-x-6 py-10 text-center md:grid-cols-2 md:justify-items-start md:text-left lg:grid-cols-[1.6fr_repeat(4,minmax(0,1fr))]"
        >
          <section class="w-full max-w-xs space-y-5 md:max-w-none">
            <img
              src="/images/front-page-news-logo.png"
              alt="Front Page News"
              class="mx-auto h-10 w-auto object-contain sm:h-12 md:mx-0"
            />
            <p class="max-w-xs text-sm leading-7 text-secondary-foreground/80">
              Las ultimas noticias de distintos periodicos, reunidas en un solo lugar. Informate en minutos y profundiza solo en lo que de verdad te interesa.
            </p>
            <ul
              class="flex items-center justify-center gap-3 text-xs uppercase tracking-wider text-secondary-foreground/80 md:justify-start"
            >
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

          <section class="w-full max-w-xs text-center md:max-w-none md:justify-self-center md:text-center">
            <h2 class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Secciones</h2>
            <ul class="mt-5 space-y-3 text-sm">
              @for (item of sectionLinks; track item.href) {
                <li>
                  <a
                    class="text-secondary-foreground/90 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
                    [routerLink]="item.href"
                  >
                    {{ item.label }}
                  </a>
                </li>
              }
            </ul>
          </section>

          <section class="w-full max-w-xs text-center md:max-w-none md:justify-self-center md:text-center">
            <h2 class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Servicios</h2>
            <ul class="mt-5 space-y-3 text-sm">
              @for (item of serviceLinks; track item.label) {
                <li>
                  <a
                    class="text-secondary-foreground/90 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
                    [href]="item.url"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ item.label }}
                  </a>
                </li>
              }
            </ul>
          </section>

          <section class="w-full max-w-xs text-center md:max-w-none md:justify-self-center md:text-center">
            <h2 class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Enlaces de interes</h2>
            <ul class="mt-5 space-y-3 text-sm">
              @for (item of interestLinks; track item.label) {
                <li>
                  <a
                    class="text-secondary-foreground/90 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
                    [routerLink]="item.href"
                    [fragment]="item.fragment"
                  >
                    {{ item.label }}
                  </a>
                </li>
              }
            </ul>
          </section>

          <section class="w-full max-w-xs text-center md:max-w-none md:justify-self-center md:text-center">
            <h2 class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Periodicos</h2>
            <ul class="mt-5 space-y-3 text-sm">
              @for (item of newspaperLinks; track item.label) {
                <li>
                  <a
                    class="text-secondary-foreground/90 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
                    [href]="item.url"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ item.label }}
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
  protected readonly sectionLinks = FOOTER_SECTION_LINKS;
  protected readonly serviceLinks = FOOTER_SERVICE_LINKS;
  protected readonly legalLinks = FOOTER_LEGAL_LINKS;
  protected readonly interestLinks = FOOTER_INTEREST_LINKS;
  protected readonly newspaperLinks = FOOTER_NEWSPAPER_LINKS;
}

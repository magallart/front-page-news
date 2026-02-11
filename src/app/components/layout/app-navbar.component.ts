import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { SocialIconComponent } from '../icons/social-icon.component';

import { PageContainerComponent } from './page-container.component';

interface NavLink {
  readonly label: string;
  readonly href: string;
  readonly exact: boolean;
}

interface TopLink {
  readonly label: string;
}

interface SocialLink {
  readonly label: string;
  readonly icon: 'facebook' | 'instagram' | 'x';
  readonly url: string;
}

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, PageContainerComponent, SocialIconComponent],
  styles: [
    `
      .ticker-window {
        overflow: hidden;
        mask-image: linear-gradient(to right, transparent 0, black 5%, black 95%, transparent 100%);
      }

      .brand-title {
        font-family: var(--font-brand), serif;
        font-weight: 700;
        letter-spacing: 0.06em;
      }

      .ticker-marquee {
        display: flex;
        width: max-content;
        animation: ticker-ltr 58s linear infinite;
      }

      .ticker-window:hover .ticker-marquee,
      .ticker-window:focus-within .ticker-marquee {
        animation-play-state: paused;
      }

      .breaking-badge {
        animation: breaking-pulse 3.8s ease-in-out infinite;
        background-color: hsl(var(--primary));
      }

      @keyframes breaking-pulse {
        0%,
        100% {
          background-color: hsl(var(--primary));
        }
        50% {
          background-color: hsl(var(--accent));
        }
      }

      .ticker-sequence {
        display: inline-flex;
        flex-shrink: 0;
        align-items: center;
        gap: 2.5rem;
        padding-inline-end: 2.5rem;
        white-space: nowrap;
      }

      @keyframes ticker-ltr {
        from {
          transform: translateX(-50%);
        }
        to {
          transform: translateX(0);
        }
      }
    `,
  ],
  template: `
    <header class="border-b border-border bg-background">
      <div class="border-b border-border/70">
        <app-page-container>
          <div
            class="flex flex-col gap-3 py-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
          >
            <p class="text-center sm:text-left">{{ topbarMeta() }}</p>

            <ul class="flex items-center justify-center gap-5 sm:justify-end">
              @for (link of topLinks; track link.label) {
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
              @for (link of links; track link.href) {
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M4 11a7 7 0 1 1 14 0a7 7 0 0 1 -14 0" />
              <path d="M20 20l-3 -3" />
            </svg>
          </button>
        </div>
      </app-page-container>

      <div class="bg-secondary text-secondary-foreground" style="background-color: hsl(var(--secondary)); color: hsl(var(--secondary-foreground));">
        <app-page-container>
          <div class="flex items-center gap-4 py-2 text-sm">
            <span
              class="breaking-badge inline-flex shrink-0 rounded bg-primary px-2 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-secondary"
            >
              Última hora
            </span>

            <div class="ticker-window min-w-0 flex-1">
              <div class="ticker-marquee">
                <div class="ticker-sequence">
                  @for (headline of tickerHeadlines; track headline.id) {
                    <a
                      class="transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
                      [routerLink]="['/noticia', headline.id]"
                    >
                      {{ headline.title }}
                    </a>
                    <span class="text-primary/70" aria-hidden="true">•</span>
                  }
                </div>
                <div class="ticker-sequence" aria-hidden="true">
                  @for (headline of tickerHeadlines; track headline.id) {
                    <a
                      class="transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
                      [routerLink]="['/noticia', headline.id]"
                    >
                      {{ headline.title }}
                    </a>
                    <span class="text-primary/70" aria-hidden="true">•</span>
                  }
                </div>
              </div>
            </div>
          </div>
        </app-page-container>
      </div>
    </header>

    <div
      class="fixed inset-x-0 top-0 z-50 transition-all duration-300"
      [class.pointer-events-none]="!stickyVisible()"
      [class.opacity-0]="!stickyVisible()"
      [class.-translate-y-full]="!stickyVisible()"
      [class.opacity-100]="stickyVisible()"
      [class.translate-y-0]="stickyVisible()"
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
              (click)="toggleMenu()"
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

    <div
      class="fixed inset-0 z-[60] transition"
      [class.pointer-events-none]="!menuOpen()"
      [attr.aria-hidden]="!menuOpen()"
    >
      <button
        type="button"
        class="absolute inset-0 bg-black/50 transition-opacity duration-300"
        [class.opacity-0]="!menuOpen()"
        [class.opacity-100]="menuOpen()"
        (click)="closeMenu()"
        aria-label="Cerrar menu lateral"
      ></button>

      <aside
        class="absolute left-0 top-0 h-full w-80 max-w-[85vw] border-r border-border bg-background p-5 shadow-medium transition-transform duration-300"
        [class.-translate-x-full]="!menuOpen()"
        [class.translate-x-0]="menuOpen()"
      >
        <div class="mb-6 flex items-center justify-between">
          <h2 class="font-heading text-xl font-semibold tracking-tight">Menu</h2>
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            (click)="closeMenu()"
            aria-label="Cerrar menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6l-12 12" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav aria-label="Menu principal" class="space-y-2">
          <a
            class="block rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-foreground transition hover:bg-accent hover:text-accent-foreground"
            routerLink="/"
            (click)="closeMenu()"
          >
            Inicio
          </a>

          @for (link of links; track link.href) {
            <a
              class="block rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-foreground transition hover:bg-accent hover:text-accent-foreground"
              [routerLink]="link.href"
              (click)="closeMenu()"
            >
              {{ link.label }}
            </a>
          }
        </nav>

        <div class="mt-8 border-t border-border pt-6">
          <p class="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Redes sociales</p>
          <ul class="space-y-2">
            @for (social of socialLinks; track social.label) {
              <li>
                <a
                  class="inline-flex items-center gap-3 rounded-md px-2 py-2 text-sm text-foreground transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  [href]="social.url"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <app-social-icon [name]="social.icon" />
                  <span>{{ social.label }}</span>
                </a>
              </li>
            }
          </ul>
        </div>
      </aside>
    </div>
  `,
})
export class AppNavbarComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly city = signal('Madrid');
  private readonly temperature = signal<number | null>(24);

  protected readonly stickyVisible = signal(false);
  protected readonly menuOpen = signal(false);

  protected readonly links: readonly NavLink[] = [
    { label: 'Actualidad', href: '/seccion/actualidad', exact: false },
    { label: 'Sucesos', href: '/seccion/sucesos', exact: false },
    { label: 'Deportes', href: '/seccion/deportes', exact: false },
    { label: 'Economia', href: '/seccion/economia', exact: false },
    { label: 'Cultura', href: '/seccion/cultura', exact: false },
    { label: 'Opinion', href: '/seccion/opinion', exact: false },
  ];

  protected readonly topLinks: readonly TopLink[] = [
    { label: 'Newsletter' },
    { label: 'Club de lectores' },
  ];

  protected readonly socialLinks: readonly SocialLink[] = [
    { label: 'Facebook', icon: 'facebook', url: 'https://facebook.com' },
    { label: 'Instagram', icon: 'instagram', url: 'https://instagram.com' },
    { label: 'X', icon: 'x', url: 'https://x.com' },
  ];

  protected readonly topbarMeta = computed(() => {
    const dateLabel = formatDateLabel(new Date());
    const tempLabel = this.temperature() === null ? '--' : `${this.temperature()}ºC`;
    return `${dateLabel} · ${this.city().toUpperCase()} ${tempLabel}`;
  });

  protected readonly tickerHeadlines = [
    {
      id: 'demo-noticia-008',
      title: 'Bruselas propone nuevas cuotas de pesca para el Mediterraneo.',
    },
    {
      id: 'demo-noticia-001',
      title: 'El Ibex 35 abre con tendencia alcista tras los ultimos datos de inflacion.',
    },
    {
      id: 'demo-noticia-010',
      title: 'Cultura presenta un plan de digitalizacion para bibliotecas municipales.',
    },
    {
      id: 'demo-noticia-003',
      title: 'Nuevas medidas para reducir los tiempos de espera en justicia.',
    },
    {
      id: 'demo-noticia-007',
      title: 'La seleccion anuncia convocatoria para los amistosos de junio.',
    },
    {
      id: 'demo-noticia-011',
      title: 'Aumenta la inversion en tecnologias de eficiencia energetica.',
    },
  ] as const;

  constructor() {
    this.initStickyOnScroll();
    void this.loadCityAndWeather();
  }

  protected toggleMenu(): void {
    this.menuOpen.update((value) => !value);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  private initStickyOnScroll(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const threshold = 220;
    const onScroll = (): void => {
      const shouldShowSticky = window.scrollY > threshold;
      this.stickyVisible.set(shouldShowSticky);

      if (!shouldShowSticky && this.menuOpen()) {
        this.menuOpen.set(false);
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
    });
  }

  private async loadCityAndWeather(): Promise<void> {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return;
    }

    const position = await new Promise<GeolocationPosition | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (value) => resolve(value),
        () => resolve(null),
        { timeout: 3500 },
      );
    });

    if (!position) {
      return;
    }

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    try {
      const [geoResponse, weatherResponse] = await Promise.all([
        fetch(
          `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&count=1&language=es&format=json`,
        ),
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&timezone=auto`,
        ),
      ]);

      const geoJson = (await geoResponse.json()) as OpenMeteoReverseGeocodingResponse;
      const weatherJson = (await weatherResponse.json()) as OpenMeteoWeatherResponse;

      const detectedCity = geoJson.results?.[0]?.name;
      if (detectedCity) {
        this.city.set(detectedCity);
      }

      const detectedTemperature = weatherJson.current?.temperature_2m;
      if (typeof detectedTemperature === 'number') {
        this.temperature.set(Math.round(detectedTemperature));
      }
    } catch {
      // Fallback values remain visible when location/weather lookup fails.
    }
  }
}

interface OpenMeteoReverseGeocodingResponse {
  readonly results?: readonly {
    readonly name?: string;
  }[];
}

interface OpenMeteoWeatherResponse {
  readonly current?: {
    readonly temperature_2m?: number;
  };
}

function formatDateLabel(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
    .format(date)
    .toUpperCase();
}


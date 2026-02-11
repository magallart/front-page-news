import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';

import { NavbarMainHeaderComponent } from './navbar/navbar-main-header.component';
import { NavbarSideMenuComponent } from './navbar/navbar-side-menu.component';
import { NavbarStickyHeaderComponent } from './navbar/navbar-sticky-header.component';
import { NavbarTickerComponent } from './navbar/navbar-ticker.component';

import type { NavLink } from '../../../interfaces/nav-link.interface';
import type { SocialLink } from '../../../interfaces/social-link.interface';
import type { TickerHeadline } from '../../../interfaces/ticker-headline.interface';
import type { TopLink } from '../../../interfaces/top-link.interface';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NavbarMainHeaderComponent,
    NavbarTickerComponent,
    NavbarStickyHeaderComponent,
    NavbarSideMenuComponent,
  ],
  template: `
    <header class="border-b border-border bg-background">
      <app-navbar-main-header [links]="links" [topLinks]="topLinks" [topbarMeta]="topbarMeta()" />
      <app-navbar-ticker [headlines]="tickerHeadlines" />
    </header>

    <app-navbar-sticky-header
      [visible]="stickyVisible()"
      [menuOpen]="menuOpen()"
      [topbarMeta]="topbarMeta()"
      (menuToggle)="toggleMenu()"
    />

    <app-navbar-side-menu
      [open]="menuOpen()"
      [links]="links"
      [socialLinks]="socialLinks"
      (closed)="closeMenu()"
    />
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
    const tempLabel = this.temperature() === null ? '--' : `${this.temperature()}\u00BAC`;
    return `${dateLabel} \u00B7 ${this.city().toUpperCase()} ${tempLabel}`;
  });

  protected readonly tickerHeadlines: readonly TickerHeadline[] = [
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
  ];

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

import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';

import { MAX_FEED_NEWS_LIMIT } from '../../constants/news-limit.constants';
import { NewsStore } from '../../stores/news.store';

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
    <header class="hidden border-b border-border bg-background lg:block">
      <app-navbar-main-header [links]="links" [topLinks]="topLinks" [topbarMeta]="topbarMeta()" />
      <app-navbar-ticker [headlines]="tickerHeadlines()" />
    </header>

    <app-navbar-sticky-header
      [visible]="shouldShowSticky()"
      [menuOpen]="menuOpen()"
      [topbarMeta]="stickyTopbarMeta()"
      (menuToggle)="toggleMenu()"
    />

    <div class="border-b border-border bg-background lg:hidden">
      <app-navbar-ticker [headlines]="tickerHeadlines()" />
    </div>

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
  private readonly newsStore = inject(NewsStore);
  private readonly isMobileViewport = signal(false);
  private readonly tickerLimit = 12;

  protected readonly stickyVisible = signal(false);
  protected readonly menuOpen = signal(false);
  protected readonly shouldShowSticky = computed(() => this.isMobileViewport() || this.stickyVisible());

  protected readonly links: readonly NavLink[] = [
    { label: 'Actualidad', href: '/seccion/actualidad', exact: false },
    { label: 'Ciencia', href: '/seccion/ciencia', exact: false },
    { label: 'Cultura', href: '/seccion/cultura', exact: false },
    { label: 'Deportes', href: '/seccion/deportes', exact: false },
    { label: 'Economía', href: '/seccion/economia', exact: false },
    { label: 'España', href: '/seccion/espana', exact: false },
    { label: 'Internacional', href: '/seccion/internacional', exact: false },
    { label: 'Opinión', href: '/seccion/opinion', exact: false },
    { label: 'Sociedad', href: '/seccion/sociedad', exact: false },
    { label: 'Tecnología', href: '/seccion/tecnologia', exact: false },
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
    return formatDateLabel(new Date());
  });
  protected readonly stickyTopbarMeta = computed(() => {
    return this.isMobileViewport() ? formatCompactDateLabel(new Date()) : formatDateLabel(new Date());
  });

  protected readonly tickerHeadlines = computed<readonly TickerHeadline[]>(() =>
    this.newsStore
      .data()
      .slice(0, this.tickerLimit)
      .map((item) => ({ id: item.id, title: item.title })),
  );

  constructor() {
    this.newsStore.load({ page: 1, limit: MAX_FEED_NEWS_LIMIT });
    this.initResponsiveMode();
    this.initStickyOnScroll();
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
      if (this.isMobileViewport()) {
        this.stickyVisible.set(false);
        return;
      }

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

  private initResponsiveMode(): void {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(max-width: 1023px)');
    const onChange = (): void => {
      this.isMobileViewport.set(mediaQuery.matches);
      if (!mediaQuery.matches && this.menuOpen() && !this.stickyVisible()) {
        this.menuOpen.set(false);
      }
    };

    onChange();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', onChange);
      this.destroyRef.onDestroy(() => {
        mediaQuery.removeEventListener('change', onChange);
      });
      return;
    }

    mediaQuery.addListener(onChange);
    this.destroyRef.onDestroy(() => {
      mediaQuery.removeListener(onChange);
    });
  }

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

function formatCompactDateLabel(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
}


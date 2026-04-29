import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import {
  NAVBAR_FALLBACK_TICKER_HEADLINES,
  NAVBAR_LINKS,
  NAVBAR_SCROLL_STICKY_THRESHOLD,
  NAVBAR_SOCIAL_LINKS,
  NAVBAR_TICKER_HEADLINE_LIMIT,
  NAVBAR_TOP_LINKS,
} from '../../constants/navbar.constants';
import { createLatestNewsTickerQuery } from '../../lib/news-query-factory';
import { NewsStore } from '../../stores/news.store';
import { formatDateLabelUppercase } from '../../utils/date-formatting';
import { registerMediaQueryListener } from '../../utils/media-query-listener';

import { NavbarMainHeaderComponent } from './navbar/navbar-main-header.component';
import { NavbarSideMenuComponent } from './navbar/navbar-side-menu.component';
import { NavbarStickyHeaderComponent } from './navbar/navbar-sticky-header.component';
import { NavbarTickerComponent } from './navbar/navbar-ticker.component';

import type { TickerHeadline } from '../../../interfaces/ticker-headline.interface';

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
  private readonly router = inject(Router);
  private readonly isMobileViewport = signal(false);
  private readonly tickerLimit = NAVBAR_TICKER_HEADLINE_LIMIT;
  private readonly fallbackTickerHeadlines = NAVBAR_FALLBACK_TICKER_HEADLINES;
  private readonly tickerNewsQuery = createLatestNewsTickerQuery();

  protected readonly stickyVisible = signal(false);
  protected readonly menuOpen = signal(false);
  protected readonly shouldShowSticky = computed(() => this.isMobileViewport() || this.stickyVisible());

  protected readonly links = NAVBAR_LINKS;
  protected readonly topLinks = NAVBAR_TOP_LINKS;
  protected readonly socialLinks = NAVBAR_SOCIAL_LINKS;

  protected readonly topbarMeta = computed(() => formatDateLabelUppercase(new Date()));
  protected readonly stickyTopbarMeta = computed(() =>
    this.isMobileViewport() ? '' : formatDateLabelUppercase(new Date()),
  );

  protected readonly tickerHeadlines = computed<readonly TickerHeadline[]>(() =>
    this.newsStore.data(this.tickerNewsQuery).length > 0
      ? this.newsStore
          .data(this.tickerNewsQuery)
          .slice(0, this.tickerLimit)
          .map((item) => ({ id: item.id, title: item.title }))
      : this.fallbackTickerHeadlines,
  );

  constructor() {
    this.initTickerFallbackLoad();
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

    const onScroll = (): void => {
      if (this.isMobileViewport()) {
        this.stickyVisible.set(false);
        return;
      }

      const shouldShowSticky = window.scrollY > NAVBAR_SCROLL_STICKY_THRESHOLD;
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
    registerMediaQueryListener({
      query: '(max-width: 1023px)',
      destroyRef: this.destroyRef,
      onChange: (matches) => {
        this.isMobileViewport.set(matches);
        if (!matches && this.menuOpen() && !this.stickyVisible()) {
          this.menuOpen.set(false);
        }
      },
    });
  }

  private initTickerFallbackLoad(): void {
    this.loadTickerNewsIfNeeded();

    const subscription = this.router.events.subscribe((event) => {
      if (!(event instanceof NavigationEnd)) {
        return;
      }

      this.loadTickerNewsIfNeeded();
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  private loadTickerNewsIfNeeded(): void {
    if (this.newsStore.loading(this.tickerNewsQuery) || this.newsStore.data(this.tickerNewsQuery).length > 0) {
      return;
    }

    this.newsStore.load(this.tickerNewsQuery);
  }
}

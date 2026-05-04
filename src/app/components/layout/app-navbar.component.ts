import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';

import {
  NAVBAR_FALLBACK_TICKER_HEADLINES,
  NAVBAR_LINKS,
  NAVBAR_SCROLL_STICKY_THRESHOLD,
  NAVBAR_SOCIAL_LINKS,
  NAVBAR_TICKER_HEADLINE_LIMIT,
  NAVBAR_TOP_LINKS,
} from '../../constants/navbar.constants';
import { createLatestNewsTickerQuery, createSearchNewsQuery } from '../../lib/news-query-factory';
import { NewsService } from '../../services/news.service';
import { NewsStore } from '../../stores/news.store';
import { formatDateLabelUppercase } from '../../utils/date-formatting';
import { registerMediaQueryListener } from '../../utils/media-query-listener';
import { normalizeSearchQuery } from '../../utils/search-query';

import { NavbarMainHeaderComponent } from './navbar/navbar-main-header.component';
import { NavbarSearchDialogComponent } from './navbar/navbar-search-dialog.component';
import { NavbarSideMenuComponent } from './navbar/navbar-side-menu.component';
import { NavbarStickyHeaderComponent } from './navbar/navbar-sticky-header.component';
import { NavbarTickerComponent } from './navbar/navbar-ticker.component';

import type { TickerHeadline } from '../../../interfaces/ticker-headline.interface';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NavbarMainHeaderComponent,
    NavbarSearchDialogComponent,
    NavbarTickerComponent,
    NavbarStickyHeaderComponent,
    NavbarSideMenuComponent,
  ],
  template: `
    <header class="hidden border-b border-border bg-background lg:block">
      <app-navbar-main-header
        [links]="links"
        [topLinks]="topLinks"
        [topbarMeta]="topbarMeta()"
        (searchRequested)="openSearchDialog()"
      />
      <app-navbar-ticker [headlines]="tickerHeadlines()" />
    </header>

    <app-navbar-sticky-header
      [visible]="shouldShowSticky()"
      [menuOpen]="menuOpen()"
      [topbarMeta]="stickyTopbarMeta()"
      (menuToggle)="toggleMenu()"
      (searchRequested)="openSearchDialog()"
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

    <app-navbar-search-dialog
      [open]="searchDialogOpen()"
      [query]="searchDraftQuery()"
      [submitting]="isSearchSubmitting()"
      [feedbackMessage]="searchFeedbackMessage()"
      (closed)="closeSearchDialog()"
      (queryChange)="updateSearchDraft($event)"
      (submitted)="submitSearch()"
    />
  `,
})
export class AppNavbarComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly newsService = inject(NewsService);
  private readonly newsStore = inject(NewsStore);
  private readonly router = inject(Router);
  private readonly isMobileViewport = signal(false);
  private readonly tickerLimit = NAVBAR_TICKER_HEADLINE_LIMIT;
  private readonly fallbackTickerHeadlines = NAVBAR_FALLBACK_TICKER_HEADLINES;
  private readonly tickerNewsQuery = createLatestNewsTickerQuery();

  protected readonly stickyVisible = signal(false);
  protected readonly menuOpen = signal(false);
  protected readonly searchDialogOpen = signal(false);
  protected readonly searchDraftQuery = signal('');
  protected readonly isSearchSubmitting = signal(false);
  protected readonly searchFeedbackMessage = signal<string | null>(null);
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

  protected openSearchDialog(): void {
    this.lastFocusedElement = this.getActiveElement();
    this.searchFeedbackMessage.set(null);
    this.searchDialogOpen.set(true);
  }

  protected closeSearchDialog(): void {
    this.searchDialogOpen.set(false);
    this.isSearchSubmitting.set(false);
    this.searchFeedbackMessage.set(null);

    const focusTarget = this.lastFocusedElement;
    this.lastFocusedElement = null;
    if (!focusTarget) {
      return;
    }

    queueMicrotask(() => {
      focusTarget.focus();
    });
  }

  protected updateSearchDraft(value: string): void {
    this.searchDraftQuery.set(value);
    if (this.searchFeedbackMessage()) {
      this.searchFeedbackMessage.set(null);
    }
  }

  protected async submitSearch(): Promise<void> {
    if (this.isSearchSubmitting()) {
      return;
    }

    const query = normalizeSearchQuery(this.searchDraftQuery());
    if (!query) {
      this.searchFeedbackMessage.set('Escribe un término de búsqueda para continuar.');
      return;
    }

    this.isSearchSubmitting.set(true);
    this.searchFeedbackMessage.set(null);

    try {
      const result = await lastValueFrom(this.newsService.getNews(createSearchNewsQuery(query)));
      if (result.response.articles.length === 0) {
        this.searchFeedbackMessage.set(`No encontramos resultados para "${query}". Prueba con otro término.`);
        return;
      }

      this.searchDraftQuery.set('');
      this.closeSearchDialog();
      await this.router.navigate(['/buscar'], {
        queryParams: { q: query },
      });
    } catch {
      this.searchFeedbackMessage.set('No se pudo completar la búsqueda. Inténtalo de nuevo en unos minutos.');
    } finally {
      this.isSearchSubmitting.set(false);
    }
  }

  private lastFocusedElement: HTMLElement | null = null;

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
    if (this.newsStore.isInitialLoading(this.tickerNewsQuery) || this.newsStore.data(this.tickerNewsQuery).length > 0) {
      return;
    }

    this.newsStore.load(this.tickerNewsQuery);
  }

  private getActiveElement(): HTMLElement | null {
    if (typeof document === 'undefined') {
      return null;
    }

    return document.activeElement instanceof HTMLElement ? document.activeElement : null;
  }
}

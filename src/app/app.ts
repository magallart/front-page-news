import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { IconChevronUpComponent } from './components/icons/icon-chevron-up.component';
import { AppFooterComponent } from './components/layout/app-footer.component';
import { AppNavbarComponent } from './components/layout/app-navbar.component';
import { resolveTopScrollBehavior, scrollToTopAfterNavigation } from './utils/navigation-scroll';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppNavbarComponent, AppFooterComponent, IconChevronUpComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly showScrollTopThreshold = 480;

  protected readonly showScrollTopButton = signal(false);

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => scrollToTopAfterNavigation(event.urlAfterRedirects, window));

    this.initScrollTopButton();
  }

  protected scrollToTop(): void {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: resolveTopScrollBehavior(window),
    });
  }

  private initScrollTopButton(): void {
    const onScroll = (): void => {
      this.showScrollTopButton.set(window.scrollY > this.showScrollTopThreshold);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    this.destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));
  }
}

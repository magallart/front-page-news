import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { AppFooterComponent } from './components/layout/app-footer.component';
import { AppNavbarComponent } from './components/layout/app-navbar.component';
import { scrollToTopAfterNavigation } from './utils/navigation-scroll';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppNavbarComponent, AppFooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => scrollToTopAfterNavigation(event.urlAfterRedirects, window));
  }
}

import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { IconCloseComponent } from '../icons/icon-close.component';
import { IconNewsComponent } from '../icons/icon-news.component';

@Component({
  selector: 'app-news-refresh-indicator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconCloseComponent, IconNewsComponent],
  template: `
    @if (hasNewSinceLastVisit()) {
      <section
        class="mb-4 flex items-start gap-3 rounded-lg border border-primary/30 bg-background px-4 py-3 text-sm text-foreground"
        aria-live="polite"
        data-testid="last-visit-banner"
      >
        <span class="mt-0.5 text-primary">
          <app-icon-news />
        </span>
        <div class="min-w-0 flex-1 space-y-1">
          <p class="font-editorial-body text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            Novedades desde tu última visita
          </p>
          <p class="font-editorial-body text-sm leading-6 text-foreground">
            {{ lastVisitMessage() }}
          </p>
        </div>
        <button
          type="button"
          class="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Ocultar aviso de novedades"
          (click)="lastVisitDismissed.emit()"
        >
          <app-icon-close />
        </button>
      </section>
    }

    @if (hasFreshUpdateAvailable()) {
      <section
        class="mb-4 flex items-start gap-3 rounded-lg border border-primary/35 bg-primary/10 px-4 py-3 text-sm text-foreground"
        aria-live="polite"
        data-testid="fresh-update-banner"
      >
        <span class="mt-0.5 text-primary">
          <app-icon-news />
        </span>
        <div class="min-w-0 flex-1 space-y-1">
          <p class="font-editorial-body text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            {{ scopeLabel() }} actualizada
          </p>
          <p class="font-editorial-body text-sm leading-6 text-foreground">
            Se ha aplicado contenido más reciente.
            @if (lastUpdatedLabel(); as label) {
              <span class="text-muted-foreground">{{ label }}</span>
            }
          </p>
        </div>
        <button
          type="button"
          class="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Ocultar aviso de actualización"
          (click)="dismissed.emit()"
        >
          <app-icon-close />
        </button>
      </section>
    }

    @if (showRefreshState()) {
      <section
        class="mb-4 flex items-start gap-3 rounded-lg border border-border bg-card/70 px-4 py-3 text-sm text-foreground"
        aria-live="polite"
        data-testid="refresh-status"
      >
        <span class="mt-1 flex h-2.5 w-2.5 shrink-0 rounded-full bg-primary" [class.animate-pulse]="isRefreshing()"></span>
        <div class="min-w-0 space-y-1">
          <p class="font-editorial-body text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            {{ statusEyebrow() }}
          </p>
          <p class="font-editorial-body text-sm leading-6 text-foreground">
            {{ statusMessage() }}
          </p>
          @if (lastUpdatedLabel(); as label) {
            <p class="font-editorial-body text-xs text-muted-foreground">
              {{ label }}
            </p>
          }
        </div>
      </section>
    }
  `,
})
export class NewsRefreshIndicatorComponent {
  readonly scopeLabel = input.required<string>();
  readonly isRefreshing = input(false);
  readonly isShowingStaleData = input(false);
  readonly hasFreshUpdateAvailable = input(false);
  readonly hasNewSinceLastVisit = input(false);
  readonly newSinceLastVisitCount = input(0);
  readonly lastUpdated = input<number | null>(null);
  readonly dismissed = output();
  readonly lastVisitDismissed = output();

  protected readonly showRefreshState = computed(() => this.isRefreshing() || this.isShowingStaleData());

  protected readonly statusEyebrow = computed(() => {
    if (this.isRefreshing()) {
      return 'Actualizando en segundo plano';
    }

    return 'Contenido temporalmente no fresco';
  });

  protected readonly statusMessage = computed(() => {
    if (this.isRefreshing() && this.isShowingStaleData()) {
      return 'Mostrando la versión disponible mientras buscamos noticias más recientes.';
    }

    if (this.isRefreshing()) {
      return 'Estamos revalidando esta vista sin bloquear la lectura actual.';
    }

    return 'Se mantiene la última versión disponible hasta que el servicio pueda refrescarla.';
  });

  protected readonly lastVisitMessage = computed(() => {
    const count = this.newSinceLastVisitCount();
    const noun = count === 1 ? 'titular nuevo' : 'titulares nuevos';
    return `${count} ${noun} en ${this.scopeLabel().toLowerCase()} desde la última visita.`;
  });

  protected readonly lastUpdatedLabel = computed(() => {
    const value = this.lastUpdated();
    if (value === null) {
      return null;
    }

    const time = new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(value);

    return `Última actualización a las ${time}.`;
  });
}

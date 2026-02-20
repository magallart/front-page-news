import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PageContainerComponent } from '../page-container.component';

import type { TickerHeadline } from '../../../../interfaces/ticker-headline.interface';

@Component({
  selector: 'app-navbar-ticker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageContainerComponent, RouterLink],
  styles: [
    `
      .ticker-window {
        overflow: hidden;
        mask-image: linear-gradient(to right, transparent 0, black 5%, black 95%, transparent 100%);
      }

      .ticker-marquee {
        display: flex;
        width: max-content;
        animation: ticker-rtl 78s linear infinite;
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

      @keyframes ticker-rtl {
        from {
          transform: translateX(0);
        }
        to {
          transform: translateX(-50%);
        }
      }
    `,
  ],
  template: `
    <div class="bg-secondary text-secondary-foreground" style="background-color: hsl(var(--secondary)); color: hsl(var(--secondary-foreground));">
      <app-page-container>
        <div class="flex items-center gap-4 py-2 text-sm">
          <a
            class="breaking-badge inline-flex shrink-0 rounded bg-primary px-2 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-secondary transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
            routerLink="/seccion/ultima-hora"
          >
            {{ breakingLabel }}
          </a>

          <div class="ticker-window min-w-0 flex-1">
            <div class="ticker-marquee">
              <div class="ticker-sequence">
                @for (headline of headlines(); track headline.id) {
                  <a
                    class="transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
                    [routerLink]="['/noticia', headline.id]"
                  >
                    {{ headline.title }}
                  </a>
                  <span class="text-primary/70" aria-hidden="true">{{ separator }}</span>
                }
              </div>
              <div class="ticker-sequence" aria-hidden="true">
                @for (headline of headlines(); track headline.id) {
                  <a
                    class="transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
                    [routerLink]="['/noticia', headline.id]"
                  >
                    {{ headline.title }}
                  </a>
                  <span class="text-primary/70" aria-hidden="true">{{ separator }}</span>
                }
              </div>
            </div>
          </div>
        </div>
      </app-page-container>
    </div>
  `,
})
export class NavbarTickerComponent {
  readonly headlines = input.required<readonly TickerHeadline[]>();

  protected readonly breakingLabel = '\u00DAltima hora';
  protected readonly separator = '\u2022';
}

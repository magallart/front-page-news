import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-home-page-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-6 py-4 sm:space-y-8" aria-label="Cargando portada" aria-busy="true">
      <div class="grid gap-5 lg:grid-cols-[minmax(0,2fr)_22rem] lg:items-stretch">
        <div class="space-y-4 rounded-xl border border-border p-4">
          <div class="home-skeleton h-7 w-36 rounded-md"></div>
          <div class="home-skeleton aspect-[16/9] w-full rounded-lg"></div>
          <div class="space-y-3">
            <div class="home-skeleton h-5 w-full rounded-sm"></div>
            <div class="home-skeleton h-5 w-11/12 rounded-sm"></div>
            <div class="home-skeleton h-5 w-4/5 rounded-sm"></div>
          </div>
        </div>

        <div class="rounded-xl py-0 lg:pl-5">
          <div class="mb-3 flex items-center gap-3">
            <div class="home-skeleton h-3 w-3 rounded-full"></div>
            <h2 class="font-editorial-title text-lg font-semibold uppercase tracking-[0.22em] text-foreground">En directo</h2>
          </div>
          <ul class="grid grid-rows-4">
            @for (placeholder of breakingSkeletonItems; track placeholder) {
              <li class="min-h-0 border-b-2 border-primary/30 py-3 last:border-b-0 lg:flex lg:flex-col lg:justify-center">
                <div class="mb-2 flex items-center gap-3">
                  <div class="home-skeleton h-2.5 w-2.5 rounded-full"></div>
                  <div class="home-skeleton h-3 w-20 rounded-sm"></div>
                </div>
                <div class="space-y-2">
                  <div class="home-skeleton h-5 w-full rounded-sm"></div>
                  <div class="home-skeleton h-5 w-5/6 rounded-sm"></div>
                </div>
              </li>
            }
          </ul>
          <div class="home-skeleton mt-3 h-11 w-full rounded-md"></div>
        </div>
      </div>

      <div class="grid gap-5 lg:grid-cols-[minmax(0,2fr)_22rem] lg:items-start">
        <div class="space-y-6">
          @for (row of mixedSkeletonRows; track row) {
            <section>
              <div class="grid gap-4 md:grid-cols-3">
                @for (card of sectionSkeletonCards; track card) {
                  <article class="rounded-xl border border-border p-4">
                    <div class="mb-3 flex items-center justify-between gap-3">
                      <div class="home-skeleton h-5 w-20 rounded-sm"></div>
                      <div class="home-skeleton h-3 w-24 rounded-sm"></div>
                    </div>
                    <div class="home-skeleton mb-3 aspect-[16/9] w-full rounded-lg"></div>
                    <div class="space-y-2">
                      <div class="home-skeleton h-4 w-full rounded-sm"></div>
                      <div class="home-skeleton h-4 w-11/12 rounded-sm"></div>
                    </div>
                    <div class="home-skeleton mt-4 h-3 w-1/2 rounded-sm"></div>
                  </article>
                }
              </div>
            </section>
          }
        </div>

        <div class="space-y-10 lg:pl-5">
          <section class="rounded-xl bg-secondary px-4 py-5 text-secondary-foreground shadow-subtle sm:px-5">
            <div class="mb-4 border-b border-primary/35 pb-3">
              <h2 class="font-editorial-title inline-flex items-center gap-2 text-2xl font-semibold tracking-tight">Lo más leído</h2>
            </div>
            <ol class="space-y-3">
              @for (item of mostReadSkeletonItems; track item) {
                <li class="flex gap-3 border-b border-secondary-foreground/20 pb-3 last:border-b-0 last:pb-0">
                  <div class="home-skeleton mt-0.5 h-4 w-4 rounded-sm"></div>
                  <div class="min-w-0 flex-1 space-y-2">
                    <div class="home-skeleton h-4 w-full rounded-sm"></div>
                    <div class="home-skeleton h-3 w-1/2 rounded-sm"></div>
                  </div>
                </li>
              }
            </ol>
          </section>

          <section class="rounded-xl border border-border p-4">
            <div class="home-skeleton mb-4 h-6 w-56 rounded-md"></div>
            <div class="grid grid-cols-3 gap-4 sm:grid-cols-4">
              @for (source of sourceSkeletonItems; track source) {
                <div class="home-skeleton aspect-square w-full rounded-lg"></div>
              }
            </div>
          </section>
        </div>
      </div>
    </section>
  `,
  styles: `
    .home-skeleton {
      position: relative;
      overflow: hidden;
      background: hsl(var(--muted));
    }

    .home-skeleton::after {
      content: '';
      position: absolute;
      inset: 0;
      transform: translateX(-100%);
      background: linear-gradient(90deg, transparent 0%, hsl(var(--background) / 0.38) 50%, transparent 100%);
      animation: homeSkeletonShimmer 1.3s ease-in-out infinite;
    }

    @keyframes homeSkeletonShimmer {
      100% {
        transform: translateX(100%);
      }
    }
  `,
})
export class HomePageSkeletonComponent {
  protected readonly breakingSkeletonItems = [1, 2, 3, 4] as const;
  protected readonly mixedSkeletonRows = [1, 2, 3, 4, 5] as const;
  protected readonly sectionSkeletonCards = [1, 2, 3] as const;
  protected readonly mostReadSkeletonItems = [1, 2, 3, 4, 5, 6, 7] as const;
  protected readonly sourceSkeletonItems = [1, 2, 3, 4, 5, 6, 7, 8] as const;
}

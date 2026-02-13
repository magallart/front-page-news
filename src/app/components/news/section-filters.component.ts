import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-section-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="rounded-xl border border-border bg-foreground p-4 text-background" aria-label="Filtros de noticias">
      <div class="relative grid gap-5 lg:grid-cols-[4fr_1fr] lg:items-start">
        <section>
          <div class="flex flex-col items-start gap-2">
            <div class="flex flex-wrap items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.08em]">
              <button
                type="button"
                class="rounded-md border border-background/80 px-2 py-1 text-background/90 transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
                (click)="selectAllSources()"
              >
                SELECCIONAR TODO
              </button>
              <button
                type="button"
                class="rounded-md border border-background/80 px-2 py-1 text-background/80 transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
                (click)="clearAllSources()"
              >
                QUITAR TODO
              </button>
            </div>
          </div>

          <div class="mt-5 grid gap-x-4 gap-y-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            @for (source of sources(); track source) {
              <label class="flex cursor-pointer items-center gap-2 text-sm text-background">
                <input
                  type="checkbox"
                  class="h-4 w-4 border-background/40 bg-foreground accent-primary focus:ring-primary"
                  [checked]="isSourceSelected(source)"
                  (change)="onSourceToggle(source, $event)"
                />
                <span>{{ source }}</span>
              </label>
            }
          </div>
        </section>

        <span class="absolute inset-y-0 left-[calc(80%-2.5rem)] hidden w-px bg-background/15 lg:block" aria-hidden="true"></span>

        <section class="border-t border-background/15 pt-4 lg:border-none lg:pl-2 lg:pt-0">
          <p class="text-xs font-semibold uppercase tracking-[0.12em] text-background/70">Orden</p>

          <div class="mt-5 space-y-3">
            <label class="flex cursor-pointer items-center gap-2 text-sm text-background">
              <input
                type="radio"
                name="publishedAtSort"
                class="h-4 w-4 border-background/40 bg-foreground accent-primary focus:ring-primary"
                value="desc"
                [checked]="sortDirection() === 'desc'"
                (change)="onSortDirectionChange('desc')"
              />
              <span>Mas recientes primero</span>
            </label>

            <label class="flex cursor-pointer items-center gap-2 text-sm text-background">
              <input
                type="radio"
                name="publishedAtSort"
                class="h-4 w-4 border-background/40 bg-foreground accent-primary focus:ring-primary"
                value="asc"
                [checked]="sortDirection() === 'asc'"
                (change)="onSortDirectionChange('asc')"
              />
              <span>Mas antiguas primero</span>
            </label>
          </div>
        </section>
      </div>
    </aside>
  `,
})
export class SectionFiltersComponent {
  readonly sources = input.required<readonly string[]>();
  readonly selectedSources = input.required<readonly string[]>();
  readonly sortDirection = input.required<'asc' | 'desc'>();

  readonly selectedSourcesChange = output<readonly string[]>();
  readonly sortDirectionChange = output<'asc' | 'desc'>();

  protected isSourceSelected(source: string): boolean {
    return this.selectedSources().includes(source);
  }

  protected onSourceToggle(source: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement | null;
    const checked = checkbox?.checked ?? false;
    const currentSources = this.selectedSources();
    const nextSources = checked ? [...new Set([...currentSources, source])] : currentSources.filter((item) => item !== source);
    this.selectedSourcesChange.emit(nextSources);
  }

  protected onSortDirectionChange(direction: 'asc' | 'desc'): void {
    this.sortDirectionChange.emit(direction);
  }

  protected selectAllSources(): void {
    this.selectedSourcesChange.emit(this.sources());
  }

  protected clearAllSources(): void {
    this.selectedSourcesChange.emit([]);
  }
}

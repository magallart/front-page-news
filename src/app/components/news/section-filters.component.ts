import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-section-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="rounded-xl border border-border bg-foreground p-4 text-background lg:sticky lg:top-24" aria-label="Filtros de noticias">
      <h2 class="font-editorial-title text-lg font-semibold text-background">Filtros</h2>

      <div class="mt-4 space-y-3">
        <p class="text-xs font-semibold uppercase tracking-[0.12em] text-background/70">Periodicos</p>

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

      <div class="mt-6 space-y-3">
        <p class="text-xs font-semibold uppercase tracking-[0.12em] text-background/70">Orden</p>

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
}

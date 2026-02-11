import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { PageContainerComponent } from '../../components/layout/page-container.component';

@Component({
  selector: 'app-section-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PageContainerComponent],
  template: `
    <app-page-container>
      <section class="space-y-6 py-4 sm:space-y-8">
        <header class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Seccion</p>
          <h1 class="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {{ sectionTitle() }}
          </h1>
          <p class="text-sm text-muted-foreground sm:text-base">
            Placeholder para mostrar noticias filtradas por la seccion {{ sectionSlug() }}.
          </p>
        </header>

        <div class="grid gap-4 lg:grid-cols-3">
          @for (item of mockStories; track item.id) {
            <article class="rounded-lg border border-border bg-card p-4">
              <p class="text-xs uppercase tracking-wide text-muted-foreground">{{ sectionTitle() }}</p>
              <h2 class="mt-2 font-heading text-lg font-semibold">{{ item.title }}</h2>
              <p class="mt-2 text-sm text-muted-foreground">{{ item.summary }}</p>
              <a
                class="mt-4 inline-flex items-center text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                [routerLink]="['/noticia', item.id]"
              >
                Ver noticia
              </a>
            </article>
          }
        </div>
      </section>
    </app-page-container>
  `,
})
export class SectionPageComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly sectionSlug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug') ?? 'actualidad')),
    { initialValue: 'actualidad' },
  );

  protected readonly sectionTitle = computed(() => formatSectionLabel(this.sectionSlug()));

  protected readonly mockStories = [
    {
      id: 'mock-001',
      title: 'Titular de ejemplo para seccion',
      summary: 'Este bloque validara la estructura visual mientras usamos datos mock.',
    },
    {
      id: 'mock-002',
      title: 'Segunda noticia de ejemplo',
      summary: 'Mas adelante se sustituye por datos reales de RSS desde la API.',
    },
    {
      id: 'mock-003',
      title: 'Tercera noticia de ejemplo',
      summary: 'Tarjeta base para iterar tipografia, espaciado y jerarquia.',
    },
  ] as const;
}

function formatSectionLabel(slug: string): string {
  if (!slug) {
    return 'Actualidad';
  }

  return `${slug.charAt(0).toUpperCase()}${slug.slice(1)}`;
}

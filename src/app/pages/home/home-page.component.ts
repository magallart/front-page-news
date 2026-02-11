import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PageContainerComponent } from '../../components/layout/page-container.component';
import { NewsCarouselComponent } from '../../components/news/news-carousel.component';
import { SectionBlockComponent } from '../../components/news/section-block.component';
import { TrendingListComponent } from '../../components/news/trending-list.component';

import type { NewsItem } from '../../interfaces/news-item.interface';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageContainerComponent, NewsCarouselComponent, SectionBlockComponent, TrendingListComponent],
  template: `
    <app-page-container>
      <section class="space-y-6 py-4 sm:space-y-8">
        <header class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Portada</p>
          <h1 class="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Portada de noticias</h1>
          <p class="max-w-3xl text-sm text-muted-foreground sm:text-base">
            Estructura base de portada para mostrar varias noticias de distintos periodicos en un solo portal.
          </p>
        </header>

        <app-news-carousel title="Destacadas" [articles]="featuredNews" />

        <div class="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <app-section-block title="Actualidad" sectionSlug="actualidad" [articles]="currentAffairsNews" />
          <app-trending-list [items]="trendingNews" />
        </div>

        <app-section-block title="Economia" sectionSlug="economia" [articles]="economyNews" />
      </section>
    </app-page-container>
  `,
})
export class HomePageComponent {
  protected readonly featuredNews = MOCK_NEWS.slice(0, 2);
  protected readonly currentAffairsNews = MOCK_NEWS.filter((item) => item.section === 'actualidad').slice(0, 3);
  protected readonly economyNews = MOCK_NEWS.filter((item) => item.section === 'economia').slice(0, 3);
  protected readonly trendingNews = MOCK_NEWS.slice(0, 5);
}

const MOCK_NEWS: readonly NewsItem[] = [
  {
    id: 'demo-noticia-001',
    title: 'Los mercados abren con subidas moderadas en Europa',
    summary: 'La sesion arranca con avances suaves mientras se esperan datos macro de cierre semanal.',
    imageUrl: 'https://images.unsplash.com/photo-1569025743873-ea3a9ade89f9?auto=format&fit=crop&w=1200&q=80',
    source: 'El Diario Global',
    section: 'economia',
    publishedAt: '2026-02-11',
    author: 'Redaccion Economia',
    url: 'https://example.com/noticia-001',
  },
  {
    id: 'demo-noticia-002',
    title: 'Nuevo acuerdo cultural para impulsar festivales regionales',
    summary: 'Las instituciones anuncian una hoja de ruta con medidas para reforzar la agenda cultural anual.',
    imageUrl: 'https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?auto=format&fit=crop&w=1200&q=80',
    source: 'La Voz Cultural',
    section: 'cultura',
    publishedAt: '2026-02-11',
    author: 'Ana Perez',
    url: 'https://example.com/noticia-002',
  },
  {
    id: 'demo-noticia-003',
    title: 'Actualizacion judicial sobre el caso de mayor impacto de la semana',
    summary: 'El tribunal fija nuevos plazos procesales y cita a las partes para una vista adicional.',
    imageUrl: 'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?auto=format&fit=crop&w=1200&q=80',
    source: 'Boletin Justicia',
    section: 'actualidad',
    publishedAt: '2026-02-10',
    author: 'Mario Ruiz',
    url: 'https://example.com/noticia-003',
  },
  {
    id: 'demo-noticia-004',
    title: 'El congreso debate nuevas medidas de competitividad industrial',
    summary: 'El plan incluye incentivos para modernizacion y apoyo a exportaciones en sectores estrategicos.',
    imageUrl: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
    source: 'Portada Nacional',
    section: 'actualidad',
    publishedAt: '2026-02-10',
    author: 'Lucia Martin',
    url: 'https://example.com/noticia-004',
  },
  {
    id: 'demo-noticia-005',
    title: 'Las pymes aceleran su adopcion de herramientas digitales',
    summary: 'El ultimo informe sectorial muestra crecimiento en automatizacion y comercio electronico.',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    source: 'Economia Hoy',
    section: 'economia',
    publishedAt: '2026-02-10',
    author: 'Daniel Soto',
    url: 'https://example.com/noticia-005',
  },
  {
    id: 'demo-noticia-006',
    title: 'Nueva temporada de museos con exposiciones inmersivas',
    summary: 'Varias ciudades amplian su oferta con muestras interactivas y actividades educativas.',
    imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80',
    source: 'Revista Cultura',
    section: 'cultura',
    publishedAt: '2026-02-09',
    author: 'Paula Vega',
    url: 'https://example.com/noticia-006',
  },
  {
    id: 'demo-noticia-007',
    title: 'Actualidad internacional marcada por acuerdos energeticos',
    summary: 'Los principales bloques negocian nuevas condiciones para el suministro de invierno.',
    imageUrl: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1200&q=80',
    source: 'Mundo Diario',
    section: 'actualidad',
    publishedAt: '2026-02-09',
    author: 'Irene Gil',
    url: 'https://example.com/noticia-007',
  },
] as const;

import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PageContainerComponent } from '../../components/layout/page-container.component';
import { CurrentAffairsBlockComponent } from '../../components/news/current-affairs-block.component';
import { LatestNewsListComponent } from '../../components/news/latest-news-list.component';
import { NewsCarouselComponent } from '../../components/news/news-carousel.component';
import { SectionBlockComponent } from '../../components/news/section-block.component';
import { TrendingListComponent } from '../../components/news/trending-list.component';

import type { NewsItem } from '../../interfaces/news-item.interface';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageContainerComponent,
    NewsCarouselComponent,
    CurrentAffairsBlockComponent,
    LatestNewsListComponent,
    SectionBlockComponent,
    TrendingListComponent,
  ],
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
          <app-current-affairs-block [articles]="currentAffairsNews" />
          <div class="space-y-6">
            <div class="mb-2">
              <app-latest-news-list [items]="latestNews" />
            </div>
            <app-trending-list [items]="trendingNews" />
          </div>
        </div>

        <app-section-block title="Economia" sectionSlug="economia" [articles]="economyNews" />
      </section>
    </app-page-container>
  `,
})
export class HomePageComponent {
  protected readonly featuredNews = pickRandomItems(MOCK_NEWS, FEATURED_STORIES_COUNT);
  protected readonly currentAffairsNews = MOCK_NEWS.filter((item) => item.section === 'actualidad').slice(0, 4);
  protected readonly latestNews = MOCK_NEWS.filter((item) => item.section === 'actualidad').slice(0, 6);
  protected readonly economyNews = MOCK_NEWS.filter((item) => item.section === 'economia').slice(0, 3);
  protected readonly trendingNews = MOCK_NEWS.slice(0, 5);
}

const FEATURED_STORIES_COUNT = 10;

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
  {
    id: 'demo-noticia-008',
    title: 'El sector turistico adelanta previsiones al alza para primavera',
    summary: 'Las reservas anticipadas mejoran frente al mismo periodo del ano anterior.',
    imageUrl: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80',
    source: 'Actualidad 24',
    section: 'actualidad',
    publishedAt: '2026-02-08',
    author: 'Rocio Lara',
    url: 'https://example.com/noticia-008',
  },
  {
    id: 'demo-noticia-009',
    title: 'Los bancos centrales mantienen cautela ante la inflacion subyacente',
    summary: 'Los analistas esperan ajustes graduales en las proximas reuniones monetarias.',
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80',
    source: 'Economia Europa',
    section: 'economia',
    publishedAt: '2026-02-08',
    author: 'Sergio Nieto',
    url: 'https://example.com/noticia-009',
  },
  {
    id: 'demo-noticia-010',
    title: 'Una red de bibliotecas lanza un plan de actividades para jovenes',
    summary: 'El programa combina talleres de lectura, escritura y arte digital en barrios urbanos.',
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80',
    source: 'Cultura Viva',
    section: 'cultura',
    publishedAt: '2026-02-08',
    author: 'Marta Soler',
    url: 'https://example.com/noticia-010',
  },
  {
    id: 'demo-noticia-011',
    title: 'Tecnologia sanitaria acelera el diagnostico en centros publicos',
    summary: 'Nuevos sistemas de apoyo clinico reducen tiempos de espera en pruebas clave.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
    source: 'Salud y Ciencia',
    section: 'actualidad',
    publishedAt: '2026-02-07',
    author: 'Diego Fuentes',
    url: 'https://example.com/noticia-011',
  },
] as const;

function pickRandomItems(items: readonly NewsItem[], count: number): readonly NewsItem[] {
  if (items.length <= count) {
    return items;
  }

  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const currentItem = shuffled[index];
    shuffled[index] = shuffled[randomIndex];
    shuffled[randomIndex] = currentItem;
  }

  return shuffled.slice(0, count);
}

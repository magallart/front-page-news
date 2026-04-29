import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Front Page News | Portada',
    loadComponent: () => import('./pages/home/home-page.component').then((m) => m.HomePageComponent),
  },
  {
    path: 'seccion/:slug',
    title: 'Front Page News | Sección',
    loadComponent: () => import('./pages/section/section-page.component').then((m) => m.SectionPageComponent),
  },
  {
    path: 'fuente/:slug',
    title: 'Front Page News | Fuente',
    loadComponent: () => import('./pages/source/source-page.component').then((m) => m.SourcePageComponent),
  },
  {
    path: 'buscar',
    title: 'Front Page News | Buscar',
    loadComponent: () => import('./pages/search/search-page.component').then((m) => m.SearchPageComponent),
  },
  {
    path: 'aviso-legal',
    title: 'Front Page News | Aviso legal',
    loadComponent: () => import('./pages/legal/legal-notice-page.component').then((m) => m.LegalNoticePageComponent),
  },
  {
    path: 'privacidad',
    title: 'Front Page News | Privacidad',
    loadComponent: () => import('./pages/legal/privacy-page.component').then((m) => m.PrivacyPageComponent),
  },
  {
    path: 'cookies',
    title: 'Front Page News | Cookies',
    loadComponent: () => import('./pages/legal/cookies-page.component').then((m) => m.CookiesPageComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

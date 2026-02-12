import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Front Page News | Portada',
    loadComponent: () => import('./pages/home/home-page.component').then((m) => m.HomePageComponent),
  },
  {
    path: 'seccion/:slug',
    title: 'Front Page News | Seccion',
    loadComponent: () => import('./pages/section/section-page.component').then((m) => m.SectionPageComponent),
  },
  {
    path: 'noticia/:id',
    title: 'Front Page News | Noticia',
    loadComponent: () => import('./pages/article/article-page.component').then((m) => m.ArticlePageComponent),
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

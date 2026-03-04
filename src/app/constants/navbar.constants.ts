import type { NavLink } from '../../interfaces/nav-link.interface';
import type { SocialLink } from '../../interfaces/social-link.interface';
import type { TickerHeadline } from '../../interfaces/ticker-headline.interface';
import type { TopLink } from '../../interfaces/top-link.interface';

export const NAVBAR_SCROLL_STICKY_THRESHOLD = 220;
export const NAVBAR_TICKER_HEADLINE_LIMIT = 12;
export const NAVBAR_SIDE_MENU_DIALOG_ID = 'navbar-side-menu-dialog';
export const NAVBAR_SIDE_MENU_TITLE_ID = 'navbar-side-menu-title';

export const NAVBAR_FALLBACK_TICKER_HEADLINES: readonly TickerHeadline[] = [
  {
    id: 'loading-headlines',
    title: 'Actualizando titulares...',
  },
];

export const NAVBAR_LINKS: readonly NavLink[] = [
  { label: 'Actualidad', href: '/seccion/actualidad', exact: false },
  { label: 'Ciencia', href: '/seccion/ciencia', exact: false },
  { label: 'Cultura', href: '/seccion/cultura', exact: false },
  { label: 'Deportes', href: '/seccion/deportes', exact: false },
  { label: 'Economia', href: '/seccion/economia', exact: false },
  { label: 'Espana', href: '/seccion/espana', exact: false },
  { label: 'Internacional', href: '/seccion/internacional', exact: false },
  { label: 'Opinion', href: '/seccion/opinion', exact: false },
  { label: 'Sociedad', href: '/seccion/sociedad', exact: false },
  { label: 'Tecnologia', href: '/seccion/tecnologia', exact: false },
];

export const NAVBAR_TOP_LINKS: readonly TopLink[] = [
  { label: 'Newsletter' },
  { label: 'Club de lectores' },
];

export const NAVBAR_SOCIAL_LINKS: readonly SocialLink[] = [
  { label: 'Facebook', icon: 'facebook', url: 'https://facebook.com' },
  { label: 'Instagram', icon: 'instagram', url: 'https://instagram.com' },
  { label: 'X', icon: 'x', url: 'https://x.com' },
];

export const ROUTES_WITHOUT_DEDICATED_NEWS_LOAD = new Set(['/aviso-legal', '/privacidad', '/cookies']);

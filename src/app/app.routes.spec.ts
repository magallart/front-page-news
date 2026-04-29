import { describe, expect, it } from 'vitest';

import { routes } from './app.routes';

describe('app.routes', () => {
  it('contains the expected public routes and no dedicated /noticia detail route', () => {
    const paths = routes.map((route) => route.path);

    expect(paths).toContain('');
    expect(paths).toContain('seccion/:slug');
    expect(paths).toContain('fuente/:slug');
    expect(paths).toContain('buscar');
    expect(paths).toContain('aviso-legal');
    expect(paths).toContain('privacidad');
    expect(paths).toContain('cookies');
    expect(paths).toContain('**');
    expect(paths).not.toContain('noticia/:id');

    const fallback = routes.find((route) => route.path === '**');
    expect(fallback?.redirectTo).toBe('');
  });

  it('resolves lazy route components for main and legal pages', async () => {
    const pathsToResolve = ['', 'seccion/:slug', 'fuente/:slug', 'buscar', 'aviso-legal', 'privacidad', 'cookies'] as const;

    for (const path of pathsToResolve) {
      const route = routes.find((item) => item.path === path);
      expect(route?.loadComponent).toBeTypeOf('function');

      const component = await route?.loadComponent?.();
      expect(component).toBeDefined();
    }
  });
});


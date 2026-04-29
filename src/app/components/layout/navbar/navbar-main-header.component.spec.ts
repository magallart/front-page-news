import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';

import { NAVBAR_PRIMARY_LINKS_COUNT, NAVBAR_SECONDARY_LINKS_MAX_COUNT } from '../../../constants/navbar.constants';

import { NavbarMainHeaderComponent } from './navbar-main-header.component';

describe('NavbarMainHeaderComponent', () => {
  it('renders topbar info, brand and splits links into two rows', async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarMainHeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(NavbarMainHeaderComponent);
    const navLinks = createNavLinks();
    fixture.componentRef.setInput('topbarMeta', 'MIERCOLES 04 DE MARZO DE 2026');
    fixture.componentRef.setInput('topLinks', [{ label: 'Newsletter' }, { label: 'Club de lectores' }]);
    fixture.componentRef.setInput('links', navLinks);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    const navRows = fixture.nativeElement.querySelectorAll('nav ul');
    const brandLink = fixture.nativeElement.querySelector('a[routerlink="/"]') as HTMLAnchorElement | null;
    const searchButton = fixture.nativeElement.querySelector('a[aria-label="Buscar noticias"]') as HTMLAnchorElement | null;

    expect(text).toContain('MIERCOLES 04 DE MARZO DE 2026');
    expect(text).toContain('FRONT PAGE');
    expect(text).toContain('NEWS');
    expect(text).toContain('Suscribete');
    expect(navRows.length).toBe(2);
    expect(navRows[0]?.querySelectorAll('li').length).toBe(Math.min(navLinks.length, NAVBAR_PRIMARY_LINKS_COUNT));
    expect(navRows[1]?.querySelectorAll('li').length).toBe(
      Math.min(Math.max(navLinks.length - NAVBAR_PRIMARY_LINKS_COUNT, 0), NAVBAR_SECONDARY_LINKS_MAX_COUNT),
    );
    expect(brandLink?.getAttribute('href')).toBe('/');
    expect(searchButton).toBeTruthy();
    expect(searchButton?.getAttribute('href')).toBe('/buscar');
  });
});

function createNavLinks() {
  return [
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
  ] as const;
}

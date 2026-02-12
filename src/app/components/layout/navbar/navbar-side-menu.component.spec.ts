import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';

import { NavbarSideMenuComponent } from './navbar-side-menu.component';

describe('NavbarSideMenuComponent', () => {
  it('renders social icons in a single row and without text labels', async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarSideMenuComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(NavbarSideMenuComponent);
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('links', MOCK_LINKS);
    fixture.componentRef.setInput('socialLinks', MOCK_SOCIAL_LINKS);
    fixture.detectChanges();

    const socialList = fixture.nativeElement.querySelector('ul.flex.items-center.gap-2');
    expect(socialList).toBeTruthy();

    const socialLabels = Array.from(fixture.nativeElement.querySelectorAll('span')).map((node) =>
      (node as HTMLElement).textContent?.trim(),
    );
    expect(socialLabels).not.toContain('Facebook');
    expect(socialLabels).not.toContain('Instagram');
    expect(socialLabels).not.toContain('X');
  });

  it('emits close event from overlay and close button', async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarSideMenuComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(NavbarSideMenuComponent);
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('links', MOCK_LINKS);
    fixture.componentRef.setInput('socialLinks', MOCK_SOCIAL_LINKS);
    fixture.detectChanges();

    const closeSpy = vi.fn();
    fixture.componentInstance.closed.subscribe(closeSpy);

    const overlayButton = fixture.nativeElement.querySelector(
      'button[aria-label="Cerrar menu lateral"]',
    ) as HTMLButtonElement;
    overlayButton.click();
    fixture.detectChanges();

    const closeButton = fixture.nativeElement.querySelector(
      'button[aria-label="Cerrar menu"]',
    ) as HTMLButtonElement;
    closeButton.click();
    fixture.detectChanges();

    expect(closeSpy).toHaveBeenCalledTimes(2);
  });

  it('emits close event when selecting a navigation link', async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarSideMenuComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(NavbarSideMenuComponent);
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('links', MOCK_LINKS);
    fixture.componentRef.setInput('socialLinks', MOCK_SOCIAL_LINKS);
    fixture.detectChanges();

    const closeSpy = vi.fn();
    fixture.componentInstance.closed.subscribe(closeSpy);

    const firstNavLink = fixture.nativeElement.querySelector('nav a') as HTMLAnchorElement;
    firstNavLink.click();
    fixture.detectChanges();

    expect(closeSpy).toHaveBeenCalledOnce();
  });
});

const MOCK_LINKS = [
  { label: 'Actualidad', href: '/seccion/actualidad', exact: false },
  { label: 'Economia', href: '/seccion/economia', exact: false },
] as const;

const MOCK_SOCIAL_LINKS = [
  { label: 'Facebook', icon: 'facebook', url: 'https://facebook.com' },
  { label: 'Instagram', icon: 'instagram', url: 'https://instagram.com' },
  { label: 'X', icon: 'x', url: 'https://x.com' },
] as const;

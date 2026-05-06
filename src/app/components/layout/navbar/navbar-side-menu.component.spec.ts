import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';

import { NAVBAR_SIDE_MENU_DIALOG_ID, NAVBAR_SIDE_MENU_TITLE_ID } from '../../../constants/navbar.constants';

import { NavbarSideMenuComponent } from './navbar-side-menu.component';

import type { ComponentFixture } from '@angular/core/testing';

describe('NavbarSideMenuComponent', () => {
  it('renders social icons in a single row and without text labels', async () => {
    const fixture = await createFixture();

    const socialList = fixture.nativeElement.querySelector('ul.flex.items-center.gap-2');
    expect(socialList).toBeTruthy();

    const socialLabels = Array.from(fixture.nativeElement.querySelectorAll('span')).map((node) =>
      (node as HTMLElement).textContent?.trim(),
    );
    expect(socialLabels).not.toContain('Facebook');
    expect(socialLabels).not.toContain('Instagram');
    expect(socialLabels).not.toContain('X');
  });

  it('exposes dialog semantics and labelling attributes when open', async () => {
    const fixture = await createFixture();

    const panel = fixture.nativeElement.querySelector(`#${NAVBAR_SIDE_MENU_DIALOG_ID}`) as HTMLElement;
    const heading = fixture.nativeElement.querySelector(`#${NAVBAR_SIDE_MENU_TITLE_ID}`) as HTMLElement;

    expect(panel).toBeTruthy();
    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.getAttribute('aria-modal')).toBe('true');
    expect(panel.getAttribute('aria-labelledby')).toBe(NAVBAR_SIDE_MENU_TITLE_ID);
    expect(heading.textContent?.trim()).toBe('Menu');
  });

  it('starts hidden off-canvas and remains hidden on desktop by responsive classes', async () => {
    const fixture = await createFixture(false);

    const container = fixture.nativeElement.firstElementChild as HTMLElement;
    const overlayButton = fixture.nativeElement.querySelector(
      'button[aria-label="Cerrar menu lateral"]',
    ) as HTMLButtonElement;
    const panel = fixture.nativeElement.querySelector(`#${NAVBAR_SIDE_MENU_DIALOG_ID}`) as HTMLElement;

    expect(container.className).toContain('lg:hidden');
    expect(container.className).toContain('pointer-events-none');
    expect(overlayButton.style.opacity).toBe('0');
    expect(panel.style.transform).toBe('translateX(-100%)');
  });

  it('emits close event from overlay and close button', async () => {
    const fixture = await createFixture();

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
    const fixture = await createFixture();

    const closeSpy = vi.fn();
    fixture.componentInstance.closed.subscribe(closeSpy);

    const firstNavLink = fixture.nativeElement.querySelector('nav a') as HTMLAnchorElement;
    firstNavLink.click();
    fixture.detectChanges();

    expect(closeSpy).toHaveBeenCalledOnce();
  });

  it('emits close event when Escape key is pressed', async () => {
    const fixture = await createFixture();

    const closeSpy = vi.fn();
    fixture.componentInstance.closed.subscribe(closeSpy);

    const panel = fixture.nativeElement.querySelector(`#${NAVBAR_SIDE_MENU_DIALOG_ID}`) as HTMLElement;
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(closeSpy).toHaveBeenCalledOnce();
  });

  it('focuses close button on open and restores previous focus on close', async () => {
    const openerButton = document.createElement('button');
    openerButton.type = 'button';
    openerButton.textContent = 'Open menu';
    document.body.appendChild(openerButton);
    openerButton.focus();

    const fixture = await createFixture(false);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    await flushMicrotasks();

    const closeButton = fixture.nativeElement.querySelector('button[aria-label="Cerrar menu"]') as HTMLButtonElement;
    expect(document.activeElement).toBe(closeButton);

    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();
    await flushMicrotasks();

    expect(document.activeElement).toBe(openerButton);
    openerButton.remove();
  });

  it('traps keyboard focus inside the menu panel', async () => {
    const fixture = await createFixture();
    await flushMicrotasks();

    const panel = fixture.nativeElement.querySelector(`#${NAVBAR_SIDE_MENU_DIALOG_ID}`) as HTMLElement;
    const focusableElements = Array.from(panel.querySelectorAll<HTMLElement>('button, a[href]'));
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    expect(firstFocusableElement).toBeTruthy();
    expect(lastFocusableElement).toBeTruthy();

    firstFocusableElement?.focus();
    firstFocusableElement?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(lastFocusableElement);

    lastFocusableElement?.focus();
    lastFocusableElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(firstFocusableElement);
  });
});

async function createFixture(open = true): Promise<ComponentFixture<NavbarSideMenuComponent>> {
  await TestBed.configureTestingModule({
    imports: [NavbarSideMenuComponent],
    providers: [provideRouter([])],
  }).compileComponents();

  const fixture = TestBed.createComponent(NavbarSideMenuComponent);
  fixture.componentRef.setInput('open', open);
  fixture.componentRef.setInput('links', MOCK_LINKS);
  fixture.componentRef.setInput('socialLinks', MOCK_SOCIAL_LINKS);
  fixture.detectChanges();
  return fixture;
}

async function flushMicrotasks(): Promise<void> {
  await Promise.resolve();
}

const MOCK_LINKS = [
  { label: 'Actualidad', href: '/seccion/actualidad', exact: false },
  { label: 'Economia', href: '/seccion/economia', exact: false },
] as const;

const MOCK_SOCIAL_LINKS = [
  { label: 'Facebook', icon: 'facebook', url: 'https://facebook.com' },
  { label: 'Instagram', icon: 'instagram', url: 'https://instagram.com' },
  { label: 'X', icon: 'x', url: 'https://x.com' },
] as const;

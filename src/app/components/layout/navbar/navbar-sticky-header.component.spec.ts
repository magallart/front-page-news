import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';

import { NavbarStickyHeaderComponent } from './navbar-sticky-header.component';

describe('NavbarStickyHeaderComponent', () => {
  it('toggles hidden/visible classes based on visible input', async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarStickyHeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(NavbarStickyHeaderComponent);
    fixture.componentRef.setInput('visible', false);
    fixture.componentRef.setInput('menuOpen', false);
    fixture.componentRef.setInput('topbarMeta', '11-02-26 · MADRID 24ºC');
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector('div.sticky') as HTMLDivElement;
    expect(root.className).toContain('-translate-y-full');

    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    expect(root.className).toContain('translate-y-0');
  });

  it('emits menu toggle event and reflects aria-expanded state', async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarStickyHeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(NavbarStickyHeaderComponent);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('menuOpen', true);
    fixture.componentRef.setInput('topbarMeta', '11-02-26 · MADRID 24ºC');
    fixture.detectChanges();

    const toggleSpy = vi.fn();
    fixture.componentInstance.menuToggle.subscribe(toggleSpy);

    const button = fixture.nativeElement.querySelector('button[aria-label="Abrir menu"]') as HTMLButtonElement;
    expect(button.getAttribute('aria-expanded')).toBe('true');

    button.click();
    fixture.detectChanges();

    expect(toggleSpy).toHaveBeenCalledOnce();
  });
});


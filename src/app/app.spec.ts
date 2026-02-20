import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        media: '(max-width: 1023px)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    });
    setWindowScrollY(0);

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render app shell', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-navbar')).toBeTruthy();
    expect(compiled.querySelector('main')).toBeTruthy();
    expect(compiled.querySelector('app-footer')).toBeTruthy();
  });

  it('shows the back-to-top button after passing the scroll threshold', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button[aria-label="Volver arriba"]') as HTMLButtonElement;
    expect(button.className).toContain('opacity-0');

    setWindowScrollY(600);
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    expect(button.className).toContain('opacity-100');
  });

  it('scrolls smoothly to top when pressing back-to-top button', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    setWindowScrollY(600);
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button[aria-label="Volver arriba"]') as HTMLButtonElement;
    button.click();

    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  });
});

function setWindowScrollY(value: number): void {
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    writable: true,
    value,
  });
}

import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';

import { AppFooterComponent } from './app-footer.component';

describe('AppFooterComponent', () => {
  it('renders compact footer row with logo and social icons', async () => {
    await TestBed.configureTestingModule({
      imports: [AppFooterComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppFooterComponent);
    fixture.detectChanges();

    const logo = fixture.nativeElement.querySelector('img[alt="Front Page News"]') as HTMLImageElement | null;
    expect(logo).toBeTruthy();
    expect(logo?.getAttribute('src')).toBe('/images/front-page-news-logo.png');

    const socialLinks = fixture.nativeElement.querySelectorAll('a[aria-label="Facebook"], a[aria-label="Instagram"], a[aria-label="X"]');
    expect(socialLinks.length).toBe(3);
  });

  it('does not render removed editorial columns', async () => {
    await TestBed.configureTestingModule({
      imports: [AppFooterComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppFooterComponent);
    fixture.detectChanges();

    const textContent = fixture.nativeElement.textContent as string;
    expect(textContent).not.toContain('Secciones');
    expect(textContent).not.toContain('Servicios');
    expect(textContent).not.toContain('Enlaces de interes');
    expect(textContent).not.toContain('Periodicos');
  });

  it('renders legal links and external social links with proper attributes', async () => {
    await TestBed.configureTestingModule({
      imports: [AppFooterComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppFooterComponent);
    fixture.detectChanges();

    const legalLinks = fixture.nativeElement.querySelectorAll('a[href="/aviso-legal"], a[href="/privacidad"], a[href="/cookies"]');
    expect(legalLinks.length).toBe(3);

    const externalLinks = Array.from(fixture.nativeElement.querySelectorAll('a[target="_blank"]')) as HTMLAnchorElement[];
    expect(externalLinks.length).toBe(3);
    for (const link of externalLinks) {
      expect(link.getAttribute('rel')).toContain('noopener');
      expect(link.getAttribute('rel')).toContain('noreferrer');
    }
  });
});

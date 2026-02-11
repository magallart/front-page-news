import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';

import { AppFooterComponent } from './app-footer.component';

describe('AppFooterComponent', () => {
  it('renders brand block with logo, description and social icons', async () => {
    await TestBed.configureTestingModule({
      imports: [AppFooterComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppFooterComponent);
    fixture.detectChanges();

    const logo = fixture.nativeElement.querySelector(
      'img[alt="Front Page News"]',
    ) as HTMLImageElement | null;
    expect(logo).toBeTruthy();
    expect(logo?.getAttribute('src')).toBe('/images/front-page-news-logo.png');

    const textContent = fixture.nativeElement.textContent as string;
    expect(textContent).toContain('Las ultimas noticias de distintos periodicos, reunidas en un solo lugar.');

    const socialLinks = fixture.nativeElement.querySelectorAll(
      'a[aria-label="Facebook"], a[aria-label="Instagram"], a[aria-label="X"]',
    );
    expect(socialLinks.length).toBe(3);
  });

  it('renders all editorial columns and key links', async () => {
    await TestBed.configureTestingModule({
      imports: [AppFooterComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppFooterComponent);
    fixture.detectChanges();

    const headings = Array.from(fixture.nativeElement.querySelectorAll('h2')).map((node) =>
      (node as HTMLElement).textContent?.trim(),
    );
    expect(headings).toContain('Secciones');
    expect(headings).toContain('Servicios');
    expect(headings).toContain('Enlaces de interes');
    expect(headings).toContain('Periodicos');

    const textContent = fixture.nativeElement.textContent as string;
    expect(textContent).toContain('Actualidad');
    expect(textContent).toContain('Lo mas leido');
    expect(textContent).toContain('El Pais');
    expect(textContent).toContain('elDiario.es');
  });

  it('renders legal links and external links with proper attributes', async () => {
    await TestBed.configureTestingModule({
      imports: [AppFooterComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppFooterComponent);
    fixture.detectChanges();

    const legalLinks = fixture.nativeElement.querySelectorAll(
      'a[href="/aviso-legal"], a[href="/privacidad"], a[href="/cookies"]',
    );
    expect(legalLinks.length).toBe(3);

    const externalLinks = Array.from(
      fixture.nativeElement.querySelectorAll('a[target="_blank"]'),
    ) as HTMLAnchorElement[];
    expect(externalLinks.length).toBeGreaterThanOrEqual(10);
    for (const link of externalLinks) {
      expect(link.getAttribute('rel')).toContain('noopener');
      expect(link.getAttribute('rel')).toContain('noreferrer');
    }
  });
});


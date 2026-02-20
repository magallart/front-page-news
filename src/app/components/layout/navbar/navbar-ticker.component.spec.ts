import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';

import { NavbarTickerComponent } from './navbar-ticker.component';

describe('NavbarTickerComponent', () => {
  it('renders breaking badge and ticker links duplicated for seamless animation', async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarTickerComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(NavbarTickerComponent);
    fixture.componentRef.setInput('headlines', MOCK_HEADLINES);
    fixture.detectChanges();

    const rootText = fixture.nativeElement.textContent as string;
    expect(rootText).toContain('Última hora');

    const links = Array.from(fixture.nativeElement.querySelectorAll('a')) as HTMLAnchorElement[];
    const breakingLink = links.find((link) => link.textContent?.includes('Última hora'));
    const headlineLinks = links.filter((link) => link.getAttribute('href')?.startsWith('/noticia/'));

    expect(breakingLink?.getAttribute('href')).toBe('/seccion/ultima-hora');
    expect(headlineLinks.length).toBe(MOCK_HEADLINES.length * 2);
    expect(headlineLinks[0]?.getAttribute('href')).toContain('/noticia/demo-noticia-001');
  });
});

const MOCK_HEADLINES = [
  { id: 'demo-noticia-001', title: 'Titular 1' },
  { id: 'demo-noticia-002', title: 'Titular 2' },
] as const;


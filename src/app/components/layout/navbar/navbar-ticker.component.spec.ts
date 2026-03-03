import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';

import { NavbarTickerComponent } from './navbar-ticker.component';

describe('NavbarTickerComponent', () => {
  it('renders breaking badge link and duplicated ticker text sequences', async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarTickerComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(NavbarTickerComponent);
    fixture.componentRef.setInput('headlines', MOCK_HEADLINES);
    fixture.detectChanges();

    const rootText = fixture.nativeElement.textContent as string;
    expect(rootText).toContain('\u00DAltima hora');

    const links = Array.from(fixture.nativeElement.querySelectorAll('a')) as HTMLAnchorElement[];
    const breakingLink = links.find((link) => link.textContent?.includes('\u00DAltima hora'));
    expect(breakingLink?.getAttribute('href')).toBe('/seccion/ultima-hora');

    const tickerTextItems = Array.from(fixture.nativeElement.querySelectorAll('.ticker-sequence span')) as HTMLElement[];
    const renderedHeadlines = tickerTextItems.filter((element) =>
      MOCK_HEADLINES.some((headline) => element.textContent?.includes(headline.title)),
    );

    expect(renderedHeadlines.length).toBe(MOCK_HEADLINES.length * 2);
  });
});

const MOCK_HEADLINES = [
  { id: 'demo-noticia-001', title: 'Titular 1' },
  { id: 'demo-noticia-002', title: 'Titular 2' },
] as const;

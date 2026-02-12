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

    const links = fixture.nativeElement.querySelectorAll('a');
    expect(links.length).toBe(MOCK_HEADLINES.length * 2);
    expect((links[0] as HTMLAnchorElement).getAttribute('href')).toContain('/noticia/demo-noticia-001');
  });
});

const MOCK_HEADLINES = [
  { id: 'demo-noticia-001', title: 'Titular 1' },
  { id: 'demo-noticia-002', title: 'Titular 2' },
] as const;


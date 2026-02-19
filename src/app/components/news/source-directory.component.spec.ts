import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { SourceDirectoryComponent } from './source-directory.component';

describe('SourceDirectoryComponent', () => {
  it('renders source links with icon-only layout and tooltip labels', async () => {
    await TestBed.configureTestingModule({
      imports: [SourceDirectoryComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SourceDirectoryComponent);
    fixture.componentRef.setInput('items', [
      {
        id: 'source-a',
        name: 'Periodico A',
        url: 'https://periodico-a.test',
        logoUrl: '/images/sources/source-a.png',
      },
      {
        id: 'source-b',
        name: 'Periodico B',
        url: 'https://periodico-b.test',
        logoUrl: '/images/sources/source-b.png',
      },
    ]);
    fixture.detectChanges();

    const links = fixture.nativeElement.querySelectorAll('a');
    expect(links.length).toBe(2);
    expect((links[0] as HTMLAnchorElement).href).toContain('https://periodico-a.test/');
    expect((links[1] as HTMLAnchorElement).href).toContain('https://periodico-b.test/');
    expect((links[0] as HTMLAnchorElement).getAttribute('aria-label')).toBe('Periodico A');
    expect((links[1] as HTMLAnchorElement).getAttribute('aria-label')).toBe('Periodico B');

    const images = fixture.nativeElement.querySelectorAll('img');
    expect(images.length).toBe(2);

    const tooltipLabels = fixture.nativeElement.querySelectorAll('span');
    expect(tooltipLabels.length).toBe(2);
  });

  it('renders empty state when no source items are provided', async () => {
    await TestBed.configureTestingModule({
      imports: [SourceDirectoryComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SourceDirectoryComponent);
    fixture.componentRef.setInput('items', []);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No hay fuentes disponibles');
  });

  it('uses placeholder logo when image fails to load', async () => {
    await TestBed.configureTestingModule({
      imports: [SourceDirectoryComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SourceDirectoryComponent);
    fixture.componentRef.setInput('items', [
      {
        id: 'source-economista',
        name: 'El Economista',
        url: 'https://eleconomista.es',
        logoUrl: '/images/sources/source-economista.png',
      },
    ]);
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    image.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(image.src).toContain('/images/sources/source-placeholder.svg');
  });
});

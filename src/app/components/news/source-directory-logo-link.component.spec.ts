import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { SOURCE_DIRECTORY_PLACEHOLDER_LOGO_URL } from '../../constants/source-directory.constants';

import { SourceDirectoryLogoLinkComponent } from './source-directory-logo-link.component';

describe('SourceDirectoryLogoLinkComponent', () => {
  it('renders icon link and tooltip label', async () => {
    await TestBed.configureTestingModule({
      imports: [SourceDirectoryLogoLinkComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SourceDirectoryLogoLinkComponent);
    fixture.componentRef.setInput('item', {
      id: 'source-a',
      name: 'Periodico A',
      url: 'https://periodico-a.test',
      logoUrl: '/images/sources/source-a.png',
    });
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    const tooltip = fixture.nativeElement.querySelector('span') as HTMLSpanElement;
    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;

    expect(link.href).toContain('https://periodico-a.test/');
    expect(link.getAttribute('aria-label')).toBe('Periodico A');
    expect(tooltip.textContent?.trim()).toBe('Periodico A');
    expect(image.getAttribute('alt')).toBe('Logotipo de Periodico A');
  });

  it('uses placeholder logo when image fails to load', async () => {
    await TestBed.configureTestingModule({
      imports: [SourceDirectoryLogoLinkComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SourceDirectoryLogoLinkComponent);
    fixture.componentRef.setInput('item', {
      id: 'source-a',
      name: 'Periodico A',
      url: 'https://periodico-a.test',
      logoUrl: '/images/sources/source-a.png',
    });
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    image.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(image.src).toContain(SOURCE_DIRECTORY_PLACEHOLDER_LOGO_URL);
  });

  it('ignores image error events with no image target', async () => {
    await TestBed.configureTestingModule({
      imports: [SourceDirectoryLogoLinkComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SourceDirectoryLogoLinkComponent);
    fixture.componentRef.setInput('item', {
      id: 'source-a',
      name: 'Periodico A',
      url: 'https://periodico-a.test',
      logoUrl: '/images/sources/source-a.png',
    });
    fixture.detectChanges();

    expect(() => {
      (fixture.componentInstance as unknown as { handleImageError: (event: Event) => void }).handleImageError(
        new Event('error'),
      );
    }).not.toThrow();
  });
});

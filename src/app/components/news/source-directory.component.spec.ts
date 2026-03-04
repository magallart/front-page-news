import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  SOURCE_DIRECTORY_EMPTY_MESSAGE,
  SOURCE_DIRECTORY_PLACEHOLDER_LOGO_URL,
  SOURCE_DIRECTORY_TITLE,
} from '../../constants/source-directory.constants';

import { SourceDirectoryComponent } from './source-directory.component';

const BASE_ITEMS = [
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
  {
    id: 'source-c',
    name: 'Periodico C',
    url: 'https://periodico-c.test',
    logoUrl: '/images/sources/source-c.png',
  },
  {
    id: 'source-d',
    name: 'Periodico D',
    url: 'https://periodico-d.test',
    logoUrl: '/images/sources/source-d.png',
  },
] as const;

describe('SourceDirectoryComponent', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: originalMatchMedia,
    });
    vi.restoreAllMocks();
  });

  it('renders source links with icon-only layout and tooltip labels', async () => {
    await TestBed.configureTestingModule({
      imports: [SourceDirectoryComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SourceDirectoryComponent);
    fixture.componentRef.setInput('items', BASE_ITEMS.slice(0, 2));
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
    expect(fixture.nativeElement.textContent).toContain(SOURCE_DIRECTORY_TITLE);
  });

  it('renders empty state when no source items are provided', async () => {
    await TestBed.configureTestingModule({
      imports: [SourceDirectoryComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SourceDirectoryComponent);
    fixture.componentRef.setInput('items', []);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(SOURCE_DIRECTORY_EMPTY_MESSAGE);
  });

  it('uses placeholder logo when image fails to load', async () => {
    await TestBed.configureTestingModule({
      imports: [SourceDirectoryComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SourceDirectoryComponent);
    fixture.componentRef.setInput('items', [BASE_ITEMS[0]]);
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    image.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(image.src).toContain(SOURCE_DIRECTORY_PLACEHOLDER_LOGO_URL);
  });

  it('uses tablet fixed rows when matchMedia supports addEventListener', async () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    const mediaQueryList = {
      matches: true,
      media: '(min-width: 768px) and (max-width: 1023px)',
      onchange: null,
      addEventListener,
      removeEventListener,
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList;

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: vi.fn(() => mediaQueryList),
    });

    await TestBed.configureTestingModule({
      imports: [SourceDirectoryComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SourceDirectoryComponent);
    fixture.componentRef.setInput('items', BASE_ITEMS);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('ul');
    expect(rows.length).toBe(2);
    expect(rows[0]?.querySelectorAll('li').length).toBe(2);
    expect(rows[1]?.querySelectorAll('li').length).toBe(2);
    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    fixture.destroy();
    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('supports legacy addListener/removeListener matchMedia API', async () => {
    const addListener = vi.fn();
    const removeListener = vi.fn();
    const mediaQueryList = {
      matches: false,
      media: '(min-width: 768px) and (max-width: 1023px)',
      onchange: null,
      addListener,
      removeListener,
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList;

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: vi.fn(() => mediaQueryList),
    });

    await TestBed.configureTestingModule({
      imports: [SourceDirectoryComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SourceDirectoryComponent);
    fixture.componentRef.setInput('items', BASE_ITEMS);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('ul');
    expect(rows[0]?.querySelectorAll('li').length).toBe(3);
    expect(rows[1]?.querySelectorAll('li').length).toBe(1);
    expect(addListener).toHaveBeenCalledOnce();

    fixture.destroy();
    expect(removeListener).toHaveBeenCalledWith(expect.any(Function));
  });
});

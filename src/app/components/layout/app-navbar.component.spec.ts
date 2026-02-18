import { type Signal, type WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';

import { NewsStore } from '../../stores/news.store';

import { AppNavbarComponent } from './app-navbar.component';

describe('AppNavbarComponent', () => {
  it('shows sticky header by default on mobile viewport', async () => {
    mockMatchMedia(true);
    mockNoGeolocation();

    await TestBed.configureTestingModule({
      imports: [AppNavbarComponent],
      providers: [provideRouter([]), { provide: NewsStore, useValue: createNewsStoreMock() }],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppNavbarComponent);
    fixture.detectChanges();

    const component = asNavbarTestInstance(fixture.componentInstance);
    expect(component.shouldShowSticky()).toBe(true);
  });

  it('keeps sticky hidden on desktop until crossing scroll threshold', async () => {
    mockMatchMedia(false);
    mockNoGeolocation();
    setWindowScrollY(0);

    await TestBed.configureTestingModule({
      imports: [AppNavbarComponent],
      providers: [provideRouter([]), { provide: NewsStore, useValue: createNewsStoreMock() }],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppNavbarComponent);
    fixture.detectChanges();

    const component = asNavbarTestInstance(fixture.componentInstance);
    expect(component.shouldShowSticky()).toBe(false);

    setWindowScrollY(260);
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    expect(component.shouldShowSticky()).toBe(true);
  });

  it('closes side menu when scroll returns below desktop threshold', async () => {
    mockMatchMedia(false);
    mockNoGeolocation();
    setWindowScrollY(260);

    await TestBed.configureTestingModule({
      imports: [AppNavbarComponent],
      providers: [provideRouter([]), { provide: NewsStore, useValue: createNewsStoreMock() }],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppNavbarComponent);
    fixture.detectChanges();

    const component = asNavbarTestInstance(fixture.componentInstance);
    component.menuOpen.set(true);

    setWindowScrollY(100);
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    expect(component.menuOpen()).toBe(false);
    expect(component.shouldShowSticky()).toBe(false);
  });

  it('formats compact sticky meta label in mobile viewport', async () => {
    mockMatchMedia(true);
    mockNoGeolocation();

    await TestBed.configureTestingModule({
      imports: [AppNavbarComponent],
      providers: [provideRouter([]), { provide: NewsStore, useValue: createNewsStoreMock() }],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppNavbarComponent);
    fixture.detectChanges();

    const component = asNavbarTestInstance(fixture.componentInstance);
    component.city.set('Bilbao');
    component.temperature.set(18);

    const label = component.stickyTopbarMeta();
    expect(label).toMatch(/^\d{2}-\d{2}-\d{2}\s\u00B7\sBILBAO\s18\u00BAC$/);
  });

  it('updates city and temperature from geolocation + weather APIs', async () => {
    mockMatchMedia(false);
    mockGeoSuccess(40.4, -3.7);
    mockFetchSuccess('Valencia', 27.2);

    await TestBed.configureTestingModule({
      imports: [AppNavbarComponent],
      providers: [provideRouter([]), { provide: NewsStore, useValue: createNewsStoreMock() }],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppNavbarComponent);
    fixture.detectChanges();

    const component = asNavbarTestInstance(fixture.componentInstance);
    await vi.waitFor(() => {
      expect(component.topbarMeta()).toContain(`VALENCIA 27\u00BAC`);
    });
  });
});

function asNavbarTestInstance(component: AppNavbarComponent): NavbarTestInstance {
  const map = component as unknown as Record<string, unknown>;
  return {
    topbarMeta: map['topbarMeta'] as Signal<string>,
    stickyTopbarMeta: map['stickyTopbarMeta'] as Signal<string>,
    shouldShowSticky: map['shouldShowSticky'] as Signal<boolean>,
    city: map['city'] as WritableSignal<string>,
    temperature: map['temperature'] as WritableSignal<number | null>,
    menuOpen: map['menuOpen'] as WritableSignal<boolean>,
  };
}

function mockMatchMedia(matches: boolean): void {
  const mql = {
    matches,
    media: '(max-width: 1023px)',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList;

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockReturnValue(mql),
  });
}

function setWindowScrollY(value: number): void {
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    writable: true,
    value,
  });
}

function mockNoGeolocation(): void {
  Object.defineProperty(globalThis.navigator, 'geolocation', {
    configurable: true,
    value: undefined,
  });
}

function mockGeoSuccess(latitude: number, longitude: number): void {
  Object.defineProperty(globalThis.navigator, 'geolocation', {
    configurable: true,
    value: {
      getCurrentPosition: (success: PositionCallback): void => {
        success({
          coords: { latitude, longitude } as GeolocationCoordinates,
        } as GeolocationPosition);
      },
    },
  });
}

function mockFetchSuccess(city: string, temperature: number): void {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({
      json: async () => ({
        results: [{ name: city }],
      }),
    })
    .mockResolvedValueOnce({
      json: async () => ({
        current: { temperature_2m: temperature },
      }),
    });

  vi.stubGlobal('fetch', fetchMock);
}

function createNewsStoreMock() {
  return {
    data: vi.fn(() => [
      createArticle('news-1', 'Titular 1'),
      createArticle('news-2', 'Titular 2'),
      createArticle('news-3', 'Titular 3'),
    ]),
    load: vi.fn(),
  };
}

function createArticle(id: string, title: string) {
  return {
    id,
    externalId: null,
    title,
    summary: 'Resumen',
    url: 'https://example.com/noticia',
    canonicalUrl: null,
    imageUrl: null,
    sourceId: 'source-1',
    sourceName: 'Fuente',
    sectionSlug: 'actualidad',
    author: null,
    publishedAt: null,
  } as const;
}

interface NavbarTestInstance {
  readonly topbarMeta: Signal<string>;
  readonly stickyTopbarMeta: Signal<string>;
  readonly shouldShowSticky: Signal<boolean>;
  readonly city: WritableSignal<string>;
  readonly temperature: WritableSignal<number | null>;
  readonly menuOpen: WritableSignal<boolean>;
}


import { type Signal, type WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';

import { NewsStore } from '../../stores/news.store';

import { AppNavbarComponent } from './app-navbar.component';

describe('AppNavbarComponent', () => {
  it('shows sticky header by default on mobile viewport', async () => {
    mockMatchMedia(true);

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

  it('formats compact sticky meta label in mobile viewport without city or temperature', async () => {
    mockMatchMedia(true);

    await TestBed.configureTestingModule({
      imports: [AppNavbarComponent],
      providers: [provideRouter([]), { provide: NewsStore, useValue: createNewsStoreMock() }],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppNavbarComponent);
    fixture.detectChanges();

    const component = asNavbarTestInstance(fixture.componentInstance);
    const label = component.stickyTopbarMeta();
    expect(label).toMatch(/^\d{2}-\d{2}-\d{2}$/);
  });

  it('does not trigger ticker fallback load when news data already exists', async () => {
    mockMatchMedia(false);
    const storeMock = createNewsStoreMock();

    await TestBed.configureTestingModule({
      imports: [AppNavbarComponent],
      providers: [provideRouter([]), { provide: NewsStore, useValue: storeMock }],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppNavbarComponent);
    fixture.detectChanges();

    expect(storeMock.load).not.toHaveBeenCalled();
  });

  it('shows fallback ticker headline when store has no news', async () => {
    mockMatchMedia(false);
    const storeMock = createNewsStoreMock({ articles: [] });

    await TestBed.configureTestingModule({
      imports: [AppNavbarComponent],
      providers: [provideRouter([]), { provide: NewsStore, useValue: storeMock }],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppNavbarComponent);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Actualizando titulares...');
    expect(storeMock.load).not.toHaveBeenCalled();
  });

  it('loads ticker news fallback on legal routes when store is empty', async () => {
    mockMatchMedia(false);
    const storeMock = createNewsStoreMock({ articles: [] });

    await TestBed.configureTestingModule({
      imports: [AppNavbarComponent],
      providers: [provideRouter([]), { provide: NewsStore, useValue: storeMock }],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppNavbarComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as { loadTickerNewsIfNeeded: (url: string) => void };
    component.loadTickerNewsIfNeeded('/aviso-legal');

    expect(storeMock.load).toHaveBeenCalledTimes(1);
    expect(storeMock.load).toHaveBeenCalledWith({ page: 1, limit: 120 });
  });

  it('does not load ticker fallback on legal routes while store is already loading', async () => {
    mockMatchMedia(false);
    const storeMock = createNewsStoreMock({ articles: [], loading: true });

    await TestBed.configureTestingModule({
      imports: [AppNavbarComponent],
      providers: [provideRouter([]), { provide: NewsStore, useValue: storeMock }],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppNavbarComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as { loadTickerNewsIfNeeded: (url: string) => void };
    component.loadTickerNewsIfNeeded('/privacidad');

    expect(storeMock.load).not.toHaveBeenCalled();
  });
});

function asNavbarTestInstance(component: AppNavbarComponent): NavbarTestInstance {
  const map = component as unknown as Record<string, unknown>;
  return {
    topbarMeta: map['topbarMeta'] as Signal<string>,
    stickyTopbarMeta: map['stickyTopbarMeta'] as Signal<string>,
    shouldShowSticky: map['shouldShowSticky'] as Signal<boolean>,
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

function createNewsStoreMock(overrides?: Partial<{ articles: readonly ReturnType<typeof createArticle>[]; loading: boolean }>) {
  return {
    data: vi.fn(
      () =>
        overrides?.articles ?? [
          createArticle('news-1', 'Titular 1'),
          createArticle('news-2', 'Titular 2'),
          createArticle('news-3', 'Titular 3'),
        ]
    ),
    loading: vi.fn(() => overrides?.loading ?? false),
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
  readonly menuOpen: WritableSignal<boolean>;
}


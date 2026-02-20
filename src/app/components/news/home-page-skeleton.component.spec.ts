import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { HomePageSkeletonComponent } from './home-page-skeleton.component';

describe('HomePageSkeletonComponent', () => {
  it('renders loading skeleton with key section headings', async () => {
    await TestBed.configureTestingModule({
      imports: [HomePageSkeletonComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomePageSkeletonComponent);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('section[aria-label="Cargando portada"]')).toBeTruthy();
    expect(root.textContent).toContain('En directo');
    expect(root.textContent).toContain('Lo más leído');
    expect(root.querySelectorAll('.home-skeleton').length).toBeGreaterThan(20);
  });
});

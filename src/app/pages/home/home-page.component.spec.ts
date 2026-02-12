import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';

import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
  it('renders top hero+breaking and lower sections with most-read', async () => {
    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-news-carousel')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-breaking-news')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-most-read-news')).toBeTruthy();

    const sectionBlocks = fixture.nativeElement.querySelectorAll('app-section-block');
    expect(sectionBlocks.length).toBe(3);

    const sectionText = fixture.nativeElement.textContent as string;
    expect(sectionText).toContain('Actualidad');
    expect(sectionText).toContain('Economia');
    expect(sectionText).toContain('Cultura');
  });
});

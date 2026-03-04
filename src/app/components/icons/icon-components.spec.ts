import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { IconArrowRightComponent } from './icon-arrow-right.component';
import { IconChevronLeftComponent } from './icon-chevron-left.component';
import { IconChevronRightComponent } from './icon-chevron-right.component';
import { IconChevronUpComponent } from './icon-chevron-up.component';
import { IconCloseComponent } from './icon-close.component';
import { IconExclamationCircleComponent } from './icon-exclamation-circle.component';
import { IconExternalLinkComponent } from './icon-external-link.component';
import { IconEyeComponent } from './icon-eye.component';
import { IconFilterComponent } from './icon-filter.component';
import { IconMenuComponent } from './icon-menu.component';
import { IconNewsComponent } from './icon-news.component';
import { IconSearchComponent } from './icon-search.component';
import { IconTrendingUpComponent } from './icon-trending-up.component';
import { SocialIconComponent } from './social-icon.component';

@Component({
  standalone: true,
  imports: [
    IconArrowRightComponent,
    IconChevronLeftComponent,
    IconChevronRightComponent,
    IconChevronUpComponent,
    IconCloseComponent,
    IconExclamationCircleComponent,
    IconExternalLinkComponent,
    IconEyeComponent,
    IconFilterComponent,
    IconMenuComponent,
    IconNewsComponent,
    IconSearchComponent,
    IconTrendingUpComponent,
    SocialIconComponent,
  ],
  template: `
    <app-icon-arrow-right></app-icon-arrow-right>
    <app-icon-chevron-left></app-icon-chevron-left>
    <app-icon-chevron-right></app-icon-chevron-right>
    <app-icon-chevron-up></app-icon-chevron-up>
    <app-icon-close></app-icon-close>
    <app-icon-exclamation-circle></app-icon-exclamation-circle>
    <app-icon-external-link></app-icon-external-link>
    <app-icon-eye></app-icon-eye>
    <app-icon-filter></app-icon-filter>
    <app-icon-menu></app-icon-menu>
    <app-icon-news></app-icon-news>
    <app-icon-search></app-icon-search>
    <app-icon-trending-up></app-icon-trending-up>
    <app-social-icon name="facebook"></app-social-icon>
    <app-social-icon name="instagram"></app-social-icon>
    <app-social-icon name="x"></app-social-icon>
  `,
})
class IconHostComponent {}

describe('Icon components', () => {
  it('render all SVG icon components without runtime errors', async () => {
    await TestBed.configureTestingModule({
      imports: [IconHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(IconHostComponent);
    fixture.detectChanges();

    const svgs = fixture.nativeElement.querySelectorAll('svg');
    expect(svgs.length).toBe(16);
  });

  it('renders social icon variants with expected SVG path structures', async () => {
    await TestBed.configureTestingModule({
      imports: [SocialIconComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SocialIconComponent);

    fixture.componentRef.setInput('name', 'facebook');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('path').length).toBe(1);

    fixture.componentRef.setInput('name', 'instagram');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('path').length).toBe(3);

    fixture.componentRef.setInput('name', 'x');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('path').length).toBe(2);
  });
});


import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { CookiesPageComponent } from './cookies-page.component';
import { LegalNoticePageComponent } from './legal-notice-page.component';
import { PrivacyPageComponent } from './privacy-page.component';

describe('Legal pages', () => {
  it('renders legal notice page content blocks', async () => {
    await TestBed.configureTestingModule({
      imports: [LegalNoticePageComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(LegalNoticePageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Aviso legal');
    expect(fixture.nativeElement.querySelectorAll('article section').length).toBeGreaterThanOrEqual(6);
  });

  it('renders privacy page content blocks', async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyPageComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(PrivacyPageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Privacidad');
    expect(fixture.nativeElement.querySelectorAll('article section').length).toBeGreaterThanOrEqual(7);
  });

  it('renders cookies page content blocks', async () => {
    await TestBed.configureTestingModule({
      imports: [CookiesPageComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(CookiesPageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Cookies');
    expect(fixture.nativeElement.querySelectorAll('article section').length).toBeGreaterThanOrEqual(6);
  });
});


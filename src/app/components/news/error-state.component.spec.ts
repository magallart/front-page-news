import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { ErrorStateComponent } from './error-state.component';

describe('ErrorStateComponent', () => {
  it('renders the provided message and image', async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorStateComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ErrorStateComponent);
    fixture.componentRef.setInput('headline', 'Primera linea');
    fixture.componentRef.setInput('message', 'Mensaje de prueba');
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('img[src="/images/error.png"]') as HTMLImageElement;
    expect(image).toBeTruthy();
    expect(image.alt).toBe('Error visual');

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Primera linea');
    expect(text).toContain('Mensaje de prueba');
  });

  it('uses the expected visual structure for section empty state', async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorStateComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ErrorStateComponent);
    fixture.componentRef.setInput('headline', 'Algo ha salido mal...');
    fixture.componentRef.setInput('message', 'Nuestros periodistas están peleándose con el WiFi. Vuelve en un momento.');
    fixture.detectChanges();

    const container = fixture.nativeElement.querySelector('section') as HTMLElement;
    expect(container.className).not.toContain('shadow');
    expect(container.className).not.toContain('border');

    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(image.className).toContain('max-w-96');

    const headline = fixture.nativeElement.querySelector('p.error-headline') as HTMLParagraphElement;
    expect(headline).toBeTruthy();
    expect(headline.textContent?.trim()).toBe('Algo ha salido mal...');
  });
});

import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { PageContainerComponent } from './page-container.component';

@Component({
  standalone: true,
  imports: [PageContainerComponent],
  template: `
    <app-page-container>
      <p id="projected-content">Contenido proyectado</p>
    </app-page-container>
  `,
})
class HostPageContainerComponent {}

describe('PageContainerComponent', () => {
  it('renders wrapper classes and projects child content', async () => {
    await TestBed.configureTestingModule({
      imports: [HostPageContainerComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostPageContainerComponent);
    fixture.detectChanges();

    const wrapper = fixture.nativeElement.querySelector('app-page-container > div') as HTMLDivElement;
    const projected = fixture.nativeElement.querySelector('#projected-content');

    expect(wrapper.className).toContain('max-w-7xl');
    expect(wrapper.className).toContain('mx-auto');
    expect(wrapper.className).toContain('px-4');
    expect(projected?.textContent).toContain('Contenido proyectado');
  });
});


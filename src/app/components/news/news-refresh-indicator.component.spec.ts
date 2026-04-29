import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { NewsRefreshIndicatorComponent } from './news-refresh-indicator.component';

describe('NewsRefreshIndicatorComponent', () => {
  it('renders the refresh status message when stale content is revalidating', async () => {
    await TestBed.configureTestingModule({
      imports: [NewsRefreshIndicatorComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(NewsRefreshIndicatorComponent);
    fixture.componentRef.setInput('scopeLabel', 'Portada');
    fixture.componentRef.setInput('isRefreshing', true);
    fixture.componentRef.setInput('isShowingStaleData', true);
    fixture.componentRef.setInput('lastUpdated', Date.parse('2026-03-04T10:45:00.000Z'));
    fixture.detectChanges();

    const refreshStatus = fixture.nativeElement.querySelector('[data-testid="refresh-status"]');
    expect(refreshStatus).toBeTruthy();
    expect(refreshStatus.textContent as string).toContain('Actualizando en segundo plano');
    expect(refreshStatus.textContent as string).toContain('Mostrando la versión disponible');
    expect(refreshStatus.textContent as string).toContain('Última actualización');
  });

  it('renders a dismissible banner when fresh content has been applied', async () => {
    await TestBed.configureTestingModule({
      imports: [NewsRefreshIndicatorComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(NewsRefreshIndicatorComponent);
    fixture.componentRef.setInput('scopeLabel', 'Economía');
    fixture.componentRef.setInput('hasFreshUpdateAvailable', true);
    fixture.detectChanges();

    let dismissed = false;
    fixture.componentInstance.dismissed.subscribe(() => {
      dismissed = true;
    });

    const banner = fixture.nativeElement.querySelector('[data-testid="fresh-update-banner"]');
    const dismissButton = fixture.nativeElement.querySelector('button[aria-label="Ocultar aviso de actualización"]') as HTMLButtonElement;

    expect(banner).toBeTruthy();
    expect(banner.textContent as string).toContain('Economía actualizada');

    dismissButton.click();
    expect(dismissed).toBe(true);
  });

  it('renders a last-visit banner when unseen headlines exist for the current scope', async () => {
    await TestBed.configureTestingModule({
      imports: [NewsRefreshIndicatorComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(NewsRefreshIndicatorComponent);
    fixture.componentRef.setInput('scopeLabel', 'Portada');
    fixture.componentRef.setInput('hasNewSinceLastVisit', true);
    fixture.componentRef.setInput('newSinceLastVisitCount', 3);
    fixture.detectChanges();

    let dismissed = false;
    fixture.componentInstance.lastVisitDismissed.subscribe(() => {
      dismissed = true;
    });

    const banner = fixture.nativeElement.querySelector('[data-testid="last-visit-banner"]');
    const dismissButton = fixture.nativeElement.querySelector('button[aria-label="Ocultar aviso de novedades"]') as HTMLButtonElement;

    expect(banner).toBeTruthy();
    expect(banner.textContent as string).toContain('Novedades desde tu última visita');
    expect(banner.textContent as string).toContain('3 titulares nuevos');

    dismissButton.click();
    expect(dismissed).toBe(true);
  });

  it('renders nothing when there is no refresh or update state to expose', async () => {
    await TestBed.configureTestingModule({
      imports: [NewsRefreshIndicatorComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(NewsRefreshIndicatorComponent);
    fixture.componentRef.setInput('scopeLabel', 'Portada');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent.trim()).toBe('');
    expect(fixture.nativeElement.querySelector('[data-testid="refresh-status"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-testid="fresh-update-banner"]')).toBeNull();
  });
});

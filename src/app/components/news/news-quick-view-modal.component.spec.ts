import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';

import { NewsQuickViewModalComponent } from './news-quick-view-modal.component';

describe('NewsQuickViewModalComponent', () => {
  it('does not render dialog when article input is null', async () => {
    await TestBed.configureTestingModule({
      imports: [NewsQuickViewModalComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(NewsQuickViewModalComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  });

  it('renders article preview content when article exists', async () => {
    await TestBed.configureTestingModule({
      imports: [NewsQuickViewModalComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(NewsQuickViewModalComponent);
    fixture.componentRef.setInput('article', createNewsItem('news-1'));
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    const text = fixture.nativeElement.textContent as string;

    expect(dialog).toBeTruthy();
    expect(text).toContain('Titulo news-1');
    expect(text).toContain('Abrir noticia completa');
  });

  it('emits close when clicking overlay but not when clicking dialog body', async () => {
    await TestBed.configureTestingModule({
      imports: [NewsQuickViewModalComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(NewsQuickViewModalComponent);
    fixture.componentRef.setInput('article', createNewsItem('news-2'));
    fixture.detectChanges();

    const emitSpy = vi.spyOn(fixture.componentInstance.closed, 'emit');
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
    const overlay = fixture.nativeElement.querySelector('.quick-view-overlay') as HTMLElement;

    dialog.click();
    expect(emitSpy).not.toHaveBeenCalled();

    overlay.click();
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('emits close on Escape key only when article exists', async () => {
    await TestBed.configureTestingModule({
      imports: [NewsQuickViewModalComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(NewsQuickViewModalComponent);
    const emitSpy = vi.spyOn(fixture.componentInstance.closed, 'emit');

    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(emitSpy).not.toHaveBeenCalled();

    fixture.componentRef.setInput('article', createNewsItem('news-3'));
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });
});

function createNewsItem(id: string) {
  return {
    id,
    title: `Titulo ${id}`,
    summary: `Resumen ${id}`,
    imageUrl: 'https://example.com/image.jpg',
    sourceId: 'fuente-uno',
    source: 'Fuente Uno',
    section: 'actualidad',
    publishedAt: '2026-03-04T08:30:00.000Z',
    author: 'Autor',
    url: `https://example.com/${id}`,
  } as const;
}


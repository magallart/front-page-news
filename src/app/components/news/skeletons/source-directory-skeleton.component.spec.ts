import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { SourceDirectorySkeletonComponent } from './source-directory-skeleton.component';

describe('SourceDirectorySkeletonComponent', () => {
  it('renders source-directory rows in 3/2/3 layout', async () => {
    await TestBed.configureTestingModule({
      imports: [SourceDirectorySkeletonComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SourceDirectorySkeletonComponent);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('ul');
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Visita las webs oficiales para conocer todas las noticias');
    expect(rows.length).toBe(3);
    expect(rows[0]?.querySelectorAll('li').length).toBe(3);
    expect(rows[1]?.querySelectorAll('li').length).toBe(2);
    expect(rows[2]?.querySelectorAll('li').length).toBe(3);
  });
});


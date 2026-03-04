import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { SOURCE_DIRECTORY_SKELETON_ROW_LENGTHS, SOURCE_DIRECTORY_TITLE } from '../../../constants/source-directory.constants';

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

    expect(text).toContain(SOURCE_DIRECTORY_TITLE);
    expect(rows.length).toBe(SOURCE_DIRECTORY_SKELETON_ROW_LENGTHS.length);
    expect(rows[0]?.querySelectorAll('li').length).toBe(SOURCE_DIRECTORY_SKELETON_ROW_LENGTHS[0]);
    expect(rows[1]?.querySelectorAll('li').length).toBe(SOURCE_DIRECTORY_SKELETON_ROW_LENGTHS[1]);
    expect(rows[2]?.querySelectorAll('li').length).toBe(SOURCE_DIRECTORY_SKELETON_ROW_LENGTHS[2]);
  });
});

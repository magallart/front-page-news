import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { AppStateService } from './app-state.service';

describe('AppStateService', () => {
  it('starts with default project name and allows updating it', () => {
    TestBed.configureTestingModule({});

    const service = TestBed.inject(AppStateService);
    expect(service.projectName()).toBe('angular-project-base');

    service.setProjectName('front-page-news');
    expect(service.projectName()).toBe('front-page-news');
  });
});


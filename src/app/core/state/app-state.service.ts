import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AppStateService {
  private readonly projectName = signal('angular-project-base');
  readonly title = computed(() => `Hello, ${this.projectName()}`);

  setProjectName(name: string): void {
    this.projectName.set(name);
  }
}

import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AppStateService {
  private readonly projectNameSignal = signal('angular-project-base');
  readonly projectName = this.projectNameSignal.asReadonly();

  setProjectName(name: string): void {
    this.projectNameSignal.set(name);
  }
}

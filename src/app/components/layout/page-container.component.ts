import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-page-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <ng-content />
    </div>
  `,
})
export class PageContainerComponent {}

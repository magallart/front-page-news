import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PageContainerComponent } from './page-container.component';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageContainerComponent],
  template: `
    <footer class="border-t border-border bg-card">
      <app-page-container>
        <div class="flex flex-col gap-1 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Front Page News</p>
          <p>Proyecto personal para aprender Angular, Vercel Functions y RSS.</p>
        </div>
      </app-page-container>
    </footer>
  `,
})
export class AppFooterComponent {}

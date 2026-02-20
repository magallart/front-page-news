import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SkeletonBlockComponent } from './skeleton-block.component';

@Component({
  selector: 'app-source-directory-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonBlockComponent],
  template: `
    <section>
      <p class="font-editorial-title mb-4 text-center text-2xl leading-[1.25] text-foreground">
        Visita las webs oficiales para conocer todas las noticias
      </p>
      <div class="mx-auto mb-4 w-[70%] border-b-2 border-primary/60"></div>

      <div class="space-y-4 pt-2">
        <ul class="flex justify-center gap-10">
          @for (item of topRow; track item) {
            <li class="relative flex justify-center">
              <app-skeleton-block widthClass="w-12" heightClass="h-12" radiusClass="rounded-sm" />
            </li>
          }
        </ul>

        <ul class="flex justify-center gap-10">
          @for (item of middleRow; track item) {
            <li class="relative flex justify-center">
              <app-skeleton-block widthClass="w-12" heightClass="h-12" radiusClass="rounded-sm" />
            </li>
          }
        </ul>

        <ul class="flex justify-center gap-10">
          @for (item of bottomRow; track item) {
            <li class="relative flex justify-center">
              <app-skeleton-block widthClass="w-12" heightClass="h-12" radiusClass="rounded-sm" />
            </li>
          }
        </ul>
      </div>
    </section>
  `,
})
export class SourceDirectorySkeletonComponent {
  protected readonly topRow = [1, 2, 3] as const;
  protected readonly middleRow = [1, 2] as const;
  protected readonly bottomRow = [1, 2, 3] as const;
}

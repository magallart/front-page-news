import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SOURCE_DIRECTORY_SKELETON_ROW_LENGTHS, SOURCE_DIRECTORY_TITLE } from '../../../constants/source-directory.constants';

import { SkeletonBlockComponent } from './skeleton-block.component';

@Component({
  selector: 'app-source-directory-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonBlockComponent],
  template: `
    <section>
      <p class="font-editorial-title mb-4 text-center text-2xl leading-[1.25] text-foreground">
        {{ title }}
      </p>
      <div class="mx-auto mb-4 w-[70%] border-b-2 border-primary/60"></div>

      <div class="space-y-4 pt-2">
        @for (row of rows; track $index) {
          <ul class="flex justify-center gap-10">
            @for (item of row; track item) {
              <li class="relative flex justify-center">
                <app-skeleton-block widthClass="w-12" heightClass="h-12" radiusClass="rounded-sm" />
              </li>
            }
          </ul>
        }
      </div>
    </section>
  `,
})
export class SourceDirectorySkeletonComponent {
  protected readonly title = SOURCE_DIRECTORY_TITLE;
  protected readonly rows = SOURCE_DIRECTORY_SKELETON_ROW_LENGTHS.map((length) =>
    Array.from({ length }, (_, index) => index),
  );
}

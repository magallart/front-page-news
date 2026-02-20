import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  template: `
    <div class="fp-skeleton-block" [ngClass]="classes()"></div>
  `,
  styles: `
    .fp-skeleton-block {
      position: relative;
      overflow: hidden;
      background: hsl(var(--muted-foreground) / 0.28);
    }

    .fp-skeleton-block::after {
      content: '';
      position: absolute;
      inset: 0;
      transform: translateX(-100%);
      background: linear-gradient(90deg, transparent 0%, hsl(var(--background) / 0.32) 50%, transparent 100%);
      animation: fpSkeletonShimmer 1.3s ease-in-out infinite;
    }

    @keyframes fpSkeletonShimmer {
      100% {
        transform: translateX(100%);
      }
    }
  `,
})
export class SkeletonBlockComponent {
  readonly widthClass = input('w-full');
  readonly heightClass = input('h-4');
  readonly radiusClass = input('rounded-sm');
  readonly extraClass = input('');

  protected readonly classes = computed(() => [this.widthClass(), this.heightClass(), this.radiusClass(), this.extraClass()]);
}

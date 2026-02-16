import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-icon-exclamation-circle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M12 9v4" />
      <path d="M12 16v.01" />
      <path d="M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0 -18" />
    </svg>
  `,
})
export class IconExclamationCircleComponent {}

import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-icon-search',
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
      <path d="M4 11a7 7 0 1 1 14 0a7 7 0 0 1 -14 0" />
      <path d="M20 20l-3 -3" />
    </svg>
  `,
})
export class IconSearchComponent {}


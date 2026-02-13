import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-icon-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M4 4h16v2.172a2 2 0 0 1 -.586 1.414l-5.414 5.414v6l-4 -2v-4l-5.414 -5.414a2 2 0 0 1 -.586 -1.414v-2.172z" />
    </svg>
  `,
})
export class IconFilterComponent {}

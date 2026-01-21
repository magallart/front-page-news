import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-repo-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      class="inline-flex items-center justify-center gap-2 rounded-full border border-slate-600 bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-transparent hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      [href]="href()"
      target="_blank"
      rel="noopener"
    >
      <svg
        class="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M9 19c-4.3 1.4-4.3-2.5-6-3" />
        <path
          d="M15 22v-3.1a2.6 2.6 0 0 0-.7-1.8c2.3-.3 4.7-1.1 4.7-5A3.9 3.9 0 0 0 18 9.6a3.6 3.6 0 0 0-.1-2.4s-.8-.2-2.9 1.1a10.3 10.3 0 0 0-5 0C7.9 7 7.1 7.2 7.1 7.2a3.6 3.6 0 0 0-.1 2.4A3.9 3.9 0 0 0 6 12.1c0 3.9 2.4 4.7 4.7 5a2.6 2.6 0 0 0-.7 1.8V22"
        />
      </svg>
      {{ label() }}
    </a>
  `,
})
export class RepoButtonComponent {
  readonly href = input('https://github.com/magallart/angular-project-base');
  readonly label = input('View repository');
}

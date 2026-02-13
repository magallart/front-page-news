import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-error-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      .error-image {
        animation: errorImageFadeIn 350ms ease-out both;
      }

      .error-copy {
        opacity: 0;
        transform: translateY(6px);
        animation: errorCopyRiseIn 320ms ease-out both;
      }

      .error-headline {
        font-family: var(--font-brand), serif;
        font-weight: 700;
        letter-spacing: 0.04em;
        animation-delay: 120ms;
      }

      .error-message {
        animation-delay: 220ms;
      }

      @keyframes errorImageFadeIn {
        from {
          opacity: 0;
          transform: translateY(4px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes errorCopyRiseIn {
        from {
          opacity: 0;
          transform: translateY(6px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .error-image {
          animation: none;
        }

        .error-copy {
          animation: none;
          opacity: 1;
          transform: none;
        }
      }
    `,
  ],
  template: `
    <section class="px-5 py-8 text-center">
      <img
        src="/images/error.png"
        alt="Error visual"
        class="error-image mx-auto w-full max-w-96 object-contain"
        loading="lazy"
      />
      <p class="error-copy error-headline mt-4 text-2xl text-foreground sm:text-3xl">
        {{ headline() }}
      </p>
      <p class="error-copy error-message mx-auto mt-2 max-w-[38ch] font-editorial-body text-base text-muted-foreground">
        {{ message() }}
      </p>
    </section>
  `,
})
export class ErrorStateComponent {
  readonly headline = input.required<string>();
  readonly message = input.required<string>();
}

import type { AppHttpErrorKind } from './app-http-error-kind.interface';

export interface AppHttpError extends Error {
  readonly name: 'AppHttpError';
  readonly kind: AppHttpErrorKind;
  readonly status: number | null;
  readonly method: string;
  readonly url: string;
  readonly traceId: string | null;
  readonly timestamp: string;
  readonly userMessage: string;
}

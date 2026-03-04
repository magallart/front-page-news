import type { WarningCode } from './warning-code.interface';
export type { WarningCode };

export interface Warning {
  readonly code: WarningCode;
  readonly message: string;
  readonly sourceId: string | null;
  readonly feedUrl: string | null;
}

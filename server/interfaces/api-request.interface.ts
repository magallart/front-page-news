import type { IncomingMessage } from 'node:http';

export interface ApiRequest extends IncomingMessage {
  readonly method?: string;
  readonly url?: string;
}

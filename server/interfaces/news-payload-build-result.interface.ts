import type { NewsResponse } from '../../shared/interfaces/news-response.interface';
import type { NewsPayloadTimings } from './news-payload-timings.interface';

export interface NewsPayloadBuildResult {
  readonly payload: NewsResponse;
  readonly timings: NewsPayloadTimings;
}


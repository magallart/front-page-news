import type { IncomingMessage, ServerResponse } from 'node:http';

import { applyNewsFilters, parseNewsQuery } from '../src/lib/news-query';

import type { Article } from '../src/interfaces/article.interface';
import type { NewsResponse } from '../src/interfaces/news-response.interface';

interface ApiErrorResponse {
  readonly error: string;
}

type NewsApiResponse = NewsResponse | ApiErrorResponse;

interface ApiRequest extends IncomingMessage {
  readonly method?: string;
  readonly url?: string;
}

export default async function handler(request: ApiRequest, response: ServerResponse): Promise<void> {
  if (request.method !== 'GET') {
    sendJson(response, 405, { error: 'Method Not Allowed' });
    return;
  }

  // Next ticket tasks will replace this placeholder with real aggregated RSS/Atom items.
  const aggregatedArticles: readonly Article[] = [];
  const query = parseNewsQuery(request.url);
  const filtered = applyNewsFilters(aggregatedArticles, query);

  const payload: NewsResponse = {
    articles: filtered.articles,
    total: filtered.total,
    page: filtered.page,
    limit: filtered.limit,
    warnings: [],
  };

  sendJson(response, 200, payload);
}

function sendJson(response: ServerResponse, statusCode: number, body: NewsApiResponse): void {
  response.statusCode = statusCode;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
}

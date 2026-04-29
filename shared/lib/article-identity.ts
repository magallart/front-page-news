import type { Article } from '../interfaces/article.interface';
import type { NewsResponse } from '../interfaces/news-response.interface';
import type { Warning } from '../interfaces/warning.interface';

export function toArticleDeduplicationKey(article: Pick<Article, 'canonicalUrl' | 'title' | 'publishedAt'>): string {
  return article.canonicalUrl ?? `${article.title.trim().toLowerCase()}|${article.publishedAt ?? 'no-date'}`;
}

export function toArticleFingerprint(article: Article): string {
  return serializeFingerprint([
    article.id,
    article.externalId ?? '-',
    article.title,
    article.summary,
    article.url,
    article.canonicalUrl ?? '-',
    article.imageUrl ?? '-',
    article.thumbnailUrl ?? '-',
    article.sourceId,
    article.sourceName,
    article.sectionSlug,
    article.author ?? '-',
    article.publishedAt ?? '-',
  ]);
}

export function toWarningFingerprint(warning: Warning): string {
  return serializeFingerprint([
    warning.code,
    warning.message,
    warning.sourceId ?? '-',
    warning.feedUrl ?? '-',
  ]);
}

export function toNewsResponseFingerprint(response: NewsResponse): string {
  return serializeFingerprint([
    response.total,
    response.page,
    response.limit,
    response.articles.map((article) => toArticleFingerprint(article)),
    response.warnings.map((warning) => toWarningFingerprint(warning)),
  ]);
}

function serializeFingerprint(value: readonly unknown[]): string {
  return JSON.stringify(value);
}

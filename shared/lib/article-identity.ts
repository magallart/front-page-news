import type { Article } from '../interfaces/article.interface';
import type { NewsResponse } from '../interfaces/news-response.interface';
import type { Warning } from '../interfaces/warning.interface';

export function toArticleDeduplicationKey(article: Pick<Article, 'canonicalUrl' | 'title' | 'publishedAt'>): string {
  return article.canonicalUrl ?? `${article.title.trim().toLowerCase()}|${article.publishedAt ?? 'no-date'}`;
}

export function toArticleFingerprint(article: Article): string {
  return [
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
  ].join('|');
}

export function toWarningFingerprint(warning: Warning): string {
  return [
    warning.code,
    warning.message,
    warning.sourceId ?? '-',
    warning.feedUrl ?? '-',
  ].join('|');
}

export function toNewsResponseFingerprint(response: NewsResponse): string {
  return [
    response.total,
    response.page,
    response.limit,
    response.articles.map((article) => toArticleFingerprint(article)).join('||'),
    response.warnings.map((warning) => toWarningFingerprint(warning)).join('||'),
  ].join(':::');
}

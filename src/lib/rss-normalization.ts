import type { Article } from '../interfaces/article.interface';

export interface RawFeedItem {
  readonly title: string | null;
  readonly summary: string | null;
  readonly url: string | null;
  readonly sourceId: string;
  readonly sourceName: string;
  readonly sectionSlug: string;
  readonly author: string | null;
  readonly publishedAt: string | null;
  readonly imageUrl: string | null;
}

const HTML_ENTITY_MAP: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&nbsp;': ' ',
};

const URL_PROTOCOL = {
  HTTP: 'http:',
  HTTPS: 'https:',
} as const;

export function normalizeDateToIso(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toISOString();
}

export function extractSafeSummary(value: string | null): string {
  if (!value) {
    return '';
  }

  const withoutScripts = value.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ');
  const withoutStyles = withoutScripts.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ');
  const withoutTags = withoutStyles.replace(/<[^>]*>/g, ' ');
  const decodedEntities = decodeHtmlEntities(withoutTags);

  return decodedEntities.replace(/\s+/g, ' ').trim();
}

export function canonicalizeUrl(value: string | null): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== URL_PROTOCOL.HTTP && url.protocol !== URL_PROTOCOL.HTTPS) {
      return null;
    }

    const cleanedPath = url.pathname.replace(/\/+$/g, '') || '/';
    return `${url.protocol}//${url.hostname.toLowerCase()}${cleanedPath}`;
  } catch {
    return null;
  }
}

export function buildStableArticleId(
  url: string | null,
  title: string,
  publishedAt: string | null
): string {
  const canonicalUrl = canonicalizeUrl(url);
  if (canonicalUrl) {
    return `url-${hashFNV1a(canonicalUrl)}`;
  }

  const fallbackKey = `${title.trim().toLowerCase()}|${publishedAt ?? 'no-date'}`;
  return `fallback-${hashFNV1a(fallbackKey)}`;
}

export function normalizeFeedItem(item: RawFeedItem): Article | null {
  const title = item.title?.trim() ?? '';
  if (!title) {
    return null;
  }

  const normalizedDate = normalizeDateToIso(item.publishedAt);
  const canonicalUrl = canonicalizeUrl(item.url);
  const stableId = buildStableArticleId(item.url, title, normalizedDate);

  return {
    id: stableId,
    title,
    summary: extractSafeSummary(item.summary),
    url: item.url?.trim() ?? '',
    canonicalUrl,
    imageUrl: item.imageUrl?.trim() || null,
    sourceId: item.sourceId,
    sourceName: item.sourceName,
    sectionSlug: item.sectionSlug,
    author: item.author?.trim() || null,
    publishedAt: normalizedDate,
  };
}

export function dedupeAndSortArticles(items: readonly Article[]): readonly Article[] {
  const uniqueByKey = new Map<string, Article>();

  for (const item of items) {
    const dedupeKey = item.canonicalUrl ?? buildTitleDateKey(item.title, item.publishedAt);
    const current = uniqueByKey.get(dedupeKey);

    if (!current) {
      uniqueByKey.set(dedupeKey, item);
      continue;
    }

    if (isMoreRecent(item.publishedAt, current.publishedAt)) {
      uniqueByKey.set(dedupeKey, item);
    }
  }

  return Array.from(uniqueByKey.values()).sort((first, second) => {
    const firstTimestamp = first.publishedAt ? Date.parse(first.publishedAt) : Number.NEGATIVE_INFINITY;
    const secondTimestamp = second.publishedAt ? Date.parse(second.publishedAt) : Number.NEGATIVE_INFINITY;
    return secondTimestamp - firstTimestamp;
  });
}

function decodeHtmlEntities(value: string): string {
  return value.replace(/&[a-zA-Z0-9#]+;/g, (entity) => {
    if (entity in HTML_ENTITY_MAP) {
      return HTML_ENTITY_MAP[entity];
    }

    if (/^&#\d+;$/.test(entity)) {
      const numericValue = Number.parseInt(entity.slice(2, -1), 10);
      if (Number.isFinite(numericValue)) {
        return String.fromCodePoint(numericValue);
      }
    }

    if (/^&#x[0-9a-fA-F]+;$/.test(entity)) {
      const hexValue = Number.parseInt(entity.slice(3, -1), 16);
      if (Number.isFinite(hexValue)) {
        return String.fromCodePoint(hexValue);
      }
    }

    return entity;
  });
}

function hashFNV1a(value: string): string {
  let hash = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
}

function buildTitleDateKey(title: string, publishedAt: string | null): string {
  return `${title.trim().toLowerCase()}|${publishedAt ?? 'no-date'}`;
}

function isMoreRecent(candidate: string | null, current: string | null): boolean {
  const candidateTime = candidate ? Date.parse(candidate) : Number.NEGATIVE_INFINITY;
  const currentTime = current ? Date.parse(current) : Number.NEGATIVE_INFINITY;
  return candidateTime > currentTime;
}

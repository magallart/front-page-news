import type { Article } from '../interfaces/article.interface';

export interface RawFeedItem {
  readonly externalId: string | null;
  readonly title: string | null;
  readonly summary: string | null;
  readonly url: string | null;
  readonly sourceId: string;
  readonly sourceName: string;
  readonly sectionSlug: string;
  readonly author: string | null;
  readonly publishedAt: string | null;
  readonly imageUrl: string | null;
  readonly thumbnailUrl: string | null;
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
const UNICODE_MAX_CODE_POINT = 0x10ffff;
const SURROGATE_MIN = 0xd800;
const SURROGATE_MAX = 0xdfff;

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
  return normalizeFeedText(withoutTags.replace(/\s+/g, ' ').trim());
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
  const title = normalizeFeedText(item.title?.trim() ?? '');
  if (!title) {
    return null;
  }

  const normalizedDate = normalizeDateToIso(item.publishedAt);
  const canonicalUrl = canonicalizeUrl(item.url);
  const stableId = buildStableArticleId(item.url, title, normalizedDate);

  return {
    id: stableId,
    externalId: item.externalId?.trim() || null,
    title,
    summary: extractSafeSummary(item.summary),
    url: item.url?.trim() ?? '',
    canonicalUrl,
    imageUrl: item.imageUrl?.trim() || null,
    thumbnailUrl: item.thumbnailUrl?.trim() || null,
    sourceId: item.sourceId,
    sourceName: normalizeFeedText(item.sourceName),
    sectionSlug: item.sectionSlug,
    author: normalizeNullableFeedText(item.author),
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

    uniqueByKey.set(dedupeKey, mergeDedupedArticles(current, item));
  }

  return Array.from(uniqueByKey.values()).sort((first, second) => {
    const firstTimestamp = first.publishedAt ? Date.parse(first.publishedAt) : Number.NEGATIVE_INFINITY;
    const secondTimestamp = second.publishedAt ? Date.parse(second.publishedAt) : Number.NEGATIVE_INFINITY;
    return secondTimestamp - firstTimestamp;
  });
}

function mergeDedupedArticles(current: Article, candidate: Article): Article {
  const candidateIsPreferred = isCandidatePreferred(candidate, current);
  const preferred = candidateIsPreferred ? candidate : current;
  const fallback = candidateIsPreferred ? current : candidate;

  return {
    ...preferred,
    sectionSlug: pickBestSectionSlug(preferred.sectionSlug, fallback.sectionSlug),
    imageUrl: preferred.imageUrl ?? fallback.imageUrl,
    thumbnailUrl: preferred.thumbnailUrl ?? fallback.thumbnailUrl ?? preferred.imageUrl ?? fallback.imageUrl,
    author: preferred.author ?? fallback.author,
    summary: preferred.summary || fallback.summary,
  };
}

function isCandidatePreferred(candidate: Article, current: Article): boolean {
  const candidateTime = toTimestamp(candidate.publishedAt);
  const currentTime = toTimestamp(current.publishedAt);

  if (candidateTime !== currentTime) {
    return candidateTime > currentTime;
  }

  return hasHigherSectionPriority(candidate.sectionSlug, current.sectionSlug);
}

function decodeHtmlEntities(value: string): string {
  return value.replace(/&[a-zA-Z0-9#]+;/g, (entity) => {
    if (entity in HTML_ENTITY_MAP) {
      return HTML_ENTITY_MAP[entity];
    }

    if (/^&#\d+;$/.test(entity)) {
      const numericValue = Number.parseInt(entity.slice(2, -1), 10);
      if (isValidCodePoint(numericValue)) {
        return safeFromCodePoint(numericValue) ?? entity;
      }
    }

    if (/^&#x[0-9a-fA-F]+;$/.test(entity)) {
      const hexValue = Number.parseInt(entity.slice(3, -1), 16);
      if (isValidCodePoint(hexValue)) {
        return safeFromCodePoint(hexValue) ?? entity;
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

function hasHigherSectionPriority(candidateSection: string, currentSection: string): boolean {
  return getSectionPriority(candidateSection) > getSectionPriority(currentSection);
}

function pickBestSectionSlug(primarySection: string, secondarySection: string): string {
  if (hasHigherSectionPriority(secondarySection, primarySection)) {
    return secondarySection;
  }

  return primarySection;
}

function getSectionPriority(sectionSlug: string): number {
  return sectionSlug === 'ultima-hora' ? 0 : 1;
}

function toTimestamp(value: string | null): number {
  return value ? Date.parse(value) : Number.NEGATIVE_INFINITY;
}

function isValidCodePoint(value: number): boolean {
  return (
    Number.isInteger(value) &&
    value >= 0 &&
    value <= UNICODE_MAX_CODE_POINT &&
    (value < SURROGATE_MIN || value > SURROGATE_MAX)
  );
}

function safeFromCodePoint(value: number): string | null {
  try {
    return String.fromCodePoint(value);
  } catch {
    return null;
  }
}

function normalizeNullableFeedText(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = normalizeFeedText(value);
  return normalized.length > 0 ? normalized : null;
}

function normalizeFeedText(value: string): string {
  const decodedEntities = decodeHtmlEntities(value);
  const trimmed = decodedEntities.trim();
  if (!trimmed) {
    return '';
  }

  const score = mojibakeScore(trimmed);
  if (score === 0) {
    return trimmed;
  }

  const repaired = decodeUtf8FromSingleByteText(trimmed);
  return mojibakeScore(repaired) < score ? repaired : trimmed;
}

function mojibakeScore(value: string): number {
  let score = 0;
  score += (value.match(/Ã|Â|â/g) ?? []).length * 2;
  score += (value.match(/�/g) ?? []).length * 3;
  return score;
}

function decodeUtf8FromSingleByteText(value: string): string {
  const bytes = Uint8Array.from(value, (character) => character.charCodeAt(0) & 0xff);
  return new TextDecoder('utf-8').decode(bytes);
}

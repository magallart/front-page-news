import type { RssSourceRecord } from '../../shared/interfaces/rss-source-record.interface';
import type { SourceFeedTarget } from '../../shared/interfaces/source-feed-target.interface';

export const SECTION_PRIORITY_ORDER = [
  'actualidad',
  'economia',
  'espana',
  'internacional',
  'cultura',
  'deportes',
  'ciencia',
  'tecnologia',
  'sociedad',
  'opinion',
  'ultima-hora',
] as const;

const SECTION_PRIORITY_INDEX = new Map<string, number>(
  SECTION_PRIORITY_ORDER.map((sectionSlug, index) => [sectionSlug, index]),
);

export interface NormalizedCatalogRecord {
  readonly sourceName: string;
  readonly sourceSlug: string;
  readonly feedUrl: string;
  readonly sourceBaseUrl: string;
  readonly sectionName: string;
  readonly sectionSlug: string;
}

export function normalizeCatalogRecords(records: readonly RssSourceRecord[]): readonly NormalizedCatalogRecord[] {
  return records
    .map((record) => normalizeCatalogRecord(record))
    .filter((record): record is NormalizedCatalogRecord => record !== null);
}

export function normalizeCatalogRecord(record: RssSourceRecord): NormalizedCatalogRecord | null {
  const sourceName = sanitizeCatalogText(record.sourceName);
  const feedUrl = record.feedUrl.trim();
  const sectionName = sanitizeCatalogText(record.sectionName);
  const sourceSlug = toCatalogSlug(sourceName);
  const sectionSlug = toCatalogSlug(sectionName);

  if (!sourceName || !feedUrl || !sectionName || !sourceSlug || !sectionSlug) {
    return null;
  }

  return {
    sourceName,
    sourceSlug,
    feedUrl,
    sourceBaseUrl: toFeedBaseUrl(feedUrl),
    sectionName,
    sectionSlug,
  };
}

export function compareSectionSlugs(left: string, right: string): number {
  const leftPriority = getSectionPriority(left);
  const rightPriority = getSectionPriority(right);

  if (leftPriority !== rightPriority) {
    return leftPriority - rightPriority;
  }

  return left.localeCompare(right, 'es');
}

export function compareFeedTargets(left: SourceFeedTarget, right: SourceFeedTarget): number {
  const sourceOrder = left.sourceName.localeCompare(right.sourceName, 'es');
  if (sourceOrder !== 0) {
    return sourceOrder;
  }

  const sectionOrder = compareSectionSlugs(left.sectionSlug, right.sectionSlug);
  if (sectionOrder !== 0) {
    return sectionOrder;
  }

  return left.feedUrl.localeCompare(right.feedUrl, 'es');
}

export function selectPreferredCatalogRecord(
  current: NormalizedCatalogRecord,
  candidate: NormalizedCatalogRecord,
): NormalizedCatalogRecord {
  if (compareSectionSlugs(candidate.sectionSlug, current.sectionSlug) < 0) {
    return candidate;
  }

  return current;
}

export function buildOrderedSectionSlugs(sectionSlugs: readonly string[]): readonly string[] {
  return [...sectionSlugs].sort(compareSectionSlugs);
}

function getSectionPriority(sectionSlug: string): number {
  return SECTION_PRIORITY_INDEX.get(sectionSlug) ?? SECTION_PRIORITY_ORDER.length;
}

function sanitizeCatalogText(value: string): string {
  return value.trim();
}

function toCatalogSlug(value: string): string {
  return sanitizeCatalogText(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toFeedBaseUrl(feedUrl: string): string {
  try {
    const url = new URL(feedUrl);
    return `${url.protocol}//${url.hostname}`;
  } catch {
    return '';
  }
}

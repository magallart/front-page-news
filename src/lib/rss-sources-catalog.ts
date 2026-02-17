import type { RssSourceRecord } from '../interfaces/rss-source-record.interface';
import type { Section } from '../interfaces/section.interface';
import type { SourceFeedTarget } from '../interfaces/source-feed-target.interface';
import type { Source } from '../interfaces/source.interface';
import type { SourcesResponse } from '../interfaces/sources-response.interface';

export function buildSourcesResponse(markdown: string): SourcesResponse {
  const records = parseCatalogRecords(markdown);
  return buildSourcesResponseFromRecords(records);
}

export function buildSourcesResponseFromRecords(records: readonly RssSourceRecord[]): SourcesResponse {
  const normalizedRecords = normalizeCatalogRecords(records);
  const sections = buildSections(normalizedRecords);
  const sources = buildSources(normalizedRecords);

  return {
    sources,
    sections,
  };
}

export function buildSourceFeedTargets(markdown: string): readonly SourceFeedTarget[] {
  const records = parseCatalogRecords(markdown);
  return buildSourceFeedTargetsFromRecords(records);
}

export function buildSourceFeedTargetsFromRecords(records: readonly RssSourceRecord[]): readonly SourceFeedTarget[] {
  const normalizedRecords = normalizeCatalogRecords(records);
  const uniqueTargets = new Map<string, SourceFeedTarget>();

  for (const record of normalizedRecords) {
    const sourceSlug = toSlug(record.sourceName);
    const sectionSlug = toSlug(record.sectionName);
    if (!sourceSlug || !sectionSlug) {
      continue;
    }

    const sourceId = `source-${sourceSlug}`;
    const key = `${sourceId}|${sectionSlug}|${record.feedUrl}`;
    if (uniqueTargets.has(key)) {
      continue;
    }

    uniqueTargets.set(key, {
      sourceId,
      sourceName: record.sourceName,
      sourceBaseUrl: toBaseUrl(record.feedUrl),
      feedUrl: record.feedUrl,
      sectionSlug,
    });
  }

  return Array.from(uniqueTargets.values()).sort((first, second) => {
    const sourceOrder = first.sourceName.localeCompare(second.sourceName, 'es');
    if (sourceOrder !== 0) {
      return sourceOrder;
    }

    return first.sectionSlug.localeCompare(second.sectionSlug, 'es');
  });
}

function parseCatalogRecords(markdown: string): readonly RssSourceRecord[] {
  const lines = markdown.split(/\r?\n/);
  const records: RssSourceRecord[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = (lines[index] ?? '').trim();
    if (!line.startsWith('- Nombre')) {
      continue;
    }

    const sourceName = sanitizeCatalogText(valueAfterColon(line));
    let feedUrl = '';
    let sectionName = '';

    for (let lookAhead = index + 1; lookAhead < Math.min(index + 10, lines.length); lookAhead += 1) {
      const candidate = (lines[lookAhead] ?? '').trim();
      if (!feedUrl && candidate.startsWith('- URL:')) {
        feedUrl = valueAfterColon(candidate).trim();
      }
      if (!sectionName && candidate.startsWith('- Secci')) {
        sectionName = sanitizeCatalogText(valueAfterColon(candidate));
      }
    }

    if (!sourceName || !feedUrl || !sectionName) {
      continue;
    }

    records.push({
      sourceName,
      feedUrl,
      sectionName,
    });
  }

  return records;
}

function buildSections(records: readonly RssSourceRecord[]): readonly Section[] {
  const sectionBySlug = new Map<string, Section>();

  for (const record of records) {
    const slug = toSlug(record.sectionName);
    if (!slug || sectionBySlug.has(slug)) {
      continue;
    }

    sectionBySlug.set(slug, {
      id: `section-${slug}`,
      slug,
      name: record.sectionName,
    });
  }

  return Array.from(sectionBySlug.values()).sort((first, second) => first.name.localeCompare(second.name, 'es'));
}

function buildSources(records: readonly RssSourceRecord[]): readonly Source[] {
  const sourceMap = new Map<string, { source: Source; sectionSlugs: Set<string> }>();

  for (const record of records) {
    const sourceSlug = toSlug(record.sourceName);
    if (!sourceSlug) {
      continue;
    }

    const sourceId = `source-${sourceSlug}`;
    const sectionSlug = toSlug(record.sectionName);
    const baseUrl = toBaseUrl(record.feedUrl);

    const current = sourceMap.get(sourceId);
    if (!current) {
      sourceMap.set(sourceId, {
        source: {
          id: sourceId,
          name: record.sourceName,
          baseUrl,
          feedUrl: record.feedUrl,
          sectionSlugs: sectionSlug ? [sectionSlug] : [],
        },
        sectionSlugs: sectionSlug ? new Set([sectionSlug]) : new Set<string>(),
      });
      continue;
    }

    if (sectionSlug) {
      current.sectionSlugs.add(sectionSlug);
    }
  }

  return Array.from(sourceMap.values())
    .map((entry) => ({
      ...entry.source,
      sectionSlugs: Array.from(entry.sectionSlugs).sort(),
    }))
    .sort((first, second) => first.name.localeCompare(second.name, 'es'));
}

function normalizeCatalogRecords(records: readonly RssSourceRecord[]): readonly RssSourceRecord[] {
  return records
    .map((record) => ({
      sourceName: sanitizeCatalogText(record.sourceName),
      feedUrl: record.feedUrl.trim(),
      sectionName: sanitizeCatalogText(record.sectionName),
    }))
    .filter((record) => Boolean(record.sourceName) && Boolean(record.feedUrl) && Boolean(record.sectionName));
}

function valueAfterColon(line: string): string {
  const separatorIndex = line.indexOf(':');
  return separatorIndex >= 0 ? line.slice(separatorIndex + 1).trim() : '';
}

function sanitizeCatalogText(value: string): string {
  return value.trim();
}

function toSlug(value: string): string {
  return sanitizeCatalogText(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toBaseUrl(feedUrl: string): string {
  try {
    const url = new URL(feedUrl);
    return `${url.protocol}//${url.hostname}`;
  } catch {
    return '';
  }
}

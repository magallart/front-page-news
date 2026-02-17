import type { Section } from '../interfaces/section.interface';
import type { Source } from '../interfaces/source.interface';
import type { SourcesResponse } from '../interfaces/sources-response.interface';

interface CatalogRecord {
  readonly sourceName: string;
  readonly feedUrl: string;
  readonly sectionName: string;
}

export function buildSourcesResponse(markdown: string): SourcesResponse {
  const records = parseCatalogRecords(markdown);
  const sections = buildSections(records);
  const sources = buildSources(records);

  return {
    sources,
    sections,
  };
}

function parseCatalogRecords(markdown: string): readonly CatalogRecord[] {
  const lines = markdown.split(/\r?\n/);
  const records: CatalogRecord[] = [];

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

function buildSections(records: readonly CatalogRecord[]): readonly Section[] {
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

function buildSources(records: readonly CatalogRecord[]): readonly Source[] {
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

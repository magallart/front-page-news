import {
  buildOrderedSectionSlugs,
  compareFeedTargets,
  compareSectionSlugs,
  type NormalizedCatalogRecord,
  normalizeCatalogRecords,
  selectPreferredCatalogRecord,
} from './source-targets';

import type { RssSourceRecord } from '../../shared/interfaces/rss-source-record.interface';
import type { Section } from '../../shared/interfaces/section.interface';
import type { SourceFeedTarget } from '../../shared/interfaces/source-feed-target.interface';
import type { Source } from '../../shared/interfaces/source.interface';
import type { SourcesResponse } from '../../shared/interfaces/sources-response.interface';

export function buildSourcesResponseFromRecords(records: readonly RssSourceRecord[]): SourcesResponse {
  const normalizedRecords = normalizeCatalogRecords(records);
  const sections = buildSections(normalizedRecords);
  const sources = buildSources(normalizedRecords);

  return {
    sources,
    sections,
  };
}

export function buildSourceFeedTargetsFromRecords(records: readonly RssSourceRecord[]): readonly SourceFeedTarget[] {
  const normalizedRecords = normalizeCatalogRecords(records);
  const uniqueTargets = new Map<string, SourceFeedTarget>();

  for (const record of normalizedRecords) {
    const sourceId = `source-${record.sourceSlug}`;
    const key = `${sourceId}|${record.sectionSlug}|${record.feedUrl}`;
    if (uniqueTargets.has(key)) {
      continue;
    }

    uniqueTargets.set(key, {
      sourceId,
      sourceName: record.sourceName,
      sourceBaseUrl: record.sourceBaseUrl,
      feedUrl: record.feedUrl,
      sectionSlug: record.sectionSlug,
    });
  }

  return Array.from(uniqueTargets.values()).sort(compareFeedTargets);
}

function buildSections(records: readonly NormalizedCatalogRecord[]): readonly Section[] {
  const sectionBySlug = new Map<string, Section>();

  for (const record of records) {
    if (sectionBySlug.has(record.sectionSlug)) {
      continue;
    }

    sectionBySlug.set(record.sectionSlug, {
      id: `section-${record.sectionSlug}`,
      slug: record.sectionSlug,
      name: record.sectionName,
    });
  }

  return Array.from(sectionBySlug.values()).sort((first, second) => {
    const priorityOrder = compareSectionSlugs(first.slug, second.slug);
    if (priorityOrder !== 0) {
      return priorityOrder;
    }

    return first.name.localeCompare(second.name, 'es');
  });
}

function buildSources(records: readonly NormalizedCatalogRecord[]): readonly Source[] {
  const sourceMap = new Map<
    string,
    {
      preferredRecord: NormalizedCatalogRecord;
      sourceName: string;
      sectionSlugs: Set<string>;
    }
  >();

  for (const record of records) {
    const sourceId = `source-${record.sourceSlug}`;

    const current = sourceMap.get(sourceId);
    if (!current) {
      sourceMap.set(sourceId, {
        preferredRecord: record,
        sourceName: record.sourceName,
        sectionSlugs: new Set([record.sectionSlug]),
      });
      continue;
    }

    current.preferredRecord = selectPreferredCatalogRecord(current.preferredRecord, record);
    current.sectionSlugs.add(record.sectionSlug);
  }

  return Array.from(sourceMap.values())
    .map((entry) => ({
      id: `source-${entry.preferredRecord.sourceSlug}`,
      name: entry.sourceName,
      baseUrl: entry.preferredRecord.sourceBaseUrl,
      feedUrl: entry.preferredRecord.feedUrl,
      sectionSlugs: buildOrderedSectionSlugs(Array.from(entry.sectionSlugs)),
    }))
    .sort((first, second) => first.name.localeCompare(second.name, 'es'));
}


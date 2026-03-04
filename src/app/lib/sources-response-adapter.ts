import { asRecord, asString, asStringArray, toSourcesResponseError } from './sources-response-guards';

import type { Section } from '../../interfaces/section.interface';
import type { Source } from '../../interfaces/source.interface';
import type { SourcesResponse } from '../../interfaces/sources-response.interface';

export function adaptSourcesResponse(payload: Record<string, unknown>): SourcesResponse {
  return {
    sources: asSourceArray(payload['sources']),
    sections: asSectionArray(payload['sections']),
  };
}

function asSourceArray(value: unknown): readonly Source[] {
  if (!Array.isArray(value)) {
    throw toSourcesResponseError('sources', 'an array');
  }

  return value.map((source, index) => toSource(source, index));
}

function asSectionArray(value: unknown): readonly Section[] {
  if (!Array.isArray(value)) {
    throw toSourcesResponseError('sections', 'an array');
  }

  return value.map((section, index) => toSection(section, index));
}

function toSource(value: unknown, index: number): Source {
  const record = asRecord(value, `sources[${index}]`);

  return {
    id: asString(record['id'], `sources[${index}].id`),
    name: asString(record['name'], `sources[${index}].name`),
    baseUrl: asString(record['baseUrl'], `sources[${index}].baseUrl`),
    feedUrl: asString(record['feedUrl'], `sources[${index}].feedUrl`),
    sectionSlugs: asStringArray(record['sectionSlugs'], `sources[${index}].sectionSlugs`),
  };
}

function toSection(value: unknown, index: number): Section {
  const record = asRecord(value, `sections[${index}]`);

  return {
    id: asString(record['id'], `sections[${index}].id`),
    slug: asString(record['slug'], `sections[${index}].slug`),
    name: asString(record['name'], `sections[${index}].name`),
  };
}

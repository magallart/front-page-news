import { readFile } from 'node:fs/promises';

import type { RssSourceRecord } from '../../src/interfaces/rss-source-record.interface';

export async function loadRssCatalogRecords(filePath: string): Promise<readonly RssSourceRecord[]> {
  const json = await readFile(filePath, 'utf8');
  return parseRssCatalogRecords(json);
}

export function parseRssCatalogRecords(value: string): readonly RssSourceRecord[] {
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed)) {
    throw new Error('Invalid catalog JSON: expected array');
  }

  const records: RssSourceRecord[] = [];
  for (const item of parsed) {
    if (!isCatalogRecord(item)) {
      continue;
    }

    records.push({
      sourceName: item.sourceName,
      feedUrl: item.feedUrl,
      sectionName: item.sectionName,
    });
  }

  if (records.length === 0) {
    throw new Error('RSS sources catalog has no valid entries');
  }

  return records;
}

function isCatalogRecord(value: unknown): value is RssSourceRecord {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['sourceName'] === 'string' &&
    typeof candidate['feedUrl'] === 'string' &&
    typeof candidate['sectionName'] === 'string'
  );
}

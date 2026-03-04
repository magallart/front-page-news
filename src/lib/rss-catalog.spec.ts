import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { loadRssCatalogRecords, parseRssCatalogRecords } from '../../api/lib/rss-catalog';

describe('api/lib/rss-catalog', () => {
  it('parses only valid records and discards malformed entries', () => {
    const records = parseRssCatalogRecords(
      JSON.stringify([
        {
          sourceName: 'El Diario',
          feedUrl: 'https://eldiario.test/rss.xml',
          sectionName: 'Actualidad',
        },
        {
          sourceName: 'Malformed',
          feedUrl: 1234,
          sectionName: 'Actualidad',
        },
      ]),
    );

    expect(records).toEqual([
      {
        sourceName: 'El Diario',
        feedUrl: 'https://eldiario.test/rss.xml',
        sectionName: 'Actualidad',
      },
    ]);
  });

  it('throws when JSON root is not an array', () => {
    expect(() => parseRssCatalogRecords(JSON.stringify({ records: [] }))).toThrow(
      'Invalid catalog JSON: expected array',
    );
  });

  it('throws when array has no valid RSS source entries', () => {
    expect(() =>
      parseRssCatalogRecords(
        JSON.stringify([
          { sourceName: 1, feedUrl: 2, sectionName: 3 },
          { sourceName: 'Source', feedUrl: null, sectionName: 'Actualidad' },
        ]),
      ),
    ).toThrow('RSS sources catalog has no valid entries');
  });

  it('loads and parses catalog records from file path', async () => {
    const tempDirectory = await mkdtemp(join(tmpdir(), 'front-page-news-rss-catalog-'));
    const filePath = join(tempDirectory, 'rss-catalog.json');

    try {
      await writeFile(
        filePath,
        JSON.stringify([
          {
            sourceName: 'La Gazette',
            feedUrl: 'https://lagazette.test/rss.xml',
            sectionName: 'Economia',
          },
        ]),
        'utf8',
      );

      const records = await loadRssCatalogRecords(filePath);
      expect(records).toEqual([
        {
          sourceName: 'La Gazette',
          feedUrl: 'https://lagazette.test/rss.xml',
          sectionName: 'Economia',
        },
      ]);
    } finally {
      await rm(tempDirectory, { recursive: true, force: true });
    }
  });
});

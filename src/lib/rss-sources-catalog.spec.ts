import { describe, expect, it } from 'vitest';

import { buildSourceFeedTargetsFromRecords, buildSourcesResponseFromRecords } from '../../server/lib/rss-sources-catalog';

import type { RssSourceRecord } from '../../shared/interfaces/rss-source-record.interface';

describe('server/lib/rss-sources-catalog', () => {
  it('builds deduped sections and sources from source records', () => {
    const records: readonly RssSourceRecord[] = [
      {
        sourceName: ' El Pais ',
        feedUrl: ' https://feeds.elpais.com/portada.xml ',
        sectionName: ' Actualidad ',
      },
      {
        sourceName: 'El Pais',
        feedUrl: 'https://feeds.elpais.com/economia.xml',
        sectionName: 'Economia',
      },
      {
        sourceName: 'ABC',
        feedUrl: 'https://www.abc.es/rss/2.0/portada/',
        sectionName: 'Actualidad',
      },
    ];

    const response = buildSourcesResponseFromRecords(records);

    expect(response.sources).toHaveLength(2);
    expect(response.sections).toHaveLength(2);

    const elPais = response.sources.find((source) => source.id === 'source-el-pais');
    expect(elPais?.sectionSlugs).toEqual(['actualidad', 'economia']);
    expect(elPais?.baseUrl).toBe('https://feeds.elpais.com');
  });

  it('builds one feed target per source+section+url and sorts by source/section', () => {
    const records: readonly RssSourceRecord[] = [
      {
        sourceName: 'El Pais',
        feedUrl: 'https://feeds.elpais.com/portada.xml',
        sectionName: 'Actualidad',
      },
      {
        sourceName: 'El Pais',
        feedUrl: 'https://feeds.elpais.com/cultura.xml',
        sectionName: 'Cultura',
      },
      {
        sourceName: 'El Pais',
        feedUrl: 'https://feeds.elpais.com/cultura.xml',
        sectionName: 'Cultura',
      },
      {
        sourceName: ' ',
        feedUrl: 'https://invalid.test/rss.xml',
        sectionName: 'Actualidad',
      },
    ];

    const targets = buildSourceFeedTargetsFromRecords(records);

    expect(targets).toHaveLength(2);
    expect(targets.map((item) => item.sourceId)).toEqual(['source-el-pais', 'source-el-pais']);
    expect(targets.map((item) => item.sectionSlug)).toEqual(['actualidad', 'cultura']);
    expect(targets.map((item) => item.feedUrl)).toEqual([
      'https://feeds.elpais.com/portada.xml',
      'https://feeds.elpais.com/cultura.xml',
    ]);
  });

  it('keeps empty baseUrl when feed url is not a valid absolute URL', () => {
    const records: readonly RssSourceRecord[] = [
      {
        sourceName: 'Fuente Local',
        feedUrl: 'not-a-url',
        sectionName: 'Actualidad',
      },
    ];

    const response = buildSourcesResponseFromRecords(records);
    const targets = buildSourceFeedTargetsFromRecords(records);

    expect(response.sources[0]?.baseUrl).toBe('');
    expect(targets[0]?.sourceBaseUrl).toBe('');
  });
});


import { describe, expect, it, vi } from 'vitest';

import { WARNING_CODE } from '../../server/constants/warning-code.constants';
import { regenerateBaseSnapshots } from '../../server/lib/base-snapshot-regeneration';

import type { RssSourceRecord } from '../../shared/interfaces/rss-source-record.interface';
import type { Source } from '../../shared/interfaces/source.interface';
import type { Warning } from '../../shared/interfaces/warning.interface';

describe('server/lib/base-snapshot-regeneration', () => {
  it('does not persist degraded news snapshots with severe warnings', async () => {
    const putNewsSnapshot = vi.fn().mockResolvedValue(undefined);
    const putSourcesSnapshot = vi.fn().mockResolvedValue(undefined);

    const result = await regenerateBaseSnapshots({
      loadCatalogRecords: async () => makeCatalogRecords(),
      fetchFeeds: async (sources: readonly Source[]) => ({
        successes: sources.map((source, index) => ({
          sourceId: source.id,
          feedUrl: source.feedUrl,
          body: buildRssXml({
            title: `${source.name} ${index + 1}`,
            url: `https://example.com/${source.id}/${index + 1}`,
          }),
          contentType: 'application/rss+xml',
        })),
        warnings: [
          {
            code: WARNING_CODE.SOURCE_TIMEOUT,
            message: 'timeout',
            sourceId: 'source-1',
            feedUrl: 'https://source-one.test/actualidad.xml',
          },
        ] satisfies readonly Warning[],
      }),
      snapshotWriter: {
        putNewsSnapshot,
        putSourcesSnapshot,
      },
      now: () => Date.parse('2026-04-28T08:00:00.000Z'),
    });

    expect(putNewsSnapshot).not.toHaveBeenCalled();
    expect(putSourcesSnapshot).toHaveBeenCalledTimes(1);
    expect(result.newsSnapshots).toBe(11);
    expect(result.sourcesSnapshots).toBe(1);
    expect(result.keys).toEqual(['sources:default']);
  });

  it('does not persist empty news snapshots even without warnings', async () => {
    const putNewsSnapshot = vi.fn().mockResolvedValue(undefined);
    const putSourcesSnapshot = vi.fn().mockResolvedValue(undefined);

    const result = await regenerateBaseSnapshots({
      loadCatalogRecords: async () => makeCatalogRecords(),
      fetchFeeds: async () => ({
        successes: [],
        warnings: [],
      }),
      snapshotWriter: {
        putNewsSnapshot,
        putSourcesSnapshot,
      },
      now: () => Date.parse('2026-04-28T08:00:00.000Z'),
    });

    expect(putNewsSnapshot).not.toHaveBeenCalled();
    expect(putSourcesSnapshot).toHaveBeenCalledTimes(1);
    expect(result.keys).toEqual(['sources:default']);
  });
});

function makeCatalogRecords(): readonly RssSourceRecord[] {
  return [
    { sourceName: 'Fuente Uno', feedUrl: 'https://source-one.test/actualidad.xml', sectionName: 'Actualidad' },
    { sourceName: 'Fuente Dos', feedUrl: 'https://source-two.test/ciencia.xml', sectionName: 'Ciencia' },
    { sourceName: 'Fuente Tres', feedUrl: 'https://source-three.test/cultura.xml', sectionName: 'Cultura' },
    { sourceName: 'Fuente Cuatro', feedUrl: 'https://source-four.test/deportes.xml', sectionName: 'Deportes' },
    { sourceName: 'Fuente Cinco', feedUrl: 'https://source-five.test/economia.xml', sectionName: 'Economia' },
    { sourceName: 'Fuente Seis', feedUrl: 'https://source-six.test/espana.xml', sectionName: 'Espana' },
    { sourceName: 'Fuente Siete', feedUrl: 'https://source-seven.test/internacional.xml', sectionName: 'Internacional' },
    { sourceName: 'Fuente Ocho', feedUrl: 'https://source-eight.test/opinion.xml', sectionName: 'Opinion' },
    { sourceName: 'Fuente Nueve', feedUrl: 'https://source-nine.test/sociedad.xml', sectionName: 'Sociedad' },
    { sourceName: 'Fuente Diez', feedUrl: 'https://source-ten.test/tecnologia.xml', sectionName: 'Tecnologia' },
  ];
}

function buildRssXml(input: { title: string; url: string }): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>Feed</title>
        <item>
          <title>${input.title}</title>
          <link>${input.url}</link>
          <description>Resumen</description>
          <pubDate>Tue, 28 Apr 2026 08:00:00 GMT</pubDate>
        </item>
      </channel>
    </rss>`;
}

import { describe, expect, it, vi } from 'vitest';

import { WARNING_CODE } from '../../server/constants/warning-code.constants';
import { regenerateBaseSnapshots } from '../../server/lib/base-snapshot-regeneration';

import type { RssSourceRecord } from '../../shared/interfaces/rss-source-record.interface';
import type { Source } from '../../shared/interfaces/source.interface';
import type { Warning } from '../../shared/interfaces/warning.interface';

describe('server/lib/base-snapshot-regeneration', () => {
  it('reuses shared feed fetch batches for homepage and section snapshots', async () => {
    const fetchFeeds = vi.fn(async (sources: readonly Source[]) => ({
      successes: sources.map((source, index) => ({
        sourceId: source.id,
        feedUrl: source.feedUrl,
        body: buildRssXml({
          title: `${source.name} ${index + 1}`,
          url: `https://example.com/${source.id}/${index + 1}`,
        }),
        contentType: 'application/rss+xml',
      })),
      warnings: [],
    }));

    await regenerateBaseSnapshots({
      loadCatalogRecords: async () => makeCatalogRecords(),
      fetchFeeds,
      snapshotWriter: {
        putNewsSnapshot: vi.fn().mockResolvedValue(undefined),
        putSourcesSnapshot: vi.fn().mockResolvedValue(undefined),
      },
      now: () => Date.parse('2026-04-28T08:00:00.000Z'),
    });

    expect(fetchFeeds).toHaveBeenCalledTimes(2);
    expect(fetchFeeds.mock.calls[0]?.[0].length).toBeGreaterThan(0);
    expect(fetchFeeds.mock.calls[1]?.[0].length).toBe(10);
  });

  it('skips only the affected snapshots when a severe warning hits part of the shared batch', async () => {
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
            sourceId: 'source-fuente-uno',
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

    expect(putNewsSnapshot).toHaveBeenCalledTimes(9);
    expect(putSourcesSnapshot).toHaveBeenCalledTimes(1);
    expect(result.newsSnapshots).toBe(11);
    expect(result.sourcesSnapshots).toBe(1);
    expect(result.attemptedKeys).toHaveLength(12);
    expect(result.persistedKeys).toContain('sources:default');
    expect(result.skippedKeys).toEqual([
      'news:id=-:section=-:source=-:q=-:page=1:limit=250',
      'news:id=-:section=actualidad:source=-:q=-:page=1:limit=300',
    ]);
    expect(result.skippedReasons['news:id=-:section=-:source=-:q=-:page=1:limit=250']).toBe('blocking_warning');
    expect(result.warningsCount).toBeGreaterThan(0);
    expect(result.keys).not.toContain('news:id=-:section=-:source=-:q=-:page=1:limit=250');
    expect(result.keys).not.toContain('news:id=-:section=actualidad:source=-:q=-:page=1:limit=300');
    expect(result.keys).toContain('news:id=-:section=ciencia:source=-:q=-:page=1:limit=300');
    expect(result.keys).toContain('sources:default');
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

  it('does not degrade every shared section snapshot from an unscoped fetch warning', async () => {
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
            code: WARNING_CODE.SOURCE_FETCH_FAILED,
            message: 'Unexpected fetch error: worker rejected',
            sourceId: null,
            feedUrl: null,
          },
        ] satisfies readonly Warning[],
      }),
      snapshotWriter: {
        putNewsSnapshot,
        putSourcesSnapshot,
      },
      now: () => Date.parse('2026-04-28T08:00:00.000Z'),
    });

    expect(putNewsSnapshot).toHaveBeenCalledTimes(11);
    expect(putSourcesSnapshot).toHaveBeenCalledTimes(1);
    expect(result.skippedKeys).toEqual([]);
    expect(result.persistedKeys).toContain('news:id=-:section=actualidad:source=-:q=-:page=1:limit=300');
    expect(result.persistedKeys).toContain('news:id=-:section=tecnologia:source=-:q=-:page=1:limit=300');
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

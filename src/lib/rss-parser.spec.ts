import { describe, expect, it } from 'vitest';

import { parseFeedItems } from './rss-parser';

import type { Source } from '../interfaces/source.interface';

describe('rss-parser', () => {
  it('parses rss item fields', () => {
    const source = makeSource();
    const xml = `<?xml version="1.0"?>
      <rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:dc="http://purl.org/dc/elements/1.1/">
        <channel>
          <item>
            <guid>guid-1</guid>
            <title>Titular RSS</title>
            <link>https://example.com/rss-1</link>
            <pubDate>Tue, 17 Feb 2026 12:00:00 GMT</pubDate>
            <description><![CDATA[<p>Resumen RSS</p>]]></description>
            <dc:creator>Autora RSS</dc:creator>
            <media:content url="https://example.com/image.jpg" />
          </item>
        </channel>
      </rss>`;

    const result = parseFeedItems({ xml, source, sectionSlug: 'actualidad' });
    expect(result.items).toHaveLength(1);

    const first = result.items[0];
    expect(first?.externalId).toBe('guid-1');
    expect(first?.title).toBe('Titular RSS');
    expect(first?.url).toBe('https://example.com/rss-1');
    expect(first?.author).toBe('Autora RSS');
    expect(first?.imageUrl).toBe('https://example.com/image.jpg');
  });

  it('parses atom entry fields', () => {
    const source = makeSource();
    const xml = `<?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <id>tag:example.com,2026:entry-1</id>
          <title>Titular Atom</title>
          <link rel="alternate" href="https://example.com/atom-1" />
          <updated>2026-02-17T12:00:00Z</updated>
          <summary>Resumen Atom</summary>
          <author><name>Autor Atom</name></author>
        </entry>
      </feed>`;

    const result = parseFeedItems({ xml, source, sectionSlug: 'cultura' });
    expect(result.items).toHaveLength(1);

    const first = result.items[0];
    expect(first?.externalId).toBe('tag:example.com,2026:entry-1');
    expect(first?.title).toBe('Titular Atom');
    expect(first?.url).toBe('https://example.com/atom-1');
    expect(first?.author).toBe('Autor Atom');
    expect(first?.sectionSlug).toBe('cultura');
  });

  it('throws for unsupported format', () => {
    const source = makeSource();
    expect(() => parseFeedItems({ xml: '<html>invalid</html>', source, sectionSlug: 'actualidad' })).toThrow(
      'Unsupported feed format'
    );
  });
});

function makeSource(): Source {
  return {
    id: 'source-test',
    name: 'Source Test',
    baseUrl: 'https://example.com',
    feedUrl: 'https://example.com/feed.xml',
    sectionSlugs: ['actualidad'],
  };
}

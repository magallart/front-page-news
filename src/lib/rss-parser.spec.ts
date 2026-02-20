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

  it('supports single-quoted XML attributes for links and images', () => {
    const source = makeSource();
    const atomXml = `<?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <id>tag:example.com,2026:entry-2</id>
          <title>Titular Atom Single Quote</title>
          <link rel='alternate' href='https://example.com/atom-single-quote' />
          <updated>2026-02-17T12:00:00Z</updated>
          <summary>Resumen Atom</summary>
        </entry>
      </feed>`;
    const atomResult = parseFeedItems({ xml: atomXml, source, sectionSlug: 'actualidad' });

    expect(atomResult.items[0]?.url).toBe('https://example.com/atom-single-quote');

    const rssXml = `<?xml version="1.0"?>
      <rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
        <channel>
          <item>
            <guid>guid-2</guid>
            <title>Titular RSS Single Quote</title>
            <link>https://example.com/rss-2</link>
            <description>Resumen RSS</description>
            <media:content url='https://example.com/image-single-quote.jpg' />
          </item>
        </channel>
      </rss>`;
    const rssResult = parseFeedItems({ xml: rssXml, source, sectionSlug: 'actualidad' });

    expect(rssResult.items[0]?.imageUrl).toBe('https://example.com/image-single-quote.jpg');
  });

  it('prioritizes media:thumbnail over media:content video', () => {
    const source = makeSource();
    const xml = `<?xml version="1.0"?>
      <rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
        <channel>
          <item>
            <guid>guid-4</guid>
            <title>Titular con video y thumbnail</title>
            <link>https://example.com/rss-4</link>
            <media:content url="https://cdn.example.com/video.mp4" type="video/mp4" />
            <media:thumbnail url="https://cdn.example.com/thumbnail.jpg" />
          </item>
        </channel>
      </rss>`;

    const result = parseFeedItems({ xml, source, sectionSlug: 'cultura' });
    expect(result.items[0]?.imageUrl).toBe('https://cdn.example.com/thumbnail.jpg');
  });

  it('prioritizes media:content image over media:thumbnail and picks largest media image', () => {
    const source = makeSource();
    const xml = `<?xml version="1.0"?>
      <rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
        <channel>
          <item>
            <guid>guid-4c</guid>
            <title>Titular con multiples imagenes</title>
            <link>https://example.com/rss-4c</link>
            <media:thumbnail url="https://cdn.example.com/thumb.jpg" width="150" height="100" />
            <media:content url="https://cdn.example.com/large.jpg" type="image/jpeg" width="2048" height="1365" />
            <media:content url="https://cdn.example.com/small.jpg" type="image/jpeg" width="640" height="480" />
          </item>
        </channel>
      </rss>`;

    const result = parseFeedItems({ xml, source, sectionSlug: 'cultura' });
    expect(result.items[0]?.imageUrl).toBe('https://cdn.example.com/large.jpg');
  });

  it('accepts media:thumbnail urls without image extension', () => {
    const source = makeSource();
    const xml = `<?xml version="1.0"?>
      <rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
        <channel>
          <item>
            <guid>guid-4b</guid>
            <title>Titular con thumbnail sin extension</title>
            <link>https://example.com/rss-4b</link>
            <media:thumbnail url="https://cdn.example.com/thumb?id=abc123&size=640" />
            <media:content url="https://cdn.example.com/video.mp4" type="video/mp4" />
          </item>
        </channel>
      </rss>`;

    const result = parseFeedItems({ xml, source, sectionSlug: 'cultura' });
    expect(result.items[0]?.imageUrl).toBe('https://cdn.example.com/thumb?id=abc123&size=640');
  });

  it('maps youtube urls to a thumbnail when no image is available', () => {
    const source = makeSource();
    const xml = `<?xml version="1.0"?>
      <rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
        <channel>
          <item>
            <guid>guid-5</guid>
            <title>Titular con youtube</title>
            <link>https://example.com/rss-5</link>
            <media:content url="https://www.youtube.com/watch?v=7x9iAXgsuEY" type="video/mp4" />
          </item>
        </channel>
      </rss>`;

    const result = parseFeedItems({ xml, source, sectionSlug: 'cultura' });
    expect(result.items[0]?.imageUrl).toBe('https://i.ytimg.com/vi/7x9iAXgsuEY/hqdefault.jpg');
  });

  it('returns null image when feed only provides non-image media without thumbnail', () => {
    const source = makeSource();
    const xml = `<?xml version="1.0"?>
      <rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
        <channel>
          <item>
            <guid>guid-6</guid>
            <title>Titular sin imagen</title>
            <link>https://example.com/rss-6</link>
            <media:content url="https://cdn.example.com/video.mp4" type="video/mp4" />
          </item>
        </channel>
      </rss>`;

    const result = parseFeedItems({ xml, source, sectionSlug: 'cultura' });
    expect(result.items[0]?.imageUrl).toBeNull();
  });

  it('strips CDATA wrappers even when surrounded by whitespace/newlines', () => {
    const source = makeSource();
    const xml = `<?xml version="1.0"?>
      <rss version="2.0">
        <channel>
          <item>
            <guid>guid-3</guid>
            <title>
              <![CDATA[Titular CDATA]]>
            </title>
            <link>https://example.com/rss-3</link>
            <description>
              <![CDATA[<p>Resumen CDATA</p>]]>
            </description>
          </item>
        </channel>
      </rss>`;

    const result = parseFeedItems({ xml, source, sectionSlug: 'actualidad' });
    const first = result.items[0];

    expect(first?.title).toBe('Titular CDATA');
    expect(first?.summary).toBe('<p>Resumen CDATA</p>');
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

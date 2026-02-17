import type { RawFeedItem } from './rss-normalization';
import type { Source } from '../interfaces/source.interface';

const RSS_LIKE_PATTERN = /<rss\b|<rdf:rdf\b/i;
const ATOM_PATTERN = /<feed\b/i;

interface ParseFeedInput {
  readonly xml: string;
  readonly source: Source;
  readonly sectionSlug: string;
}

export interface ParsedFeedItems {
  readonly items: readonly RawFeedItem[];
}

export function parseFeedItems(input: ParseFeedInput): ParsedFeedItems {
  const xml = input.xml.trim();
  if (!xml) {
    throw new Error('Empty feed body');
  }

  if (ATOM_PATTERN.test(xml)) {
    return { items: parseAtomEntries(xml, input.source, input.sectionSlug) };
  }

  if (RSS_LIKE_PATTERN.test(xml)) {
    return { items: parseRssItems(xml, input.source, input.sectionSlug) };
  }

  throw new Error('Unsupported feed format');
}

function parseRssItems(xml: string, source: Source, sectionSlug: string): readonly RawFeedItem[] {
  const blocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];
  return blocks.map((block) => ({
    externalId: extractTagText(block, ['guid']),
    title: extractTagText(block, ['title']),
    summary: extractTagText(block, ['description', 'content:encoded']),
    url: extractTagText(block, ['link']),
    sourceId: source.id,
    sourceName: source.name,
    sectionSlug,
    author: extractTagText(block, ['dc:creator', 'author']),
    publishedAt: extractTagText(block, ['pubDate', 'dc:date']),
    imageUrl: extractImageUrl(block),
  }));
}

function parseAtomEntries(xml: string, source: Source, sectionSlug: string): readonly RawFeedItem[] {
  const blocks = xml.match(/<entry\b[\s\S]*?<\/entry>/gi) ?? [];
  return blocks.map((block) => ({
    externalId: extractTagText(block, ['id']),
    title: extractTagText(block, ['title']),
    summary: extractTagText(block, ['summary', 'content']),
    url: extractAtomEntryLink(block),
    sourceId: source.id,
    sourceName: source.name,
    sectionSlug,
    author: extractAtomAuthor(block),
    publishedAt: extractTagText(block, ['published', 'updated']),
    imageUrl: extractImageUrl(block),
  }));
}

function extractTagText(block: string, tagNames: readonly string[]): string | null {
  for (const tagName of tagNames) {
    const escaped = escapeRegExp(tagName);
    const match = block.match(new RegExp(`<${escaped}\\b[^>]*>([\\s\\S]*?)<\\/${escaped}>`, 'i'));
    if (!match?.[1]) {
      continue;
    }

    const value = decodeXmlEntities(stripCdata(match[1]).trim());
    if (value) {
      return value;
    }
  }

  return null;
}

function extractImageUrl(block: string): string | null {
  const media = block.match(/<(media:content|media:thumbnail)\b[^>]*\burl="([^"]+)"[^>]*>/i);
  if (media?.[2]) {
    return decodeXmlEntities(media[2]);
  }

  const enclosure = block.match(/<enclosure\b[^>]*\burl="([^"]+)"[^>]*>/i);
  if (enclosure?.[1]) {
    return decodeXmlEntities(enclosure[1]);
  }

  const imageFromHtml = block.match(/<img\b[^>]*\bsrc="([^"]+)"[^>]*>/i);
  if (imageFromHtml?.[1]) {
    return decodeXmlEntities(imageFromHtml[1]);
  }

  return null;
}

function extractAtomEntryLink(block: string): string | null {
  const tags = block.match(/<link\b[^>]*>/gi) ?? [];

  let fallbackHref: string | null = null;
  for (const tag of tags) {
    const href = extractAttribute(tag, 'href');
    if (!href) {
      continue;
    }

    const rel = extractAttribute(tag, 'rel');
    if (!fallbackHref) {
      fallbackHref = href;
    }

    if (!rel || rel === 'alternate') {
      return href;
    }
  }

  return fallbackHref;
}

function extractAtomAuthor(block: string): string | null {
  const authorBlock = block.match(/<author\b[^>]*>([\s\S]*?)<\/author>/i)?.[1];
  if (!authorBlock) {
    return extractTagText(block, ['author']);
  }

  return extractTagText(authorBlock, ['name']) ?? extractTagText(block, ['author']);
}

function extractAttribute(tag: string, attributeName: string): string | null {
  const escaped = escapeRegExp(attributeName);
  const match = tag.match(new RegExp(`\\b${escaped}="([^"]+)"`, 'i'));
  return match?.[1] ? decodeXmlEntities(match[1]) : null;
}

function stripCdata(value: string): string {
  const cdataMatch = value.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/i);
  return cdataMatch?.[1] ?? value;
}

function decodeXmlEntities(value: string): string {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

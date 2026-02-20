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
  return blocks.map((block) => {
    const imageSelection = extractImageSelection(block);

    return {
      externalId: extractTagText(block, ['guid']),
      title: extractTagText(block, ['title']),
      summary: extractTagText(block, ['description', 'content:encoded']),
      url: extractTagText(block, ['link']),
      sourceId: source.id,
      sourceName: source.name,
      sectionSlug,
      author: extractTagText(block, ['dc:creator', 'author']),
      publishedAt: extractTagText(block, ['pubDate', 'dc:date']),
      imageUrl: imageSelection.largeUrl,
      thumbnailUrl: imageSelection.smallUrl,
    };
  });
}

function parseAtomEntries(xml: string, source: Source, sectionSlug: string): readonly RawFeedItem[] {
  const blocks = xml.match(/<entry\b[\s\S]*?<\/entry>/gi) ?? [];
  return blocks.map((block) => {
    const imageSelection = extractImageSelection(block);

    return {
      externalId: extractTagText(block, ['id']),
      title: extractTagText(block, ['title']),
      summary: extractTagText(block, ['summary', 'content']),
      url: extractAtomEntryLink(block),
      sourceId: source.id,
      sourceName: source.name,
      sectionSlug,
      author: extractAtomAuthor(block),
      publishedAt: extractTagText(block, ['published', 'updated']),
      imageUrl: imageSelection.largeUrl,
      thumbnailUrl: imageSelection.smallUrl,
    };
  });
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

interface ImageSelection {
  readonly largeUrl: string | null;
  readonly smallUrl: string | null;
}

function extractImageSelection(block: string): ImageSelection {
  const mediaContentTags = block.match(/<media:content\b[^>]*>/gi) ?? [];
  const mediaImageCandidates: { url: string; area: number }[] = [];
  for (const tag of mediaContentTags) {
    const mediaUrl = extractAttribute(tag, 'url');
    const mediaType = extractAttribute(tag, 'type');
    if (isImageMediaCandidate(mediaUrl, mediaType)) {
      const width = parsePositiveNumber(extractAttribute(tag, 'width'));
      const height = parsePositiveNumber(extractAttribute(tag, 'height'));
      mediaImageCandidates.push({
        url: mediaUrl,
        area: width > 0 && height > 0 ? width * height : 0,
      });
      continue;
    }

    const youtubeThumbnail = toYouTubeThumbnailUrl(mediaUrl);
    if (youtubeThumbnail) {
      return { largeUrl: youtubeThumbnail, smallUrl: youtubeThumbnail };
    }
  }

  const thumbnailTags = block.match(/<media:thumbnail\b[^>]*>/gi) ?? [];
  const thumbnailCandidates: string[] = [];
  for (const tag of thumbnailTags) {
    const thumbnailUrl = extractAttribute(tag, 'url');
    if (isHttpUrl(thumbnailUrl)) {
      thumbnailCandidates.push(thumbnailUrl);
    }
  }

  if (mediaImageCandidates.length > 0) {
    mediaImageCandidates.sort((first, second) => second.area - first.area);
    const largeUrl = mediaImageCandidates[0]?.url ?? null;
    const smallestMediaUrl = mediaImageCandidates[mediaImageCandidates.length - 1]?.url ?? null;
    const smallUrl = thumbnailCandidates[0] ?? smallestMediaUrl ?? largeUrl;

    return { largeUrl, smallUrl };
  }

  if (thumbnailCandidates.length > 0) {
    const thumbnailUrl = thumbnailCandidates[0] ?? null;
    return { largeUrl: thumbnailUrl, smallUrl: thumbnailUrl };
  }

  const enclosureTag = block.match(/<enclosure\b[^>]*>/i)?.[0] ?? null;
  const enclosureUrl = enclosureTag ? extractAttribute(enclosureTag, 'url') : null;
  const enclosureType = enclosureTag ? extractAttribute(enclosureTag, 'type') : null;
  if (isImageMediaCandidate(enclosureUrl, enclosureType)) {
    return { largeUrl: enclosureUrl, smallUrl: enclosureUrl };
  }

  const enclosureYoutubeThumbnail = toYouTubeThumbnailUrl(enclosureUrl);
  if (enclosureYoutubeThumbnail) {
    return { largeUrl: enclosureYoutubeThumbnail, smallUrl: enclosureYoutubeThumbnail };
  }

  const imageTag = block.match(/<img\b[^>]*>/i)?.[0] ?? null;
  const imageUrl = imageTag ? extractAttribute(imageTag, 'src') : null;
  if (isImageUrl(imageUrl)) {
    return { largeUrl: imageUrl, smallUrl: imageUrl };
  }

  const inlineYoutubeThumbnail = toYouTubeThumbnailUrl(imageUrl);
  if (inlineYoutubeThumbnail) {
    return { largeUrl: inlineYoutubeThumbnail, smallUrl: inlineYoutubeThumbnail };
  }

  return { largeUrl: null, smallUrl: null };
}

function parsePositiveNumber(value: string | null): number {
  if (!value) {
    return 0;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
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
  const match = tag.match(new RegExp(`\\b${escaped}\\s*=\\s*(['"])([\\s\\S]*?)\\1`, 'i'));
  return match?.[2] ? decodeXmlEntities(match[2]) : null;
}

function stripCdata(value: string): string {
  const cdataMatch = value.trim().match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/i);
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

function isImageMediaCandidate(url: string | null, mediaType: string | null): url is string {
  if (!url) {
    return false;
  }

  if (mediaType?.toLowerCase().startsWith('image/')) {
    return true;
  }

  return isImageUrl(url);
}

function isImageUrl(url: string | null): url is string {
  if (!isHttpUrl(url)) {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    return /\.(avif|gif|jpe?g|png|webp|bmp|svg)$/i.test(parsedUrl.pathname);
  } catch {
    return false;
  }
}

function isHttpUrl(url: string | null): url is string {
  if (!url) {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

function toYouTubeThumbnailUrl(url: string | null): string | null {
  if (!url) {
    return null;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return null;
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  let videoId: string | null = null;

  if (hostname === 'youtu.be') {
    videoId = parsedUrl.pathname.split('/').filter((segment) => segment.length > 0)[0] ?? null;
  } else if (hostname === 'youtube.com' || hostname === 'www.youtube.com') {
    if (parsedUrl.pathname === '/watch') {
      videoId = parsedUrl.searchParams.get('v');
    } else if (parsedUrl.pathname.startsWith('/embed/')) {
      videoId = parsedUrl.pathname.split('/')[2] ?? null;
    } else if (parsedUrl.pathname.startsWith('/shorts/')) {
      videoId = parsedUrl.pathname.split('/')[2] ?? null;
    }
  }

  if (!videoId) {
    return null;
  }

  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

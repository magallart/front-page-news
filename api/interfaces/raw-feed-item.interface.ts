export interface RawFeedItem {
  readonly externalId: string | null;
  readonly title: string | null;
  readonly summary: string | null;
  readonly url: string | null;
  readonly sourceId: string;
  readonly sourceName: string;
  readonly sectionSlug: string;
  readonly author: string | null;
  readonly publishedAt: string | null;
  readonly imageUrl: string | null;
  readonly thumbnailUrl: string | null;
}

export interface Article {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly url: string;
  readonly canonicalUrl: string | null;
  readonly imageUrl: string | null;
  readonly sourceId: string;
  readonly sourceName: string;
  readonly sectionSlug: string;
  readonly author: string | null;
  readonly publishedAt: string | null;
}

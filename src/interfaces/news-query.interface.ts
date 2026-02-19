export interface NewsQuery {
  readonly id: string | null;
  readonly section: string | null;
  readonly sourceIds: readonly string[];
  readonly searchQuery: string | null;
  readonly page: number;
  readonly limit: number;
}

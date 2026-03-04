export interface SectionQueryFilters {
  readonly sourceIds: readonly string[];
  readonly searchQuery: string | null;
  readonly page: number;
  readonly limit: number;
}

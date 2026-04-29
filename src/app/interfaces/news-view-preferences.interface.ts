export interface NewsViewPreferences {
  readonly hasCustomSelection: boolean;
  readonly selectedValues: readonly string[];
  readonly sortDirection: 'asc' | 'desc';
}

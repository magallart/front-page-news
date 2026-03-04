export interface Source {
  readonly id: string;
  readonly name: string;
  readonly baseUrl: string;
  readonly feedUrl: string;
  readonly sectionSlugs: readonly string[];
}

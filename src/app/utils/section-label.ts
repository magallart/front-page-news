const DEFAULT_SECTION_LABEL = 'Actualidad';

export function formatSectionLabel(slug: string): string {
  const words = slug
    .split('-')
    .filter((part) => part.length > 0)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`);

  return words.length > 0 ? words.join(' ') : DEFAULT_SECTION_LABEL;
}

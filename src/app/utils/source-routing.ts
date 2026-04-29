import type { Source } from '../../../shared/interfaces/source.interface';

export function buildSourceRoute(sourceId: string, sourceName: string): readonly ['/fuente', string] {
  return ['/fuente', toSourceSlug(sourceId, sourceName)];
}

export function findSourceBySlug(sources: readonly Source[], slug: string | null): Source | null {
  const normalizedSlug = normalizeSourceSlug(slug);
  if (!normalizedSlug) {
    return null;
  }

  return sources.find((source) => toSourceSlug(source.id, source.name) === normalizedSlug) ?? null;
}

export function toSourceSlug(sourceId: string, sourceName: string): string {
  const normalizedId = sourceId.trim().toLowerCase();
  if (normalizedId.length > 0) {
    return normalizedId;
  }

  return `source-${slugify(sourceName) || 'unknown'}`;
}

function normalizeSourceSlug(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

import type { Source } from '../../../shared/interfaces/source.interface';

export function buildSourceRoute(sourceId: string, sourceName: string): readonly ['/fuente', string] {
  return ['/fuente', toSourceRouteSlug(sourceId, sourceName)];
}

export function findSourceBySlug(sources: readonly Source[], slug: string | null): Source | null {
  const normalizedSlug = normalizeSourceSlug(slug);
  if (!normalizedSlug) {
    return null;
  }

  return (
    sources.find((source) => buildSourceSlugAliases(source.id, source.name).includes(normalizedSlug)) ?? null
  );
}

export function sourceIdsMatch(
  leftSourceId: string,
  leftSourceName: string,
  rightSourceId: string,
  rightSourceName: string,
): boolean {
  const leftAliases = new Set(buildSourceSlugAliases(leftSourceId, leftSourceName));
  return buildSourceSlugAliases(rightSourceId, rightSourceName).some((alias) => leftAliases.has(alias));
}

export function toSourceSlug(sourceId: string, sourceName: string): string {
  const normalizedId = sourceId.trim().toLowerCase();
  if (normalizedId.length > 0) {
    return normalizedId;
  }

  return `source-${slugify(sourceName) || 'unknown'}`;
}

export function toSourceRouteSlug(sourceId: string, sourceName: string): string {
  return stripSourcePrefix(toSourceSlug(sourceId, sourceName));
}

function normalizeSourceSlug(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

function buildSourceSlugAliases(sourceId: string, sourceName: string): readonly string[] {
  const sourceSlug = toSourceSlug(sourceId, sourceName);
  const routeSlug = stripSourcePrefix(sourceSlug);

  if (sourceSlug === routeSlug) {
    return routeSlug.length > 0 ? [routeSlug, `source-${routeSlug}`] : [];
  }

  return routeSlug.length > 0 ? [sourceSlug, routeSlug] : [sourceSlug];
}

function stripSourcePrefix(value: string): string {
  return value.startsWith('source-') ? value.slice('source-'.length) : value;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

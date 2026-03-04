export function normalizeRoutePath(url: string): string {
  const pathOnly = url.split('?')[0]?.split('#')[0] ?? '';
  if (pathOnly.length === 0) {
    return '/';
  }

  const withLeadingSlash = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`;
  return withLeadingSlash.endsWith('/') && withLeadingSlash.length > 1
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash;
}

export function isRouteInSet(url: string, routes: ReadonlySet<string>): boolean {
  return routes.has(normalizeRoutePath(url));
}

export function isCacheExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt;
}

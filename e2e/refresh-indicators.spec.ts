import { expect, test } from '@playwright/test';

import { mockApiRoutes } from './helpers/api-mocks';

test.describe('Refresh Indicators', () => {
  test('does not show refresh indicators on a fresh home response', async ({ page }) => {
    await mockApiRoutes(page);
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('app-news-carousel')).toBeVisible();
    await expect(page.locator('[data-testid="refresh-status"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="fresh-update-banner"]')).toHaveCount(0);
  });

  test('does not show refresh indicators on a fresh section response', async ({ page }) => {
    await mockApiRoutes(page);
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/seccion/actualidad', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('app-news-card')).toHaveCount(5);
    await expect(page.locator('[data-testid="refresh-status"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="fresh-update-banner"]')).toHaveCount(0);
  });

  test('shows a last-visit banner when the hydrated home query contains unseen headlines', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'fpn:last-visit-news-state:news:id=-:section=-:source=-:q=-:page=1:limit=250',
        JSON.stringify({
          articleFingerprints: [],
          seenAt: Date.parse('2026-03-04T08:00:00.000Z'),
        }),
      );
    });
    await mockApiRoutes(page);
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('[data-testid="last-visit-banner"]')).toBeVisible();
    await expect(page.locator('[data-testid="last-visit-banner"]')).toContainText('Novedades desde tu última visita');
  });
});

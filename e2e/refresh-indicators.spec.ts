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
});

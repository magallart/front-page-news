import { expect, test } from '@playwright/test';

import { mockApiRoutes } from './helpers/api-mocks';

test.describe('Error States', () => {
  test('home page shows error block when /api/news fails', async ({ page }) => {
    await mockApiRoutes(page);
    await page.route('**/api/news**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal error' }),
      });
    });

    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');

    await expect(page.locator('app-error-state')).toBeVisible();
  });

  test('section page renders empty/error fallback when section news request fails', async ({ page }) => {
    await mockApiRoutes(page);
    await page.route('**/api/news**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal error' }),
      });
    });

    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/seccion/actualidad', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('app-error-state')).toBeVisible();
    await expect(page.locator('app-news-card')).toHaveCount(0);
  });
});

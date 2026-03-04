import { expect, test } from '@playwright/test';

import { mockApiRoutes } from './helpers/api-mocks';

test.describe('Home Page', () => {
  test('renders editorial home blocks from API data', async ({ page }) => {
    await mockApiRoutes(page);
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');

    await expect(page.locator('app-news-carousel')).toBeVisible();
    await expect(page.locator('#breaking-news')).toBeVisible();
    await expect(page.locator('#most-read-news')).toBeVisible();
    await expect(page.locator('app-section-block')).toHaveCount(4);
    await expect(page.locator('app-source-directory a[target="_blank"]')).toHaveCount(5);
  });

  test('opens and closes contextual quick-view modal from carousel', async ({ page }) => {
    await mockApiRoutes(page);
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');

    const quickViewDialog = page.locator('.quick-view-dialog[role="dialog"]');

    await page.locator('app-news-carousel article > button').click();
    await expect(quickViewDialog).toBeVisible();
    await expect(quickViewDialog.locator('h1')).toContainText('Acuerdo europeo');

    await page.locator('.quick-view-dialog button[aria-label="Cerrar modal"]').click();
    await expect(quickViewDialog).toHaveCount(0);

    await page.locator('app-news-carousel article > button').click();
    await expect(quickViewDialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(quickViewDialog).toHaveCount(0);
  });

  test('opens quick-view modal from breaking and most-read lists', async ({ page }) => {
    await mockApiRoutes(page);
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');

    const quickViewDialog = page.locator('.quick-view-dialog[role="dialog"]');

    await page.locator('#breaking-news ul button').first().click();
    await expect(quickViewDialog).toBeVisible();
    await page.locator('.quick-view-overlay').click({ position: { x: 6, y: 6 } });
    await expect(quickViewDialog).toHaveCount(0);

    await page.locator('#most-read-news ol li button').first().click();
    await expect(quickViewDialog).toBeVisible();
    await expect(page.locator('app-article-preview-cta a')).toHaveAttribute('target', '_blank');
  });
});

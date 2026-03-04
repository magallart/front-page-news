import { expect, test } from '@playwright/test';

import { mockApiRoutes } from './helpers/api-mocks';

test('home page loads critical news blocks with mocked API data', async ({ page }) => {
  await mockApiRoutes(page);
  await page.goto('/');

  await expect(page.locator('app-news-carousel')).toBeVisible();
  await expect(page.locator('app-breaking-news')).toBeVisible();
  await expect(page.locator('app-most-read-news')).toBeVisible();
  await expect(page.locator('app-source-directory')).toBeVisible();
});

import { test, expect } from '@playwright/test';

test('home page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('app-news-carousel')).toBeVisible();
  await expect(page.locator('app-breaking-news')).toBeVisible();
  await expect(page.locator('app-most-read-news')).toBeVisible();
});

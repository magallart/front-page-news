import { expect, test } from '@playwright/test';

import { mockApiRoutes } from './helpers/api-mocks';

test.describe('Source Page', () => {
  test('resolves a direct source route and renders source-specific news', async ({ page }) => {
    await mockApiRoutes(page);
    await page.goto('/fuente/mundo-diario');

    await expect(page).toHaveURL(/\/fuente\/mundo-diario$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Mundo Diario' })).toBeVisible();
    await expect(page.locator('app-news-card')).toHaveCount(3);
    await expect(page.locator('app-source-section-filters')).toHaveCount(0);
  });
});

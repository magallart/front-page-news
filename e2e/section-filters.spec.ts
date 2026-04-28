import { expect, test } from '@playwright/test';

import { mockApiRoutes } from './helpers/api-mocks';

test.describe('Section Filters', () => {
  test('opens filters, applies source selection and supports quick-view preview', async ({ page }) => {
    await mockApiRoutes(page);
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/seccion/actualidad', { waitUntil: 'domcontentloaded' });

    const cards = page.locator('app-news-card');
    await expect(cards).toHaveCount(5);

    const toggleFilters = page.getByRole('button', { name: /mostrar filtros/i });
    await toggleFilters.click();

    const panel = page.locator('app-section-filters');
    await expect(panel).toBeVisible();

    await panel.getByRole('button', { name: /quitar todo/i }).click();
    await expect(cards).toHaveCount(0);
    await expect(page.locator('app-error-state')).toBeVisible();

    await panel.getByRole('button', { name: /seleccionar todo/i }).click();
    await expect(cards).toHaveCount(5);

    await panel.getByLabel('Mundo Diario').check();
    await panel.getByLabel('Actualidad 24').uncheck();
    await panel.getByLabel('Portada Nacional').uncheck();
    await panel.getByLabel('Boletin Justicia').uncheck();
    await panel.getByLabel('Salud y Ciencia').uncheck();
    await expect(cards).toHaveCount(1);

    const quickViewDialog = page.locator('.quick-view-dialog[role="dialog"]');

    await cards.first().locator('h3 button').click();
    await expect(quickViewDialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(quickViewDialog).toHaveCount(0);
  });

  test('does not render filters trigger in an empty section', async ({ page }) => {
    await mockApiRoutes(page);
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/seccion/deportes', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('button', { name: /filtros/i })).toHaveCount(0);
    await expect(page.locator('app-section-filters')).toHaveCount(0);
    await expect(page.locator('app-error-state')).toBeVisible();
  });
});

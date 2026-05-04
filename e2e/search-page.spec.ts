import { expect, test } from '@playwright/test';

import { mockApiRoutes } from './helpers/api-mocks';

test.describe('Search Page', () => {
  test('opens a search modal from the navbar and navigates only after finding results', async ({ page }) => {
    await mockApiRoutes(page);
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await page.locator('header').getByRole('button', { name: /buscar noticias/i }).click();
    await expect(page.getByRole('dialog', { name: /buscar noticias/i })).toBeVisible();

    await page.getByRole('searchbox', { name: /buscar noticias/i }).fill('vivienda');
    await page.getByRole('button', { name: /^buscar$/i }).click();

    await expect(page).toHaveURL(/\/buscar\?q=vivienda$/);
    await expect(page.locator('[data-testid="search-results-summary"]')).toContainText('1 resultados para "vivienda"');

    const cards = page.locator('app-news-card');
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText('Nuevas medidas para impulsar la vivienda asequible');

    await page.getByRole('button', { name: /filtrar medios/i }).click();
    const panel = page.locator('app-section-filters');
    await expect(panel).toBeVisible();

    await panel.getByRole('button', { name: /quitar todo/i }).click();
    await expect(cards).toHaveCount(0);
    await expect(page.locator('app-error-state')).toBeVisible();

    await panel.getByLabel('Actualidad 24').check();
    await expect(cards).toHaveCount(1);
  });

  test('shows an inline no-results message in the search modal and stays on the current page', async ({ page }) => {
    await mockApiRoutes(page);
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await page.locator('header').getByRole('button', { name: /buscar noticias/i }).click();
    await page.getByRole('searchbox', { name: /buscar noticias/i }).fill('termino inexistente');
    await page.getByRole('button', { name: /^buscar$/i }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('dialog')).toContainText('No encontramos resultados para "termino inexistente"');
  });
});

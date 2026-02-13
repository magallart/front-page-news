import { expect, test } from '@playwright/test';

test.describe('Section Filters', () => {
  test('opens filters, applies source filter, sort order and clear/select all', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/seccion/actualidad');

    const cards = page.locator('app-news-card');
    await expect(cards).toHaveCount(5);

    const toggleFilters = page.getByRole('button', { name: /mostrar filtros/i });
    await expect(toggleFilters).toBeVisible();
    await expect(page.locator('app-icon-filter')).toBeVisible();
    await toggleFilters.click();

    const panel = page.locator('app-section-filters');
    await expect(panel).toBeVisible();

    await panel.getByRole('button', { name: /quitar todo/i }).click();
    await expect(cards).toHaveCount(0);
    await expect(page.locator('app-error-state')).toBeVisible();

    await panel.getByRole('button', { name: /seleccionar todo/i }).click();
    await expect(cards).toHaveCount(5);

    await panel.getByLabel('Mundo Diario').check();
    await panel.getByLabel('Boletin Justicia').uncheck();
    await panel.getByLabel('Portada Nacional').uncheck();
    await panel.getByLabel('Actualidad 24').uncheck();
    await panel.getByLabel('Salud y Ciencia').uncheck();
    await expect(cards).toHaveCount(1);

    await panel.getByRole('radio', { name: 'Mas antiguas primero' }).check();
    await expect(cards.first()).toContainText('Actualidad internacional marcada por acuerdos energeticos');

    await page.getByRole('button', { name: /ocultar filtros/i }).click();
    await expect(panel).toBeHidden();
  });

  test('does not render filters trigger in empty section', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/seccion/deportes');

    await expect(page.getByRole('button', { name: /filtros/i })).toHaveCount(0);
    await expect(page.locator('app-section-filters')).toHaveCount(0);
    await expect(page.locator('app-error-state')).toBeVisible();
  });
});

import { expect, test } from '@playwright/test';

import { mockApiRoutes } from './helpers/api-mocks';

test.describe('Home Page', () => {
  test('renders editorial home blocks from API data', async ({ page }) => {
    await mockApiRoutes(page);
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');

    const carouselHero = page.locator('[data-testid="carousel-hero"]');
    await expect(page.locator('app-news-carousel')).toBeVisible();
    await expect(carouselHero.getByRole('heading', { level: 2 })).toContainText(
      'Acuerdo europeo para reforzar la seguridad energetica',
    );
    await expect(carouselHero.locator('p').first()).toContainText('actualidad');
    await expect(carouselHero.locator('[role="button"]')).toHaveClass(/text-left/);
    await expect(page.locator('#breaking-news')).toBeVisible();
    await expect(page.locator('#most-read-news')).toBeVisible();
    await expect(page.locator('app-section-block')).toHaveCount(4);
    await expect(page.locator('app-source-directory a[target="_blank"]')).toHaveCount(5);
    await expect(page.locator('app-source-directory')).toContainText('Mundo Diario');
    await expect(page.locator('app-source-directory')).toContainText('Salud y Ciencia');
    await expect(page.locator('#most-read-news a[aria-label="Ver noticias de Mundo Diario"]').first()).toHaveAttribute(
      'href',
      '/fuente/mundo-diario',
    );
  });

  test('opens and closes contextual quick-view modal from carousel', async ({ page }) => {
    await mockApiRoutes(page);
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');

    const quickViewDialog = page.locator('.quick-view-dialog[role="dialog"]');
    const heroHeading = page.locator('[data-testid="carousel-hero"] h2').first();
    const heroTitle = await heroHeading.textContent();

    await page.locator('app-news-carousel article [role="button"]').click();
    await expect(quickViewDialog).toBeVisible();
    await expect(quickViewDialog.locator('h1')).toContainText((heroTitle ?? '').trim());

    await page.locator('.quick-view-dialog button[aria-label="Cerrar modal"]').click();
    await expect(quickViewDialog).toHaveCount(0);

    await page.locator('app-news-carousel article [role="button"]').click();
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

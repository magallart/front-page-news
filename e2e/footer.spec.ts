import { expect, test } from '@playwright/test';

test.describe('Footer', () => {
  test('renders editorial content and legal routes work', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');

    const footer = page.locator('app-footer footer').first();
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('Secciones');
    await expect(footer).toContainText('Servicios');
    await expect(footer).toContainText('Enlaces de interes');
    await expect(footer).toContainText('Periodicos');
    await expect(footer).toContainText('Las ultimas noticias de distintos periodicos, reunidas en un solo lugar.');

    await footer.getByRole('link', { name: 'Aviso legal' }).click();
    await expect(page).toHaveURL(/\/aviso-legal$/);

    await page.goto('/');
    await footer.getByRole('link', { name: 'Privacidad' }).click();
    await expect(page).toHaveURL(/\/privacidad$/);

    await page.goto('/');
    await footer.getByRole('link', { name: 'Cookies' }).click();
    await expect(page).toHaveURL(/\/cookies$/);
  });

  test('keeps external links configured with target and rel', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');

    const externalLinks = page.locator('app-footer footer a[target="_blank"]');
    const count = await externalLinks.count();
    expect(count).toBeGreaterThanOrEqual(10);

    for (let index = 0; index < count; index += 1) {
      const rel = (await externalLinks.nth(index).getAttribute('rel')) ?? '';
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    }
  });

  test('visual regression: footer desktop snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');

    const footer = page.locator('app-footer footer').first();
    await expect(footer).toHaveScreenshot('footer-desktop.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('visual regression: footer mobile snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const footer = page.locator('app-footer footer').first();
    await expect(footer).toHaveScreenshot('footer-mobile.png', {
      maxDiffPixelRatio: 0.01,
    });
  });
});


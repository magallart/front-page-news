import { expect, test } from '@playwright/test';

import { mockApiRoutes } from './helpers/api-mocks';

test.describe('Footer', () => {
  test('renders logo, social links and navigates to legal routes', async ({ page }) => {
    await mockApiRoutes(page);
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');

    const footer = page.locator('app-footer footer').first();
    await expect(footer).toBeVisible();
    await expect(footer.locator('img[alt="Front Page News"]')).toBeVisible();

    await expect(footer.locator('a[aria-label="Facebook"]')).toBeVisible();
    await expect(footer.locator('a[aria-label="Instagram"]')).toBeVisible();
    await expect(footer.locator('a[aria-label="X"]')).toBeVisible();

    await footer.getByRole('link', { name: 'Aviso legal' }).click();
    await expect(page).toHaveURL(/\/aviso-legal$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Aviso legal' })).toBeVisible();

    await page.goto('/');
    await footer.getByRole('link', { name: 'Privacidad' }).click();
    await expect(page).toHaveURL(/\/privacidad$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Privacidad' })).toBeVisible();

    await page.goto('/');
    await footer.getByRole('link', { name: 'Cookies' }).click();
    await expect(page).toHaveURL(/\/cookies$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Cookies' })).toBeVisible();
  });

  test('keeps social external links with secure target/rel attributes', async ({ page }) => {
    await mockApiRoutes(page);
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');

    const socialLinks = page.locator('app-footer footer a[target="_blank"]');
    await expect(socialLinks).toHaveCount(3);

    for (let index = 0; index < 3; index += 1) {
      const rel = (await socialLinks.nth(index).getAttribute('rel')) ?? '';
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    }
  });
});


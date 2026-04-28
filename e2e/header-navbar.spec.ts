import { expect, test } from '@playwright/test';

import { mockApiRoutes } from './helpers/api-mocks';

test.describe('Header/Navbar', () => {
  test('desktop: sticky appears on scroll and side menu navigates to section', async ({ page }) => {
    await mockApiRoutes(page);
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');

    const stickyContainer = page.locator('app-navbar-sticky-header > div').first();
    await expect(stickyContainer).toHaveClass(/-translate-y-full/);

    await page.locator('#most-read').scrollIntoViewIfNeeded();
    await expect(stickyContainer).toHaveClass(/translate-y-0/);

    await page.getByRole('button', { name: 'Abrir menu' }).click();
    const sideMenu = page.locator('app-navbar-side-menu aside');
    await expect(sideMenu).toBeVisible();

    await sideMenu.getByRole('link', { name: 'Actualidad' }).click();
    await expect(page).toHaveURL(/\/seccion\/actualidad$/);
  });

  test('ticker uses text headlines and badge routes to /seccion/ultima-hora', async ({ page }) => {
    await mockApiRoutes(page);
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');

    const tickerHeadlineSpans = page.locator('app-navbar-ticker .ticker-sequence span.transition');
    await expect(tickerHeadlineSpans.first()).toBeVisible();
    await expect(page.locator('app-navbar-ticker .ticker-sequence a')).toHaveCount(0);

    await page.locator('app-navbar-ticker a[href="/seccion/ultima-hora"]').first().click();
    await expect(page).toHaveURL(/\/seccion\/ultima-hora$/);
  });

  test('mobile: sticky header is visible and side menu shows social links', async ({ page }) => {
    await mockApiRoutes(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const stickyContainer = page.locator('app-navbar-sticky-header > div').first();
    await expect(stickyContainer).toHaveClass(/translate-y-0/);

    const compactMeta = page.locator('app-navbar-sticky-header p');
    await expect(compactMeta).toHaveText('');

    const menuToggleButton = page.getByRole('button', { name: 'Abrir menu' });
    await menuToggleButton.click();
    const sideMenuDialog = page.getByRole('dialog', { name: 'Menu' });
    const sideMenu = page.locator('app-navbar-side-menu aside');
    await expect(sideMenu).toBeVisible();
    await expect(sideMenuDialog).toBeVisible();
    await expect(sideMenu.getByRole('button', { name: 'Cerrar menu' })).toBeFocused();

    await expect(sideMenu.locator('a[aria-label="Facebook"]')).toBeVisible();
    await expect(sideMenu.locator('a[aria-label="Instagram"]')).toBeVisible();
    await expect(sideMenu.locator('a[aria-label="X"]')).toBeVisible();
    await expect(sideMenu.locator('a[href="/seccion/ultima-hora"]')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(sideMenu).toHaveClass(/-translate-x-full/);
    await expect(menuToggleButton).toBeFocused();
  });
});

import { expect, test } from '@playwright/test';

test.describe('Header/Navbar', () => {
  test('desktop: sticky appears on scroll and side menu navigates to section', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');

    const stickyContainer = page.locator('app-navbar-sticky-header > div').first();
    await expect(stickyContainer).toHaveClass(/-translate-y-full/);

    await page.evaluate(() => window.scrollTo(0, 500));
    await expect(stickyContainer).toHaveClass(/translate-y-0/);

    await page.getByRole('button', { name: 'Abrir menu' }).click();
    const sideMenu = page.locator('app-navbar-side-menu aside');
    await expect(sideMenu).toBeVisible();

    await sideMenu.getByRole('link', { name: 'Actualidad' }).click();
    await expect(page).toHaveURL(/\/seccion\/actualidad$/);
  });

  test('desktop: ticker links route to article page', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');

    await page.addStyleTag({
      content: `
        .ticker-marquee {
          animation: none !important;
        }
      `,
    });

    await page.locator('app-navbar-ticker a').first().click();
    await expect(page).toHaveURL(/\/noticia\//);
  });

  test('mobile: sticky is visible immediately with compact meta and social icons', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const stickyContainer = page.locator('app-navbar-sticky-header > div').first();
    await expect(stickyContainer).toHaveClass(/translate-y-0/);

    const compactMeta = page.locator('app-navbar-sticky-header p');
    await expect(compactMeta).toContainText(/\d{2}-\d{2}-\d{2}\s\u00B7\s[A-Z\u00C1\u00C9\u00CD\u00D3\u00DA\u00DC\u00D1 ]+\s(?:--|\d+)\u00BAC/);

    await page.getByRole('button', { name: 'Abrir menu' }).click();
    const sideMenu = page.locator('app-navbar-side-menu aside');
    await expect(sideMenu).toBeVisible();

    await expect(sideMenu.locator('a[aria-label="Facebook"]')).toBeVisible();
    await expect(sideMenu.locator('a[aria-label="Instagram"]')).toBeVisible();
    await expect(sideMenu.locator('a[aria-label="X"]')).toBeVisible();
  });

  test('branding guards: colors, key texts, and logo images remain consistent', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');

    const stickyContainer = page.locator('app-navbar-sticky-header > div').first();
    const tickerBar = page.locator('app-navbar-ticker > div').first();
    const tickerBadge = page.locator('app-navbar-ticker .breaking-badge').first();
    const footer = page.locator('app-footer footer').first();

    await expect(tickerBadge).toContainText('Última hora');
    await expect(page.locator('app-navbar-main-header')).toContainText('FRONT PAGE');
    await expect(page.locator('app-navbar-main-header')).toContainText('NEWS');
    await expect(page.locator('app-footer')).toContainText(
      'Las ultimas noticias de distintos periodicos, reunidas en un solo lugar.',
    );

    const stickyLogo = page.locator('app-navbar-sticky-header img[alt="Front Page News"]').first();
    await expect(stickyLogo).toHaveAttribute('src', /\/images\/front-page-news-logo\.png$/);
    const footerLogo = page.locator('app-footer img[alt="Front Page News"]').first();
    await expect(footerLogo).toHaveAttribute('src', /\/images\/front-page-news-logo\.png$/);

    const palette = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      return {
        mustard: root.getPropertyValue('--mustard').trim(),
        metallicGold: root.getPropertyValue('--metallic-gold').trim(),
        shadowGrey: root.getPropertyValue('--shadow-grey').trim(),
      };
    });
    expect(palette.mustard).toContain('49, 100%, 35%');
    expect(palette.metallicGold).toContain('46, 65%, 52%');
    expect(palette.shadowGrey).toContain('0, 2%, 16%');

    const stickyBackground = await stickyContainer
      .locator('div[style*="background-color"]')
      .first()
      .evaluate((node) => window.getComputedStyle(node as HTMLElement).backgroundColor);
    const footerBackground = await footer.evaluate(
      (node) => window.getComputedStyle(node as HTMLElement).backgroundColor,
    );
    const tickerBackground = await tickerBar.evaluate(
      (node) => window.getComputedStyle(node as HTMLElement).backgroundColor,
    );
    const badgeBackground = await tickerBadge.evaluate(
      (node) => window.getComputedStyle(node as HTMLElement).backgroundColor,
    );
    const pageBackground = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);

    expect(stickyBackground).toBe(footerBackground);
    expect(tickerBackground).toBe(footerBackground);
    expect(badgeBackground).not.toBe(footerBackground);
    expect(pageBackground).not.toBe(footerBackground);
  });

});

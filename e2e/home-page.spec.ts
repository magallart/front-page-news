import { expect, test, type Page } from '@playwright/test';

test.describe('Home Page', () => {
  test('renders editorial sections and most-read with 10 entries', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');

    await expect(page.locator('app-section-block').first()).toContainText('Actualidad');
    await expect(page.locator('app-section-block').nth(1)).toContainText('Economia');
    await expect(page.locator('app-section-block').nth(2)).toContainText('Cultura');

    const ctaLinks = page.locator('app-section-block a:has-text("Ver más")');
    await expect(ctaLinks).toHaveCount(3);
    await expect(page.locator('app-section-block app-icon-arrow-right')).toHaveCount(3);

    await expect(page.locator('#most-read-news')).toContainText('Lo más leído');
    await expect(page.locator('#most-read-news app-icon-trending-up')).toBeVisible();
    await expect(page.locator('#most-read-news ol > li')).toHaveCount(10);
  });

  test('keeps right column width consistent between breaking and most-read', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');

    const breakingWidth = await page.locator('#breaking-news').evaluate((node) =>
      Math.round((node as HTMLElement).getBoundingClientRect().width),
    );
    const mostReadWidth = await page.locator('#most-read-news').evaluate((node) =>
      Math.round((node as HTMLElement).getBoundingClientRect().width),
    );

    expect(Math.abs(breakingWidth - mostReadWidth)).toBeLessThanOrEqual(2);
  });

  test('keeps typography, colors and spacing tokens for editorial blocks', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');

    const styleInfo = await page.evaluate(() => {
      const title = document.querySelector('app-news-card h3') as HTMLElement | null;
      const summary = document.querySelector('app-news-card p.font-editorial-body') as HTMLElement | null;
      const mostRead = document.querySelector('#most-read-news') as HTMLElement | null;
      const root = getComputedStyle(document.documentElement);
      const cssSecondary = root.getPropertyValue('--secondary').trim();
      const cssPrimary = root.getPropertyValue('--primary').trim();

      const cardImage = document.querySelector('app-news-card img') as HTMLImageElement | null;
      const imageRatio = cardImage
        ? Math.round((cardImage.getBoundingClientRect().width / cardImage.getBoundingClientRect().height) * 100) /
          100
        : 0;

      return {
        titleFontFamily: title ? getComputedStyle(title).fontFamily : '',
        summaryFontFamily: summary ? getComputedStyle(summary).fontFamily : '',
        mostReadBackground: mostRead ? getComputedStyle(mostRead).backgroundColor : '',
        cssSecondary,
        cssPrimary,
        imageRatio,
      };
    });

    expect(styleInfo.titleFontFamily).toContain('DM Serif Text');
    expect(styleInfo.summaryFontFamily).toContain('Commissioner');
    expect(styleInfo.cssSecondary).toContain('0 2% 16%');
    expect(styleInfo.cssPrimary).toContain('46 65% 52%');
    expect(styleInfo.mostReadBackground).not.toBe('rgba(0, 0, 0, 0)');
    expect(styleInfo.imageRatio).toBeGreaterThanOrEqual(1.7);
    expect(styleInfo.imageRatio).toBeLessThanOrEqual(1.85);
  });

  test('visual regression: home content desktop snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');
    await stabilizeVisualState(page);

    const content = page.locator('#current-news');
    await expect(content).toHaveScreenshot('home-content-desktop.png', {
      maxDiffPixelRatio: 0.02,
      timeout: 10_000,
    });
  });

  test('visual regression: home content mobile snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await stabilizeVisualState(page);

    const content = page.locator('#current-news');
    await expect(content).toHaveScreenshot('home-content-mobile.png', {
      maxDiffPixelRatio: 0.02,
      timeout: 10_000,
    });
  });
});

async function stabilizeVisualState(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      .ticker-marquee,
      .breaking-badge,
      .live-dot {
        animation: none !important;
      }
    `,
  });
}

import { expect, test } from '@playwright/test';

const routes = ['/', '/projects/', '/about/', '/tags/'];

test.describe('internationalisation', () => {
  test.use({ locale: 'zh-CN' });

  test('the default follows the browser language', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
    await expect(page.locator('[data-i18n="nav.home"]').first()).toHaveText('首页');
  });

  test('an English browser defaults to English', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'en-US' });
    const page = await context.newPage();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('[data-i18n="nav.home"]').first()).toHaveText('Home');
    await context.close();
  });

  test('switching to English translates the whole interface', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
    await expect(page.locator('.lab-copy h1')).toContainText('Alun');
    await expect(page.locator('[data-i18n="nav.home"]').first()).toHaveText('首页');

    await page.locator('[data-lang-target]').first().click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('[data-i18n="nav.home"]').first()).toHaveText('Home');
    await expect(page.locator('[data-i18n="home.ctaWork"]')).toHaveText('See the work');
    await expect(page.locator('[data-i18n="home.lede"]')).toContainText('Developer, director and photographer');
    await expect(page.locator('.showcase-kicker').first()).toHaveText('What I do');
    await expect(page.locator('[data-i18n="footer.builtWith"]')).toContainText('Built with Astro');
  });

  test('the language survives a reload', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
    await page.locator('[data-lang-target]').first().click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('[data-i18n="nav.work"]').first()).toHaveText('Work');
  });

  test('every route is fully translated', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
    await page.locator('[data-lang-target]').first().click();

    const expectations: Record<string, Array<[string, string]>> = {
      '/': [['nav.home', 'Home'], ['home.lede', 'Developer, director and photographer. I turn hard problems in imaging, interaction and automation into products you can actually use.']],
      '/projects/': [['work.technical', 'Technical work'], ['work.source', 'Source']],
      '/about/': [['about.title', 'Alun'], ['about.stackTitle', 'Stack I reach for']],
      '/tags/': [['archive.title', 'Writing archive'], ['archive.all', 'All']],
    };

    for (const route of routes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      for (const [key, expected] of expectations[route]) {
        await expect(page.locator(`[data-i18n="${key}"]`).first()).toHaveText(expected);
      }
      const leftover = await page.evaluate(() =>
        [...document.querySelectorAll('[data-i18n]')].filter((element) => /[一-龥]/.test(element.textContent ?? '')).length,
      );
      expect(leftover, `no Chinese left on ${route}`).toBe(0);
    }
  });

  test('demo groups are translated on the work page', async ({ page }) => {
    await page.goto('/projects/', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-lang-target]').first().click();
    await expect(page.locator('.demo-group h3')).toHaveText(['Tools', 'Games', 'Focus & life', 'Experiments']);
    await expect(page.locator('.demo-group header p').first()).toContainText('Browser tools');
  });
});

test.describe('theming', () => {
  test('the explicit theme overrides the system preference', async ({ browser }) => {
    const dark = await browser.newContext({ colorScheme: 'dark' });
    const darkPage = await dark.newPage();
    await darkPage.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(darkPage.locator('html')).not.toHaveAttribute('data-theme', 'light');
    await expect(darkPage.locator('body')).toHaveCSS('background-color', 'rgb(30, 27, 58)');
    await dark.close();

    const light = await browser.newContext({ colorScheme: 'light' });
    const lightPage = await light.newPage();
    await lightPage.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(lightPage.locator('html')).not.toHaveAttribute('data-theme', 'dark');
    await expect(lightPage.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await light.close();
  });

  test('the toggle flips and persists the theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');

    await page.locator('[data-theme-target]').first().click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(30, 27, 58)');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(30, 27, 58)');
  });

  test('body text keeps AA contrast in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const ratio = await page.evaluate(() => {
      const element = document.querySelector('[data-i18n="home.lede"]');
      if (!element) return 0;
      const parse = (value: string) => value.match(/[\d.]+/g)!.slice(0, 3).map(Number);
      const luminance = (rgb: number[]) => {
        const channel = (v: number) => {
          const s = v / 255;
          return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
      };
      const text = luminance(parse(getComputedStyle(element).color));
      let node: Element | null = element;
      let background = 'rgb(0, 0, 0)';
      while (node) {
        const value = getComputedStyle(node).backgroundColor;
        if (value && !/rgba\(0, 0, 0, 0\)|transparent/.test(value)) {
          background = value;
          break;
        }
        node = node.parentElement;
      }
      const ground = luminance(parse(background));
      return (Math.max(text, ground) + 0.05) / (Math.min(text, ground) + 0.05);
    });

    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});

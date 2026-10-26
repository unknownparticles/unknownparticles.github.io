import { expect, test } from '@playwright/test';

const routes = [
  '/',
  '/projects/',
  '/tags/',
  '/about/',
  '/page2/',
  '/2024/03/19/opengl万字超全笔记/',
  '/offline.html',
];

for (const route of routes) {
  test(`${route} renders without horizontal overflow`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1').first()).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
}

test('home exposes content below the hero', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.post-card')).toHaveCount(10);
  await expect(page.locator('#latest-posts')).toBeInViewport();
});

test('mobile navigation opens and closes with Escape', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile-only interaction');
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const toggle = page.locator('.nav-toggle');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.site-nav')).toHaveAttribute('data-open', 'true');

  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('portfolio portrait is loaded locally', async ({ page }) => {
  await page.goto('/projects/', { waitUntil: 'domcontentloaded' });
  const portrait = page.locator('.portfolio-avatar');
  await expect(portrait).toBeVisible();
  expect(await portrait.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
});

test('service worker serves the offline fallback', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'One browser run is sufficient');
  const context = await browser.newContext({ serviceWorkers: 'allow' });
  const page = await context.newPage();
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.goto('/not-cached-during-test/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: '暂时无法连接网络' })).toBeVisible();
  await context.close();
});

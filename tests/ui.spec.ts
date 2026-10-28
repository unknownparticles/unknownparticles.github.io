import { expect, test } from '@playwright/test';

const routes = [
  '/',
  '/projects/',
  '/tags/',
  '/about/',
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

test('the home page exposes work, capabilities and writing', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.showcase-card')).toHaveCount(4);
  await expect(page.locator('.capability-list li')).toHaveCount(4);
  await expect(page.locator('.home-post')).toHaveCount(10);
});

test('the portfolio page renders the live GitHub data', async ({ page }) => {
  await page.goto('/projects/', { waitUntil: 'domcontentloaded' });
  const projects = page.locator('.work-piece');
  await expect(projects).toHaveCount(5);
  await expect(projects.first().locator('h2')).not.toBeEmpty();
  await expect(page.locator('.work-languages p')).toHaveCount(5);

  const links = page.locator('.work-piece a, .work-index a');
  const count = await links.count();
  expect(count).toBeGreaterThan(5);
  for (let index = 0; index < count; index += 1) {
    const href = await links.nth(index).getAttribute('href');
    expect(href).toMatch(/^https:\/\/(github\.com\/unknownparticles\/[^/]+|alunapp\.cn\/[^/]+\/|unknownparticles\.github\.io\/[^/]+\/)$/);
  }
});

test('mobile navigation opens and closes with Escape', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile-only interaction');
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const toggle = page.locator('.nav-toggle');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.site-nav')).toHaveAttribute('data-open', 'true');
  await expect(page.locator('.site-nav a')).toHaveCount(4);

  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('the hero and project content are visible', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.lab-copy')).toBeVisible();
  await page.locator('#selected-work').scrollIntoViewIfNeeded();
  await expect(page.locator('.showcase-card').first()).toBeVisible();
  await expect(page.locator('.home-post').first()).toBeVisible();
});

test('the 3D scene is the only visual above the fold', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const aboveFold = await page.evaluate(() =>
    [...document.images].filter((image) => {
      const rect = image.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    }).length,
  );
  expect(aboveFold).toBe(0);
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

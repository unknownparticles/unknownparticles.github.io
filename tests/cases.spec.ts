import { expect, test } from '@playwright/test';

const slugs = ['jpeg-info', 'photo', 'this-site'];

test('selected work leads into complete engineering cases', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.showcase-card')).toHaveCount(3);
  await expect(page.locator('.site-nav a').last()).toHaveAttribute('href', 'https://github.com/unknownparticles');
  const order = await page.locator('main > div, main > section').evaluateAll((nodes) =>
    nodes.map((node) => node.id || node.className));
  expect(order.indexOf('selected-work')).toBeLessThan(order.indexOf('capability-section'));
  await expect(page.locator('.mondrian')).toHaveCount(0);
  const previews = page.locator('.showcase-preview');
  const links = await previews.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));
  expect(links).toEqual(slugs.map((slug) => `/projects/${slug}/`));

  for (const href of links) {
    const response = await page.goto(href!);
    expect(response?.status()).toBe(200);
    await expect(page.locator('.case-section')).toHaveCount(5);
    await expect(page.locator('.case-evidence li a')).toHaveCount(4);
    await expect(page.locator('.case-flow li')).toHaveCount(4);
    const ids = await page.locator('.case-section').evaluateAll((nodes) => nodes.map((node) => node.id));
    expect(ids).toEqual(['problem', 'implementation', 'tradeoffs', 'verification', 'limits']);
    await page.locator('.case-actions a[href="#case-evidence"]').click();
    await expect(page.locator('#case-evidence')).toBeInViewport();
  }
});

test('selected reading keeps real article URLs', async ({ page }) => {
  await page.goto('/');
  const links = await page.locator('.selected-writing__list a').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));
  expect(links).toHaveLength(3);
  for (const href of links) {
    expect(href).toMatch(/^\/2024\//);
    const response = await page.goto(href!);
    expect(response?.status()).toBe(200);
    await expect(page.locator('.post-hero h1')).toBeVisible();
  }
});

test('case titles and descriptions follow the selected language', async ({ page }) => {
  await page.goto('/projects/jpeg-info/');
  await page.evaluate(() => window.__alun.applyLang('en'));
  await expect(page).toHaveTitle('JPEG metadata parser · Engineering case');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Reads JPEG/);
  await page.reload();
  await expect(page).toHaveTitle('JPEG metadata parser · Engineering case');
  await page.evaluate(() => window.__alun.applyLang('zh'));
  await expect(page).toHaveTitle('JPEG 元数据解析器 · 技术案例');
});

test('cases remain readable across widths, themes and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  for (const slug of slugs) {
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/projects/${slug}/`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(overflow, `${slug} at ${width}`).toBeLessThanOrEqual(0);
      const text = page.locator('.case-section p').first();
      await expect(text).toBeVisible();
      expect(await text.evaluate((node) => node.getBoundingClientRect().width)).toBeGreaterThan(280);
    }
  }
});

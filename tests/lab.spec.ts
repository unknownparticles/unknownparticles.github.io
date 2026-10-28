import { expect, test, type Page } from '@playwright/test';

async function shapeCount(page: Page) {
  return page.locator('#shape-stage .shape').count();
}

test.describe('interactive geometry', () => {
  test('the hero spawns shapes inside its stage', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect.poll(() => shapeCount(page), { timeout: 6_000 }).toBeGreaterThan(5);

    const box = await page.locator('#shape-stage').boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(600);

    const shapes = page.locator('#shape-stage .shape');
    for (let index = 0; index < await shapes.count(); index += 1) {
      await expect(shapes.nth(index)).toHaveAttribute('aria-label', /几何形状/);
    }
  });

  test('shapes drift over time and stay inside the stage', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect.poll(() => shapeCount(page), { timeout: 6_000 }).toBeGreaterThan(5);

    const first = page.locator('#shape-stage .shape').first();
    const before = await first.evaluate((node) => getComputedStyle(node).transform);
    await page.waitForTimeout(700);
    const after = await first.evaluate((node) => getComputedStyle(node).transform);
    expect(after).not.toBe(before);

    const stage = await page.locator('#shape-stage').boundingBox();
    const shape = await first.boundingBox();
    expect(shape!.x).toBeGreaterThanOrEqual(stage!.x - 80);
    expect(shape!.x + shape!.width).toBeLessThanOrEqual(stage!.x + stage!.width + 80);
  });

  test('clicking a shape changes its colour', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect.poll(() => shapeCount(page), { timeout: 6_000 }).toBeGreaterThan(5);

    const first = page.locator('#shape-stage .shape').first();
    const before = await first.evaluate((node) => getComputedStyle(node).backgroundColor);
    await first.click({ force: true });
    await page.waitForTimeout(500);
    const after = await first.evaluate((node) => getComputedStyle(node).backgroundColor);
    expect(after).not.toBe(before);
  });

  test('fewer shapes on a phone, and no drag hijack', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect.poll(() => shapeCount(page), { timeout: 6_000 }).toBeGreaterThan(4);
    const count = await shapeCount(page);
    expect(count).toBeLessThan(12);

    // A vertical swipe must scroll the page, not drag a shape.
    await page.mouse.move(195, 420);
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(300);
    const scrolled = await page.evaluate(() => window.scrollY);
    expect(scrolled).toBeGreaterThan(100);
  });

  test('reduced motion renders the hero without shapes', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.lab-hero')).toBeVisible();
    await expect(page.locator('#shape-stage .shape')).toHaveCount(0);
  });

  test('the shape script is not a synchronous page script', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const scripts = await page.locator('script[src]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('src')));
    expect(scripts.some((src) => /shapes\..+\.js/.test(src ?? ''))).toBe(false);
    await expect.poll(() => shapeCount(page), { timeout: 6_000 }).toBeGreaterThan(5);
  });
});

test.describe('work and archive', () => {
  test('all project preview assets decode', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('#selected-work').scrollIntoViewIfNeeded();
    const images = page.locator('.showcase-preview img');
    await expect(images).toHaveCount(2);
    for (let index = 0; index < 2; index += 1) {
      await expect
        .poll(() => images.nth(index).evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0))
        .toBe(true);
    }
  });

  test('tag archive filters without navigating', async ({ page }) => {
    await page.goto('/tags/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.archive-list li')).toHaveCount(12);
    await page.locator('[data-filter="OpenGL"]').click();
    await expect(page.locator('.archive-list li:not([hidden])')).toHaveCount(3);
  });
});

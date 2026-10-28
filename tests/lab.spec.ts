import { expect, test, type Page } from '@playwright/test';

async function canvasSignal(page: Page) {
  return page.locator('#lab-scene canvas').evaluate((canvas: HTMLCanvasElement) => {
    const sample = document.createElement('canvas');
    sample.width = 64;
    sample.height = 64;
    const context = sample.getContext('2d');
    if (!context) return { nonEmpty: 0, variance: 0 };
    context.drawImage(canvas, 0, 0, 64, 64);
    const data = context.getImageData(0, 0, 64, 64).data;
    let nonEmpty = 0;
    let total = 0;
    let totalSquared = 0;
    for (let index = 0; index < data.length; index += 4) {
      const value = data[index] + data[index + 1] + data[index + 2] + data[index + 3];
      if (value > 0) nonEmpty += 1;
      total += value;
      totalSquared += value * value;
    }
    const count = data.length / 4;
    const mean = total / count;
    return { nonEmpty, variance: totalSquared / count - mean * mean };
  });
}

test.describe('lab scene and project media', () => {
  test('desktop 3D scene renders nonblank pixels and moves', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const canvas = page.locator('#lab-scene canvas');
    await expect(canvas).toBeVisible({ timeout: 5_000 });
    await page.waitForTimeout(350);
    const first = await canvasSignal(page);
    expect(first.nonEmpty).toBeGreaterThan(40);
    expect(first.variance).toBeGreaterThan(1);

    await page.mouse.move(1100, 240);
    await page.waitForTimeout(400);
    const second = await canvasSignal(page);
    expect(second.nonEmpty).toBeGreaterThan(40);
    expect(second.variance).not.toBe(first.variance);
  });

  test('mobile 3D scene stays inside its hero', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const canvas = page.locator('#lab-scene canvas');
    await expect(canvas).toBeVisible({ timeout: 5_000 });
    await page.waitForTimeout(350);
    const box = await canvas.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(390);
    expect(box?.height ?? 0).toBeGreaterThan(500);
    const signal = await canvasSignal(page);
    expect(signal.nonEmpty).toBeGreaterThan(30);
  });

  test('reduced motion keeps the static hero and skips WebGL', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1_500);
    await expect(page.locator('.lab-hero')).toBeVisible();
    await expect(page.locator('#lab-scene canvas')).toHaveCount(0);
  });

  test('tag archive filters without navigating', async ({ page }) => {
    await page.goto('/tags/', { waitUntil: 'domcontentloaded' });
    const allRows = page.locator('.archive-list li');
    await expect(allRows).toHaveCount(12);
    const button = page.locator('[data-filter="OpenGL"]');
    await button.click();
    await expect(page.locator('.archive-result')).toContainText('OpenGL: 3 posts');
    await expect(page.locator('.archive-list li:not([hidden])')).toHaveCount(3);
    expect(page.url()).toContain('#OpenGL');
  });

  test('Three.js is not a synchronous page script', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const scripts = await page.locator('script[src]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('src')));
    expect(scripts.some((src) => /lab-scene\..+\.js/.test(src ?? ''))).toBe(false);
    await expect(page.locator('#lab-scene canvas')).toBeVisible({ timeout: 5_000 });
  });

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

  test('brand click easter egg toggles debug mode', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const brand = page.locator('.site-brand');
    for (let index = 0; index < 5; index += 1) await brand.click();
    await expect(page.locator('html')).toHaveClass(/debug-mode/);
  });
});

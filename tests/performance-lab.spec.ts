import { expect, test } from '@playwright/test';

const route = '/2024/08/14/浅谈c性能优化/';
test.beforeEach(async ({ page }) => {
  await page.goto(route);
});

test('window sums agree while reads decrease; changing k resets progress', async ({ page }) => {
  const panel = page.locator('performance-demo[data-mode="window"]');
  for (let i = 0; i < 4; i++) await panel.locator('[data-step]').click();
  await expect(panel.locator('[data-first-info]')).toHaveText('累计取值 20 次；窗口和：17、21、22、19');
  await expect(panel.locator('[data-second-info]')).toHaveText('累计取值 11 次；窗口和：17、21、22、19');
  await expect(panel.locator('[data-step]')).toBeDisabled();
  await panel.locator('[data-size]').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(panel.locator('[data-status]')).toHaveText('进度 0 / 5');
  await expect(panel.locator('[data-first-info]')).toContainText('累计取值 0 次');
  await panel.locator('[data-step]').click();
  await expect(panel.locator('[data-first-info]')).toContainText('窗口和：13');
  await expect(panel.locator('[data-second-info]')).toContainText('窗口和：13');
});

test('split boundary processing reaches identical matrix without changing corners twice', async ({ page }) => {
  const panel = page.locator('performance-demo[data-mode="boundary"]');
  for (let i = 0; i < 48; i++) await panel.locator('[data-step]').click();
  const a = await panel.locator('[data-first] span').allTextContents();
  const b = await panel.locator('[data-second] span').allTextContents();
  expect(a).toEqual(b);
  expect(a.filter((value) => value === '-1')).toHaveLength(24);
  expect(a.filter((value) => value === '1')).toHaveLength(24);
  await expect(panel.locator('[data-first-info]')).toContainText('逐元素边界分类 48 次');
  await expect(panel.locator('[data-second-info]')).toContainText('完成边缘 24 个、内部 24 个');
  await panel.locator('[data-reset]').click();
  await expect(panel.locator('[data-first] span')).toHaveText(Array(48).fill('0'));
});

test('locality displays real strides and equal final sums', async ({ page }) => {
  const panel = page.locator('performance-demo[data-mode="locality"]');
  await panel.locator('[data-step]').click();
  await panel.locator('[data-step]').click();
  await expect(panel.locator('[data-first-info]')).toContainText('间隔 64 字节');
  await expect(panel.locator('[data-second-info]')).toContainText('间隔 8 字节');
  for (let i = 2; i < 48; i++) await panel.locator('[data-step]').click();
  for (const selector of ['[data-first-info]', '[data-second-info]'])
    await expect(panel.locator(selector)).toContainText('总和 1128');
});

test('play can pause and reset; reduced motion never auto starts', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const panel = page.locator('performance-demo[data-mode="window"]');
  await expect(panel.locator('[data-status]')).toHaveText('进度 0 / 4');
  await panel.locator('[data-play]').click();
  await expect(panel.locator('[data-play]')).toHaveText('暂停');
  await expect(panel.locator('[data-status]')).toHaveText('进度 1 / 4', { timeout: 4000 });
  await panel.locator('[data-play]').click();
  const before = await panel.locator('[data-status]').textContent();
  await page.waitForTimeout(1500);
  await expect(panel.locator('[data-status]')).toHaveText(before!);
  await panel.locator('[data-reset]').click();
  await expect(panel.locator('[data-status]')).toHaveText('进度 0 / 4');
  await expect(panel.locator('[data-play]')).toHaveAttribute('aria-pressed', 'false');
});

test('lab works in dark mode at supported widths and downloads real code', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const lab = page.locator('#performance-lab');
    await lab.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(0);
    expect(await lab.evaluate((node) => node.scrollWidth-node.clientWidth)).toBeLessThanOrEqual(0);
    for (const button of await lab.locator('button').all()) {
      expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
  }
  for (const file of ['cpp-optimization.cpp', 'cpp-matrix.cpp']) {
    const response = await page.request.get('/examples/'+file);
    expect(response.ok()).toBe(true);
    expect(await response.text()).toContain('int main(');
  }
});

test('article has all optimization topics and no demo on other articles', async ({ page }) => {
  for (const name of ['滑动窗口', '减少 if', '内存访问', '查表', '少分配', '量化', 'SIMD', '多线程', '编译器优化'])
    await expect(page.locator('.prose h2').filter({ hasText: name })).toHaveCount(1);
  await page.goto('/2024/03/19/硬解jpeg的exif信息/');
  await expect(page.locator('performance-demo')).toHaveCount(0);
});

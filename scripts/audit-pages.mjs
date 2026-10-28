import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const routes = [
  ['home', '/'],
  ['projects', '/projects/'],
  ['about', '/about/'],
  ['tags', '/tags/'],
  ['article', '/2024/03/19/opengl万字超全笔记/'],
];

await mkdir('/tmp/site-audit', { recursive: true });
const browser = await chromium.launch({ headless: true });
for (const [name, route] of routes) {
  for (const [size, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height }, serviceWorkers: 'block' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto(`http://127.0.0.1:4321${route}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1400);
    await page.screenshot({ path: `/tmp/site-audit/${name}-${size}.png`, fullPage: true });
    console.log(JSON.stringify({ name, size, status: response?.status(), errors, height: await page.evaluate(() => document.documentElement.scrollHeight) }));
    await context.close();
  }
}
await browser.close();

import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const routes = [
  ['home', '/'],
  ['projects', '/projects/'],
  ['about', '/about/'],
  ['tags', '/tags/'],
];

await mkdir('/tmp/theme-audit', { recursive: true });
const browser = await chromium.launch({ headless: true });

for (const [theme] of [['light'], ['dark']]) {
  for (const lang of ['zh-CN', 'en-US']) {
    for (const [name, route] of routes) {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        colorScheme: theme,
        locale: lang,
        serviceWorkers: 'block',
      });
      const page = await context.newPage();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`http://127.0.0.1:4321${route}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500);
      await page.screenshot({ path: `/tmp/theme-audit/${name}-${theme}-${lang}.png`, fullPage: false });
      const state = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        bg: getComputedStyle(document.body).backgroundColor,
        lang: document.documentElement.lang,
      }));
      console.log(JSON.stringify({ name, theme, lang, ...state }));
      await context.close();
    }
  }
}
await browser.close();

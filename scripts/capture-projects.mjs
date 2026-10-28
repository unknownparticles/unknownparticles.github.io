import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const projects = [
  { slug: 'Electronic-Woodfish', path: '/Electronic-Woodfish/' },
  { slug: 'photo', path: '/photo/' },
  { slug: 'TidyUp', path: '/TidyUp-/' },
  { slug: 'RepLog', path: '/RepLog/' },
  { slug: 'focuslab', path: '/focuslab/' },
];

const out = new URL('../public/img/projects/', import.meta.url);
await mkdir(out, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ['--host-resolver-rules=MAP alunapp.cn 185.199.111.153'],
});

for (const project of projects) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    serviceWorkers: 'block',
  });
  const page = await context.newPage();
  try {
    const response = await page.goto(`https://alunapp.cn${project.path}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await page.waitForTimeout(2_000);
    if (!response || response.status() >= 400) {
      console.error(`${project.slug}: ${response?.status() ?? 'no response'}`);
    } else {
      await page.screenshot({
        path: new URL(`${project.slug}.png`, out).pathname,
        fullPage: false,
      });
      console.log(`${project.slug}: ${response.status()} ${page.url()}`);
    }
  } catch (error) {
    console.error(`${project.slug}: ${error.message}`);
  }
  await context.close();
}
await browser.close();

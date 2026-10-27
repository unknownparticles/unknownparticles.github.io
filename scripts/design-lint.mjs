/**
 * Runs the Hallmark design gates over this project's sources.
 *
 * Hallmark (github.com/Nutlope/hallmark, MIT) is a design skill, not a dependency:
 * its linter is executed from a local checkout so the rule set stays inspectable.
 * Set HALLMARK_DIR to point at a checkout; the script says so plainly when absent.
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const candidates = [
  process.env.HALLMARK_DIR,
  '/tmp/hallmark/skills/hallmark/scripts/sloplint.mjs',
].filter(Boolean);

const linter = candidates.find((path) => existsSync(path));

if (!linter) {
  console.log('Hallmark linter not found. Clone it and set HALLMARK_DIR:');
  console.log('  git clone https://github.com/Nutlope/hallmark /tmp/hallmark');
  console.log('  HALLMARK_DIR=/tmp/hallmark/skills/hallmark/scripts/sloplint.mjs npm run lint:design');
  process.exit(0);
}

const chromeCandidates = [
  process.env.CHROME_PATH,
  join(process.env.HOME ?? '', 'Library/Caches/ms-playwright'),
].filter(Boolean);

function findChrome() {
  for (const root of chromeCandidates) {
    if (!existsSync(root)) continue;
    if (root.endsWith('Google Chrome for Testing') || root.endsWith('Chromium')) return root;
    for (const entry of readdirSync(root)) {
      if (!/chromium/i.test(entry)) continue;
      for (const app of ['Google Chrome for Testing.app', 'Chromium.app']) {
        const binary = join(root, entry, 'chrome-mac-arm64', app, 'Contents', 'MacOS', app === 'Chromium.app' ? 'Chromium' : 'Google Chrome for Testing');
        if (existsSync(binary) && statSync(binary).isFile()) return binary;
      }
    }
  }
  return undefined;
}

const args = [join('src'), join('public'), '--genre', 'modern-minimal', '--scope', 'page', '--render', '--url', 'http://127.0.0.1:4321/'];
const chrome = findChrome();

if (!chrome) {
  console.log('No Chrome found for the render tier; running the static gates only.');
  args.splice(args.indexOf('--render'), 2);
} else {
  process.env.CHROME_PATH = chrome;
}

const result = spawnSync(process.execPath, [linter, ...args], { stdio: 'inherit', env: process.env });
process.exit(result.status ?? 1);

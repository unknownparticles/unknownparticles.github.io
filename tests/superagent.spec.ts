import { expect, test } from '@playwright/test';
const route='/2026/11/04/superagent工程拆解/';

test('routing filters noise and duplicates and sends follow-ups to the existing task',async({page})=>{
  await page.goto(route);
  const panel=page.locator('superagent-replay');
  for(let i=0;i<3;i++)await panel.locator('[data-step]').click();
  await expect(panel.locator('[data-router]')).toHaveText('1');
  await expect(panel.locator('[data-tasks]')).toContainText('输入 1 条');
  await panel.locator('[data-step]').click();
  await expect(panel.locator('[data-current]')).toContainText('重复事件');
  await panel.locator('[data-step]').click();
  await expect(panel.locator('[data-tasks]')).toContainText('输入 2 条');
  await expect(panel.locator('[data-router]')).toHaveText('1');
  for(let i=5;i<8;i++)await panel.locator('[data-step]').click();
  await expect(panel.locator('[data-router]')).toHaveText('2');
  await expect(panel.locator('[data-results]')).toHaveText('2');
  await expect(panel.locator('[data-step]')).toBeDisabled();
});

test('recovery keeps one result and refuses old generation and duplicate callbacks',async({page})=>{
  await page.goto(route);const panel=page.locator('superagent-replay');
  await panel.locator('[data-scenario]').selectOption('recovery');
  for(let i=0;i<4;i++)await panel.locator('[data-step]').click();
  await expect(panel.locator('[data-tasks]')).toContainText('代次 2');
  await expect(panel.locator('[data-current]')).toContainText('拒绝过期');
  await expect(panel.locator('[data-results]')).toHaveText('0');
  await panel.locator('[data-step]').click();
  await expect(panel.locator('[data-results]')).toHaveText('1');
  await panel.locator('[data-step]').click();
  await expect(panel.locator('[data-results]')).toHaveText('1');
  await panel.locator('[data-reset]').click();
  await expect(panel.locator('[data-results]')).toHaveText('0');
  await expect(panel.locator('[data-status]')).toHaveText('进度 0 / 6');
});

test('context budget preserves references and reads the local full documents',async({page})=>{
  await page.goto(route);const panel=page.locator('superagent-context');
  const range=panel.locator('[data-budget]');await range.focus();await page.keyboard.press('Home');
  await expect(panel.locator('[data-budget-value]')).toHaveText('120');
  const context=await panel.locator('[data-context]').textContent();
  expect(context!.length).toBeLessThanOrEqual(120);
  for(const id of ['event:review','thread:42','task:fix-42'])expect(context).toContain(id);
  await panel.locator('[data-read]').click();
  await expect(panel.locator('[data-documents]')).toBeVisible();
  await expect(panel.locator('[data-documents] h4')).toHaveCount(3);
  await panel.locator('[data-read]').click();await expect(panel.locator('[data-documents]')).toBeHidden();
});

test('play pauses, scenario changes reset, and reduced motion does not auto-play',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(route);
  const panel=page.locator('superagent-replay');await expect(panel.locator('[data-status]')).toHaveText('进度 0 / 8');
  await panel.locator('[data-play]').click();await expect(panel.locator('[data-play]')).toHaveText('暂停');
  await expect(panel.locator('[data-status]')).toHaveText('进度 1 / 8',{timeout:4000});
  await panel.locator('[data-play]').click();const status=await panel.locator('[data-status]').textContent();
  await page.waitForTimeout(1700);await expect(panel.locator('[data-status]')).toHaveText(status!);
  await panel.locator('[data-scenario]').selectOption('recovery');await expect(panel.locator('[data-status]')).toHaveText('进度 0 / 6');
});

test('article source, diagrams, download and narrow dark layout work',async({page})=>{
  await page.emulateMedia({colorScheme:'dark'});await page.goto(route);
  await expect(page.locator('.prose a[href="https://mp.weixin.qq.com/s/zoS7GlReWPhfCjENGxXCdg"]').first()).toBeAttached();
  await expect(page.locator('.prose img')).toHaveCount(3);
  await page.locator('.prose a[href="#superagent-lab"]').first().click();
  await expect(page.locator('#superagent-lab')).toBeInViewport();
  for(const width of [320,390,768,1440]){
    await page.setViewportSize({width,height:900});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(0);
    expect(await page.locator('#superagent-lab').evaluate(n=>n.scrollWidth-n.clientWidth)).toBeLessThanOrEqual(0);
  }
  const response=await page.request.get('/examples/superagent-runtime.mjs');expect(response.ok()).toBe(true);expect(await response.text()).toContain('class MiniRuntime');
});

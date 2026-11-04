import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MiniRuntime, replay, packContext, documents } from '../public/examples/superagent-runtime.mjs';

const route = replay('routing').at(-1);
assert.equal(route.routerCalls, 2);
assert.equal(Object.keys(route.tasks).length, 2);
assert.equal(route.outbox.length, 2);
assert.deepEqual(route.tasks['fix-42'].inputs, ['复现图片方向错误', '方向标记为 6 的样例也会失败']);
const recovery = replay('recovery');
assert.equal(recovery[4].outbox.length, 0); // 旧代次结果被拒绝
assert.equal(recovery.at(-1).outbox.length, 1);
assert.equal(recovery.at(-1).tasks['fix-42'].generation, 2);
const runtime = new MiniRuntime();
const request = { id:'x',thread:'t',kind:'request',actor:'alice',text:'task' };
runtime.receive(request);
const restored = new MiniRuntime(runtime.snapshot());
restored.receive(request);
assert.equal(restored.state.routerCalls, 1);
restored.recover('x'); restored.recover('x');
assert.equal(restored.state.tasks.x.status, 'needs-human');
restored.complete('x',1); restored.complete('x',2); restored.complete('x',3);
assert.equal(restored.state.outbox.length, 0);
for (let budget = 120; budget <= 600; ++budget) {
  const packed = packContext(budget);
  assert(packed.used <= budget);
  for (const doc of documents) assert(packed.text.includes(doc.id));
}
assert.throws(() => packContext(0));
// 正文展示的关键算法与浏览器／CLI 实际执行的是同一份代码。
const article = readFileSync(new URL('../src/content/posts/2026-11-04-superagent工程拆解.md', import.meta.url),'utf8');
for (const fn of [MiniRuntime.prototype.complete, MiniRuntime.prototype.recover, packContext])
  assert(article.includes(fn.toString()),'正文代码与实际演示不同步');
console.log('通过：准入、去重、订阅直通、任务隔离、快照恢复、旧结果拒绝、重试上限、结果唯一登记与 481 种上下文预算。');
console.log(JSON.stringify({routingTasks:2, routingDecisions:route.routerCalls, recoveryResults:recovery.at(-1).outbox.length}, null, 2));

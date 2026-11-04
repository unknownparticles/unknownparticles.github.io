// 原创教学模型：只处理离散事件与本地状态，不调用模型或外部服务。
/** @typedef {{id:string, thread:string, generation:number, status:string, inputs:string[], attempts:number}} Task */
/** @typedef {{id:string, thread:string, kind:string, actor:string, text:string}} Event */
/** @typedef {{seen:string[], tasks:Record<string,Task>, subscriptions:Record<string,string[]>, outbox:{id:string,text:string}[], routerCalls:number, log:string[], active:string}} State */

export class MiniRuntime {
  /** @param {State | undefined} saved */
  constructor(saved = undefined) {
    /** @type {State} */
    this.state = saved ? JSON.parse(JSON.stringify(saved)) : {
      seen: [], tasks: {}, subscriptions: {}, outbox: [], routerCalls: 0, log: [], active: 'intake',
    };
  }
  /** @param {string} active @param {string} message */
  record(active, message) {
    this.state.active = active;
    this.state.log.push(message);
  }
  /** @param {Event} event */
  receive(event) {
    const s = this.state;
    if (s.seen.includes(event.id)) {
      this.record('gate', `忽略重复事件 ${event.id}`); return;
    }
    s.seen.push(event.id);
    const subscribers = (s.subscriptions[event.thread] ?? [])
      .map(id => s.tasks[id]).filter(task => task.status === 'running');
    // 本模型只将 followup 当作已订阅上下文，不能扩大任务范围。
    if (event.kind === 'followup' && subscribers.length) {
      for (const task of subscribers) task.inputs.push(event.text);
      this.record('worker', `${event.id} 直通 ${subscribers.length} 个执行器；仅增加上下文`); return;
    }
    if (event.kind !== 'request' || event.actor !== 'alice') {
      this.record('gate', `${event.id} 被确定性规则过滤，不启动新工作`); return;
    }
    // 代替语义判断的确定性 accept，仅供演示。
    s.routerCalls++;
    const task = { id: event.id, thread: event.thread, generation: 1,
      status: 'running', inputs: [event.text], attempts: 1 };
    s.tasks[task.id] = task;
    (s.subscriptions[event.thread] ??= []).push(task.id);
    this.record('router', `创建 ${task.id} 并订阅 ${event.thread}；全局路由次数 ${s.routerCalls}`);
  }
  /** @param {string} id @param {number} generation */
  complete(id, generation) {
    const task = this.state.tasks[id];
    if (!task || task.status !== 'running' || task.generation !== generation) {
      this.record('gate', `拒绝过期或重复结果 ${id}@${generation}`); return;
    }
    task.status = 'ready';
    const resultId = `result:${id}`;
    if (!this.state.outbox.some(result => result.id === resultId))
      this.state.outbox.push({ id: resultId, text: `${id} 的可审阅结果` });
    this.record('outbox', `${id}@${generation} 完成；结果登记一次，尚未对外发送`);
  }
  /** @param {string} id */
  recover(id) {
    const task = this.state.tasks[id];
    if (!task || task.status !== 'running') return;
    if (task.attempts >= 2) {
      task.status = 'needs-human';
      task.generation++; // 让旧执行器的结果也失效
      this.record('watchdog', `${id} 已到重试上限，转人工处理`); return;
    }
    task.attempts++; task.generation++;
    this.record('watchdog', `${id} 无进展；换发执行代次 ${task.generation}，旧代次失效`);
  }
  /** @returns {State} */
  snapshot() { return JSON.parse(JSON.stringify(this.state)); }
}

/** @param {'routing'|'recovery'} scenario */
export function replay(scenario) {
  let runtime = new MiniRuntime();
  const frames = [runtime.snapshot()];
  /** @param {string} id @param {string} thread @param {string} kind @param {string} actor @param {string} text */
  const event = (id, thread, kind, actor, text) => runtime.receive({id, thread, kind, actor, text});
  /** @type {(() => void)[]} */
  const actions = scenario === 'routing' ? [
    () => event('noise', 'chat', 'chat', 'alice', '今天大家辛苦了'),
    () => event('unknown', 'issue:42', 'request', 'guest', '请修改部署设置'),
    () => event('fix-42', 'issue:42', 'request', 'alice', '复现图片方向错误'),
    () => event('fix-42', 'issue:42', 'request', 'alice', '重复投递'),
    () => event('review', 'issue:42', 'followup', 'guest', '方向标记为 6 的样例也会失败'),
    () => event('fix-43', 'issue:43', 'request', 'alice', '检查页面窄屏布局'),
    () => runtime.complete('fix-43', 1),
    () => runtime.complete('fix-42', 1),
  ] : [
    () => event('fix-42', 'issue:42', 'request', 'alice', '检查导出方向'),
    () => { runtime = new MiniRuntime(runtime.snapshot()); runtime.record('store', '模拟进程重启：从 JSON 快照恢复任务、订阅与去重记录'); },
    () => runtime.recover('fix-42'),
    () => runtime.complete('fix-42', 1),
    () => runtime.complete('fix-42', 2),
    () => runtime.complete('fix-42', 2),
  ];
  for (const action of actions) { action(); frames.push(runtime.snapshot()); }
  return frames;
}

export const documents = [
  { id: 'event:review', related: 'thread:42', text: '用户报告方向标记为 6 的 JPEG 导出后旋转错误，需要保留方向测试。' },
  { id: 'thread:42', related: 'task:fix-42', text: '讨论包含复现输入、导出路径、验收方式与一次旧的失败记录。'.repeat(5) },
  { id: 'task:fix-42', related: 'artifact:patch', text: '任务范围只修正方向读取与导出，不改动其他图片效果。'.repeat(4) },
];

/** @param {number} budget */
export function packContext(budget) {
  if (!Number.isInteger(budget) || budget < 120) throw new Error('预算至少 120 个字符');
  const refs = documents.map(doc => `${doc.id} -> ${doc.related}`).join('\n');
  let text = refs;
  const limit = budget - refs.length;
  let remaining = limit;
  for (const doc of documents) {
    const prefix = `\n${doc.id}: `;
    if (remaining <= prefix.length) break;
    const snippet = doc.text.slice(0, remaining-prefix.length);
    text += prefix + snippet;
    remaining -= prefix.length+snippet.length;
  }
  return { text, used: text.length, budget, references: documents.map(doc => doc.id) };
}

if (typeof process !== 'undefined' && process.argv[1]?.endsWith('superagent-runtime.mjs')) {
  for (const scenario of ['routing', 'recovery']) {
    console.log(`\n场景：${scenario}`);
    for (const frame of replay(/** @type {'routing'|'recovery'} */ (scenario)).slice(1))
      console.log(frame.log.at(-1));
  }
  console.log('\n上下文打包：', packContext(180));
}

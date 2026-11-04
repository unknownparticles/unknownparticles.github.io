import { replay, packContext, documents } from '../../public/examples/superagent-runtime.mjs';

class SuperagentReplay extends HTMLElement {
  private index = 0;
  private frames = replay('routing');
  private timer: ReturnType<typeof setInterval> | undefined;
  private controller?: AbortController;
  private motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  connectedCallback() {
    this.controller?.abort(); this.controller = new AbortController();
    const options = { signal: this.controller.signal };
    this.querySelector('[data-step]')?.addEventListener('click', () => this.step(), options);
    this.querySelector('[data-reset]')?.addEventListener('click', () => this.reset(), options);
    this.querySelector('[data-scenario]')?.addEventListener('change', () => this.reset(), options);
    this.querySelector('[data-play]')?.addEventListener('click', () => {
      if (this.timer) { this.pause(); return; }
      if (this.index === this.frames.length-1) this.index = 0;
      this.timer = setInterval(() => this.step(), this.motion.matches ? 1600 : 1000);
      this.render();
    }, options);
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.pause(); }, options);
    this.motion.addEventListener('change', () => this.pause(), options);
    this.render();
  }
  disconnectedCallback() { clearInterval(this.timer); this.controller?.abort(); }
  private pause() { clearInterval(this.timer); this.timer = undefined; this.render(); }
  private reset() {
    this.index = 0;
    const selected = this.querySelector<HTMLSelectElement>('[data-scenario]')?.value;
    this.frames = replay(selected === 'recovery' ? 'recovery' : 'routing'); this.pause();
  }
  private step() { this.index = Math.min(this.index+1,this.frames.length-1); if (this.index === this.frames.length-1) this.pause(); else this.render(); }
  private text(selector: string, text: string) { const node=this.querySelector(selector); if(node) node.textContent=text; }
  private render() {
    const state = this.frames[this.index];
    this.text('[data-current]', state.log.at(-1) ?? '点击下一步接收第一条事件。');
    this.text('[data-seen]', String(state.seen.length)); this.text('[data-router]', String(state.routerCalls));
    this.text('[data-results]',String(state.outbox.length));
    this.text('[data-state]', JSON.stringify(state,null,2));
    this.text('[data-status]', `进度 ${this.index} / ${this.frames.length-1}${this.index === this.frames.length-1 ? ' · 回放完成' : ''}`);
    for (const node of this.querySelectorAll<HTMLElement>('[data-node]')) node.dataset.active=String(node.dataset.node === state.active);
    const step=this.querySelector<HTMLButtonElement>('[data-step]'); if(step) step.disabled=this.index===this.frames.length-1;
    const play=this.querySelector<HTMLButtonElement>('[data-play]'); if(play) {play.textContent=this.timer?'暂停':'播放';play.setAttribute('aria-pressed',String(!!this.timer));}
    const target=this.querySelector('[data-tasks]');
    if(target) {
      target.replaceChildren();
      const tasks=Object.values(state.tasks);
      if(!tasks.length) { const empty=document.createElement('p');empty.textContent='还没有任务。';target.append(empty); }
      for(const task of tasks) {
        const card=document.createElement('div');
        card.style.cssText='padding:12px;border:1px solid var(--color-rule);border-radius:8px;background:var(--color-surface);color:var(--color-ink);font-size:14px;line-height:1.8;overflow-wrap:anywhere;';
        const title=document.createElement('strong');title.textContent=`${task.id} · 代次 ${task.generation} · ${task.status==='ready'?'待审阅':task.status==='running'?'执行中':'待人工'}`;
        const detail=document.createElement('p');detail.style.margin='6px 0 0';detail.style.fontSize='13px';detail.textContent=`订阅 ${task.thread}；输入 ${task.inputs.length} 条；尝试 ${task.attempts} 次。`;
        card.append(title,detail);target.append(card);
      }
    }
  }
}

class SuperagentContext extends HTMLElement {
  private controller?: AbortController;
  connectedCallback() {
    this.controller?.abort();this.controller=new AbortController();const options={signal:this.controller.signal};
    this.querySelector('[data-budget]')?.addEventListener('input',()=>this.render(),options);
    this.querySelector('[data-read]')?.addEventListener('click',()=>{
      const target=this.querySelector<HTMLElement>('[data-documents]');
      const button=this.querySelector('[data-read]');if(!target||!button)return;
      target.hidden=!target.hidden;button.setAttribute('aria-expanded',String(!target.hidden));button.textContent=target.hidden?'读取完整资料':'收起完整资料';
    },options);
    const target=this.querySelector('[data-documents]');
    if(target) {
      target.replaceChildren();
      for(const doc of documents) {
        const title=document.createElement('h4');title.textContent=doc.id;
        const text=document.createElement('p');text.textContent=doc.text;
        target.append(title,text);
      }
    }
    this.render();
  }
  disconnectedCallback(){this.controller?.abort();}
  private render() {
    const budget=Number(this.querySelector<HTMLInputElement>('[data-budget]')?.value??180);
    const packed=packContext(budget);
    const text=(selector:string,value:string)=>{const target=this.querySelector(selector);if(target)target.textContent=value;};
    text('[data-budget-value]',String(budget));text('[data-used]',`已使用 ${packed.used} / ${budget} 字符，保留 ${packed.references.length} 个资料入口。`);
    text('[data-context]',packed.text);
  }
}
if(!customElements.get('superagent-replay'))customElements.define('superagent-replay',SuperagentReplay);
if(!customElements.get('superagent-context'))customElements.define('superagent-context',SuperagentContext);

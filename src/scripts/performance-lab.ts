const values = [1, 7, 3, 2, 4, 5, 8, 0];
const rows = 6, cols = 8, count = rows * cols;
const ordered = Array.from({ length: count }, (_, i) => i);
const isEdge = (i: number) => Math.floor(i / cols) === 0 || Math.floor(i / cols) === rows - 1 || i % cols === 0 || i % cols === cols - 1;
const partitioned = [...ordered.filter(isEdge), ...ordered.filter((i) => !isEdge(i))];
const columnOrder = Array.from({ length: count }, (_, i) => (i % rows) * cols + Math.floor(i / rows));

class PerformanceDemo extends HTMLElement {
  private tick = 0;
  private timer: ReturnType<typeof setInterval> | undefined;
  private controller?: AbortController;
  private motion = window.matchMedia('(prefers-reduced-motion: reduce)');

  connectedCallback() {
    this.controller?.abort();
    this.controller = new AbortController();
    const options = { signal: this.controller.signal };
    this.querySelector('[data-step]')?.addEventListener('click', () => this.step(), options);
    this.querySelector('[data-reset]')?.addEventListener('click', () => this.reset(), options);
    this.querySelector('[data-play]')?.addEventListener('click', () => {
      if (this.timer) { this.pause(); return; }
      if (this.tick === this.total) this.tick = 0;
      this.timer = setInterval(() => this.step(), this.motion.matches ? 1400 : 650);
      this.render();
    }, options);
    this.querySelector('[data-size]')?.addEventListener('input', () => this.reset(), options);
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.pause(); }, options);
    this.motion.addEventListener('change', () => this.pause(), options);
    this.render();
  }
  disconnectedCallback() { this.pause(); this.controller?.abort(); }
  private get k() { return Number(this.querySelector<HTMLInputElement>('[data-size]')?.value ?? 5); }
  private get total() { return this.dataset.mode === 'window' ? values.length - this.k + 1 : count; }
  private text(selector: string, value: string) { const node = this.querySelector(selector); if (node) node.textContent = value; }
  private pause() { clearInterval(this.timer); this.timer = undefined; this.render(); }
  private reset() { this.tick = 0; this.pause(); }
  private step() { this.tick = Math.min(this.tick + 1, this.total); if (this.tick === this.total) this.pause(); else this.render(); }
  private cells(selector: string, data: number[], visited: number[], current: number[], leaving: number[] = []) {
    const target = this.querySelector(selector);
    if (!target) return;
    const fragment = document.createDocumentFragment();
    data.forEach((value, index) => {
      const cell = document.createElement('span');
      const active = current.includes(index), gone = leaving.includes(index);
      cell.textContent = String(value);
      cell.dataset.active = String(active);
      cell.style.cssText = 'display:grid;place-items:center;min-height:30px;border:1px solid var(--color-rule);border-radius:4px;font:12px var(--font-outlier);';
      cell.style.background = active ? 'var(--color-ink)' : visited.includes(index) ? 'var(--color-paper-3)' : 'var(--color-surface)';
      cell.style.color = active ? 'var(--color-paper)' : 'var(--color-ink)';
      if (gone) { cell.style.outline = '2px dashed var(--color-accent)'; cell.style.outlineOffset = '-2px'; }
      cell.title = `下标 ${index}，值 ${value}${active ? '，本步访问' : ''}${gone ? '，离开窗口' : ''}`;
      fragment.append(cell);
    });
    target.replaceChildren(fragment);
  }
  private render() {
    if (!this.isConnected) return;
    const step = this.querySelector<HTMLButtonElement>('[data-step]');
    if (step) step.disabled = this.tick === this.total;
    const play = this.querySelector<HTMLButtonElement>('[data-play]');
    if (play) { play.textContent = this.timer ? '暂停' : this.tick === this.total ? '重新播放' : '播放'; play.setAttribute('aria-pressed', String(!!this.timer)); }
    this.text('[data-status]', this.tick === this.total ? `完成 ${this.total} / ${this.total} 步，两种结果一致` : `进度 ${this.tick} / ${this.total}`);
    if (this.dataset.mode === 'window') this.windowFrame();
    else if (this.dataset.mode === 'boundary') this.boundaryFrame();
    else this.localityFrame();
  }
  private windowFrame() {
    const k = this.k, index = this.tick - 1;
    this.text('[data-size-value]', String(k));
    const current = index < 0 ? [] : Array.from({ length: k }, (_, j) => index + j);
    const incremental = index <= 0 ? current : [index + k - 1];
    this.cells('[data-first]', values, [], current);
    this.cells('[data-second]', values, [], incremental, index > 0 ? [index-1] : []);
    const results: number[] = [];
    const naive: number[] = [];
    let naiveReads = 0;
    let rolling = 0;
    for (let window = 0; window < this.tick; window++) {
      let direct = 0;
      for (let j = window; j < window+k; ++j) { direct += values[j]; naiveReads++; }
      naive.push(direct);
      if (window === 0) rolling = values.slice(0,k).reduce((a,b) => a+b,0);
      else rolling = rolling - values[window-1] + values[window+k-1];
      results.push(rolling);
    }
    const reads = this.tick === 0 ? 0 : k + (this.tick-1)*2;
    this.text('[data-first-info]', `累计取值 ${naiveReads} 次；窗口和：${naive.join('、') || '—'}`);
    this.text('[data-second-info]', `累计取值 ${reads} 次；窗口和：${results.join('、') || '—'}`);
    this.text('[data-explain]', index < 0 ? '深色为本步读取，虚线标记离开窗口的数。点击下一步初始化第一个窗口。' : index === 0 ? `初始化：两边都读取前 ${k} 个数，和为 ${rolling}。` : `复用上一轮的和：减去离开的 ${values[index-1]}，加上进入的 ${values[index+k-1]}，本轮和为 ${rolling}。右侧取值计数包含这一减一加所需的两次数组读取。`);
  }
  private boundaryFrame() {
    const a = ordered.slice(0,this.tick), b = partitioned.slice(0,this.tick);
    const data = (visited: number[]) => ordered.map((i) => visited.includes(i) ? isEdge(i) ? -1 : 1 : 0);
    this.cells('[data-first]', data(a), a, a.slice(-1));
    this.cells('[data-second]', data(b), b, b.slice(-1));
    this.text('[data-first-info]', `完成 ${this.tick} 个元素；逐元素边界分类 ${this.tick} 次。`);
    const inside = b.filter((i) => !isEdge(i)).length;
    this.text('[data-second-info]', `完成边缘 ${b.length-inside} 个、内部 ${inside} 个；内部循环无逐元素边界判断。`);
    this.text('[data-explain]', this.tick === 0 ? '零表示尚未处理，深色是本步更新的格子。右边先扫完边缘，再批量更新内部。' : this.tick === count ? '最终两张矩阵相同。24 个内部元素直接加一，角点只处理一次。这不是 CPU 分支计数，循环控制与实际机器指令仍需单独分析。' : `右边本步处理${isEdge(b.at(-1)!) ? '边缘，值减一' : '内部，直接加一'}。分区改变处理顺序，两边尚未完成时中间矩阵可以不同，最终结果必须一致。`);
  }
  private localityFrame() {
    const a = columnOrder.slice(0,this.tick), b = ordered.slice(0,this.tick);
    this.cells('[data-first]', ordered, a, a.slice(-1));
    this.cells('[data-second]', ordered, b, b.slice(-1));
    const info = (order: number[]) => {
      const now = order.at(-1), prev = order.at(-2);
      return now === undefined ? '尚未读取；总和 0。' : `下标 ${now}；上一步 ${prev ?? '—'}；间隔 ${prev === undefined ? '—' : (now-prev)*8 + ' 字节'}；总和 ${order.reduce((a,b) => a+b,0)}。`;
    };
    this.text('[data-first-info]',info(a)); this.text('[data-second-info]',info(b));
    this.text('[data-explain]', '每个元素按 8 字节整数计算地址间隔。按行通常向后 8 字节；按列在同一列中向后 64 字节，换列时跳回。浅色表示已访问；这里没有模拟真实缓存行、命中率或硬件预取。');
  }
}
if (!customElements.get('performance-demo')) customElements.define('performance-demo', PerformanceDemo);

/* Interactive geometry for the hero.
 *
 * Shapes are plain DOM nodes moved with transform only, driven by a single
 * requestAnimationFrame loop that parks itself when nothing is moving. Each
 * shape drifts, leans away from the pointer, and cycles colour on click or
 * Enter. Drag is desktop-only (fine pointer); touch devices get tap instead,
 * so a finger is never hijacked mid-scroll. */

type Kind = 'circle' | 'pill' | 'square' | 'blob' | 'ring' | 'triangle';

type Spec = {
  kind: Kind;
  color: string;
  size: number;
  x: number;
  y: number;
  drift: number;
  phase: number;
  label: string;
};

const POP = [
  'var(--pop-red)',
  'var(--pop-orange)',
  'var(--pop-yellow)',
  'var(--pop-lime)',
  'var(--pop-mint)',
  'var(--pop-sky)',
  'var(--pop-blue)',
  'var(--pop-violet)',
  'var(--pop-pink)',
];

const KINDS: Kind[] = ['circle', 'pill', 'square', 'blob', 'ring'];

const LABELS = ['Flutter', 'OpenGL', 'Canvas', 'TypeScript', 'C++', 'OpenCV', 'WebGL', 'Astro', 'Python'];

function buildSpecs(count: number): Spec[] {
  const specs: Spec[] = [];
  for (let index = 0; index < count; index += 1) {
    const kind = KINDS[index % KINDS.length];
    const size = kind === 'ring' ? 54 + (index % 3) * 14 : 40 + ((index * 13) % 46);
    specs.push({
      kind,
      color: POP[index % POP.length],
      size,
      x: 6 + ((index * 29) % 78),
      y: 10 + ((index * 41) % 74),
      drift: 0.35 + ((index * 7) % 5) * 0.16,
      phase: index * 1.27,
      label: LABELS[index % LABELS.length],
    });
  }
  return specs;
}

export function mountShapes() {
  const stage = document.getElementById('shape-stage');
  if (!stage || stage.dataset.mounted === 'true') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  stage.dataset.mounted = 'true';

  // Match the CSS breakpoint rather than pointer queries: headless and
  // touch laptops report hover inconsistently.
  const compact = window.matchMedia('(max-width: 760px)').matches;
  const count = compact ? 9 : 14;
  const specs = buildSpecs(count);

  const nodes = specs.map((spec) => {
    const node = document.createElement('button');
    node.type = 'button';
    node.className = `shape shape--${spec.kind}`;
    node.style.width = `${spec.size}px`;
    node.style.height = `${spec.size}px`;
    node.style.left = `${spec.x}%`;
    node.style.top = `${spec.y}%`;
    node.style.background = spec.color;
    node.dataset.colorIndex = String(POP.indexOf(spec.color));
    node.setAttribute('aria-label', `几何形状 ${spec.label}，点击换色`);
    stage.appendChild(node);
    return node;
  });

  let pointerX = -1;
  let pointerY = -1;
  let pointerActive = false;
  let running = true;
  let frame = 0;
  const time = { start: performance.now() };

  function place(node: HTMLElement, spec: Spec, now: number) {
    const t = (now - time.start) / 1000;
    const driftX = Math.sin(t * spec.drift + spec.phase) * 9;
    const driftY = Math.cos(t * spec.drift * 0.8 + spec.phase) * 11;

    let pushX = 0;
    let pushY = 0;
    if (pointerActive) {
      const rect = node.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = cx - pointerX;
      const dy = cy - pointerY;
      const distance = Math.hypot(dx, dy);
      const reach = 150;
      if (distance < reach && distance > 0.01) {
        const force = (1 - distance / reach) * 26;
        pushX = (dx / distance) * force;
        pushY = (dy / distance) * force;
      }
    }

    node.style.transform = `translate3d(${(driftX + pushX).toFixed(2)}px, ${(driftY + pushY).toFixed(2)}px, 0)`;
  }

  function tick(now: number) {
    if (!running) {
      frame = 0;
      return;
    }
    nodes.forEach((node, index) => place(node, specs[index], now));
    frame = requestAnimationFrame(tick);
  }

  function start() {
    if (!frame) frame = requestAnimationFrame(tick);
  }

  // Park the loop when the hero leaves the viewport.
  const observer = new IntersectionObserver(([entry]) => {
    running = entry.isIntersecting;
    if (running) start();
  });
  observer.observe(stage);

  stage.addEventListener('pointermove', (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    pointerActive = true;
  });

  stage.addEventListener('pointerleave', () => {
    pointerActive = false;
  });

  nodes.forEach((node, index) => {
    const spec = specs[index];

    node.addEventListener('click', (event) => {
      // A drag should not also count as a colour change.
      if (node.dataset.dragged === 'true') {
        node.dataset.dragged = 'false';
        return;
      }
      const next = (Number(node.dataset.colorIndex) + 1) % POP.length;
      node.dataset.colorIndex = String(next);
      node.style.background = POP[next];
      node.animate(
        [
          { transform: `${node.style.transform} scale(1)` },
          { transform: `${node.style.transform} scale(1.22) rotate(${event.shiftKey ? 24 : -18}deg)` },
          { transform: `${node.style.transform} scale(1)` },
        ],
        { duration: 420, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
      );
    });

    if (compact) return;

    let dragId: number | null = null;
    let offsetX = 0;
    let offsetY = 0;

    node.addEventListener('pointerdown', (event) => {
      dragId = event.pointerId;
      const rect = node.getBoundingClientRect();
      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;
      node.setPointerCapture(event.pointerId);
      node.style.zIndex = '5';
    });

    node.addEventListener('pointermove', (event) => {
      if (dragId !== event.pointerId) return;
      const stageRect = stage.getBoundingClientRect();
      const x = ((event.clientX - offsetX - stageRect.left) / stageRect.width) * 100;
      const y = ((event.clientY - offsetY - stageRect.top) / stageRect.height) * 100;
      spec.x = Math.max(-4, Math.min(96, x));
      spec.y = Math.max(-4, Math.min(94, y));
      node.style.left = `${spec.x}%`;
      node.style.top = `${spec.y}%`;
      node.dataset.dragged = 'true';
    });

    const release = (event: PointerEvent) => {
      if (dragId !== event.pointerId) return;
      dragId = null;
      node.style.zIndex = '';
      window.setTimeout(() => {
        if (node.dataset.dragged === 'true') node.dataset.dragged = 'false';
      }, 0);
    };

    node.addEventListener('pointerup', release);
    node.addEventListener('pointercancel', release);
  });

  start();
}

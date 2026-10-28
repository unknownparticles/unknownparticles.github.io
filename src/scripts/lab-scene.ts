import {
  BufferAttribute,
  BufferGeometry,
  Color,
  EllipseCurve,
  LineBasicMaterial,
  LineLoop,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
} from 'three';

export function mountLabScene() {
  const element = document.getElementById('lab-scene');
  if (!element || element.dataset.mounted === 'true') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const container: HTMLElement = element;
  container.dataset.mounted = 'true';

  const mobile = window.matchMedia('(max-width: 760px)').matches;
  const count = mobile ? 420 : 900;
  const scene = new Scene();
  const camera = new PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 6.3);

  const renderer = new WebGLRenderer({
    antialias: false,
    alpha: true,
    powerPreference: 'low-power',
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const coral = new Color('#ff4d5e');
  const blue = new Color('#3388ff');
  const white = new Color('#f6f8fa');

  for (let index = 0; index < count; index += 1) {
    const radius = 1.75 + Math.random() * 0.32;
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const offset = index * 3;
    positions[offset] = radius * Math.sin(phi) * Math.cos(theta);
    positions[offset + 1] = radius * Math.cos(phi);
    positions[offset + 2] = radius * Math.sin(phi) * Math.sin(theta);
    const source = Math.random() > 0.82 ? coral : Math.random() > 0.72 ? blue : white;
    colors[offset] = source.r;
    colors[offset + 1] = source.g;
    colors[offset + 2] = source.b;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('color', new BufferAttribute(colors, 3));
  const material = new PointsMaterial({
    size: mobile ? 0.035 : 0.026,
    transparent: true,
    opacity: 0.88,
    vertexColors: true,
    sizeAttenuation: true,
  });
  const globe = new Points(geometry, material);
  globe.position.x = mobile ? 0 : 1.25;
  scene.add(globe);

  const ringMaterial = new LineBasicMaterial({ color: '#ff4d5e', transparent: true, opacity: 0.28 });
  for (const rotation of [
    [0.2, 0, 0.5],
    [1.1, 0.4, -0.2],
    [0.4, 1.2, 0.8],
  ]) {
    const curve = new EllipseCurve(0, 0, 2.08, 2.08, 0, Math.PI * 2, false, 0);
    const ringGeometry = new BufferGeometry().setFromPoints(curve.getPoints(128));
    const ring = new LineLoop(ringGeometry, ringMaterial);
    ring.rotation.set(rotation[0], rotation[1], rotation[2]);
    ring.position.x = globe.position.x;
    scene.add(ring);
  }

  let pointerX = 0;
  let pointerY = 0;
  let visible = true;
  let frame = 0;

  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
  }

  function onPointer(event: PointerEvent) {
    pointerX = (event.clientX / window.innerWidth - 0.5) * 0.45;
    pointerY = (event.clientY / window.innerHeight - 0.5) * 0.25;
  }

  function animate() {
    if (!visible) {
      frame = 0;
      return;
    }
    globe.rotation.y += 0.0018;
    globe.rotation.x += (pointerY - globe.rotation.x) * 0.018;
    globe.rotation.y += (pointerX - globe.rotation.z) * 0.002;
    scene.rotation.z = Math.sin(performance.now() * 0.00018) * 0.035;
    renderer.render(scene, camera);
    frame = requestAnimationFrame(animate);
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !frame) frame = requestAnimationFrame(animate);
  });
  observer.observe(container);

  resize();
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', onPointer, { passive: true });
  frame = requestAnimationFrame(animate);
}

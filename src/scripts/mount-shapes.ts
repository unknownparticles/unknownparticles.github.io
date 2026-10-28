/* Entry point for the hero geometry. Kept as its own module so Astro emits it
 * as a real chunk with a working import instead of an inlined bundle. */
import { mountShapes } from './shapes';

const idle = window.requestIdleCallback;
if (typeof idle === 'function') {
  idle(() => mountShapes(), { timeout: 900 });
} else {
  globalThis.setTimeout(() => mountShapes(), 200);
}

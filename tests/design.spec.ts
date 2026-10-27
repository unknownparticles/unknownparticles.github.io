import { test, expect } from '@playwright/test';

const widths = [320, 375, 414, 768, 1024, 1280, 1440, 1920];

/** oklch() to linear sRGB, so contrast maths runs without a browser. */
function oklchToLinear(lightness: number, chroma: number, hue: number): number[] {
  const h = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(h);
  const b = chroma * Math.sin(h);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function toLinearRgb(value: string): number[] {
  const oklch = value.match(/^oklch\(\s*([\d.]+)(%)?\s+([\d.]+)\s+([\d.]+)/i);
  if (oklch) {
    const lightness = oklch[2] === '%' ? Number(oklch[1]) / 100 : Number(oklch[1]);
    return oklchToLinear(lightness, Number(oklch[3]), Number(oklch[4]));
  }
  const rgb = value.match(/[\d.]+/g);
  if (!rgb) throw new Error(`unparseable colour: ${value}`);
  const channel = (index: number) => {
    const v = Number(rgb[index]) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return [channel(0), channel(1), channel(2)];
}

function contrast(first: string, second: string) {
  const a = toLinearRgb(first);
  const b = toLinearRgb(second);
  const luminance = (c: number[]) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

test.describe('desktop rendering', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('the hero fits the first screen at 1280 by 800', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);

    const fold = await page.evaluate(() => {
      const box = (element: Element | null) => {
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        return { top: Math.round(rect.top), bottom: Math.round(rect.bottom) };
      };
      return {
        heading: box(document.querySelector('.home-hero h1')),
        lede: box(document.querySelector('.home-hero__lede')),
        action: box(document.querySelector('.hero-actions')),
        viewport: window.innerHeight,
      };
    });

    expect(fold.heading?.top ?? Number.MAX_SAFE_INTEGER).toBeGreaterThanOrEqual(0);
    expect(fold.lede?.bottom ?? 0).toBeLessThanOrEqual(fold.viewport);
    expect(fold.action?.bottom ?? 0).toBeLessThanOrEqual(fold.viewport);
  });

  test('body text meets AA contrast against its surface', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);

    const samples = await page.evaluate(() => {
      const targets = ['.post-card__excerpt', '.post-date', '.site-footer__bottom p', '.tag', '.post-card__subtitle'];
      return targets.map((selector) => {
        const element = document.querySelector(selector);
        if (!element) return { selector, missing: true as const };
        let node: Element | null = element;
        let background = 'rgb(0, 0, 0)';
        while (node) {
          const value = getComputedStyle(node).backgroundColor;
          if (value && !/rgba\(0, 0, 0, 0\)|transparent/.test(value)) {
            background = value;
            break;
          }
          node = node.parentElement;
        }
        return {
          selector,
          color: getComputedStyle(element).color,
          background,
          text: (element.textContent || '').trim().slice(0, 20),
          missing: false as const,
        };
      });
    });

    for (const sample of samples) {
      expect(sample.missing, `${sample.selector} exists`).toBe(false);
      if (sample.missing) continue;
      const ratio = contrast(sample.color!, sample.background!);
      expect(ratio, `${sample.selector} (“${sample.text}”) at ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('the branded fonts are actually loaded', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const loaded = await page.evaluate(async () => {
      await document.fonts.ready;
      return {
        body: document.fonts.check('16px "Manrope Variable"'),
        family: getComputedStyle(document.body).fontFamily,
      };
    });
    expect(loaded.body).toBe(true);
    expect(loaded.family).toContain('Manrope Variable');
  });

  test('every post cover and the portrait decode', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.6;
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 180));
      }
    });

    await expect
      .poll(
        async () =>
          page.evaluate(() =>
            [...document.querySelectorAll('img')].every((image) => (image as HTMLImageElement).complete),
          ),
        { timeout: 15_000, message: 'all images finish loading' },
      )
      .toBe(true);

    const images = await page.evaluate(() =>
      [...document.querySelectorAll('img')].map((image) => ({
        src: image.getAttribute('src'),
        width: image.naturalWidth,
      })),
    );
    expect(images.length).toBeGreaterThan(0);
    for (const image of images) {
      expect(image.width > 0, `${image.src} decoded`).toBe(true);
    }
  });

  test('no horizontal overflow at any supported width', async ({ page }) => {
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `home at ${width}px`).toBeLessThanOrEqual(0);
    }
  });

  test('no navigation label wraps', async ({ page }) => {
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const wrapped = await page.evaluate(() =>
        [...document.querySelectorAll('.site-nav a')]
          .filter((link) => link.getClientRects().length > 1)
          .map((link) => link.textContent),
      );
      expect(wrapped, `nav at ${width}px`).toEqual([]);
    }
  });

  test('no tag label wraps at any supported width', async ({ page }) => {
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/tags/', { waitUntil: 'domcontentloaded' });
      const wrapped = await page.evaluate(() =>
        [...document.querySelectorAll('.tag')]
          .filter((tag) => tag.getClientRects().length > 1)
          .map((tag) => tag.textContent),
      );
      expect(wrapped, `tags at ${width}px`).toEqual([]);
    }
  });
});

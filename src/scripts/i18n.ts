/* Applies the active language to every translatable element.
 *
 * Two mechanisms:
 *  - [data-i18n="a.b.c"]       reads the value out of the dictionary
 *  - [data-i18n-attr="attr"]   reads data-zh / data-en for that attribute
 * Elements carrying data-zh / data-en but no dictionary path fall back to
 * those values, which lets per-item copy stay next to the item. */

import { onLangChange, type Lang } from './settings';
import { zh } from '../i18n/zh';
import { en } from '../i18n/en';

const dicts: Record<Lang, Record<string, unknown>> = { zh: zh as unknown as Record<string, unknown>, en: en as unknown as Record<string, unknown> };

function read(dict: Record<string, unknown>, path: string): string | undefined {
  const value = path.split('.').reduce<unknown>((node, key) => (node as Record<string, unknown> | undefined)?.[key], dict);
  return typeof value === 'string' ? value : undefined;
}

export function translate(lang: Lang) {
  const dict = dicts[lang];

  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((element) => {
    const path = element.dataset.i18n!;
    const value = read(dict, path) ?? element.dataset[lang];
    if (value) element.textContent = value;
  });
  document.querySelectorAll<HTMLElement>('[data-i18n-attr]').forEach((element) => {
    const attribute = element.dataset.i18nAttr!;
    const value = element.dataset[lang];
    if (value) element.setAttribute(attribute, value);
  });
}

function init() {
  const lang: Lang = document.documentElement.dataset.lang === 'en' ? 'en' : 'zh';
  translate(lang);
  onLangChange(translate);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

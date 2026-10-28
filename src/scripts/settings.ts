/* Applies a dictionary to every [data-i18n] element and keeps html/lang in
 * sync. Runs after the DOM is parsed; the pre-paint script has already set the
 * initial attributes so nothing flashes. */

export type Lang = 'zh' | 'en';

const listeners = new Set<(lang: Lang) => void>();

export function currentLang(): Lang {
  return document.documentElement.dataset.lang === 'en' ? 'en' : 'zh';
}

export function applyLang(lang: Lang) {
  document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
  document.documentElement.dataset.lang = lang;
  try {
    localStorage.setItem('lang', lang);
  } catch (error) {
    /* private mode: keep the in-memory choice only */
  }
  listeners.forEach((listener) => listener(lang));
}

export function onLangChange(listener: (lang: Lang) => void) {
  listeners.add(listener);
}

export function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem('theme', theme);
  } catch (error) {
    /* private mode */
  }
  document.querySelectorAll<HTMLElement>('[data-theme-target]').forEach((button) => {
    button.setAttribute('aria-label', button.dataset[theme === 'dark' ? 'labelDark' : 'labelLight'] || '');
  });
}

export function systemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function toggleTheme() {
  const stored = document.documentElement.dataset.theme;
  const active = stored === 'dark' || stored === 'light' ? stored : systemTheme();
  applyTheme(active === 'dark' ? 'light' : 'dark');
}

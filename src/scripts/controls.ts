/* Wires the language and theme controls, and keeps aria-labels in sync with
 * the active theme. Imported by the pages that render the controls. */

import { applyLang, applyTheme, currentLang, systemTheme, toggleTheme, onLangChange } from './settings';

function labelThemeButton(button: HTMLElement) {
  const stored = document.documentElement.dataset.theme;
  const active = stored === 'dark' || stored === 'light' ? stored : systemTheme();
  const label = button.dataset[active === 'dark' ? 'labelDark' : 'labelLight'];
  if (label) button.setAttribute('aria-label', label);
}

function wireControls() {
  document.querySelectorAll<HTMLElement>('[data-lang-target]').forEach((button) => {
    button.addEventListener('click', () => applyLang(currentLang() === 'en' ? 'zh' : 'en'));
  });

  document.querySelectorAll<HTMLElement>('[data-theme-target]').forEach((button) => {
    labelThemeButton(button);
    button.addEventListener('click', () => {
      toggleTheme();
      labelThemeButton(button);
    });
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!document.documentElement.dataset.theme) {
      document.querySelectorAll<HTMLElement>('[data-theme-target]').forEach(labelThemeButton);
    }
  });

  onLangChange(() => {
    document.querySelectorAll<HTMLElement>('[data-lang-target]').forEach((button) => {
      button.setAttribute('aria-label', currentLang() === 'en' ? '切换到中文' : 'Switch to English');
    });
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireControls);
  } else {
    wireControls();
  }
}

export { applyTheme };

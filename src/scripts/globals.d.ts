export {};

declare global {
  interface Window {
    __alun: {
      applyLang: (lang: 'zh' | 'en') => void;
      currentLang: () => 'zh' | 'en';
      systemTheme: () => 'light' | 'dark';
      toggleTheme: () => void;
    };
  }
}

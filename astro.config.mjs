import { defineConfig } from 'astro/config';
import { createCssVariablesTheme } from 'shiki';

export default defineConfig({
  site: 'https://alunapp.cn',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  markdown: {
    shikiConfig: {
      theme: createCssVariablesTheme({
        variablePrefix: '--shiki-',
        fontStyle: true,
      }),
    },
  },
});

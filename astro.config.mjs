import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://alunapp.cn',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: false,
    },
  },
});

import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://jackthepunished.github.io',
  base: '/portfolio',
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'auto' }
});


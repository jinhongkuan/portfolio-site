// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://jinhongkuan.github.io',
  base: '/portfolio-site', // Your repo name
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },
});

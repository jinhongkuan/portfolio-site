// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://jinhongkuan.github.io',
  base: '/portfolio-site',
  integrations: [svelte()],
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },
});

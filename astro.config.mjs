import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

// Static output: pages are prerendered (SSG) at build time.
// Only routes with `export const prerender = false` (the contact API)
// run on the Node server provided by the adapter.
export default defineConfig({
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  server: { host: true },
  vite: {
    plugins: [tailwindcss()],
  },
});

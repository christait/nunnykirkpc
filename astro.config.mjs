import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Site URL — must match the custom domain in public/CNAME.
export default defineConfig({
  site: 'https://nunnykirkpc.org.uk',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  build: {
    format: 'directory',
  },
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },
});

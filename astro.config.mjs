import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { astroImageTools } from 'astro-imagetools';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://updownpod-79a0d.web.app',
  integrations: [
    mdx(),
    astroImageTools,
    icon({
      iconDir: 'src/assets/icons',
    }),
    sitemap(),
    react(),
  ],
});

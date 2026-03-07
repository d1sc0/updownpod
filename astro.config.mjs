import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { astroImageTools } from 'astro-imagetools';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://updownpod.com',
  integrations: [mdx(), astroImageTools, icon(), sitemap()],
});

# Upstairs Downstairs Podcast

A modern Astro v6 site for the Upstairs Downstairs podcast, featuring:

- Content Layer API for episodes
- Sveltia CMS integration for easy editing
- Automated Open Graph (OG) and preview image generation (Node + Puppeteer)
- Audio player, episode navigation, and social sharing

## Quick Start

1. Install dependencies:
   ```
   npm install
   ```
2. Start the dev server:

   ```
   npm run dev
   ```

3. To generate OG and preview images (after adding or editing episodes):
   - OG images: see [docs/og-image-generation.md](docs/og-image-generation.md)
   - Preview images: see [docs/preview-image-generation.md](docs/preview-image-generation.md)
   - Both are run automatically with `npm run build`, or can be run manually as described in the docs.

## Requirements

- Node.js 22.12.0 or higher

## CSS Processing

This project uses **PostCSS** with `postcss-preset-env` and **autoprefixer** for modern CSS features and cross-browser compatibility. The configuration is in `postcss.config.cjs` and is automatically picked up by Astro.

**Reminder:** If you do not need modern CSS features or autoprefixer, you can remove `postcss.config.cjs` and the related devDependencies from `package.json`.

## Docs

See the [docs/](docs/) folder for setup, CMS, image automation, and migration details.

## To-do

- [ ] Set up Firebase redirect for /podcast.xml
- [ ] Update HeadSEO and pageMeta descriptions

## Sveltia CMS Prebuild Automation

Image path corrections and Markdown file renaming are now handled automatically by the prebuild script:

src/scripts/pre-build-sveltia-cms-catches.js

This script:

- Fixes image paths in Markdown files (uploaded via Sveltia CMS) to ensure static build compatibility
- Renames Markdown files to match their `slug` frontmatter (if present)

No manual changes are needed after uploading images or creating new posts in the CMS.

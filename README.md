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

## Docs

See the [docs/](docs/) folder for setup, CMS, image automation, and migration details.

## To-do

- [ ] Set up Firebase redirect for /podcast.xml
- [ ] Configure Jam Comments API key
- [ ] Update HeadSEO and pageMeta descriptions

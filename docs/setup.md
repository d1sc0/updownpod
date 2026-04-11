# Project Setup

## Requirements

- Node.js 22.12.0 or higher (see .nvmrc)
- npm

## Install dependencies

```
npm install
```

## Development server

```
npm run dev
```

## Build for production

```
npm run build
```

This will also generate Open Graph (OG) and preview images for all episodes using Puppeteer and your HTML templates. Images are output to:

- `public/generated_social_images/` (OG images, 1200x630)
- `public/generated_preview_images/` (Preview images, 600x600)

You can also run these scripts manually:

```
npx ts-node src/scripts/generate-og-images.ts
npx ts-node src/scripts/generate-preview-images.ts
```

### Image Template Previews

The OG and preview image templates include a fallback background image so you can see a realistic preview when opening the HTML files in your browser. During image generation, the script injects the correct background automatically.

### Log Output

When generating images, only the generated filename is shown in the logs for clarity.

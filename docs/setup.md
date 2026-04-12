# Project Setup

## Requirements

- Node.js 22.12.0 or higher (see .nvmrc)
- npm

## CSS Processing

This project uses **PostCSS** with `postcss-preset-env` and **autoprefixer** for modern CSS features and cross-browser compatibility. The configuration is in `postcss.config.cjs` and is automatically picked up by Astro.

**Reminder:** If you do not need modern CSS features or autoprefixer, you can remove `postcss.config.cjs` and the related devDependencies from `package.json`.

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

npx ts-node src/scripts/image-generation/generate-og-images.ts
npx ts-node src/scripts/image-generation/generate-preview-images.ts

This will also generate Open Graph (OG) and preview images for all episodes using Puppeteer and your HTML templates. See:

- [OG image generation details](og-image-generation.md)
- [Preview image generation details](preview-image-generation.md)

You can also run these scripts manually; see the respective docs for instructions.

### Image Template Previews

The OG and preview image templates include a fallback background image so you can see a realistic preview when opening the HTML files in your browser. During image generation, the script injects the correct background automatically.

### Log Output

When generating images, only the generated filename is shown in the logs for clarity.

## Sveltia CMS Image Uploads

**Important:** When uploading or adding images into posts using Sveltia CMS, you must manually update the Markdown to change image links from:

    src/assets/uploaded_images/your-image.png

to:

    ../../assets/uploaded_images/your-image.png

This ensures images are correctly referenced in the static build.

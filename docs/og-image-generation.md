# OG Image Generation Script

This script generates Open Graph (OG) images for all podcast episodes using Puppeteer and a custom HTML template.

- **Script:** `src/scripts/image-generation/generate-og-images.ts`
- **Template:** `src/scripts/image-generation/social-image-template.html`
- **Background:** `src/scripts/image-generation/og-background.png`
- **Output:** `public/generated_social_images/` (1200x630 PNG)

## How It Works

1. Reads all Markdown files in `src/content/episodes/`.
2. Extracts episode metadata (title, episode number).
3. Loads the HTML template and injects episode data and a base64-encoded background image.
4. Uses Puppeteer to render the HTML and capture a PNG screenshot.
5. Saves the image as `[episode-id].png` in the output folder.

## Usage

Run automatically with the build:

```
npm run build
```

Or manually:

npx ts-node src/scripts/generate-og-images.ts

```
npx ts-node src/scripts/image-generation/generate-og-images.ts
```

## Notes

- Skips images that already exist.
- Logs only the generated filename for clarity.
- The template includes a fallback background for browser preview, but the script injects the correct background at runtime.
- Only episode Markdown files are processed (no static pages).
- **Font loading:** The template now includes a Google Fonts link for Jersey 15, ensuring correct font rendering in both browser preview and generated images.

---

For preview image generation, see `docs/preview-image-generation.md`.

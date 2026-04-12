# Preview Image Generation Script

This script generates square preview images for all podcast episodes using Puppeteer and a custom HTML template.

- **Script:** `src/scripts/image-generation/generate-preview-images.ts`
- **Template:** `src/scripts/image-generation/preview-image-template.html`
- **Background:** `src/scripts/image-generation/preview-background.png`
- **Output:** `public/generated_preview_images/` (600x600 PNG)

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

npx ts-node src/scripts/generate-preview-images.ts

```
npx ts-node src/scripts/image-generation/generate-preview-images.ts
```

## Notes

- Skips images that already exist.
- Logs only the generated filename for clarity.
- The template includes a fallback background for browser preview, but the script injects the correct background at runtime.
- Only episode Markdown files are processed (no static pages).
- **Font loading:** The template now includes a Google Fonts link for Jersey 15, ensuring correct font rendering in both browser preview and generated images.

---

For OG image generation, see `docs/og-image-generation.md`.

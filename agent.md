# Agent Notes for updownpod.com

## Project Overview

- Modern Astro v6 podcast site with Sveltia CMS integration
- Automated OG and preview image generation (Puppeteer)
- Modular CSS with PostCSS (postcss-preset-env, autoprefixer)
- Static asset and Markdown content workflow
- Deploys to Firebase Hosting via GitHub Actions

## Key Automation/Workflow

- `prebuild` script runs before dev/build: fixes image paths, renames Markdown files to match slug, generates OG/preview images
- All image templates include Google Fonts for Jersey 15 for consistent font rendering
- No manual Markdown or asset path edits needed after CMS use
- Astro build copies all public/ assets to dist/ for deployment

## Gotchas & Best Practices

- Always run `npm run prebuild` before committing new/edited Markdown or images to ensure filenames and paths are correct
- If you add new fonts to image templates, update the Puppeteer scripts to wait for them
- If you change the CMS media folder, update the prebuild script accordingly
- For local preview of image templates, open in browser (background and fonts will load)
- For troubleshooting image generation, check Puppeteer logs and ensure Google Fonts links are present in templates

## Deployment

- GitHub Actions workflow runs `npm run build` (which triggers prebuild)
- Only files in dist/ are deployed to Firebase
- Any file renames or fixes during CI are NOT committed back to the repo (run prebuild locally and commit for repo sync)

## Useful Scripts

- `npm run dev` — runs prebuild, then Astro dev server
- `npm run build` — runs prebuild, then Astro build
- `npm run prebuild` — run all pre-deployment/preview automation
- `npm run generate:og` / `npm run generate:preview` — manual image generation

## Troubleshooting

- If images/fonts are missing in generated images, check Google Fonts link and font wait logic in scripts
- If Markdown files are not renamed, check slug frontmatter and prebuild script
- If images are missing on deployed site, ensure they exist in public/ before build

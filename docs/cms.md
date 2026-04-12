# CMS & Content Editing

This project uses Sveltia CMS (Netlify CMS compatible) for editing podcast episodes.

- CMS config: `public/admin/config.yaml`
- Media folder: `src/assets/episode_images`
- Content folder: `src/content/episodes`
- Editable fields: title, draft, pubDate, description, mp3, mp3title, socialImage, body
- Sortable by: title, pubDate
- Default sort: pubDate descending

To access the CMS, open `/admin/` in your deployed site.

## Image Uploads & Path Correction

**Important:** When uploading or adding images into posts using Sveltia CMS, you must manually update the Markdown to change image links from:

    src/assets/uploaded_images/your-image.png

to:

    ../../assets/uploaded_images/your-image.png

This ensures images are correctly referenced in the static build.

---

## CSS Processing

This project uses **PostCSS** with `postcss-preset-env` and **autoprefixer** for modern CSS features and cross-browser compatibility. The configuration is in `postcss.config.cjs` and is automatically picked up by Astro.

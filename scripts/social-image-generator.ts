import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

const EPISODES_DIR = path.join(process.cwd(), 'src/content/episodes');
const TEMPLATE_PATH = path.join(
  process.cwd(),
  'scripts/social-image-template.html',
);
const OUTPUT_DIR = path.join(process.cwd(), 'public/generated_social_images');
const OG_TEMPLATE_PATH = path.join(
  process.cwd(),
  'scripts/social-image-template.html',
);
const PREVIEW_TEMPLATE_PATH = path.join(
  process.cwd(),
  'scripts/preview-image-template.html',
);
const OG_OUTPUT_DIR = path.join(
  process.cwd(),
  'public/generated_social_images',
);
const PREVIEW_OUTPUT_DIR = path.join(
  process.cwd(),
  'public/generated_preview_images',
);

async function getEpisodes() {
  const files = fs.readdirSync(EPISODES_DIR).filter(f => f.endsWith('.md'));
  return files.map(file => {
    const content = fs.readFileSync(path.join(EPISODES_DIR, file), 'utf-8');
    const match = content.match(/title:\s*['"](.+?)['"]/);
    const title = match ? match[1] : file.replace(/\.md$/, '');
    const id = file.replace(/\.md$/, '');
    return { id, title };
  });
}

async function generateImages() {
  if (!fs.existsSync(OG_OUTPUT_DIR))
    fs.mkdirSync(OG_OUTPUT_DIR, { recursive: true });
  if (!fs.existsSync(PREVIEW_OUTPUT_DIR))
    fs.mkdirSync(PREVIEW_OUTPUT_DIR, { recursive: true });
  const episodes = await getEpisodes();
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });
  for (const episode of episodes) {
    // OG image (1200x630)
    const ogOutPath = path.join(OG_OUTPUT_DIR, `${episode.id}.png`);
    if (!fs.existsSync(ogOutPath)) {
      const ogPage = await browser.newPage();
      await ogPage.goto('file://' + OG_TEMPLATE_PATH);
      await ogPage.evaluate(title => {
        document.getElementById('title')!.textContent = title;
      }, episode.title);
      await ogPage.screenshot({
        path: ogOutPath,
        type: 'png',
        clip: { x: 0, y: 0, width: 1200, height: 630 },
      });
      await ogPage.close();
      console.log(`Generated OG: ${ogOutPath}`);
    } else {
      console.log(`OG image for ${episode.id} already exists, skipping.`);
    }

    // Preview image (1200x1200)
    const previewOutPath = path.join(PREVIEW_OUTPUT_DIR, `${episode.id}.png`);
    if (!fs.existsSync(previewOutPath)) {
      const previewPage = await browser.newPage();
      await previewPage.goto('file://' + PREVIEW_TEMPLATE_PATH);
      await previewPage.evaluate(
        (title, id) => {
          document.getElementById('title')!.textContent = title;
          document.getElementById('episode')!.textContent =
            `EPISODE ${id.replace(/[^\d]/g, '')}`;
        },
        episode.title,
        episode.id,
      );
      await previewPage.screenshot({
        path: previewOutPath,
        type: 'png',
        clip: { x: 0, y: 0, width: 1200, height: 1200 },
      });
      await previewPage.close();
      console.log(`Generated Preview: ${previewOutPath}`);
    } else {
      console.log(`Preview image for ${episode.id} already exists, skipping.`);
    }
  }
  await browser.close();
  console.log('All OG and preview images generated.');
}

generateImages();

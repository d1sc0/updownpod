import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import matter from 'gray-matter';

const EPISODES_DIR = path.join(process.cwd(), 'src/content/episodes');
const TEMPLATE_PATH = path.join(
  process.cwd(),
  'src/scripts/image-generation/preview-image-template.html',
);
const BG_PATH = path.join(
  process.cwd(),
  'src/scripts/image-generation/preview-background.png',
);
const OUTPUT_DIR = path.join(process.cwd(), 'public/generated_preview_images');

async function getEpisodes() {
  const files = fs.readdirSync(EPISODES_DIR).filter(f => f.endsWith('.md'));
  return files.map(file => {
    const content = fs.readFileSync(path.join(EPISODES_DIR, file), 'utf-8');
    const { data } = matter(content);
    const title = data.title ? String(data.title) : file.replace(/\.md$/, '');
    const id = file.replace(/\.md$/, '');
    return { id, title };
  });
}

function fillTemplate(
  template,
  { siteTitle, episodeNumber, title, siteUrl, bgPath },
) {
  return template
    .replaceAll('%%SITE_TITLE%%', siteTitle)
    .replaceAll('%%EPISODE_NUMBER%%', episodeNumber)
    .replaceAll('%%TITLE%%', title)
    .replaceAll('%%SITE_URL%%', siteUrl)
    .replaceAll('%%PREVIEW_BG%%', bgPath);
}

async function generatePreviewImages() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const episodes = await getEpisodes();
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });
  for (const episode of episodes) {
    const outFile = `${episode.id}.png`;
    const outPath = path.join(OUTPUT_DIR, outFile);
    if (fs.existsSync(outPath)) {
      console.log(`Preview image for ${outFile} already exists, skipping.`);
      continue;
    }
    let episodeNumber = '';
    const match = episode.id.match(/^ep(\d+)-/);
    if (match) {
      episodeNumber = `Episode ${match[1]}`;
    }
    let html = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
    // Read and encode background as base64
    const bgBuffer = fs.readFileSync(BG_PATH);
    const ext = path.extname(BG_PATH).toLowerCase().replace('.', '');
    const mimeType =
      ext === 'svg' ? 'image/svg+xml' : `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    const bgBase64 = `data:${mimeType};base64,${bgBuffer.toString('base64')}`;
    // Replace the background url in the template with an <img> tag for reliability
    html = html
      .replace("background: url('%%PREVIEW_BG%%') no-repeat center center;", '')
      .replace(
        '<div class="container">',
        `<div class="container"><img src="${bgBase64}" style="position:absolute;width:100%;height:100%;object-fit:cover;z-index:0;" />`,
      );
    html = fillTemplate(html, {
      siteTitle: 'Upstairs / Downstairs Podcast',
      episodeNumber,
      title: episode.title,
      siteUrl: 'updownpod.com',
      bgPath: '', // Not used anymore
    });
    // Debug log
    console.log(`Generating preview: ${outFile}`);
    const page = await browser.newPage();
    await page.setViewport({ width: 600, height: 600 });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.screenshot({
      path: outPath,
      type: 'png',
      clip: { x: 0, y: 0, width: 600, height: 600 },
    });
    await page.close();
    console.log(`${outFile}`);
  }
  await browser.close();
  console.log('All preview images generated.');
}

generatePreviewImages();

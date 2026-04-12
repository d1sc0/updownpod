import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EPISODES_DIR = path.join(__dirname, '../content/episodes');

function fixImagePathsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  content = content.replace(
    /\]\(\/src\/assets\/uploaded_images\/([^\)]+)\)/g,
    (match, p1) => {
      changed = true;
      return `](../../assets/uploaded_images/${p1})`;
    },
  );
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed image paths in: ${filePath}`);
  }
}

function renameFileToSlug(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(content);
  if (data.slug) {
    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const newName = `${data.slug}${ext}`;
    const newPath = path.join(dir, newName);
    if (path.basename(filePath) !== newName && !fs.existsSync(newPath)) {
      fs.renameSync(filePath, newPath);
      console.log(`Renamed file: ${filePath} -> ${newPath}`);
      return newPath;
    }
  }
  return filePath;
}

function walkDir(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.md')) {
      fixImagePathsInFile(fullPath);
      // If renamed, update path for further processing
      renameFileToSlug(fullPath);
    }
  });
}

walkDir(EPISODES_DIR);

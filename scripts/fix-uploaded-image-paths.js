#!/usr/bin/env node
/**
 * Script to fix image paths in Markdown files before Astro build.
 * Replaces any image links pointing to '/src/assets/uploaded_images' with '../../assets/uploaded_images'.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EPISODES_DIR = path.join(__dirname, '../src/content/episodes');
const IMAGE_PATH_REGEX = /\]\((\/src\/assets\/uploaded_images\/[^)]+)\)/g;
const REPLACEMENT = '](../../assets/uploaded_images/$2)';

function fixImagePathsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  // Replace all image links
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

function walkDir(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.md')) {
      fixImagePathsInFile(fullPath);
    }
  });
}

walkDir(EPISODES_DIR);

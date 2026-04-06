import fs from 'fs/promises';
import path from 'path';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const filePath = path.resolve('public/admin/index.html');
  try {
    const html = await fs.readFile(filePath, 'utf-8');
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
      status: 200,
    });
  } catch (e) {
    return new Response('Not found', { status: 404 });
  }
};

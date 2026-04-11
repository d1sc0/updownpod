import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const episodes = defineCollection({
  loader: glob({ base: './src/content/episodes', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    pubDate: z.date(),
    description: z.string(),
    mp3: z.string().url().optional(),
    mp3title: z.string().optional(),
    draft: z.boolean().optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string().optional(),
    body: z.string().optional(),
  }),
});

export const collections = { episodes, pages };

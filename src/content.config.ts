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
    socialImage: z.string().optional(),
    mp3: z.string().url().optional(),
    mp3title: z.string().optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = { episodes };

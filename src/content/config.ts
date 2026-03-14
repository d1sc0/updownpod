// Import utilities from `astro:content`
import { z, defineCollection } from 'astro:content';

// Define a `type` and `schema` for each collection
const episodesCollection = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      pubDate: z.date(),
      description: z.string(),
      episodeImage: z.object({
        src: image(),
        alt: z.string(),
      }),
      socialImage: z.string().optional(),
      mp3: z.string().url().optional(),
      mp3title: z.string().optional(),
      draft: z.boolean().optional(),
    }),
});

// Export a single `collections` object to register your collection(s)
export const collections = {
  episodes: episodesCollection,
};

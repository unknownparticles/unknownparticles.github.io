import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    date: z.coerce.date(),
    author: z.string().default('Alun'),
    'header-img': z.string().default('img/post-bg-desk.jpg'),
    catalog: z.boolean().default(true),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { posts };

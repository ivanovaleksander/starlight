import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Публикации – всяка статия е Markdown файл в src/content/publications/.
 * Името на файла е адресът на статията: /publikacii/<име-на-файла>.
 *
 * Front matter:
 *   title, category, summary, date (YYYY-MM-DD), demo (true = демо съдържание, noindex)
 */
const publications = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/publications' }),
	schema: z.object({
		title: z.string(),
		category: z.enum([
			'Гражданско право',
			'Административно право',
			'Търговско право',
			'Вещно право',
			'Процесуално представителство',
		]),
		summary: z.string().max(220),
		date: z.coerce.date(),
		/** Демо съдържание – показва се с обозначение и не се индексира. */
		demo: z.boolean().default(false),
	}),
});

export const collections = { publications };

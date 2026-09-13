import type { CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'publications'>;
export type PostPair = { slug: string; bg: Post; en: Post | null };

/** Групира записите по slug: bg/<slug> + en/<slug>. Сортира по дата (най-новите първи). */
export function pairPosts(posts: Post[]): PostPair[] {
	return posts
		.filter((p) => p.id.startsWith('bg/'))
		.map((bg) => {
			const slug = bg.id.slice(3);
			return { slug, bg, en: posts.find((p) => p.id === `en/${slug}`) ?? null };
		})
		.sort((a, b) => b.bg.data.date.getTime() - a.bg.data.date.getTime());
}

export function readingTime(body: string | undefined): number {
	const words = body?.split(/\s+/).filter(Boolean).length ?? 0;
	return Math.max(1, Math.round(words / 180));
}

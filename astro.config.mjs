// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * Публичният адрес на сайта се използва за canonical URL, Open Graph
 * и структурираните данни. Netlify подава `URL` автоматично при build;
 * при друг хостинг задайте PUBLIC_SITE_URL (напр. https://www.example.bg).
 */
const site =
	process.env.PUBLIC_SITE_URL || process.env.URL || 'http://localhost:4321';

// https://astro.build/config
export default defineConfig({
	site,
	output: 'static',
	integrations: [
		sitemap({
			// Правните подстраници са временни и не се включват в sitemap-а
			filter: (page) => !/politika-|pravna-/.test(page),
		}),
	],
	trailingSlash: 'never',
	build: {
		inlineStylesheets: 'auto',
	},
	image: {
		// sharp се използва за оптимизация на изображенията
		service: { entrypoint: 'astro/assets/services/sharp' },
	},
	compressHTML: true,
	vite: {
		build: { cssMinify: true },
	},
});

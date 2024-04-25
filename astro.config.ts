import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: process.env.DEPLOY_URL ?? 'https://astro-tips.dev',
	redirects: {
		'/recipes/how-to-add-gsap': '/tips/how-to-add-gsap',
	},
	integrations: [
		starlight({
			title: 'Astro Tips',
			social: {
				github: 'https://github.com/astrolicious/astro-tips.dev',
				discord: 'https://chat.astrolicious.dev/',
			},
			sidebar: [
				{
					label: 'Home',
					link: '/',
				},
				{
					label: 'Contributing',
					link: '/contributing/',
				},
				{
					label: 'Recipes',
					autogenerate: { directory: 'recipes' },
				},
				{
					label: 'Tips',
					autogenerate: { directory: 'tips' },
				},
			],
			components: {
				PageTitle: './src/components/starlight/PageTitle.astro',
				MarkdownContent: './src/components/starlight/MarkdownContent.astro',
			},
		}),
	],
});

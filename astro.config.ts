import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import cloudflare from '@astrojs/cloudflare';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

export default defineConfig({
	site: process.env.DEPLOY_URL ?? 'https://astro-tips.dev',
	redirects: {
		'/recipes/how-to-add-gsap': '/tips/how-to-add-gsap',
		'/contributing': '/#want-to-get-involved',
	},
	experimental: {
		contentCollectionJsonSchema: true,
	},
	integrations: [
		starlight({
			title: 'Astro Tips',
			logo: {
				light: './src/assets/logo-light.svg',
				dark: './src/assets/logo-dark.svg',
				replacesTitle: true,
			},
			customCss: ['./src/styles/custom.css'],
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
					label: 'Recipes',
					autogenerate: {
						directory: 'recipes',
					},
				},
				{
					label: 'Tips',
					autogenerate: {
						directory: 'tips',
					},
				},
				{
					label: 'Resources',
					badge: 'New',
					autogenerate: {
						directory: 'resources',
					},
				},
			],
			components: {
				Head: './src/components/starlight/Head.astro',
				PageTitle: './src/components/starlight/PageTitle.astro',
				MarkdownContent: './src/components/starlight/MarkdownContent.astro',
			},
		}),
	],
	vite: {
		resolve: {
			alias: {
				'~': resolve(dirname(fileURLToPath(import.meta.url)), './src'),
			},
		},
		ssr: {
			// This should be removed once Starlight's SSR support is released
			external: ['node:url', 'node:path', 'node:child_process', 'node:fs'],
		},
	},
	output: 'hybrid',
	adapter: cloudflare(),
});

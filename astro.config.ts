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
			head: [
				// https://cloud.umami.is/settings/websites/3c868d1b-5f9f-4de1-93c4-a21d4944e596
				{
					tag: 'script',
					attrs: {
						defer: true,
						src: 'https://cloud.umami.is/script.js',
						'data-website-id': '3c868d1b-5f9f-4de1-93c4-a21d4944e596',
					},
				},
			],
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
					items: [
						{ slug: 'resources/educational' },
						{ label: 'Tags', link: '/resources/tags' },
					]
				},
			],
			components: {
				PageTitle: './src/components/starlight/PageTitle.astro',
				MarkdownContent: './src/components/starlight/MarkdownContent.astro',
			},
			credits: true,
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

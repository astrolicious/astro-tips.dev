import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import cloudflare from '@astrojs/cloudflare';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

export default defineConfig({
	site: process.env.DEPLOY_URL ?? 'https://astro-tips.dev',
	scopedStyleStrategy: 'where',
	session: false,
	redirects: {
		'/recipes/how-to-add-gsap': '/tips/how-to-add-gsap',
		'/contributing': '/#want-to-get-involved',
		'/resources/educational': '/external-resources',
	},
	experimental: {
		contentIntellisense: true,
	},
	integrations: [
		starlight({
			title: 'Astro Tips',
			description:
				'Astro best practices, tips, and recipes from the community — the place for content that goes beyond the official docs, for all Astronauts!',
			logo: {
				light: './src/assets/logo-light.svg',
				dark: './src/assets/logo-dark.svg',
				replacesTitle: true,
			},
			editLink: {
				baseUrl: 'https://github.com/astrolicious/astro-tips.dev/edit/main/',
			},
			lastUpdated: true,
			customCss: ['./src/styles/custom.css'],
			head: [
				{
					tag: 'meta',
					attrs: {
						name: 'theme-color',
						content: '#ae1c66',
					},
				},
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
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/astrolicious/astro-tips.dev',
				},
				{ icon: 'discord', label: 'Discord', href: 'https://chat.astrolicious.dev' },
			],
			sidebar: [
				{
					label: 'Home',
					link: '/',
				},
				{
					label: 'Best practices',
					link: '/best-practices',
				},
				{
					label: 'Recipes',
					items: [
						{
							autogenerate: {
								directory: 'recipes',
							},
						},
					],
				},
				{
					label: 'Tips',
					items: [
						{
							autogenerate: {
								directory: 'tips',
							},
						},
					],
				},
				{
					label: 'External resources',
					link: '/external-resources',
				},
				{
					label: 'Authors',
					link: '/authors',
				},
			],
			components: {
				PageTitle: './src/components/starlight/PageTitle.astro',
				MarkdownContent: './src/components/starlight/MarkdownContent.astro',
			},
			routeMiddleware: [
				'./src/middleware/compatibility-toc.ts',
				'./src/middleware/authors-meta.ts',
				'./src/middleware/resources-badge.ts',
				'./src/middleware/og-meta.ts',
				'./src/middleware/structured-data.ts',
			],
			credits: true,
		}),
	],
	vite: {
		resolve: {
			alias: {
				'~': resolve(dirname(fileURLToPath(import.meta.url)), './src'),
			},
		},
	},
	adapter: cloudflare({
		imageService: 'passthrough',
		prerenderEnvironment: 'node',
	}),
});

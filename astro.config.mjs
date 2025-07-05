import { builtinModules } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import cloudflare from '@astrojs/cloudflare';
import starlight from '@astrojs/starlight';
import { defineConfig, envField } from 'astro/config';

export default defineConfig({
	site: process.env.DEPLOY_URL ?? 'https://astro-tips.dev',
	redirects: {
		'/recipes/how-to-add-gsap': '/tips/how-to-add-gsap',
		'/contributing': '/#want-to-get-involved',
		'/resources/educational': '/external-resources',
	},
	integrations: [
		starlight({
			prerender: true,
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
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/astrolicious/astro-tips.dev' },
				{ icon: 'discord', label: 'Discord', href: 'https://chat.astrolicious.dev' },
			],
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
					label: 'External resources',
					badge: 'Updated',
					link: '/external-resources',
				},
			],
			components: {
				PageTitle: './src/components/starlight/PageTitle.astro',
				MarkdownContent: './src/components/starlight/MarkdownContent.astro',
				ThemeSelect: './src/components/starlight/ThemeSelect.astro',
			},
			credits: true,
		}),
	],
	vite: {
		build: {
			minify: false,
		},
		resolve: {
			alias: {
				'~': resolve(dirname(fileURLToPath(import.meta.url)), './src'),
			},
		},
		ssr: {
			external: [...builtinModules, ...builtinModules.map((mod) => `node:${mod}`)],
		},
	},
	output: 'static',
	adapter: cloudflare({
		imageService: 'passthrough',
		platformProxy: {
			enabled: true,
			experimental: {
				remoteBindings: true
			}
		},
	}),
	// env: {
	// 	validateSecrets: true,
	// 	schema: {
	// 		BETTER_AUTH_SECRET: envField.string({
	// 			context: "server",
	// 			access: "secret",
	// 		})
	// 	}
	// }
});

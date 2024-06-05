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
				{
					tag: 'script',
					content: `!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);posthog.init('phc_S9YMyBFAOplEOzpXnlxNVYaAFuQ4ZmcZ43JXhtsW8Kr',{api_host:'https://eu.i.posthog.com',persistence: 'memory'})`,
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
					autogenerate: {
						directory: 'resources',
					},
				},
			],
			components: {
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

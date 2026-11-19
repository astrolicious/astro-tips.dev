import { bindings, defineConfig } from 'cf/config';

export default defineConfig({
	// biome-ignore lint/security/noSecrets: public Cloudflare account ID
	accountId: '69e5e09fd9c27bf9e7540c12be67ab9d',
	worker: {
		name: 'astro-tips',
		compatibilityDate: '2026-11-19',
		compatibilityFlags: [
			'nodejs_process_version_24',
			'temporal',
			'wasm_source_url_support',
			'request_signal_passthrough',
			'remove_nodejs_compat_eol_v22',
		],
		entrypoint: '@astrojs/cloudflare/entrypoints/server',
		assets: {
			notFoundHandling: '404-page',
		},
		workersDev: true,
		previewUrls: true,
		observability: {
			enabled: true,
			logs: {
				enabled: true,
			},
		},
		domains: ['astro-tips.dev', 'www.astro-tips.dev'],
		env: {
			ASSETS: bindings.assets(),
		},
	},
});

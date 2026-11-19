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
			'remove_nodejs_compat_eol_v24',
			'global_fetch_strictly_public',
			'pedantic_wpt',
		],
		entrypoint: '@astrojs/cloudflare/entrypoints/server',
		assets: {
			notFoundHandling: '404-page',
		},
		limits: {
			cpuMs: 60_000,
		},
		workersDev: false,
		previewUrls: false,
		observability: {
			enabled: true,
			headSamplingRate: 1,
			issues: {
				enabled: true,
			},
			logs: {
				enabled: true,
				headSamplingRate: 1,
			},
			traces: {
				enabled: true,
				headSamplingRate: 1,
			},
		},
		domains: [
			'astro-tips.dev',
			{
				hostname: 'previews.astro-tips.dev',
				production: false,
				previews: true,
			},
		],
		env: {
			ASSETS: bindings.assets(),
		},
	},
});

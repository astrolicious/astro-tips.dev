import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	getSemverUrl,
	hasCompatibilityInfo,
	normalizeCompatibility,
	resolveCompatibility,
} from '../src/lib/compatibility.ts';

describe('compatibility helpers', () => {
	it('detects when compatibility info is present or empty', () => {
		assert.equal(hasCompatibilityInfo(undefined), false);
		assert.equal(hasCompatibilityInfo({}), false);
		assert.equal(hasCompatibilityInfo({ note: 'Only a note' }), false);
		assert.equal(hasCompatibilityInfo({ rendering: {} }), false);
		assert.equal(hasCompatibilityInfo({ rendering: { prerendered: 'supported' } }), true);
	});

	it('normalizes shorthand status strings into entry objects', () => {
		const normalized = normalizeCompatibility({
			rendering: {
				prerendered: 'recommended',
				'on-demand': {
					status: 'unsupported',
					note: 'Static only',
				},
			},
		});

		assert.deepEqual(normalized, {
			rendering: {
				prerendered: { status: 'recommended' },
				'on-demand': { status: 'unsupported', note: 'Static only' },
			},
		});
	});

	it('rejects invalid semver ranges in version fields', () => {
		assert.throws(() =>
			normalizeCompatibility({
				adapters: {
					node: {
						status: 'supported',
						version: 'not-a-semver',
					},
				},
			})
		);
	});

	it('resolves overall tones accurately across all combinations', () => {
		const allRecommended = resolveCompatibility({
			rendering: { prerendered: 'recommended' },
			runtimes: { node: 'recommended' },
		});
		assert.equal(allRecommended.overall.tone, 'recommended');

		const widelyCompatible = resolveCompatibility({
			rendering: { prerendered: 'recommended', 'on-demand': 'supported' },
		});
		assert.equal(widelyCompatible.overall.tone, 'supported');

		const limited = resolveCompatibility({
			rendering: { prerendered: 'recommended', 'on-demand': 'unsupported' },
		});
		assert.equal(limited.overall.tone, 'limited');

		const unsupported = resolveCompatibility({
			rendering: { prerendered: 'unsupported' },
		});
		assert.equal(unsupported.overall.tone, 'unsupported');
	});

	it('assigns sequential footnote indexes and tracks version column visibility', () => {
		const resolved = resolveCompatibility(
			{
				rendering: {
					prerendered: { status: 'recommended', note: 'First note' },
					'on-demand': 'supported',
				},
				adapters: {
					cloudflare: {
						status: 'supported',
						version: '>=12.0.0',
						note: 'Second note',
					},
				},
			},
			'>=5.0.0'
		);

		assert.equal(resolved.hasAnyVersion, true);
		assert.equal(resolved.footnotes.length, 2);
		assert.deepEqual(
			resolved.footnotes.map((f) => ({
				index: f.index,
				targetLabel: f.targetLabel,
				note: f.note,
			})),
			[
				{ index: 1, targetLabel: 'Prerendered', note: 'First note' },
				{ index: 2, targetLabel: 'Cloudflare', note: 'Second note' },
			]
		);

		const withoutVersions = resolveCompatibility({
			rendering: { prerendered: 'supported' },
		});
		assert.equal(withoutVersions.hasAnyVersion, false);
	});

	it('builds valid semver inspector URLs', () => {
		const url = getSemverUrl('@astrojs/cloudflare', '>=12.0.0');
		const parsed = new URL(url);
		assert.equal(parsed.origin, 'https://semver.otterlord.dev');
		assert.equal(parsed.searchParams.get('package'), '@astrojs/cloudflare');
		assert.equal(parsed.searchParams.get('range'), '>=12.0.0');
		assert.equal(parsed.searchParams.get('filter'), 'on');
	});
});
